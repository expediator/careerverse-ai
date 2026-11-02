import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  college: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.string().optional(),
  experienceLevel: z.string().optional(),
  domains: z.array(z.string()),
  targetRoles: z.array(z.string()),
  hoursPerDay: z.string(),
  daysPerWeek: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const data = parsed.data

    const [profile] = await Promise.all([
      db.userProfile.upsert({
        where: { userId: session?.user?.id as string },
        create: {
          userId: session?.user?.id as string,
          college: data.college,
          degree: data.degree,
          branch: data.branch,
          graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
          experienceLevel: data.experienceLevel ?? "student",
          domains: data.domains,
          targetRoles: data.targetRoles,
          onboardingComplete: true,
        },
        update: {
          college: data.college,
          degree: data.degree,
          branch: data.branch,
          graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
          experienceLevel: data.experienceLevel ?? "student",
          domains: data.domains,
          targetRoles: data.targetRoles,
          onboardingComplete: true,
        },
      }),
      db.studyGoal.upsert({
        where: { userId: session?.user?.id as string },
        create: {
          userId: session?.user?.id as string,
          hoursPerDay: parseFloat(data.hoursPerDay),
          daysPerWeek: parseInt(data.daysPerWeek),
          focusAreas: data.domains,
        },
        update: {
          hoursPerDay: parseFloat(data.hoursPerDay),
          daysPerWeek: parseInt(data.daysPerWeek),
          focusAreas: data.domains,
        },
      }),
    ])

    return NextResponse.json({ success: true, profile })
  } catch (err) {
    console.error("[ONBOARDING]", err)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
