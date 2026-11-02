import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  category: z.enum(["quantitative", "logical", "verbal", "mixed"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  topic: z.string().nullish(),
  count: z.number().min(5).max(30).default(15),
  company: z.string().optional(),
})

const SAMPLE_QUESTIONS = {
  quantitative: [
    { id: "q1", question: "A train travels 360 km in 4 hours. What is its speed in meters per second?", options: ["25 m/s", "90 m/s", "100 m/s", "360 m/s"], correctAnswer: "25 m/s", explanation: "Speed = 360 km / 4 h = 90 km/h. Convert: 90 × (1000/3600) = 25 m/s", topic: "Time Speed Distance" },
    { id: "q2", question: "If 15% of a number is 45, what is 30% of the same number?", options: ["60", "90", "75", "120"], correctAnswer: "90", explanation: "15% = 45, so 1% = 3, so 100% = 300. Then 30% = 90.", topic: "Percentages" },
    { id: "q3", question: "What is the compound interest on ₹10,000 at 10% per annum for 2 years?", options: ["₹2000", "₹2100", "₹1900", "₹2200"], correctAnswer: "₹2100", explanation: "CI = P[(1+r)^n - 1] = 10000[(1.1)^2 - 1] = 10000 × 0.21 = ₹2100", topic: "Compound Interest" },
    { id: "q4", question: "A can do a work in 10 days and B can do the same work in 15 days. In how many days can they finish it together?", options: ["4 days", "5 days", "6 days", "7 days"], correctAnswer: "6 days", explanation: "A's rate = 1/10, B's rate = 1/15. Combined = 1/10 + 1/15 = 5/30 = 1/6. So 6 days.", topic: "Time & Work" },
    { id: "q5", question: "The ratio of A's age to B's age is 3:5. If A is 18 years old, how old is B?", options: ["25 years", "30 years", "35 years", "40 years"], correctAnswer: "30 years", explanation: "3:5 = 18:B → B = (18 × 5) / 3 = 30 years", topic: "Ratio & Proportion" },
  ],
  logical: [
    { id: "l1", question: "Find the next number in the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], correctAnswer: "42", explanation: "Differences: 4, 6, 8, 10, 12. Each difference increases by 2. So 30 + 12 = 42.", topic: "Number Series" },
    { id: "l2", question: "In a code, APPLE is written as BQQMF. How is MANGO written?", options: ["NBNHP", "NBOHP", "NBOIP", "LZMFN"], correctAnswer: "NBOIP", explanation: "Each letter is shifted +1. M→N, A→B, N→O, G→H, O→P = NBOIP", topic: "Coding-Decoding" },
  ],
  verbal: [
    { id: "v1", question: "Choose the correct synonym for 'ELOQUENT':", options: ["Silent", "Articulate", "Confused", "Absent"], correctAnswer: "Articulate", explanation: "Eloquent means fluent and persuasive in speech. Articulate is the closest synonym.", topic: "Vocabulary" },
    { id: "v2", question: "Select the sentence with correct grammar:", options: ["She don't know the answer.", "She doesn't knows the answer.", "She doesn't know the answer.", "She not knows the answer."], correctAnswer: "She doesn't know the answer.", explanation: "With 'she' (third person singular), use 'doesn't' + base form: 'doesn't know'.", topic: "Grammar" },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { category, difficulty, topic, count } = parsed.data

    if (!process.env.GROQ_API_KEY) {
      const sampleKey = category === "logical" ? "logical" : category === "verbal" ? "verbal" : "quantitative"
      const pool = SAMPLE_QUESTIONS[sampleKey as keyof typeof SAMPLE_QUESTIONS] ?? SAMPLE_QUESTIONS.quantitative
      return NextResponse.json({
        questions: pool.slice(0, Math.min(count, pool.length)),
        duration: count * 90,
        note: "Using sample questions — add GROQ_API_KEY for AI-generated questions"
      })
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const topicStr = topic ? `Focus specifically on the topic: "${topic}". ` : ""
    const prompt = `Generate ${count} multiple choice aptitude questions for ${category} ability at ${difficulty} level. ${topicStr}
Return ONLY a valid JSON array with this exact structure:
[{"id":"q1","question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"Step-by-step explanation...","topic":"${topic ?? category}"}]
Rules:
- Options must be 4 distinct choices
- correctAnswer must exactly match one of the options
- Explanations must be clear and educational
- Difficulty ${difficulty}: ${difficulty === "beginner" ? "basic concepts" : difficulty === "intermediate" ? "moderate complexity" : "challenging multi-step problems"}
Return ONLY the JSON array, no other text.`

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = completion.choices[0].message.content ?? ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("No JSON found")

    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions, duration: count * 90 })
  } catch (err) {
    console.error("[APTITUDE_QUESTIONS]", err)
    return NextResponse.json({
      questions: SAMPLE_QUESTIONS.quantitative,
      duration: 1350,
      note: "Using fallback questions due to error"
    })
  }
}
