import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  type: z.enum(["hr", "technical", "behavioral", "case"]),
  domain: z.string().optional(),
  difficulty: z.enum(["easy", "intermediate", "hard"]).default("intermediate"),
})

const OPENING_QUESTIONS: Record<string, string> = {
  hr: "Hello! I'm glad to meet you today. Let's start our HR interview. Could you please introduce yourself — tell me about your background, what you've been doing, and what brings you to this opportunity?",
  technical: "Welcome to the technical interview! I'm going to assess your technical knowledge today. Let's start with the fundamentals: Can you walk me through your technical background and the core skills you've developed?",
  behavioral: "Good to meet you! In this behavioral interview, I'll ask about past experiences to understand how you handle various situations. Let's begin: Tell me about yourself and a challenge you've recently overcome.",
  case: "Welcome! This is a case study interview to understand your problem-solving approach. Before we dive into a case, tell me briefly about your background and analytical experience.",
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { type, domain, difficulty } = parsed.data

    const interview = await db.interview.create({
      data: {
        userId: session?.user?.id as string,
        type,
        domain,
        difficulty,
        status: "in_progress",
      },
    })

    let firstQuestion = OPENING_QUESTIONS[type] ?? OPENING_QUESTIONS.hr

    if (process.env.GROQ_API_KEY) {
      try {
        const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
        const completion = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `You are a professional ${type} interviewer${domain ? ` specializing in ${domain}` : ""}. Generate a warm, professional opening question for a ${difficulty} level ${type} interview${domain ? ` for ${domain} role` : ""}. The question should make the candidate comfortable while starting the assessment. Return ONLY the question text, nothing else.`
          }],
        })
        const text = completion.choices[0].message.content?.trim()
        if (text) firstQuestion = text
      } catch {}
    }

    return NextResponse.json({ sessionId: interview.id, firstQuestion, type, domain })
  } catch (err) {
    console.error("[INTERVIEW_START]", err)
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 })
  }
}
