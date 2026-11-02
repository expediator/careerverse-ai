import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Groq from "groq-sdk"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code, language, problem } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ review: "Add GROQ_API_KEY to your environment variables to enable AI code review. Get it free at console.groq.com" })
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `Review this ${language} code${problem ? ` for the problem "${problem}"` : ""}:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Correctness: Is the logic correct?
2. Time/Space complexity (if applicable)
3. Code quality: readability, naming, style
4. One specific improvement suggestion
5. A brief encouragement

Be concise and actionable. Max 200 words.`
      }],
    })

    const text = completion.choices[0].message.content ?? "Could not generate review."
    return NextResponse.json({ review: text })
  } catch (err) {
    console.error("[AI_REVIEW]", err)
    return NextResponse.json({ review: "Failed to get AI review." }, { status: 500 })
  }
}
