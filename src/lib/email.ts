import { Resend } from "resend"

let _resend: Resend | null = null
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const FROM_EMAIL = "CareerVerse AI <onboarding@resend.dev>"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  const resend = getResend()
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping send")
    return { success: false, error: "not_configured" }
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error("[email] send error:", err)
    return { success: false, error: String(err) }
  }
}

export async function sendBatch(
  emails: Array<{ to: string; subject: string; html: string }>
) {
  const resend = getResend()
  if (!resend) return { success: false, sent: 0, error: "not_configured" }

  let sent = 0
  for (let i = 0; i < emails.length; i += 50) {
    const chunk = emails.slice(i, i + 50)
    try {
      await resend.batch.send(
        chunk.map(e => ({ from: FROM_EMAIL, to: e.to, subject: e.subject, html: e.html }))
      )
      sent += chunk.length
    } catch (err) {
      console.error("[email] batch error:", err)
    }
  }
  return { success: true, sent }
}
