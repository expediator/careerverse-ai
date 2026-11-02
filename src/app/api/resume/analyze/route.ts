import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { resumeText, jobDescription } = await req.json()
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        analysis: {
          atsScore: 0,
          strengths: [],
          improvements: ["Add ANTHROPIC_API_KEY to your .env.local to enable AI resume analysis."],
          missingSkills: [],
          extractedSkills: [],
          interviewQuestions: [],
          summary: "AI analysis requires an API key.",
        }
      })
    }

    const client = new Anthropic()
    const jobSection = jobDescription
      ? `\nJob Description to match against:\n${jobDescription.slice(0, 1500)}`
      : ""

    const prompt = `Analyze this resume and provide a comprehensive assessment.

Resume:
${resumeText.slice(0, 3000)}
${jobSection}

Return ONLY valid JSON with this structure:
{
  "atsScore": <0-100 number based on ATS optimization>,
  "summary": "<2-sentence overall assessment>",
  "strengths": ["<specific strength>", ...],
  "improvements": ["<actionable improvement>", ...],
  "extractedSkills": ["<skill>", ...],
  "missingSkills": [${jobDescription ? '"<skill missing from JD>"' : '"N/A - no JD provided"'}, ...],
  "interviewQuestions": ["<likely question based on resume>", ...]
}

Guidelines:
- atsScore: Consider formatting, keywords, action verbs, quantified achievements
- strengths: 3-5 concrete strengths
- improvements: 4-6 specific improvements
- extractedSkills: All technical and soft skills found
- missingSkills: ${jobDescription ? "Skills in JD but not in resume" : '["Add a job description for gap analysis"]'}
- interviewQuestions: 5-7 questions a recruiter would ask based on this resume
Return ONLY the JSON, no other text.`

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    })

    const content = msg.content[0]
    if (content.type !== "text") throw new Error("Unexpected response")

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found")

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json({ analysis })
  } catch (err) {
    console.error("[RESUME_ANALYZE]", err)
    return NextResponse.json({
      analysis: {
        atsScore: 0,
        strengths: [],
        improvements: ["Analysis failed. Please try again."],
        missingSkills: [],
        extractedSkills: [],
        interviewQuestions: [],
        summary: "Could not analyze resume.",
      }
    })
  }
}
