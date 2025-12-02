import type { ReactNode } from "react"
import Link from "next/link"

type DashboardLayoutProps = {
  children: ReactNode
}

// Simple, predictable layout:
// - Fixed-width sidebar on the left
// - Main dashboard content (children) on the right
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left sidebar */}
      <aside className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <span className="text-sm font-semibold">ApniDukaan</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-sm">
          <p className="px-2 text-xs font-semibold text-sidebar-foreground/70 mb-2">
            Dashboard
          </p>
          <Link
            href="/page1"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <span>Page 1</span>
          </Link>
          {/* Add more dashboard links here */}
        </nav>

        <div className="border-t border-sidebar-border px-3 py-2 text-xs text-sidebar-foreground/70">
          Signed in dashboard
        </div>
      </aside>

      {/* Right main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-4">
          <h1 className="text-base font-semibold tracking-tight">
            Dashboard
          </h1>
        </header>

        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
