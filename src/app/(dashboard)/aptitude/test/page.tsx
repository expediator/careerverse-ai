"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  topic: string
}

interface TestState {
  questions: Question[]
  answers: Record<number, string>
  marked: Set<number>
  timeLeft: number
  submitted: boolean
  loading: boolean
}

export default function AptitudeTestPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const category = searchParams.get("category") ?? "quantitative"
  const difficulty = searchParams.get("difficulty") ?? "intermediate"
  const topic = searchParams.get("topic")

  const [current, setCurrent] = useState(0)
  const [state, setState] = useState<TestState>({
    questions: [],
    answers: {},
    marked: new Set(),
    timeLeft: 1800,
    submitted: false,
    loading: true,
  })
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)

  const loadQuestions = useCallback(async () => {
    setState(s => ({ ...s, loading: true }))
    try {
      const res = await fetch("/api/aptitude/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty, topic: topic ?? undefined, count: 15 }),
      })
      const data = await res.json()
      setState(s => ({
        ...s,
        questions: data.questions ?? [],
        timeLeft: data.duration ?? 1800,
        loading: false,
      }))
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [category, difficulty, topic])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  useEffect(() => {
    if (state.submitted || state.loading || state.questions.length === 0) return
    const timer = setInterval(() => {
      setState(s => {
        if (s.timeLeft <= 1) {
          submitTest()
          return s
        }
        return { ...s, timeLeft: s.timeLeft - 1 }
      })
    }, 1000)
    return () => clearInterval(timer)
  })

  function selectAnswer(index: number, option: string) {
    setState(s => ({
      ...s,
      answers: { ...s.answers, [index]: option },
    }))
  }

  function toggleMark(index: number) {
    setState(s => {
      const marked = new Set(s.marked)
      if (marked.has(index)) marked.delete(index)
      else marked.add(index)
      return { ...s, marked }
    })
  }

  async function submitTest() {
    setState(s => ({ ...s, submitted: true }))
    const questions = state.questions
    let correct = 0
    questions.forEach((q, i) => {
      if (state.answers[i] === q.correctAnswer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    setResult({ score, correct, total: questions.length })

    await fetch("/api/aptitude/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        difficulty,
        questions: questions.map((q, i) => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          userAnswer: state.answers[i] ?? null,
          explanation: q.explanation,
        })),
        score,
        timeTaken: (1800 - state.timeLeft),
      }),
    }).catch(() => {})
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-zinc-400">Generating your test with AI...</p>
      </div>
    )
  }

  if (state.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="w-8 h-8 text-amber-400" />
        <p className="text-zinc-300 font-medium">Could not load questions</p>
        <p className="text-zinc-500 text-sm">Please check your AI API key or try again.</p>
        <div className="flex gap-3">
          <Button onClick={loadQuestions}>Retry</Button>
          <Button variant="outline" onClick={() => router.push("/aptitude")}>Back</Button>
        </div>
      </div>
    )
  }

  if (result) {
    const q = state.questions
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className={`text-6xl font-bold mb-2 ${result.score >= 70 ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
            {result.score}%
          </div>
          <p className="text-zinc-300 text-lg font-medium">{result.correct}/{result.total} correct</p>
          <p className="text-zinc-500 mt-1">
            {result.score >= 80 ? "Excellent! " : result.score >= 60 ? "Good effort! " : "Keep practicing! "}
            {result.score >= 80 ? "You're well-prepared for this topic." : "Review the explanations below to improve."}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={loadQuestions}>Retake Test</Button>
            <Button variant="outline" onClick={() => router.push("/aptitude")}>Back to Aptitude</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-zinc-100">Question Review</h3>
          {q.map((question, i) => {
            const userAns = state.answers[i]
            const isCorrect = userAns === question.correctAnswer
            return (
              <Card key={i} className={`border ${isCorrect ? "border-emerald-500/20" : "border-rose-500/20"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200 mb-3">{i + 1}. {question.question}</p>
                      <div className="space-y-1.5 mb-3">
                        {question.options.map((opt) => (
                          <div
                            key={opt}
                            className={cn(
                              "text-xs px-3 py-2 rounded-md",
                              opt === question.correctAnswer ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                              opt === userAns && !isCorrect ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" :
                              "bg-zinc-800/50 text-zinc-400"
                            )}
                          >
                            {opt}
                            {opt === question.correctAnswer && " ✓"}
                            {opt === userAns && !isCorrect && " ✗"}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-400 bg-zinc-800/50 rounded-md px-3 py-2">
                        <span className="font-medium text-zinc-300">Explanation: </span>
                        {question.explanation}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const q = state.questions[current]
  const totalQ = state.questions.length
  const answered = Object.keys(state.answers).length
  const timeColor = state.timeLeft < 300 ? "text-rose-400" : state.timeLeft < 600 ? "text-amber-400" : "text-zinc-300"

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-zinc-950/90 backdrop-blur py-3 -mx-6 px-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">{category}</Badge>
          <Badge variant="outline" className="capitalize">{difficulty}</Badge>
          <span className="text-sm text-zinc-500">{answered}/{totalQ} answered</span>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timeColor}`}>
          <Clock className="w-4 h-4" />
          {formatTime(state.timeLeft)}
        </div>
      </div>

      <Progress value={(answered / totalQ) * 100} className="mb-6" />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-start justify-between mb-4">
              <Badge variant="outline" className="text-xs">{q.topic}</Badge>
              <button
                onClick={() => toggleMark(current)}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  state.marked.has(current) ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Flag className="w-3.5 h-3.5" />
                {state.marked.has(current) ? "Marked" : "Mark for review"}
              </button>
            </div>

            <p className="text-zinc-100 leading-relaxed mb-6 font-medium">
              Q{current + 1}. {q.question}
            </p>

            <div className="space-y-2.5">
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => selectAnswer(current, option)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                    state.answers[current] === option
                      ? "border-indigo-500 bg-indigo-500/15 text-indigo-200"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {current < totalQ - 1 ? (
              <Button onClick={() => setCurrent(c => c + 1)}>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={submitTest} className="bg-emerald-600 hover:bg-emerald-500">
                Submit Test
              </Button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sticky top-24">
            <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {state.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-8 h-8 rounded-md text-xs font-medium transition-all",
                    i === current ? "bg-indigo-600 text-white" :
                    state.marked.has(i) ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                    state.answers[i] ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500/20" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500/20" /> Marked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-zinc-800" /> Not answered</div>
            </div>
            <Button
              onClick={submitTest}
              size="sm"
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
