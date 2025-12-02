"use client"

import { useMemo } from "react"
import { DollarSign, TrendingUp } from "lucide-react"
import { useAppContext } from "@/context/AppContext"

export default function AccountingPage() {
  const { products, sales } = useAppContext()

  const metrics = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)

    const costOfGoodsSold = sales.reduce((total, sale) => {
      return (
        total +
        sale.items.reduce((itemCost, item) => {
          const cost = item.costPrice ?? 0
          return itemCost + cost * item.cartQuantity
        }, 0)
      )
    }, 0)

    const grossProfit = totalRevenue - costOfGoodsSold

    const inventoryAsset = products.reduce((sum, p) => {
      const cost = p.costPrice ?? p.discountedPrice
      return sum + cost * p.quantity
    }, 0)

    // In this offline-first version we treat all revenue as cash for a simple snapshot
    const cashAsset = totalRevenue

    const totalAssets = inventoryAsset + cashAsset

    return {
      totalRevenue,
      costOfGoodsSold,
      grossProfit,
      inventoryAsset,
      cashAsset,
      totalAssets,
    }
  }, [products, sales])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Accounting snapshot
        </h1>
        <p className="text-sm text-muted-foreground">
          Lightweight P&amp;L and balance-style view computed from the data stored in this browser.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Total revenue"
          value={`₹${metrics.totalRevenue.toFixed(0)}`}
          tone="primary"
        />
        <Card
          title="Cost of goods sold"
          value={`₹${metrics.costOfGoodsSold.toFixed(0)}`}
          tone="muted"
        />
        <Card
          title="Gross profit"
          value={`₹${metrics.grossProfit.toFixed(0)}`}
          tone="success"
        />
        <Card
          title="Inventory asset"
          value={`₹${metrics.inventoryAsset.toFixed(0)}`}
          tone="muted"
        />
        <Card
          title="Cash (approx.)"
          value={`₹${metrics.cashAsset.toFixed(0)}`}
          tone="primary"
        />
        <Card
          title="Total assets"
          value={`₹${metrics.totalAssets.toFixed(0)}`}
          tone="success"
        />
      </div>

      <div className="rounded-xl border border-border/70 bg-card/80 p-4 text-xs text-muted-foreground shadow-sm shadow-black/30">
        <p>
          These figures are derived purely from your POS checkouts and current inventory in this browser.
          For statutory reporting, always reconcile with your official books and GST filings.
        </p>
      </div>
    </section>
  )
}

type CardTone = "primary" | "success" | "muted"

function Card({ title, value, tone }: { title: string; value: string; tone: CardTone }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/10 text-emerald-200"
      : tone === "primary"
        ? "bg-primary/10 text-primary-foreground/90"
        : "bg-background/80 text-muted-foreground"

  const icon =
    tone === "success" ? (
      <TrendingUp className="h-5 w-5" />
    ) : (
      <DollarSign className="h-5 w-5" />
    )

  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

