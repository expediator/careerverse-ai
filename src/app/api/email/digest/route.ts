import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { weeklyDigestEmail } from "@/lib/email-templates"

const TIPS = [
  {
    title: "Practice daily, not in bursts",
    body: "30 minutes every day beats 4-hour weekend sessions. Consistent small sessions build lasting memory.",
  },
  {
    title: "Mock interviews > reading solutions",
    body: "Talking through your answers aloud (even alone) trains recall under pressure better than silent reading.",
  },
  {
    title: "Start with your weakness",
    body: "When you have limited prep time, prioritize your weakest subject. Diminishing returns hit strong areas first.",
  },
  {
    title: "Read job descriptions, not just syllabi",
    body: "Find 5 job listings in your target role, list the skills mentioned 3+ times — that's your actual syllabus.",
  },
]

export async function GET(req: Request) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = (await headers()).get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const tip = TIPS[new Date().getDay() % TIPS.length]

  const users = await db.user.findMany({ select: { id: true, name: true, email: true } })

  let sent = 0
  for (const user of users) {
    const [tests, interviews, resumes] = await Promise.all([
      db.aptitudeTest.count({ where: { userId: user.id, completedAt: { gte: oneWeekAgo } } }),
      db.interview.count({ where: { userId: user.id, createdAt: { gte: oneWeekAgo } } }),
      db.resumeUpload.count({ where: { userId: user.id, createdAt: { gte: oneWeekAgo } } }),
    ])

    await sendEmail({
      to: user.email,
      subject: "Your CareerVerse AI weekly recap 📅",
      html: weeklyDigestEmail({
        name: user.name?.split(" ")[0] ?? "",
        tests,
        interviews,
        resumes,
        tipTitle: tip.title,
        tipBody: tip.body,
      }),
    })
    sent++
  }

  return NextResponse.json({ success: true, sent })
}
