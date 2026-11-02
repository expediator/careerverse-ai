"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ArrowLeft, BookOpen, Zap } from "lucide-react"

const TOPIC_INFO: Record<string, { desc: string; tips: string[]; relatedTopics: string[] }> = {
  "Number Systems": {
    desc: "Questions on HCF, LCM, divisibility, remainders, and number properties.",
    tips: ["Learn divisibility rules for 2–13", "Practice remainder theorems", "Memorize squares up to 30 and cubes up to 15"],
    relatedTopics: ["Percentages", "Algebra", "Probability"],
  },
  "Percentages": {
    desc: "Percentage calculations, percentage change, and percentage-based word problems.",
    tips: ["Practice converting % to fractions quickly", "Learn the % change formula", "Common shortcut: 10% of X = X/10"],
    relatedTopics: ["Profit & Loss", "Simple Interest", "Averages"],
  },
  "Time & Work": {
    desc: "Work rate problems, pipes and cisterns, and efficiency calculations.",
    tips: ["Use LCM method for work problems", "1/A + 1/B = 1/C for combined work", "Practice negative work (emptying) cases"],
    relatedTopics: ["Time Speed Distance", "Ratio & Proportion"],
  },
  "Probability": {
    desc: "Classical probability, conditional probability, and combinatorics-based questions.",
    tips: ["P(A) = favorable / total outcomes", "Learn combinations nCr formula", "Practice with cards and dice problems"],
    relatedTopics: ["Permutations & Combinations", "Algebra"],
  },
  default: {
    desc: "Practice questions on this topic with AI-generated problems at your chosen difficulty.",
    tips: [
      "Understand the concept before attempting questions",
      "Practice at beginner level first, then increase difficulty",
      "Use the AI Assistant for concept clarification",
    ],
    relatedTopics: [],
  },
}

function PracticeContent() {
  const params = useSearchParams()
  const category = params.get("category") ?? "quantitative"
  const topic = params.get("topic") ?? "General"
  const info = TOPIC_INFO[topic] ?? TOPIC_INFO["default"]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/aptitude">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            {topic}
          </h1>
          <p className="text-zinc-400 mt-0.5 capitalize">{category} Aptitude</p>
        </div>
      </div>

      {/* Topic overview */}
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-300">Topic Overview</span>
          </div>
          <p className="text-sm text-zinc-300 mb-4">{info.desc}</p>
          <div className="space-y-2">
            {info.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                {tip}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice options */}
      <div>
        <h2 className="text-base font-semibold text-zinc-100 mb-4">Choose Difficulty</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {(["beginner", "intermediate", "advanced"] as const).map(level => {
            const colors = {
              beginner: { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10", badge: "success" as const },
              intermediate: { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10", badge: "warning" as const },
              advanced: { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500/10", badge: "destructive" as const },
            }[level]
            const numQ = { beginner: 10, intermediate: 15, advanced: 20 }[level]
            const time = { beginner: 15, intermediate: 20, advanced: 30 }[level]
            return (
              <Link
                key={level}
                href={`/aptitude/test?category=${category}&topic=${encodeURIComponent(topic)}&difficulty=${level}`}
              >
                <Card className={`border ${colors.border} ${colors.bg} card-hover cursor-pointer`}>
                  <CardContent className="p-5 text-center">
                    <Badge variant={colors.badge} className="mb-3 capitalize">{level}</Badge>
                    <p className="text-2xl font-bold text-zinc-100 mb-1">{numQ}</p>
                    <p className="text-xs text-zinc-500 mb-1">questions</p>
                    <p className={`text-sm font-medium ${colors.text}`}>{time} min</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Related topics */}
      {info.relatedTopics.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-zinc-100 mb-3">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {info.relatedTopics.map(t => (
              <Link key={t} href={`/aptitude/practice?category=${category}&topic=${encodeURIComponent(t)}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-zinc-700 text-sm py-1 px-3">{t}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ask AI */}
      <Card className="border-zinc-800">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-200">Need a concept explained?</p>
            <p className="text-xs text-zinc-500">Ask the AI Assistant for {topic} explanations, formulas, and shortcuts.</p>
          </div>
          <Link href={`/assistant?q=${encodeURIComponent(`Explain ${topic} for aptitude exams with formulas and shortcuts`)}`}>
            <Button size="sm" variant="outline">Ask AI</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading...</div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  )
}
