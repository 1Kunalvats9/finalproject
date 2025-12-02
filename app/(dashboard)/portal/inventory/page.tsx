"use client"

import { useMemo, useState } from "react"
import { Edit2, Search, ShoppingCart, Trash2, X, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppContext, type Product } from "@/context/AppContext"
import { formatQuantityWithUnit, getUnitById, getUnitsByType, UNIT_TYPES } from "@/lib/units"

type SortKey = "name" | "price" | "stock"

export default function InventoryPage() {
  const { products, updateProduct, deleteProduct, addToCart } = useAppContext()

  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [editing, setEditing] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const name = p.name.toLowerCase()
      const barcode = p.barcode.toLowerCase()
      const hsn = (p.hsnSacCode ?? "").toLowerCase()
      return name.includes(q) || barcode.includes(q) || hsn.includes(q)
    })
  }, [products, search])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name)
      } else if (sortBy === "price") {
        cmp = a.discountedPrice - b.discountedPrice
      } else {
        cmp = a.quantity - b.quantity
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
    return copy
  }, [filtered, sortBy, sortDirection])

  const toggleSort = (key: SortKey) => {
    setSortBy((current) => {
      if (current === key) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
        return current
      }
      setSortDirection("asc")
      return key
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product from your inventory?")) return
    await deleteProduct(id)
  }

  const handleEditingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editing) return
    const { name, value } = e.target
    let next: any = value

    if (name === "quantity") {
      const unit = getUnitById(editing.unit || "pc")
      if (unit?.type === "piece") {
        next = Number.parseInt(value || "0", 10) || 0
      } else {
        next = Number.parseFloat(value || "0") || 0
      }
    } else if (name === "originalPrice" || name === "discountedPrice") {
      next = Number.parseFloat(value || "0") || 0
    }

    setEditing({
      ...editing,
      [name]: next,
    })
  }

  const handleSaveEditing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    await updateProduct(editing)
    setEditing(null)
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Browse, search and adjust every product that lives in your ApniDukaan carts.
          </p>
        </div>

        <div className="mt-3 w-full max-w-xs md:mt-0">
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
        </div>
      </header>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>
          Showing <span className="font-medium text-foreground">{sorted.length}</span> products
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={() => toggleSort("name")}
          >
            Name
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={() => toggleSort("price")}
          >
            Price
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={() => toggleSort("stock")}
          >
            Stock
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/70 px-6 py-12 text-sm text-muted-foreground shadow-sm shadow-black/30">
          <p className="font-medium">No products yet</p>
          <p className="mt-1 text-xs">
            Use the <span className="font-semibold">Add / Update product</span> screen to seed your catalog.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((product) => {
            const unit = getUnitById(product.unit || "pc")
            const qtyLabel = formatQuantityWithUnit(product.quantity, product.unit || "pc")
            const stockTone =
              product.quantity === 0
                ? "bg-red-500/10 text-red-200 border-red-500/40"
                : product.quantity < 5
                  ? "bg-amber-500/10 text-amber-100 border-amber-500/40"
                  : "bg-emerald-500/10 text-emerald-100 border-emerald-500/40"

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">{product.name}</p>
                      {product.hsnSacCode && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          HSN/SAC: <span className="font-mono">{product.hsnSacCode}</span>
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {unit?.name ?? "Piece"}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-muted-foreground">#{product.barcode}</p>

                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        ₹{product.discountedPrice.toFixed(2)}{" "}
                        <span className="text-[11px] text-muted-foreground">per {unit?.symbol ?? "pc"}</span>
                      </p>
                      {product.originalPrice > product.discountedPrice && (
                        <p className="text-[11px] text-muted-foreground line-through">
                          MRP ₹{product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${stockTone}`}
                    >
                      {qtyLabel} in stock
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 text-[11px]"
                    onClick={() => setEditing(product)}
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 text-[11px]"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-300" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 flex-1 text-[11px]"
                    onClick={() => addToCart(product, 1)}
                    disabled={product.quantity <= 0}
                  >
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                    Add to cart
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Edit product</h2>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {editing.name}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                onClick={() => setEditing(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditing} className="max-h-[80vh] space-y-3 overflow-y-auto px-5 py-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Product name</label>
                <Input name="name" value={editing.name} onChange={handleEditingChange} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">HSN / SAC</label>
                <Input
                  name="hsnSacCode"
                  value={editing.hsnSacCode ?? ""}
                  onChange={handleEditingChange}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Unit</label>
                <select
                  name="unit"
                  value={editing.unit || "pc"}
                  onChange={handleEditingChange}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground shadow-sm shadow-black/5"
                >
                  <optgroup label="Piece units">
                    {getUnitsByType(UNIT_TYPES.PIECE).map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Weight units">
                    {getUnitsByType(UNIT_TYPES.WEIGHT).map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Volume units">
                    {getUnitsByType(UNIT_TYPES.VOLUME).map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Length units">
                    {getUnitsByType(UNIT_TYPES.LENGTH).map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Barcode</label>
                <Input name="barcode" value={editing.barcode} onChange={handleEditingChange} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">MRP (₹)</label>
                  <Input
                    type="number"
                    name="originalPrice"
                    min={0}
                    step="0.01"
                    value={editing.originalPrice}
                    onChange={handleEditingChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Selling price (₹)</label>
                  <Input
                    type="number"
                    name="discountedPrice"
                    min={0}
                    step="0.01"
                    value={editing.discountedPrice}
                    onChange={handleEditingChange}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Quantity ({getUnitById(editing.unit || "pc")?.symbol ?? "pc"})
                </label>
                <Input
                  type="number"
                  name="quantity"
                  min={0}
                  step="1"
                  value={editing.quantity}
                  onChange={handleEditingChange}
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 pb-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

