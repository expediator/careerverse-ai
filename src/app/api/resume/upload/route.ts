import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import Groq from "groq-sdk"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const uploads = await db.resumeUpload.findMany({
    where: { userId: session.user?.id as string },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
  return NextResponse.json(uploads)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { resumeText, fileName, jobDescription } = await req.json()
    if (!resumeText?.trim()) return NextResponse.json({ error: "Resume text required" }, { status: 400 })

    let analysis = {
      atsScore: 0,
      summary: "AI analysis unavailable — add GROQ_API_KEY",
      strengths: [] as string[],
      improvements: ["Add GROQ_API_KEY to enable AI analysis"] as string[],
      extractedSkills: [] as string[],
      missingSkills: [] as string[],
      interviewQuestions: [] as string[],
    }

    if (process.env.GROQ_API_KEY) {
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
      const jobSection = jobDescription
        ? `\nJob Description:\n${jobDescription.slice(0, 1500)}`
        : ""

      const prompt = `Analyze this resume and return ONLY valid JSON:

Resume:
${resumeText.slice(0, 3000)}
${jobSection}

{
  "atsScore": <0-100>,
  "summary": "<2-sentence assessment>",
  "strengths": ["<strength 1>","<strength 2>","<strength 3>"],
  "improvements": ["<improvement 1>","<improvement 2>","<improvement 3>","<improvement 4>"],
  "extractedSkills": ["<skill>"],
  "missingSkills": ${jobDescription ? '["<skill from JD not in resume>"]' : '["Paste a job description to see skill gaps"]'},
  "interviewQuestions": ["<question 1>","<question 2>","<question 3>","<question 4>","<question 5>"]
}
Return ONLY the JSON.`

      try {
        const completion = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        })
        const text = completion.choices[0].message.content ?? ""
        const match = text.match(/\{[\s\S]*\}/)
        if (match) analysis = { ...analysis, ...JSON.parse(match[0]) }
      } catch (e) {
        console.error("[RESUME_UPLOAD_ANALYSIS]", e)
      }
    }

    const upload = await db.resumeUpload.create({
      data: {
        userId: session.user?.id as string,
        fileName: fileName ?? "resume.txt",
        fileUrl: "",
        parsedData: { text: resumeText },
        atsScore: analysis.atsScore,
        feedback: analysis.summary,
        extractedSkills: analysis.extractedSkills,
      },
    })

    return NextResponse.json({ upload, analysis })
  } catch (err) {
    console.error("[RESUME_UPLOAD]", err)
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  await db.resumeUpload.deleteMany({
    where: { id, userId: session.user?.id as string },
  })
  return NextResponse.json({ ok: true })
}
