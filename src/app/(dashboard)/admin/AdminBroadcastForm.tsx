"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminBroadcastForm({ userCount }: { userCount: number }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [ctaLabel, setCtaLabel] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent?: number; error?: string } | null>(null)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!confirm(`Send this email to ALL ${userCount} users? This cannot be undone.`)) return

    setLoading(true)
    setResult(null)

    const res = await fetch("/api/email/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, ctaLabel: ctaLabel || undefined, ctaUrl: ctaUrl || undefined }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          placeholder="e.g. New feature: Mock Interviews now live!"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Message body</Label>
        <Textarea
          placeholder="Write your message here. Plain text or simple HTML."
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>CTA button label (optional)</Label>
          <Input
            placeholder="e.g. Try it now"
            value={ctaLabel}
            onChange={e => setCtaLabel(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA URL (optional)</Label>
          <Input
            type="url"
            placeholder="https://careerverse-ai-sigma.vercel.app/..."
            value={ctaUrl}
            onChange={e => setCtaUrl(e.target.value)}
          />
        </div>
      </div>

      {result && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${result.error ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
          {result.error ? `Error: ${result.error}` : `✓ Sent to ${result.sent} users`}
        </div>
      )}

      <Button type="submit" disabled={loading} variant="destructive">
        {loading ? "Sending…" : `Send to ${userCount} users`}
      </Button>
    </form>
  )
}
