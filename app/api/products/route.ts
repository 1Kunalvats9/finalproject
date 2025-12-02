import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

/**
 * NOTE: Live product CRUD is handled entirely in the client using localforage (see AppContext + lib/storage).
 * This endpoint is ONLY for backup/restore of products to Prisma, similar to how your old MVP synced data.
 */

// GET /api/products – return latest backed-up products snapshot for this user
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

    const products = await prisma.product.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/products – overwrite backed-up products for this user with a full snapshot array
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
    const { products } = body as {
      products: Array<{
        name: string
        category?: string | null
        quantity: number
        retailPrice: number
        wholesalePrice: number
        barcode: string
        hsnSacCode?: string | null
        unit?: string | null
        originalPrice: number
        discountedPrice: number
        createdAt?: string
        updatedAt?: string
      }>
    }

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Field 'products' must be an array" }, { status: 400 })
    }

    const userId = payload.userId

    // Replace existing products for this user with the incoming snapshot
    const result = await prisma.$transaction(async (tx) => {
      await tx.product.deleteMany({ where: { userId } })

      if (products.length === 0) {
        return []
      }

      const created = await tx.product.createMany({
        data: products.map((p) => ({
          userId,
          name: p.name,
          category: p.category ?? null,
          quantity: p.quantity ?? 0,
          retailPrice: p.retailPrice ?? 0,
          wholesalePrice: p.wholesalePrice ?? 0,
          barcode: p.barcode,
          hsnSacCode: p.hsnSacCode ?? null,
          unit: p.unit || "pc",
          originalPrice: p.originalPrice ?? 0,
          discountedPrice: p.discountedPrice ?? 0,
        })),
        skipDuplicates: true,
      })

      return created
    })

    return NextResponse.json({ success: true, count: Array.isArray(result) ? result.length : 0 }, { status: 200 })
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

