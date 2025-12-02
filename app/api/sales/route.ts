import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// Helper to compute next bill number per user
async function getNextBillNumber(userId: string) {
  const latest = await prisma.sale.findFirst({
    where: { userId },
    orderBy: { billNumber: "desc" },
    select: { billNumber: true },
  })
  return (latest?.billNumber ?? 0) + 1
}

// GET /api/sales – list recent sales for dashboard / analytics
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const url = new URL(request.url)
    const limitParam = url.searchParams.get("limit")
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20

    const sales = await prisma.sale.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ sales }, { status: 200 })
  } catch (error) {
    console.error("GET /api/sales error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/sales – checkout current cart
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { customerPhone, items } = body as {
      customerPhone?: string
      items?: Array<{
        productId: string
        name: string
        barcode: string
        unit: string
        quantity: number
        originalPrice: number
        discountedPrice: number
        hsnSacCode?: string | null
      }>
    }

    if (!customerPhone) {
      return NextResponse.json({ error: "Customer phone is required" }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 })
    }

    const userId = payload.userId

    // Resolve or create customer by phone
    const customer = await prisma.customer.upsert({
      where: {
        userId_phoneNumber: {
          userId,
          phoneNumber: customerPhone,
        },
      },
      update: {},
      create: {
        userId,
        phoneNumber: customerPhone,
      },
    })

    // Compute totals
    const total = items.reduce((sum, item) => {
      const qty = typeof item.quantity === "number" ? item.quantity : 0
      const price = typeof item.discountedPrice === "number" ? item.discountedPrice : 0
      return sum + qty * price
    }, 0)

    const billNumber = await getNextBillNumber(userId)

    // Use a transaction to update stock + record sale
    const sale = await prisma.$transaction(async (tx) => {
      // Decrement product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Record sale
      return tx.sale.create({
        data: {
          userId,
          customerId: customer.id,
          customerPhone,
          billNumber,
          total,
          items,
        },
      })
    })

    return NextResponse.json({ sale }, { status: 201 })
  } catch (error) {
    console.error("POST /api/sales error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


