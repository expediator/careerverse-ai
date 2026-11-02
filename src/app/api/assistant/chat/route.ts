import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  mode: z.string().default("default"),
})

const SYSTEM_PROMPTS: Record<string, string> = {
  default: `You are CareerVerse AI's expert learning assistant, helping students and professionals prepare for interviews, placements, and career development. You adapt your explanations to the user's level.
Your capabilities:
- Explain technical and non-technical concepts clearly
- Solve aptitude problems step-by-step
- Generate practice questions and mock interview questions
- Review and debug code
- Create personalized study plans
- Give career guidance
Guidelines:
- Be concise but thorough
- Use examples and analogies
- Format code properly with language tags
- If solving math, show each step
- Proactively suggest related concepts
- Be encouraging and mentor-like`,

  beginner: `You are a patient, encouraging mentor for beginners. Explain everything simply, avoid jargon, and use lots of relatable examples. Break down complex topics into tiny digestible pieces. Always check understanding by suggesting follow-up questions.`,

  technical: `You are a senior software engineer and technical expert. Provide deep, accurate technical explanations with code examples. Discuss trade-offs, edge cases, and best practices. Focus on interview-level technical depth.`,

  interview: `You are an expert interview coach. Help users prepare for interviews by:
1. Asking them practice questions when requested
2. Evaluating their answers and giving specific feedback
3. Teaching the STAR method, frameworks, and answer structures
4. Identifying gaps in their answers
Be direct and professional, like a real interviewer.`,

  exam: `You are an exam preparation specialist. Focus on:
- Most frequently tested topics
- Pattern recognition in questions
- Time-saving tricks and shortcuts
- Common mistakes to avoid
- Previous year question patterns`,
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { messages, mode } = parsed.data

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        content: "AI assistant requires a GROQ_API_KEY. Get your free key at console.groq.com and add it to your environment variables."
      })
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.default

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ""
            if (text) {
              const data = JSON.stringify({ text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (err) {
    console.error("[ASSISTANT_CHAT]", err)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
