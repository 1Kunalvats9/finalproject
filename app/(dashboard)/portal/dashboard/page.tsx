"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Plus,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { getCurrentBillNumber } from "@/lib/storage"

export default function DashboardHome() {
  const { products, customers, sales, analytics } = useAppContext()
  const [nextBillNumber, setNextBillNumber] = useState<number>(0)

  useEffect(() => {
    const fetchBillNumber = async () => {
      const current = await getCurrentBillNumber()
      setNextBillNumber(current + 1)
    }
    fetchBillNumber()
  }, [])

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const lowStockProducts = products
    .filter((product) => product.quantity < 5 && product.quantity > 0)
    .slice(0, 5)

  const outOfStockProducts = products.filter((product) => product.quantity === 0).slice(0, 5)

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm shadow-black/30 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Store health at a glance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Total products, inventory worth, sales and today&apos;s income – tailored per
            logged in user.
          </p>
        </div>
        <div className="flex gap-2 text-[11px] text-muted-foreground/90">
          <span className="rounded-full bg-muted/40 px-3 py-1">
            Multi-cart billing
          </span>
          <span className="rounded-full bg-muted/40 px-3 py-1">
            Offline-friendly inventory
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total products</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
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
              <p className="text-xs font-medium text-muted-foreground">Inventory worth</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
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
              <p className="text-xs font-medium text-muted-foreground">Total sales</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                ₹{analytics.totalSales.toFixed(0)}
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
              <p className="text-xs font-medium text-muted-foreground">Today&apos;s income</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                ₹{analytics.todaysIncome.toFixed(0)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Next bill no</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {nextBillNumber}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-300">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/portal/add-product"
          className="group flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm shadow-black/30 transition-all hover:bg-card hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Add Product</h3>
        </Link>

        <Link
          href="/portal/sell"
          className="group flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm shadow-black/30 transition-all hover:bg-card hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300 transition-colors group-hover:bg-indigo-500/20">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Sell Products</h3>
        </Link>

        <Link
          href="/portal/print-barcode"
          className="group flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm shadow-black/30 transition-all hover:bg-card hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 transition-colors group-hover:bg-emerald-500/20">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Print Barcode</h3>
        </Link>

        <Link
          href="/portal/analytics"
          className="group flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm shadow-black/30 transition-all hover:bg-card hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-300 transition-colors group-hover:bg-orange-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">View Analytics</h3>
        </Link>
      </div>

      {/* Recent Sales & Inventory Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Recent Sales
              </h2>
              <Link
                href="/portal/customers"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="p-0">
            {recentSales.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No recent sales found
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {recentSales.map((sale) => (
                  <li key={sale.id} className="p-4 transition-colors hover:bg-background/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {sale.customerId
                            ? customers.find((c) => c.id === sale.customerId)?.phoneNumber ||
                              "Customer"
                            : "Walk-in Customer"}
                          {sale.billNumber && (
                            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                              Bill #{sale.billNumber}
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(sale.date).toLocaleString()} • {sale.items.length} items
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300">
                        ₹{sale.total.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Inventory Alerts
              </h2>
              <Link
                href="/portal/inventory"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="p-0">
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No inventory alerts
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {outOfStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="p-4 transition-colors hover:bg-background/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Barcode: {product.barcode}
                        </p>
                      </div>
                      <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-300">
                        Out of Stock
                      </span>
                    </div>
                  </li>
                ))}
                {lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="p-4 transition-colors hover:bg-background/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Barcode: {product.barcode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300">
                          Low Stock
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {product.quantity} left
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}


