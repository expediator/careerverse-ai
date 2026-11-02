import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sendBatch } from "@/lib/email"
import { broadcastEmail } from "@/lib/email-templates"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { subject, message, ctaLabel, ctaUrl } = await req.json()
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
  }

  const users = await db.user.findMany({ select: { email: true, name: true } })
  const emails = users
    .filter(u => u.email)
    .map(u => ({
      to: u.email,
      subject,
      html: broadcastEmail({ subject, message, ctaLabel, ctaUrl }),
    }))

  const result = await sendBatch(emails)
  return NextResponse.json(result)
}
