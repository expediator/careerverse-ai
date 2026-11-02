import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  sessionId: z.string(),
  type: z.string(),
  domain: z.string().optional(),
  history: z.array(z.object({ role: z.string(), content: z.string() })),
  questionNumber: z.number(),
})

const MAX_QUESTIONS = 8

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 })

    const { sessionId, type, domain, history, questionNumber } = parsed.data

    if (questionNumber >= MAX_QUESTIONS) {
      let score = 65
      let feedback = "Good interview! You demonstrated reasonable communication skills. Focus on providing more specific examples with measurable outcomes in your answers."
      let closingMessage = "Thank you for the interview! You've answered all our questions. I'll now calculate your score and provide feedback."

      if (process.env.GROQ_API_KEY) {
        try {
          const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
          const evalPrompt = `You are evaluating a ${type} interview${domain ? ` for ${domain} role` : ""}.
Based on this interview conversation, provide:
1. A score from 0-100 based on: answer quality, relevance, communication clarity, and depth
2. Specific constructive feedback (3-4 sentences)
3. A professional closing message

Interview history:
${history.map(m => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n")}

Return JSON only: {"score": number, "feedback": "...", "closingMessage": "..."}`

          const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 600,
            messages: [{ role: "user", content: evalPrompt }],
          })

          const text = completion.choices[0].message.content ?? ""
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            score = result.score ?? score
            feedback = result.feedback ?? feedback
            closingMessage = result.closingMessage ?? closingMessage
          }
        } catch {}
      }

      await db.interview.update({
        where: { id: sessionId },
        data: { status: "completed", overallScore: score, feedback, completedAt: new Date() },
      })

      await db.userProgress.create({
        data: { userId: session?.user?.id as string, module: "interview", subModule: type, score },
      })

      return NextResponse.json({ finished: true, score, feedback, closingMessage })
    }

    let nextQuestion = `Great answer! Now, tell me about a time when you faced a significant challenge at work or college. How did you handle it, and what was the outcome?`

    if (process.env.GROQ_API_KEY) {
      try {
        const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
        const messages = history.map(m => ({
          role: (m.role === "interviewer" ? "assistant" : "user") as "user" | "assistant",
          content: m.content,
        }))

        const completion = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content: `You are a professional ${type} interviewer${domain ? ` for ${domain} roles` : ""}. Ask ONE follow-up question based on the candidate's last answer. Either dig deeper OR smoothly transition to a new relevant topic. Keep it concise (1-2 sentences). Be professional but encouraging. Vary question types: behavioral (STAR), situational, technical (if ${type === "technical"}), knowledge-based. Question ${questionNumber} of ${MAX_QUESTIONS}. Return ONLY the question, no preamble.`,
            },
            ...messages,
          ],
        })

        const text = completion.choices[0].message.content?.trim()
        if (text) nextQuestion = text
      } catch {}
    }

    const lastUserMessage = history.filter(m => m.role === "user").at(-1)
    if (lastUserMessage) {
      await db.interviewQuestion.create({
        data: {
          interviewId: sessionId,
          question: history.filter(m => m.role === "interviewer").at(-1)?.content ?? "",
          userAnswer: lastUserMessage.content,
        },
      })
    }

    return NextResponse.json({ finished: false, nextQuestion })
  } catch (err) {
    console.error("[INTERVIEW_RESPOND]", err)
    return NextResponse.json({
      finished: false,
      nextQuestion: "Interesting! Could you elaborate on how that experience shaped your professional approach?"
    })
  }
}
