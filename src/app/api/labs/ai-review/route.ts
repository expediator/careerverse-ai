import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code, language, problem } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ review: "Add ANTHROPIC_API_KEY to your .env.local to enable AI code review." })
    }

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
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

    const content = msg.content[0]
    return NextResponse.json({ review: content.type === "text" ? content.text : "Could not generate review." })
  } catch (err) {
    console.error("[AI_REVIEW]", err)
    return NextResponse.json({ review: "Failed to get AI review." }, { status: 500 })
  }
}
