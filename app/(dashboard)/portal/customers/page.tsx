"use client"

import { useMemo, useState } from "react"
import { Calendar, Phone, Search, ShoppingBag, User, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAppContext } from "@/context/AppContext"

export default function CustomersPage() {
  const { customers, sales } = useAppContext()
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sortedCustomers = useMemo(() => {
    const copy = [...customers]
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return copy
  }, [customers])

  const customersWithStats = useMemo(
    () =>
      sortedCustomers.map((c) => {
        const customerSales = sales.filter((s) => s.customerId === c.id)
        const totalSpent = customerSales.reduce((sum, s) => sum + s.total, 0)
        return {
          ...c,
          totalPurchases: customerSales.length,
          totalSpent,
        }
      }),
    [sortedCustomers, sales],
  )

  const filteredCustomers = useMemo(() => {
    const q = search.trim()
    if (!q) return customersWithStats
    return customersWithStats.filter((c) => c.phoneNumber.includes(q))
  }, [customersWithStats, search])

  const selectedCustomer =
    selectedId != null
      ? customersWithStats.find((c) => c.id === selectedId) ?? null
      : null

  const customerSales = useMemo(() => {
    if (!selectedCustomer) return []
    const list = sales.filter((s) => s.customerId === selectedCustomer.id)
    list.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    return list
  }, [sales, selectedCustomer])

  return (
    <section className="flex h-full flex-col gap-5 md:flex-row">
      {/* Left: customer list */}
      <div className="flex flex-col md:w-1/3">
        <header className="mb-3 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            Search by phone number and inspect their purchase history.
          </p>
        </header>

        <div className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm shadow-black/30">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by phone number…"
              className="pl-8 pr-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex-1 rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Phone numbers
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                No customers found yet. Complete a checkout to create one.
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {filteredCustomers.map((c) => (
                  <li
                    key={c.id}
                    className={`cursor-pointer px-4 py-3 text-xs transition-colors ${
                      selectedId === c.id
                        ? "bg-primary/10"
                        : "hover:bg-background/40"
                    }`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {c.phoneNumber}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {c.totalPurchases}{" "}
                          <span className="text-muted-foreground">
                            {c.totalPurchases === 1 ? "order" : "orders"}
                          </span>
                        </p>
                        {c.totalSpent > 0 && (
                          <p>₹{c.totalSpent.toFixed(0)}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Right: history */}
      <div className="mt-6 flex flex-1 flex-col md:mt-0 md:w-2/3">
        {!selectedCustomer ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-border/70 bg-card/80 px-6 py-10 text-center shadow-sm shadow-black/30">
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <User className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Select a customer to view purchase history
              </p>
              <p className="text-xs text-muted-foreground">
                Phone numbers appear here automatically whenever you check out
                a cart with a customer phone.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
            <div className="border-b border-border/70 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    Purchase history
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {selectedCustomer.phoneNumber}
                  </p>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {customerSales.length}{" "}
                    <span className="text-muted-foreground">
                      {customerSales.length === 1 ? "order" : "orders"}
                    </span>
                  </p>
                  <p>
                    ₹
                    {customerSales
                      .reduce((sum, s) => sum + s.total, 0)
                      .toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] flex-1 overflow-y-auto px-4 py-3">
              {customerSales.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No purchase history for this customer yet.
                </div>
              ) : (
                <ul className="space-y-3 text-xs">
                  {customerSales.map((sale) => (
                    <li
                      key={sale.id}
                      className="rounded-lg border border-border/60 bg-background/70 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(sale.date).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-300">
                          ₹{sale.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="rounded-lg bg-card/80 px-3 py-2">
                        <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-foreground">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          {sale.items.length} items
                        </div>
                        <ul className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-center justify-between gap-2 text-[11px]"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-foreground">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  x{item.cartQuantity} @ ₹
                                  {item.discountedPrice.toFixed(2)}
                                </p>
                              </div>
                              <span className="font-medium text-foreground">
                                ₹
                                {(
                                  item.discountedPrice * item.cartQuantity
                                ).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

