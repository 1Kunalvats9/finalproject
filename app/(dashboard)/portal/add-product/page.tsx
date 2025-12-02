"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Package, ScanLine, Hash, Save, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/AppContext"
import { generateEAN13, isValidEAN13 } from "@/lib/barcode"
import { UNIT_TYPES, UNITS, getUnitsByType, getUnitById } from "@/lib/units"

type Mode = "barcode" | "hsn"

export default function AddProductPage() {
  const { addProduct, updateProduct, getProductByBarcode, getProductByHsnSacCode } = useAppContext()

  const [mode, setMode] = useState<Mode>("barcode")

  const initialForm = useMemo(
    () => ({
      name: "",
      costPrice: "",
      originalPrice: "",
      discountedPrice: "",
      quantity: "",
      barcode: "",
      hsnSacCode: "",
      unit: "pc",
    }),
    [],
  )

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [useScannedBarcode, setUseScannedBarcode] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [showBarcodePreview, setShowBarcodePreview] = useState(false)
  const barcodeRef = useRef<HTMLInputElement | null>(null)

  const [hsnInput, setHsnInput] = useState("")
  const [hsnFeedback, setHsnFeedback] = useState<string | null>(null)
  const [existingHsnProduct, setExistingHsnProduct] = useState<ReturnType<typeof getProductByHsnSacCode>>()
  const [quantityToAdd, setQuantityToAdd] = useState("")

  const selectedUnit = getUnitById(form.unit) ?? getUnitById("pc")

  useEffect(() => {
    if (useScannedBarcode && barcodeRef.current) {
      barcodeRef.current.focus()
    }
  }, [useScannedBarcode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const processScannedBarcode = useCallback(
    (barcode: string) => {
      const trimmed = barcode.trim()
      if (!trimmed) {
        setFeedback("Invalid barcode. Please scan a valid barcode.")
        return
      }
      const existing = getProductByBarcode(trimmed)
      if (existing) {
        setForm({
          name: existing.name,
          costPrice: existing.costPrice != null ? String(existing.costPrice) : "",
          originalPrice: String(existing.originalPrice),
          discountedPrice: String(existing.discountedPrice),
          quantity: String(existing.quantity),
          barcode: existing.barcode,
          hsnSacCode: existing.hsnSacCode ?? "",
          unit: existing.unit || "pc",
        })
        setUseScannedBarcode(true)
        setShowBarcodePreview(true)
        setFeedback(`Loaded existing product "${existing.name}" from this barcode.`)
      } else {
        setForm({ ...initialForm, barcode: trimmed })
        setUseScannedBarcode(true)
        setShowBarcodePreview(true)
        setFeedback(`Barcode ${trimmed} scanned. Fill in the remaining details to save.`)
      }
    },
    [getProductByBarcode, initialForm],
  )

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      processScannedBarcode(barcodeInput)
      setBarcodeInput("")
    }
  }

  const generateNewBarcode = () => {
    const code = generateEAN13()
    setForm((prev) => ({ ...prev, barcode: code }))
    setUseScannedBarcode(false)
    setShowBarcodePreview(true)
    setFeedback("Generated a fresh EAN13 barcode for this product.")
  }

  const handleHsnLookup = useCallback(
    (code: string) => {
      const trimmed = code.trim()
      if (!trimmed) {
        setHsnFeedback("Please enter a valid HSN/SAC code.")
        return
      }
      const existing = getProductByHsnSacCode(trimmed)
      if (existing) {
        setExistingHsnProduct(existing)
        setHsnFeedback(`Found product "${existing.name}". Enter quantity to add.`)
      } else {
        setExistingHsnProduct(undefined)
        setForm({ ...initialForm, hsnSacCode: trimmed })
        setHsnFeedback("No product found with this HSN/SAC. Fill details to create a new one.")
      }
    },
    [getProductByHsnSacCode, initialForm],
  )

  const handleHsnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleHsnLookup(hsnInput)
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)
    try {
      if (!form.name.trim()) throw new Error("Product name is required.")

      if (mode === "barcode" && !form.barcode.trim()) {
        throw new Error("Barcode is required in barcode mode.")
      }

      const costPrice = Number.parseFloat(form.costPrice)
      const originalPrice = Number.parseFloat(form.originalPrice)
      const discountedPrice = Number.parseFloat(form.discountedPrice)
      const quantity = Number.parseFloat(form.quantity)

      if (!Number.isFinite(costPrice) || costPrice <= 0) throw new Error("Cost price must be positive.")
      if (!Number.isFinite(originalPrice) || originalPrice <= 0) throw new Error("MRP must be positive.")
      if (!Number.isFinite(discountedPrice) || discountedPrice <= 0)
        throw new Error("Selling price must be positive.")
      if (costPrice > discountedPrice) throw new Error("Cost price cannot exceed selling price.")
      if (!Number.isFinite(quantity) || quantity < 0) throw new Error("Quantity cannot be negative.")

      const payload = {
        name: form.name.trim(),
        costPrice,
        originalPrice,
        discountedPrice,
        quantity,
        barcode: form.barcode.trim() || generateEAN13(),
        hsnSacCode: form.hsnSacCode.trim() || undefined,
        unit: form.unit || "pc",
        // Local-only fields that AppContext will fill in: id, createdAt, updatedAt
        category: undefined,
        retailPrice: originalPrice,
        wholesalePrice: costPrice,
      }

      const existing = getProductByBarcode(payload.barcode)
      if (existing) {
        await updateProduct({
          ...existing,
          ...payload,
        })
        setFeedback(`Updated existing product "${payload.name}".`)
      } else {
        await addProduct(payload as any)
        setFeedback(`Added new product "${payload.name}".`)
      }

      setSuccess(true)
      setForm(initialForm)
      setBarcodeInput("")
      setHsnInput("")
      setUseScannedBarcode(false)
      setShowBarcodePreview(false)
      setExistingHsnProduct(undefined)
      setQuantityToAdd("")

      setTimeout(() => {
        setSuccess(false)
      }, 2500)
    } catch (err: any) {
      setFeedback(err?.message ?? "Something went wrong while saving the product.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStockForHsn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!existingHsnProduct) return
    setLoading(true)
    setHsnFeedback(null)
    try {
      const qty = Number.parseFloat(quantityToAdd)
      if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be positive.")

      await updateProduct({
        ...existingHsnProduct,
        quantity: existingHsnProduct.quantity + qty,
      })

      setSuccess(true)
      setHsnFeedback(`Added ${qty} ${existingHsnProduct.unit || "pc"} to "${existingHsnProduct.name}".`)
      setQuantityToAdd("")
      setTimeout(() => {
        setSuccess(false)
      }, 2500)
    } catch (err: any) {
      setHsnFeedback(err?.message ?? "Failed to update stock.")
    } finally {
      setLoading(false)
    }
  }

  const productForm = (
    <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
      <div className="border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Product details</h2>
      </div>
      <form onSubmit={handleSubmitProduct} className="space-y-4 p-4 md:p-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Product name *</label>
          <Input name="name" value={form.name} onChange={handleInputChange} placeholder="e.g. Aashirvaad Atta 5kg" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">HSN / SAC (optional)</label>
          <Input
            name="hsnSacCode"
            value={form.hsnSacCode}
            onChange={handleInputChange}
            placeholder="e.g. 1001"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Unit</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleInputChange}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground shadow-sm shadow-black/5"
          >
            {Object.values(UNIT_TYPES).map((type) => (
              <optgroup key={type} label={`${type[0]?.toUpperCase()}${type.slice(1)} units`}>
                {getUnitsByType(type).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Cost price (₹) *</label>
            <Input
              type="number"
              name="costPrice"
              min={0}
              step="0.01"
              value={form.costPrice}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">MRP (₹) *</label>
            <Input
              type="number"
              name="originalPrice"
              min={0}
              step="0.01"
              value={form.originalPrice}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Selling price (₹) *</label>
            <Input
              type="number"
              name="discountedPrice"
              min={0}
              step="0.01"
              value={form.discountedPrice}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Initial stock ({selectedUnit?.symbol ?? "pc"}) *
          </label>
          <Input
            type="number"
            name="quantity"
            min={0}
            step={selectedUnit?.type === "piece" ? "1" : "0.01"}
            value={form.quantity}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>

        {Number(form.costPrice) > 0 && Number(form.discountedPrice) > Number(form.costPrice) && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
            <div className="flex items-center justify-between">
              <span>Margin</span>
              <span className="font-semibold">
                ₹{(Number(form.discountedPrice) - Number(form.costPrice)).toFixed(2)} (
                {Math.round(
                  ((Number(form.discountedPrice) - Number(form.costPrice)) / Number(form.costPrice)) * 100,
                )}
                %)
              </span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="default"
          size="sm"
          className="mt-1 w-full"
          disabled={loading || (mode === "barcode" && !form.barcode.trim())}
        >
          {loading ? (
            "Saving…"
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {getProductByBarcode(form.barcode.trim() || "") ? "Update product" : "Add product"}
            </>
          )}
        </Button>
      </form>
    </div>
  )

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Add / Update product</h1>
        <p className="text-sm text-muted-foreground">
          Create new SKUs, scan or generate barcodes, and keep pricing & stock in sync with your shelves.
        </p>
      </header>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          <Check className="h-4 w-4" />
          <span>Saved successfully.</span>
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm shadow-black/30">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Input method
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "barcode" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("barcode")}
          >
            <ScanLine className="mr-2 h-4 w-4" />
            Barcode
          </Button>
          <Button
            type="button"
            variant={mode === "hsn" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("hsn")}
          >
            <Hash className="mr-2 h-4 w-4" />
            HSN / SAC
          </Button>
        </div>
      </div>

      {mode === "barcode" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.3fr)]">
          <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
            <div className="border-b border-border/70 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                <ScanLine className="h-4 w-4" />
                Barcode tools
              </h2>
            </div>
            <div className="space-y-4 p-4 md:p-6">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={useScannedBarcode ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setUseScannedBarcode(true)}
                >
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan
                </Button>
                <Button
                  type="button"
                  variant={!useScannedBarcode ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={generateNewBarcode}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>

              {useScannedBarcode && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Focus the field and scan a barcode; press Enter to load or create the product.
                  </p>
                  <Input
                    ref={barcodeRef}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                    placeholder="Scan barcode…"
                    className="text-center font-mono"
                  />
                </div>
              )}

              {form.barcode && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Current barcode</label>
                  <Input value={form.barcode} readOnly className="font-mono" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowBarcodePreview((v) => !v)}
                  >
                    {showBarcodePreview ? "Hide preview" : "Show preview"}
                  </Button>
                </div>
              )}

              {showBarcodePreview && form.barcode && (
                <div className="rounded-lg border border-border/60 bg-background/80 p-3 text-center text-xs text-muted-foreground">
                  {isValidEAN13(form.barcode) ? (
                    <>
                      <div className="mb-1 font-mono tracking-[0.28em]">{form.barcode}</div>
                      <p>Valid EAN13 barcode – ready for sticker printing.</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-1 font-mono tracking-[0.28em]">{form.barcode}</div>
                      <p>Non-standard barcode – still usable for scanning in POS.</p>
                    </>
                  )}
                </div>
              )}

              {feedback && (
                <p
                  className={`text-xs ${
                    feedback.toLowerCase().includes("error") || feedback.toLowerCase().includes("invalid")
                      ? "text-red-400"
                      : "text-emerald-300"
                  }`}
                >
                  {feedback}
                </p>
              )}
            </div>
          </div>

          {productForm}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.3fr)]">
          <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
            <div className="border-b border-border/70 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                <Hash className="h-4 w-4" />
                HSN / SAC lookup
              </h2>
            </div>
            <div className="space-y-4 p-4 md:p-6">
              <p className="text-xs text-muted-foreground">
                Enter an HSN/SAC code and press Enter to either fetch an existing product or start a new one.
              </p>
              <Input
                value={hsnInput}
                onChange={(e) => setHsnInput(e.target.value)}
                onKeyDown={handleHsnKeyDown}
                placeholder="e.g. 1001"
                className="text-center"
              />
              {hsnFeedback && (
                <p
                  className={`text-xs ${
                    hsnFeedback.toLowerCase().includes("found") ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {hsnFeedback}
                </p>
              )}
              {existingHsnProduct && (
                <div className="rounded-lg border border-border/70 bg-background/80 p-3 text-xs">
                  <p className="font-medium text-foreground">{existingHsnProduct.name}</p>
                  <p className="text-muted-foreground">
                    Current stock: {existingHsnProduct.quantity} {existingHsnProduct.unit || "pc"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {existingHsnProduct ? (
            <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/30">
              <div className="border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Add stock</h2>
              </div>
              <form onSubmit={handleAddStockForHsn} className="space-y-4 p-4 md:p-6">
                <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs">
                  Adding stock to <span className="font-semibold">{existingHsnProduct.name}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Quantity to add ({existingHsnProduct.unit || "pc"}) *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="default" size="sm" className="w-full" disabled={loading}>
                  {loading ? (
                    "Updating…"
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to stock
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            productForm
          )}
        </div>
      )}
    </section>
  )
}

