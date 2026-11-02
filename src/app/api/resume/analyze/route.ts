import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Groq from "groq-sdk"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { resumeText, jobDescription } = await req.json()
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 })

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        analysis: {
          atsScore: 0,
          strengths: [],
          improvements: ["Add GROQ_API_KEY to your environment variables to enable AI resume analysis. Get it free at console.groq.com"],
          missingSkills: [],
          extractedSkills: [],
          interviewQuestions: [],
          summary: "AI analysis requires a GROQ_API_KEY.",
        }
      })
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const jobSection = jobDescription
      ? `\nJob Description to match against:\n${jobDescription.slice(0, 1500)}`
      : ""

    const prompt = `Analyze this resume and provide a comprehensive assessment.

Resume:
${resumeText.slice(0, 3000)}
${jobSection}

Return ONLY valid JSON with this structure:
{
  "atsScore": <0-100 number>,
  "summary": "<2-sentence overall assessment>",
  "strengths": ["<specific strength>"],
  "improvements": ["<actionable improvement>"],
  "extractedSkills": ["<skill>"],
  "missingSkills": [${jobDescription ? '"<skill missing from JD>"' : '"Add a job description for gap analysis"'}],
  "interviewQuestions": ["<likely question based on resume>"]
}
Guidelines:
- atsScore: Consider formatting, keywords, action verbs, quantified achievements
- strengths: 3-5 concrete strengths
- improvements: 4-6 specific improvements
- extractedSkills: All technical and soft skills found
- missingSkills: ${jobDescription ? "Skills in JD but not in resume" : '["Add a job description for gap analysis"]'}
- interviewQuestions: 5-7 questions a recruiter would ask
Return ONLY the JSON, no other text.`

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    })

    const text = completion.choices[0].message.content ?? ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
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
