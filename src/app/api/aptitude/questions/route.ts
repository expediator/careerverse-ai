import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  category: z.enum(["quantitative", "logical", "verbal", "mixed"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  topic: z.string().nullish(),
  count: z.number().min(5).max(30).default(15),
  company: z.string().optional(),
})

const SAMPLES = {
  quantitative: [
    { id: "q1",  question: "A train travels 360 km in 4 hours. What is its speed in m/s?", options: ["25 m/s", "90 m/s", "100 m/s", "360 m/s"], correctAnswer: "25 m/s", explanation: "90 km/h × (1000/3600) = 25 m/s", topic: "Speed" },
    { id: "q2",  question: "If 15% of a number is 45, what is 30% of that number?", options: ["60", "90", "75", "120"], correctAnswer: "90", explanation: "15% = 45 → 100% = 300 → 30% = 90", topic: "Percentages" },
    { id: "q3",  question: "Compound interest on ₹10,000 at 10% p.a. for 2 years?", options: ["₹2000", "₹2100", "₹1900", "₹2200"], correctAnswer: "₹2100", explanation: "CI = 10000[(1.1)² − 1] = ₹2100", topic: "Compound Interest" },
    { id: "q4",  question: "A and B finish a job in 10 and 15 days. Together in how many days?", options: ["4", "5", "6", "7"], correctAnswer: "6", explanation: "1/10 + 1/15 = 1/6, so 6 days.", topic: "Time & Work" },
    { id: "q5",  question: "Ratio of A's age to B's is 3:5. A = 18 yrs. Find B.", options: ["25", "30", "35", "40"], correctAnswer: "30", explanation: "B = (18×5)/3 = 30", topic: "Ratios" },
    { id: "q6",  question: "25% markup then 10% discount. Net profit %?", options: ["10%", "12.5%", "15%", "20%"], correctAnswer: "12.5%", explanation: "SP = 1.25 × 0.90 = 1.125 → 12.5% profit", topic: "Profit & Loss" },
    { id: "q7",  question: "Simple interest on ₹5000 at 8% for 3 years?", options: ["₹1000", "₹1200", "₹1500", "₹1800"], correctAnswer: "₹1200", explanation: "SI = 5000 × 8% × 3 = ₹1200", topic: "Simple Interest" },
    { id: "q8",  question: "Two numbers in ratio 3:4. LCM = 48. Smaller number?", options: ["9", "12", "16", "18"], correctAnswer: "12", explanation: "LCM of 3k,4k = 12k = 48 → k=4, smaller = 12.", topic: "LCM & HCF" },
    { id: "q9",  question: "Pipe fills in 20 min, drain empties in 30 min. Both open: time to fill?", options: ["45", "50", "55", "60"], correctAnswer: "60", explanation: "1/20 − 1/30 = 1/60, so 60 min.", topic: "Pipes & Cisterns" },
    { id: "q10", question: "Average of 5 numbers = 20. Remove one, average = 18. Removed?", options: ["26", "28", "30", "32"], correctAnswer: "28", explanation: "Sum = 100, new sum = 72, removed = 28.", topic: "Averages" },
  ],
  logical: [
    { id: "l1",  question: "Next: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], correctAnswer: "42", explanation: "Diffs: 4,6,8,10,12 (+2 each). 30+12=42.", topic: "Number Series" },
    { id: "l2",  question: "APPLE → BQQMF. MANGO → ?", options: ["NBNHP", "NBOHP", "NBOIP", "LZMFN"], correctAnswer: "NBOIP", explanation: "+1 to each letter: NBOIP", topic: "Coding" },
    { id: "l3",  question: "All cats are animals. Some animals are dogs. Conclusion?", options: ["Some cats are dogs", "No conclusion possible", "All dogs are cats", "Some cats are not animals"], correctAnswer: "No conclusion possible", explanation: "No direct link between cats and dogs.", topic: "Syllogisms" },
    { id: "l4",  question: "A is 3 ranks ahead of B. C is 2 ranks behind B. A = rank 5. C's rank?", options: ["7", "8", "9", "10"], correctAnswer: "10", explanation: "B = 8, C = 10.", topic: "Ranking" },
    { id: "l5",  question: "Mirror time of 3:20?", options: ["8:40", "9:40", "8:20", "9:20"], correctAnswer: "8:40", explanation: "11:60 − 3:20 = 8:40.", topic: "Mirror Images" },
    { id: "l6",  question: "Odd one: 3, 5, 7, 9, 11", options: ["3", "5", "9", "11"], correctAnswer: "9", explanation: "9=3×3 is not prime; rest are.", topic: "Odd One Out" },
    { id: "l7",  question: "A is B's sister. C is B's mother. D is C's father. A is related to D as?", options: ["Daughter", "Granddaughter", "Great-granddaughter", "Niece"], correctAnswer: "Granddaughter", explanation: "A→parent C→parent D. Two generations up = granddaughter.", topic: "Blood Relations" },
    { id: "l8",  question: "'His mother is the only daughter of my mother.' How is the woman related to him?", options: ["Mother", "Sister", "Aunt", "Grandmother"], correctAnswer: "Mother", explanation: "Only daughter of her mother = herself. She is his mother.", topic: "Blood Relations" },
    { id: "l9",  question: "Series: Z, X, V, T, ?", options: ["S", "R", "Q", "P"], correctAnswer: "R", explanation: "Skip every alternate letter backwards: Z→X→V→T→R.", topic: "Letter Series" },
    { id: "l10", question: "If MANGO = 13+1+14+7+15 = 50, APPLE = ?", options: ["50", "55", "57", "60"], correctAnswer: "50", explanation: "A+P+P+L+E = 1+16+16+12+5 = 50.", topic: "Coding" },
  ],
  verbal: [
    { id: "v1",  question: "Synonym of ELOQUENT:", options: ["Silent", "Articulate", "Confused", "Absent"], correctAnswer: "Articulate", explanation: "Eloquent = fluent; articulate matches.", topic: "Vocabulary" },
    { id: "v2",  question: "Correct sentence:", options: ["She don't know.", "She doesn't knows.", "She doesn't know.", "She not know."], correctAnswer: "She doesn't know.", explanation: "3rd person singular: doesn't + base verb.", topic: "Grammar" },
    { id: "v3",  question: "Antonym of LOQUACIOUS:", options: ["Talkative", "Quiet", "Noisy", "Cheerful"], correctAnswer: "Quiet", explanation: "Loquacious = very talkative. Antonym = quiet.", topic: "Vocabulary" },
    { id: "v4",  question: "'He is one of those man who never give up.' Error?", options: ["one of those", "man", "who", "give"], correctAnswer: "man", explanation: "Should be 'men' (plural noun after 'those').", topic: "Grammar" },
    { id: "v5",  question: "'Bite the bullet' means:", options: ["Eat quickly", "Endure pain stoically", "Argue fiercely", "Shoot accurately"], correctAnswer: "Endure pain stoically", explanation: "Endure hardship bravely.", topic: "Idioms" },
    { id: "v6",  question: "Correctly spelled:", options: ["Accomodate", "Accommodate", "Acommodate", "Acomodate"], correctAnswer: "Accommodate", explanation: "Double-c, double-m: ac-com-mo-date.", topic: "Spelling" },
    { id: "v7",  question: "One word for 'fear of heights':", options: ["Claustrophobia", "Agoraphobia", "Acrophobia", "Hydrophobia"], correctAnswer: "Acrophobia", explanation: "Acro = heights + phobia.", topic: "One-Word Substitution" },
    { id: "v8",  question: "Analogy: Book : Library :: Painting : ?", options: ["Artist", "Canvas", "Gallery", "Museum"], correctAnswer: "Gallery", explanation: "Books stored in libraries; paintings in galleries.", topic: "Analogies" },
    { id: "v9",  question: "Fill in: 'The committee ___ divided on this.'", options: ["was", "were", "are", "have"], correctAnswer: "was", explanation: "Collective noun as unit → singular verb.", topic: "Agreement" },
    { id: "v10", question: "Idiom: 'Spill the beans' means:", options: ["Make a mess", "Reveal a secret", "Cook quickly", "Lose patience"], correctAnswer: "Reveal a secret", explanation: "Disclose secret or confidential information.", topic: "Idioms" },
  ],
}

function getFallback(category: string, count: number) {
  if (category === "mixed") {
    const pool = [
      ...SAMPLES.quantitative.slice(0, 5),
      ...SAMPLES.logical.slice(0, 5),
      ...SAMPLES.verbal.slice(0, 5),
    ]
    return pool.slice(0, count)
  }
  const pool = SAMPLES[category as keyof typeof SAMPLES] ?? SAMPLES.quantitative
  return pool.slice(0, Math.min(count, pool.length))
}

export async function POST(req: NextRequest) {
  let category = "quantitative"
  let difficulty = "intermediate"
  let topic: string | null | undefined = null
  let count = 15

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
    }

    category = parsed.data.category
    difficulty = parsed.data.difficulty
    topic = parsed.data.topic ?? null
    count = parsed.data.count

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ questions: getFallback(category, count), duration: count * 90 })
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const topicStr = topic ? `Focus specifically on: "${topic}". ` : ""
    const prompt = `Generate ${count} multiple choice aptitude questions for ${category} ability at ${difficulty} level. ${topicStr}
Return ONLY a valid JSON array (no markdown fences, no text outside the array):
[{"id":"q1","question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"step-by-step...","topic":"${topic ?? category}"}]
Rules:
- 4 distinct options per question
- correctAnswer must exactly match one option string
- Clear step-by-step explanations
- ${difficulty === "beginner" ? "Basic concepts, no tricks" : difficulty === "intermediate" ? "2-step problems, moderate" : "Multi-step, challenging"}
Return ONLY the JSON array.`

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    })

    const text = completion.choices[0]?.message?.content ?? ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("No JSON array in Groq response")

    const questions = JSON.parse(jsonMatch[0])
    if (!Array.isArray(questions) || questions.length === 0) throw new Error("Empty questions array")

    return NextResponse.json({ questions, duration: count * 90 })
  } catch (err) {
    console.error("[APTITUDE_QUESTIONS]", err)
    return NextResponse.json({ questions: getFallback(category, count), duration: count * 90 })
  }
}
