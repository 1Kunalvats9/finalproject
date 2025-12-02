import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/dashboard/overview – stats for dashboard cards
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

    const userId = payload.userId
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [totalProducts, inventoryWorthAgg, totalSalesAgg, todaysIncomeAgg] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.product.aggregate({
        where: { userId },
        _sum: {
          discountedPrice: true,
        },
      }),
      prisma.sale.aggregate({
        where: { userId },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: {
          userId,
          createdAt: {
            gte: todayStart,
          },
        },
        _sum: { total: true },
      }),
    ])

    const inventoryWorth = inventoryWorthAgg._sum.discountedPrice || 0
    const totalSales = totalSalesAgg._sum.total || 0
    const todaysIncome = todaysIncomeAgg._sum.total || 0

    return NextResponse.json(
      {
        totalProducts,
        inventoryWorth,
        totalSales,
        todaysIncome,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("GET /api/dashboard/overview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


