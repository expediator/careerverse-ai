import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  category: z.string(),
  difficulty: z.string(),
  score: z.number(),
  timeTaken: z.number(),
  questions: z.array(z.object({
    question: z.string(),
    correctAnswer: z.string(),
    userAnswer: z.string().nullable(),
    explanation: z.string().optional(),
  })),
})

const XP_PER_CORRECT: Record<string, number> = {
  beginner: 5,
  easy:     5,
  intermediate: 12,
  medium:   12,
  advanced: 20,
  hard:     20,
  expert:   30,
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { category, difficulty, score, timeTaken, questions } = parsed.data
    const correct = questions.filter(q => q.userAnswer === q.correctAnswer).length
    const xpEarned = correct * (XP_PER_CORRECT[difficulty.toLowerCase()] ?? 10)

    const test = await db.aptitudeTest.create({
      data: {
        userId: session?.user?.id as string,
        category,
        difficulty,
        totalQuestions: questions.length,
        attempted: questions.filter(q => q.userAnswer !== null).length,
        correct,
        timeTaken,
        score,
        questions: {
          create: questions.map(q => ({
            question: q.question,
            options: [],
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer ?? undefined,
            isCorrect: q.userAnswer === q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
    })

    await db.userProgress.create({
      data: {
        userId: session?.user?.id as string,
        module: "aptitude",
        subModule: category,
        score,
        details: {
          category,
          difficulty,
          correct,
          total: questions.length,
          xpEarned,
          timeTaken,
        },
      },
    })

    return NextResponse.json({ testId: test.id, score, correct, xpEarned })
  } catch (err) {
    console.error("[APTITUDE_SUBMIT]", err)
    return NextResponse.json({ error: "Failed to save test" }, { status: 500 })
  }
}
