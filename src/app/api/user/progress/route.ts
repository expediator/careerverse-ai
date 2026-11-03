import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { connection } from "next/server"

export async function GET() {
  await connection()
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ skills: [], aptitude: [], stats: {} }, { status: 401 })

  const userId = session.user.id as string

  const [skillRecords, aptitudeRecords] = await Promise.all([
    db.userProgress.findMany({
      where: { userId, module: "skills" },
      orderBy: { recordedAt: "desc" },
    }),
    db.userProgress.findMany({
      where: { userId, module: "aptitude" },
      orderBy: { recordedAt: "desc" },
      take: 10,
    }),
  ])

  // Latest result per domain
  const latestSkills: Record<string, typeof skillRecords[0]> = {}
  for (const r of skillRecords) {
    if (r.subModule && !latestSkills[r.subModule]) latestSkills[r.subModule] = r
  }

  const scores = Object.values(latestSkills).map(r => r.score)
  const totalTests = skillRecords.length + aptitudeRecords.length
  const totalXp = [...skillRecords, ...aptitudeRecords].reduce((sum, r) => {
    const det = r.details as Record<string, unknown> | null
    return sum + ((det?.xpEarned as number) ?? 0)
  }, 0)
  const stats = {
    skillDomainsAssessed: scores.length,
    skillAvgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    skillBestScore: scores.length ? Math.round(Math.max(...scores)) : 0,
    aptitudeCount: aptitudeRecords.length,
    aptitudeAvgScore: aptitudeRecords.length
      ? Math.round(aptitudeRecords.reduce((a, r) => a + r.score, 0) / aptitudeRecords.length)
      : 0,
    totalTests,
    totalXp,
  }

  return NextResponse.json({
    skills: Object.values(latestSkills),
    skillHistory: skillRecords.slice(0, 20),
    aptitude: aptitudeRecords,
    stats,
  })
}
