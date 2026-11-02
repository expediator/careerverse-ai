import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json()
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const record = await db.verificationToken.findFirst({
      where: { identifier: `otp:${email}`, expires: { gt: new Date() } },
    })

    if (!record) {
      return NextResponse.json({ error: "OTP expired or not found. Request a new one." }, { status: 400 })
    }

    const storedOtp = record.token.split("_")[1]
    if (storedOtp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 })
    }

    // OTP valid — update password and clean up
    const hashed = await bcrypt.hash(newPassword, 12)
    await Promise.all([
      db.user.update({ where: { email }, data: { password: hashed } }),
      db.verificationToken.delete({
        where: { identifier_token: { identifier: `otp:${email}`, token: record.token } },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[reset-password] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
