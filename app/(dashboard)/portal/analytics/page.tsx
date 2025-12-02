"use client"

import { useMemo, useState } from "react"
import { Calendar, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { useAppContext } from "@/context/AppContext"

export default function AnalyticsPage() {
  const { products, sales, analytics } = useAppContext()
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month")

  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  const filteredSales = useMemo(
    () =>
      sales.filter((s) => {
        const d = new Date(s.date)
        if (Number.isNaN(d.getTime())) return false
        switch (period) {
          case "day":
            return d >= dayStart
          case "week":
            return d >= weekStart
          case "month":
            return d >= monthStart
          case "year":
            return d >= yearStart
        }
      }),
    [sales, period],
  )

  const periodTotal = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.total, 0),
    [filteredSales],
  )
  const periodCheckouts = filteredSales.length

  const productSalesMap = useMemo(() => {
    const map = new Map<
      string,
      {
        count: number
        revenue: number
      }
    >()
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = map.get(item.id)
        if (existing) {
          existing.count += item.cartQuantity
          existing.revenue += item.discountedPrice * item.cartQuantity
        } else {
          map.set(item.id, {
            count: item.cartQuantity,
            revenue: item.discountedPrice * item.cartQuantity,
          })
        }
      })
    })
    return map
  }, [filteredSales])

  const topProducts = useMemo(
    () =>
      Array.from(productSalesMap.entries())
        .map(([id, stats]) => {
          const product = products.find((p) => p.id === id)
          return {
            id,
            name: product?.name ?? "Unknown product",
            count: stats.count,
            revenue: stats.revenue,
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    [productSalesMap, products],
  )

  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity < 5).length
  const outOfStock = products.filter((p) => p.quantity === 0).length
  const healthy = products.length - lowStock - outOfStock

  const periodLabel =
    period === "day"
      ? "Today"
      : period === "week"
        ? "This week"
        : period === "month"
          ? "This month"
          : "This year"

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Offline-first insights computed from the sales stored in this browser.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border/70 bg-card/80 p-1 text-xs">
          {(["day", "week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "px-3 py-1 rounded-md transition-colors",
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {p === "day" ? "Today" : p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total products
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {analytics.totalProducts}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Inventory worth
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                ₹{analytics.inventoryWorth.toFixed(0)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {periodLabel} sales
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                ₹{periodTotal.toFixed(0)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {periodLabel} checkouts
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {periodCheckouts}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Top products + inventory status */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Top selling products ({periodLabel.toLowerCase()})
            </h2>
          </div>
          <div className="p-4 text-xs">
            {topProducts.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No sales for this period yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {topProducts.map((p, index) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.count} units • ₹{p.revenue.toFixed(0)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Inventory status
            </h2>
          </div>
          <div className="space-y-4 p-4 text-xs">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3">
                <p className="text-[11px] font-medium text-amber-100">
                  Low stock
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-50">
                  {lowStock}
                </p>
                <p className="mt-1 text-[11px] text-amber-100">
                  Units below 5 in quantity
                </p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3">
                <p className="text-[11px] font-medium text-red-100">
                  Out of stock
                </p>
                <p className="mt-1 text-xl font-semibold text-red-50">
                  {outOfStock}
                </p>
                <p className="mt-1 text-[11px] text-red-100">
                  Products at zero quantity
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border/70 bg-background/80 px-3 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  Inventory distribution
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total {products.length} products
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-border/80">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{
                    width: `${
                      products.length
                        ? (healthy / Math.max(products.length, 1)) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Healthy: {healthy}</span>
                <span>Low: {lowStock}</span>
                <span>Out: {outOfStock}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales overview row */}
      <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
        <div className="border-b border-border/70 px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Sales overview
          </h2>
        </div>
        <div className="grid gap-4 p-4 text-xs md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-background/80 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Total checkouts
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {sales.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-background/80 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Total revenue
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                ₹{analytics.totalSales.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-background/80 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Today&apos;s income
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                ₹{analytics.todaysIncome.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

