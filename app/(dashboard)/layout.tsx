"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { AppProvider } from "@/context/AppContext"

type DashboardLayoutProps = {
  children: ReactNode
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/dashboard" },
  { label: "Inventory", href: "/portal/inventory" },
  { label: "Add / Update Product", href: "/portal/add-product" },
  { label: "Customers", href: "/portal/customers" },
  { label: "Sell (POS)", href: "/portal/sell" },
  { label: "Print Barcode", href: "/portal/print-barcode" },
  { label: "Analytics", href: "/portal/analytics" },
  { label: "Backup & Restore", href: "/portal/backup" },
  { label: "Parties & Bills", href: "/portal/parties" },
  { label: "Accounting", href: "/portal/accounting" },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  // Simple client-side guard – this app is JWT + localStorage based
  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [loading, user, router])

  return (
    <AppProvider>
      <div className="dashboard-shell flex min-h-screen bg-linear-to-br from-background via-background/95 to-background text-foreground">
        {/* Left sidebar */}
        <aside className="flex h-screen w-64 flex-col border-r border-border/70 bg-secondary/80 text-foreground shadow-xl shadow-black/40">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ApniDukaan Logo"
              width={28}
              height={28}
              className="rounded-lg shadow-md shadow-black/40"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              ApniDukaan
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
          <p className="mb-2 px-2 text-xs font-semibold text-foreground/60">
            Portal
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    "transition-colors duration-150",
                    "hover:bg-primary/15 hover:text-primary",
                    isActive
                      ? "bg-primary/20 font-medium text-primary border border-primary/50"
                      : "text-foreground/80",
                  ].join(" ")}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-border/70 px-3 py-2 text-xs text-foreground/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-medium truncate text-foreground">
                {user?.name || user?.email || "ApniDukaan Portal"}
              </span>
              <span className="text-[10px] text-foreground/60">
                Multi-tenant inventory workspace
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => logout()}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

        {/* Right main content */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-14 items-center border-b border-border/70 bg-background/90 px-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ApniDukaan Logo"
                width={24}
                height={24}
                className="rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground/60">
                  ApniDukaan Portal
                </span>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {getPageTitle(pathname)}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  )
}

function getPageTitle(pathname: string | null) {
  if (!pathname) return "Dashboard"
  const match = NAV_ITEMS.find((item) =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  )
  return match?.label ?? "Dashboard"
}

