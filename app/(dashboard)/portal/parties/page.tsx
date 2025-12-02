"use client"

import { useMemo, useState } from "react"
import { Calendar, Phone, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAppContext } from "@/context/AppContext"

export default function PartiesPage() {
  const { customers, sales } = useAppContext()
  const [search, setSearch] = useState("")

  const parties = useMemo(() => {
    return customers.map((c) => {
      const partySales = sales.filter((s) => s.customerId === c.id)
      const total = partySales.reduce((sum, s) => sum + s.total, 0)
      return {
        ...c,
        total,
        count: partySales.length,
        lastSaleAt: partySales.length
          ? partySales
              .map((s) => new Date(s.date))
              .sort((a, b) => b.getTime() - a.getTime())[0]
          : null,
      }
    })
  }, [customers, sales])

  const filtered = useMemo(() => {
    const q = search.trim()
    if (!q) return parties
    return parties.filter((p) => p.phoneNumber.includes(q))
  }, [parties, search])

  const recentBills = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20),
    [sales],
  )

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Parties &amp; bills
          </h1>
          <p className="text-sm text-muted-foreground">
            View every phone number that has checked out and the bills attached to it.
          </p>
        </div>

        <div className="mt-3 w-full max-w-xs md:mt-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by phone…"
              className="pl-8 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.2fr)]">
        {/* Parties summary */}
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <p>
              Total parties:{" "}
              <span className="font-semibold text-foreground">{parties.length}</span>
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No parties found yet. As you sell to customers, this view will fill up.
            </div>
          ) : (
            <ul className="space-y-2 text-xs">
              {filtered.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {p.phoneNumber}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Joined{" "}
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                      {p.lastSaleAt && (
                        <>
                          {" • Last bill "}
                          {new Date(p.lastSaleAt).toLocaleDateString("en-IN")}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {p.count}{" "}
                      <span className="text-muted-foreground">
                        {p.count === 1 ? "bill" : "bills"}
                      </span>
                    </p>
                    <p>₹{p.total.toFixed(0)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent bills table */}
        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Recent bills
            </h2>
          </div>
          <div className="max-h-[55vh] overflow-y-auto text-xs">
            {recentBills.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No bills have been generated yet.
              </div>
            ) : (
              <table className="w-full border-separate border-spacing-0">
                <thead className="sticky top-0 bg-background/90 text-[11px] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Bill #</th>
                    <th className="px-4 py-2 text-left font-medium">Phone</th>
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.map((s) => {
                    const party = customers.find((c) => c.id === s.customerId)
                    return (
                      <tr key={s.id} className="border-t border-border/60">
                        <td className="px-4 py-2 align-middle font-mono text-[11px] text-foreground">
                          #{s.billNumber}
                        </td>
                        <td className="px-4 py-2 align-middle text-[11px] text-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {party?.phoneNumber ?? "Walk-in"}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-middle text-[11px] text-muted-foreground">
                          {new Date(s.date).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-2 align-middle text-right text-[11px] font-semibold text-foreground">
                          ₹{s.total.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

