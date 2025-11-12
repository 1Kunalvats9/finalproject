"use client"

import { useState, type FormEvent } from "react"
import { MagneticButton } from "@/components/magnetic-button"

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
      const body =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : { email: formData.email, password: formData.password, name: formData.name }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Something went wrong")

      if (data.token) {
        try {
          localStorage.setItem("auth-token", data.token)
        } catch {}
      }
      window.location.href = "/"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-foreground/20 bg-background/95 p-8 shadow-xl backdrop-blur-xl">
      <h1 className="mb-2 font-sans text-3xl font-light tracking-tight text-foreground">
        {mode === "login" ? "Welcome back" : "Create account"}
      </h1>
      <p className="mb-6 font-mono text-sm text-foreground/60">
        {mode === "login" ? "Sign in to your account" : "Start by creating your account"}
      </p>
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
    </div>
  )
}


