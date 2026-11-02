import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { connection } from "next/server"

export async function GET() {
  await connection()
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 })

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id as string },
  })
  return NextResponse.json(profile)
}

const patchSchema = z.object({
  degree: z.string().optional(),
  college: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.number().optional(),
  targetRoles: z.array(z.string()).optional(),
  domains: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
})

export async function PATCH(req: Request) {
  await connection()
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const userId = session.user.id as string

  const profile = await db.userProfile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json(profile)
}
