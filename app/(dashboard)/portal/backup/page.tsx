"use client"

import { useState } from "react"
import { Download, RotateCcw } from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { saveCustomers, saveProducts, saveSales } from "@/lib/storage"

export default function BackupPage() {
  const { products, customers, sales } = useAppContext()
  const [message, setMessage] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)

  const handleDownload = () => {
    const snapshot = {
      version: 1,
      takenAt: new Date().toISOString(),
      products,
      customers,
      sales,
    }
    const json = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `apnidukaan-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage("Backup downloaded as JSON. Keep it safe offline.")
  }

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setRestoring(true)
      setMessage(null)
      const text = await file.text()
      const data = JSON.parse(text) as {
        products?: unknown[]
        customers?: unknown[]
        sales?: unknown[]
      }

      if (!Array.isArray(data.products) || !Array.isArray(data.customers) || !Array.isArray(data.sales)) {
        throw new Error("Selected file does not look like a valid backup.")
      }

      await Promise.all([
        saveProducts(data.products),
        saveCustomers(data.customers),
        saveSales(data.sales),
      ])

      setMessage("Backup restored into this browser. Refresh the page to see all changes.")
    } catch (err: any) {
      console.error("Restore failed", err)
      setMessage(err?.message ?? "Failed to restore backup file.")
    } finally {
      setRestoring(false)
      e.target.value = ""
    }
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Backup &amp; restore
        </h1>
        <p className="text-sm text-muted-foreground">
          Export your local products, customers and sales as a JSON file and restore them later into any browser.
        </p>
      </header>

      {message && (
        <div className="rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-xs text-muted-foreground">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Create backup
            </h2>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Downloads a snapshot of all data stored in this browser: products, customers and sales.
          </p>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex w-full items-center justify-center rounded-lg border border-border/70 bg-primary text-xs font-medium text-primary-foreground shadow-sm shadow-black/30 hover:bg-primary/90 px-3 py-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Download JSON backup
          </button>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-black/30">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Restore from file
            </h2>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Choose a previously downloaded backup file to overwrite the current local data.
          </p>
          <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-border/70 bg-background/80 text-xs font-medium text-foreground shadow-sm shadow-black/30 hover:bg-background px-3 py-2">
            <RotateCcw className="mr-2 h-4 w-4" />
            {restoring ? "Restoring…" : "Select backup file"}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleRestoreFile}
              disabled={restoring}
            />
          </label>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Recommended: restore into an empty browser profile or after taking a fresh backup.
          </p>
        </div>
      </div>
    </section>
  )
}

