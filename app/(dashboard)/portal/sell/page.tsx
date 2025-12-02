"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Phone, ScanLine, Search, ShoppingBag, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/AppContext"
import { formatQuantityWithUnit, getUnitById } from "@/lib/units"

export default function SellPage() {
  const {
    products,
    customers,
    sales,
    carts,
    activeCartId,
    addToCart,
    clearCart,
    checkout,
    getActiveCart,
    getActiveCartItems,
    updateCartCustomer,
  } = useAppContext()

  const [barcodeInput, setBarcodeInput] = useState("")
  const [scanFeedback, setScanFeedback] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [checkoutSuccess, setCheckoutSuccess] = useState<null | { billNumber: number | null }>(null)
  const [customerSuggestions, setCustomerSuggestions] = useState<typeof customers>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const barcodeRef = useRef<HTMLInputElement | null>(null)

  const activeCart = getActiveCart()
  const items = getActiveCartItems()

  const cartTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.discountedPrice * i.cartQuantity, 0),
    [items],
  )

  const totalSavings = useMemo(
    () => items.reduce((sum, i) => sum + (i.originalPrice - i.discountedPrice) * i.cartQuantity, 0),
    [items],
  )

  const nextBillNumber = useMemo(() => {
    if (!sales.length) return 1
    const last = [...sales].sort((a, b) => b.billNumber - a.billNumber)[0]
    return (last?.billNumber ?? 0) + 1
  }, [sales])

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q),
    )
  }, [products, search])

  useEffect(() => {
    if (barcodeRef.current) {
      barcodeRef.current.focus()
    }
  }, [])

  const processBarcode = useCallback(
    (raw: string) => {
      const code = raw.trim()
      if (!code) {
        setScanFeedback("Scan a valid barcode.")
        return
      }

      const product = products.find((p) => p.barcode === code)
      if (!product) {
        setScanFeedback(`No product found for barcode ${code}.`)
        return
      }

      const existing = items.find((i) => i.barcode === code)
      const already = existing ? existing.cartQuantity : 0
      if (already >= product.quantity) {
        setScanFeedback(
          `Cannot add more ${product.name}. Only ${formatQuantityWithUnit(
            product.quantity,
            product.unit || "pc",
          )} in stock.`,
        )
        return
      }

      addToCart(product, 1)
      setScanFeedback(
        existing
          ? `Increased quantity of ${product.name} in cart.`
          : `Added ${product.name} to cart.`,
      )
      setTimeout(() => setScanFeedback(null), 2500)
    },
    [addToCart, items, products],
  )

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (!barcodeInput.trim()) return
      processBarcode(barcodeInput)
      setBarcodeInput("")
    }
  }

  const handleQuickAdd = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const existing = items.find((i) => i.id === product.id)
    const already = existing ? existing.cartQuantity : 0
    if (already >= product.quantity) {
      setScanFeedback(
        `Cannot add more ${product.name}. Only ${formatQuantityWithUnit(
          product.quantity,
          product.unit || "pc",
        )} in stock.`,
      )
      return
    }
    addToCart(product, 1)
  }

  const handleCustomerChange = (value: string) => {
    updateCartCustomer(activeCartId, value)
    if (value.trim().length >= 3) {
      const matches = customers
        .filter((c) => c.phoneNumber.includes(value.trim()))
        .slice(0, 5)
      setCustomerSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleCheckout = async () => {
    if (!activeCart.customerPhone?.trim()) {
      alert("Enter customer phone number before checkout.")
      return
    }
    if (!items.length) {
      alert("Cart is empty.")
      return
    }
    const billNumber = await checkout(activeCart.customerPhone, activeCartId)
    setCheckoutSuccess({ billNumber: billNumber ?? null })
    setBarcodeInput("")
    if (barcodeRef.current) barcodeRef.current.focus()
  }

  return (
    <section className="flex h-full flex-col gap-6 pb-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sell (POS)
        </h1>
        <p className="text-sm text-muted-foreground">
          Scan barcodes, search items and check out faster than your queue grows.
        </p>
      </header>

      {/* Bill meta */}
      <div className="rounded-xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm shadow-black/30">
        <div className="flex flex-col justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>
            <p className="font-mono text-[11px] text-foreground/80">
              Next bill:{" "}
              <span className="font-semibold text-primary">
                #{nextBillNumber}
              </span>
            </p>
            <p>
              {new Date().toLocaleString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <p>
            Active cart:{" "}
            <span className="font-medium text-foreground">
              {activeCart.name} ({items.length} items)
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        {/* Left side: scanner + search */}
        <div className="flex flex-1 flex-col gap-4 lg:w-1/2">
          <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
            <div className="border-b border-border/70 bg-primary/5 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                <ScanLine className="h-4 w-4" />
                Scan barcodes
              </h2>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-xs text-muted-foreground">
                Focus stays on this field so your scanner can keep firing as you
                move through the queue.
              </p>
              <Input
                ref={barcodeRef}
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value)
                  setScanFeedback(null)
                }}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="Scan or type barcode, then press Enter…"
                className="text-center font-mono text-lg tracking-[0.3em]"
              />
              {scanFeedback && (
                <p
                  className={`text-xs ${
                    scanFeedback.toLowerCase().includes("cannot") ||
                    scanFeedback.toLowerCase().includes("no product")
                      ? "text-red-300"
                      : "text-emerald-300"
                  }`}
                >
                  {scanFeedback}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
            <div className="border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Quick search
              </h2>
            </div>
            <div className="space-y-3 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or barcode…"
                  className="pl-8 pr-8"
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

              <div className="max-h-64 overflow-y-auto">
                {search && searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No products match your query.
                  </div>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {searchResults.map((p) => {
                      const unit = getUnitById(p.unit || "pc")
                      return (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-foreground">
                              {p.name}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {p.barcode}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Stock:{" "}
                              {formatQuantityWithUnit(
                                p.quantity,
                                p.unit || "pc",
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] font-semibold text-foreground">
                              ₹{p.discountedPrice.toFixed(2)}{" "}
                              <span className="text-muted-foreground">
                                / {unit?.symbol ?? "pc"}
                              </span>
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              disabled={p.quantity <= 0}
                              onClick={() => handleQuickAdd(p.id)}
                            >
                              Add
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: cart + checkout */}
        <div className="flex flex-1 flex-col gap-4 lg:w-1/2">
          <div className="flex-1 rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
            <div className="flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                <ShoppingBag className="h-4 w-4" />
                {activeCart.name}
                <span className="text-[11px] font-normal text-muted-foreground">
                  {items.length} items
                </span>
              </h2>
              {items.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  onClick={clearCart}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="max-h-[48vh] flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Scan or search to add items to this cart.
                </div>
              ) : (
                <ul className="space-y-2 text-xs">
                  {items.map((item, idx) => {
                    const unit = getUnitById(item.unit || "pc")
                    return (
                      <li
                        key={`${item.id}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-foreground">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatQuantityWithUnit(
                              item.cartQuantity,
                              item.unit || "pc",
                            )}{" "}
                            @ ₹{item.discountedPrice.toFixed(2)}{" "}
                            <span className="text-muted-foreground">
                              / {unit?.symbol ?? "pc"}
                            </span>
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-foreground">
                          ₹
                          {(
                            item.discountedPrice * item.cartQuantity
                          ).toFixed(2)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-border/70 bg-background/90 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="mb-3 flex items-center justify-between text-xs text-emerald-300">
                  <span>You save</span>
                  <span className="font-semibold">
                    ₹{totalSavings.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Customer phone
                </div>
                <div className="relative">
                  <Input
                    type="tel"
                    value={activeCart.customerPhone || ""}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="pr-8"
                  />
                  {activeCart.customerPhone && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCustomerChange("")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {showSuggestions && customerSuggestions.length > 0 && (
                    <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-border/70 bg-card/95 text-[11px] shadow-lg shadow-black/40">
                      {customerSuggestions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="flex w-full justify-between px-3 py-2 text-left hover:bg-background/80"
                          onClick={() => {
                            handleCustomerChange(c.phoneNumber)
                            setShowSuggestions(false)
                          }}
                        >
                          <span>{c.phoneNumber}</span>
                          <span className="text-muted-foreground">
                            Joined{" "}
                            {new Date(c.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="button"
                className="mt-3 w-full"
                size="sm"
                disabled={
                  !items.length || !activeCart.customerPhone?.trim()
                }
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-card/95 p-6 text-center shadow-xl shadow-black/60">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Check className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Checkout successful
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              The sale has been recorded in this browser. You can now move to
              the next customer.
            </p>
            {checkoutSuccess.billNumber != null && (
              <p className="mt-2 text-xs font-mono text-primary">
                Bill #{checkoutSuccess.billNumber}
              </p>
            )}
            <Button
              type="button"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setCheckoutSuccess(null)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

