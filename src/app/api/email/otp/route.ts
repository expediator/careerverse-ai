import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { otpEmail } from "@/lib/email-templates"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      // Don't reveal whether the email exists — return success regardless
      return NextResponse.json({ success: true })
    }
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google/GitHub sign-in. Password reset is not applicable." },
        { status: 400 }
      )
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Delete any existing OTP for this email, then insert fresh
    await db.verificationToken.deleteMany({ where: { identifier: `otp:${email}` } })
    await db.verificationToken.create({
      data: {
        identifier: `otp:${email}`,
        token: `${Date.now()}_${otp}`,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    await sendEmail({ to: email, subject: "CareerVerse AI — password reset OTP", html: otpEmail({ otp, email }) })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[otp] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
