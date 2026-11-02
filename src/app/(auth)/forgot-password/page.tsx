"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/email/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
          📬
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Check your inbox</h1>
        <p className="text-zinc-400 text-sm mb-6">
          We sent a 6-digit OTP to <strong className="text-zinc-200">{email}</strong>. Enter it on the next screen to reset your password.
        </p>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
          <Button className="w-full">Enter OTP</Button>
        </Link>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Didn&apos;t get it? Resend
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/login" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to login
      </Link>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Forgot password?</h1>
        <p className="text-zinc-400 text-sm mt-2">Enter your email and we&apos;ll send you a reset code.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset code"}
        </Button>
      </form>
    </div>
  )
}
