"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const emailFromUrl = params.get("email") ?? ""

  const [email, setEmail] = useState(emailFromUrl)
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/email/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword: password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.")
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push("/login"), 2500)
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Password updated!</h1>
        <p className="text-zinc-400 text-sm">Redirecting you to login…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Reset your password</h1>
        <p className="text-zinc-400 text-sm mt-2">Enter the 6-digit code from your email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!emailFromUrl && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="otp">6-digit OTP</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            className="text-center tracking-[0.5em] text-xl font-mono"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              className="pl-9 pr-9"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-400 mt-6">
        OTP expired?{" "}
        <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
          Request a new one
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-sm">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
