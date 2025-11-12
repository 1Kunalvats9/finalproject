"use client"

import { useState, type FormEvent } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { MagneticButton } from "@/components/magnetic-button"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
      const body = mode === "login" 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      if (data.token) {
        try {
          localStorage.setItem("auth-token", data.token)
        } catch {
        }
      }

      // Success - close modal and reset form
      setFormData({ name: "", email: "", password: "" })
      onOpenChange(false)
      onAuthSuccess?.()
      
      // Refresh to update auth state
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setError(null)
    setFormData({ name: "", email: "", password: "" })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-foreground/20 bg-background/95 p-8 shadow-xl backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-foreground/20">
            <X className="h-4 w-4 text-foreground" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <Dialog.Title className="mb-2 font-sans text-3xl font-light tracking-tight text-foreground">
            {mode === "login" ? "Welcome back" : "Create account"}
          </Dialog.Title>
          <Dialog.Description className="mb-6 font-mono text-sm text-foreground/60">
            {mode === "login" 
              ? "Sign in to access your ApniDukaan dashboard" 
              : "Start managing your inventory with ApniDukaan"}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block font-mono text-xs text-foreground/60">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={mode === "signup"}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors caret-foreground cursor-text"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block font-mono text-xs text-foreground/60">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors caret-foreground cursor-text"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs text-foreground/60">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors caret-foreground cursor-text"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5">
                <p className="font-mono text-xs text-destructive">{error}</p>
              </div>
            )}

            <MagneticButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </MagneticButton>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="font-mono text-xs text-foreground/60 underline-offset-4 hover:text-foreground/80 hover:underline"
            >
              {mode === "login" 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

