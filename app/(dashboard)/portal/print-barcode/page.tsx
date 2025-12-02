"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Printer, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/AppContext"
import { BarcodeDisplay } from "@/components/barcode-display"

export default function PrintBarcodePage() {
  const { products } = useAppContext()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copies, setCopies] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q),
    )
  }, [products, query])

  const selected = useMemo(
    () => (selectedId ? products.find((p) => p.id === selectedId) ?? null : null),
    [products, selectedId],
  )

  const handlePrint = useCallback(() => {
    if (!selected) {
      setError("Select a product to print labels for.")
      return
    }
    if (copies < 1) {
      setError("Label quantity must be at least 1.")
      return
    }
    setError(null)
    setPrinting(true)

    const win = window.open("", "_blank", "width=800,height=600,scrollbars=yes")
    if (!win) {
      setError("Popup blocked. Allow popups to print labels.")
      setPrinting(false)
      return
    }

    let labelsHtml = ""
    for (let i = 0; i < copies; i++) {
      labelsHtml += `
        <div class="label-item">
          <p class="label-name">${selected.name}</p>
          <p class="label-price">₹${(selected.discountedPrice || selected.originalPrice || 0).toFixed(2)}</p>
          <svg class="label-barcode" data-code="${selected.barcode}"></svg>
          <p class="label-barcode-text">${selected.barcode}</p>
        </div>
      `
    }

    win.document.write(`
      <html>
      <head>
        <title>Print barcode labels</title>
        <style>
          @page { size: auto; margin: 0; }
          body {
            margin: 0;
            padding: 8px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
            -webkit-print-color-adjust: exact;
          }
          .label-item {
            width: 2.5in;
            height: 1.1in;
            border: 1px solid #d4d4d8;
            padding: 4px;
            margin: 4px;
            display: inline-block;
            text-align: center;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          .label-name {
            font-size: 0.7em;
            font-weight: 600;
            margin: 0 0 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .label-price {
            font-size: 0.75em;
            font-weight: 600;
            margin: 0 0 3px;
          }
          .label-barcode-text {
            font-size: 0.6em;
            margin: 1px 0 0;
          }
          svg.label-barcode {
            width: 100%;
            height: 48px;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function () {
            const nodes = document.querySelectorAll("svg.label-barcode");
            nodes.forEach((node) => {
              const value = node.getAttribute("data-code") || "";
              try {
                JsBarcode(node, value, {
                  format: "EAN13",
                  displayValue: false,
                  height: 38,
                  width: 1.4,
                  margin: 0
                });
              } catch (e) {
                node.outerHTML = '<p style="font-size: 0.6em; color: #b91c1c;">Invalid barcode ' + value + "</p>";
              }
            });
            window.print();
          };
        </script>
      </head>
      <body>
        ${labelsHtml}
      </body>
      </html>
    `)

    win.document.close()
    win.focus()
    setPrinting(false)
  }, [copies, selected])

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Print barcode labels
        </h1>
        <p className="text-sm text-muted-foreground">
          Search any SKU, preview its EAN13 barcode and send perfectly sized labels to your printer.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.2fr)]">
        {/* Left: search + list */}
        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Choose product
            </h2>
          </div>
          <div className="space-y-3 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Search by name or barcode…"
                className="pl-8 pr-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-border/70 bg-background/60 text-xs">
              {!query ? (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  Start typing to find a product.
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  No products match your search.
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {filtered.map((p) => (
                    <li
                      key={p.id}
                      className={`cursor-pointer px-3 py-2 transition-colors ${
                        selectedId === p.id
                          ? "bg-primary/10"
                          : "hover:bg-background/60"
                      }`}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-foreground">{p.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {p.barcode}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-foreground">
                          ₹{p.discountedPrice.toFixed(0)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right: preview + print */}
        <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
          <div className="border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Preview & quantity
            </h2>
          </div>
          <div className="space-y-4 p-4">
            {selected ? (
              <>
                {error && (
                  <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                    {error}
                  </p>
                )}
                <div className="space-y-1 text-xs">
                  <p className="truncate font-medium text-foreground">
                    {selected.name}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {selected.barcode}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Price:{" "}
                    <span className="font-semibold text-foreground">
                      ₹
                      {(selected.discountedPrice || selected.originalPrice || 0).toFixed(
                        2,
                      )}
                    </span>
                  </p>
                </div>

                <BarcodeDisplay value={selected.barcode} />

                <div className="space-y-1 text-xs">
                  <label className="text-xs font-medium text-muted-foreground">
                    Number of labels
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={copies}
                    onChange={(e) =>
                      setCopies(
                        Math.max(1, Number.parseInt(e.target.value || "1", 10) || 1),
                      )
                    }
                  />
                </div>

                <Button
                  type="button"
                  className="mt-2 w-full"
                  size="sm"
                  onClick={handlePrint}
                  disabled={printing}
                >
                  {printing ? (
                    "Preparing…"
                  ) : (
                    <>
                      <Printer className="mr-2 h-4 w-4" />
                      Print labels
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex h-full items-center justify-center py-10 text-xs text-muted-foreground">
                Choose a product on the left to preview its barcode and print labels.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

