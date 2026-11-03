"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle,
  AlertCircle, Loader2, Flame, Zap, Trophy, Star, RotateCcw, ArrowLeft,
} from "lucide-react"

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

const QUIT_TAUNTS = [
  "Your future interviewer is watching. Kidding. Or am I?",
  "The person who got your dream job? They didn't quit.",
  "Every question you skip is one you'll get wrong in a real placement test.",
  "Consistency is what turns average into excellent. You were doing great.",
  "You're 3 questions away from a breakthrough. Just 3.",
  "Your competitor just answered 2 more questions while you stared at this dialog.",
  "The recruiter sorting 200 resumes doesn't care that you got tired.",
  "Quitting now means coming back and starting over. Worth it?",
  "Hard things feel impossible — until they suddenly don't. You're close.",
  "One placement season. One shot. Don't practice quitting.",
  "Your brain says 'stop.' Your future self says 'don't you dare.'",
  "You can close this. Or you can become the person who doesn't close this.",
  "The test doesn't get easier when you come back. But you will.",
  "Every topper wanted to quit at some point. Difference is — they didn't.",
  "Fun fact: the next question might be the easiest one. You'll never know now.",
  "Imagine explaining this to your family at placement season. Don't.",
  "People who finish what they start get shortlisted. Simple math.",
  "The only test you truly fail is the one you don't complete.",
]

const ACHIEVEMENTS = [
  { threshold: 90, label: "Prodigy", icon: "🏆", color: "text-amber-400" },
  { threshold: 75, label: "Sharp Mind", icon: "⚡", color: "text-indigo-400" },
  { threshold: 60, label: "On Track", icon: "📈", color: "text-emerald-400" },
  { threshold: 0,  label: "Started Strong", icon: "💪", color: "text-zinc-400" },
]

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
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [currentTaunt, setCurrentTaunt] = useState("")
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [apiXp, setApiXp] = useState<number | null>(null)
  const prevAnsweredRef = useRef(0)

  const loadQuestions = useCallback(async () => {
    setState(s => ({ ...s, loading: true }))
    setXp(0)
    setStreak(0)
    setCurrent(0)
    try {
      const res = await fetch("/api/aptitude/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty, topic: topic ?? undefined, count: 15 }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState(s => ({
        ...s,
        questions: data.questions ?? [],
        answers: {},
        marked: new Set(),
        timeLeft: data.duration ?? 1800,
        submitted: false,
        loading: false,
      }))
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [category, difficulty, topic])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  // XP + streak tracking
  useEffect(() => {
    const answered = Object.keys(state.answers).length
    const prev = prevAnsweredRef.current
    if (answered > prev && !state.submitted) {
      setXp(p => p + 10)
      setStreak(s => s + 1)
    }
    prevAnsweredRef.current = answered
  }, [state.answers, state.submitted])

  // Countdown timer
  useEffect(() => {
    if (state.submitted || state.loading || state.questions.length === 0) return
    const timer = setInterval(() => {
      setState(s => {
        if (s.timeLeft <= 1) {
          handleSubmit(s)
          return { ...s, submitted: true }
        }
        return { ...s, timeLeft: s.timeLeft - 1 }
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.submitted, state.loading, state.questions.length])

  // Warn on tab close during active test
  useEffect(() => {
    if (state.submitted || state.loading) return
    const fn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', fn)
    return () => window.removeEventListener('beforeunload', fn)
  }, [state.submitted, state.loading])

  function attemptQuit() {
    if (state.submitted) { router.push('/aptitude'); return }
    const taunt = QUIT_TAUNTS[Math.floor(Math.random() * QUIT_TAUNTS.length)]
    setCurrentTaunt(taunt)
    setShowQuitModal(true)
  }

  function selectAnswer(index: number, option: string) {
    setState(s => ({ ...s, answers: { ...s.answers, [index]: option } }))
  }

  function toggleMark(index: number) {
    setState(s => {
      const marked = new Set(s.marked)
      if (marked.has(index)) marked.delete(index)
      else marked.add(index)
      return { ...s, marked }
    })
  }

  function handleSubmit(currentState?: TestState) {
    const s = currentState ?? state
    let correct = 0
    s.questions.forEach((q, i) => {
      if (s.answers[i] === q.correctAnswer) correct++
    })
    const score = s.questions.length ? Math.round((correct / s.questions.length) * 100) : 0
    setResult({ score, correct, total: s.questions.length })

    fetch("/api/aptitude/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        difficulty,
        questions: s.questions.map((q, i) => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          userAnswer: s.answers[i] ?? null,
          explanation: q.explanation,
        })),
        score,
        timeTaken: (1800 - s.timeLeft),
      }),
    }).then(r => r.json()).then(d => { if (typeof d.xpEarned === "number") setApiXp(d.xpEarned) }).catch(() => {})
  }

  function submitTest() {
    setState(s => ({ ...s, submitted: true }))
    handleSubmit()
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
        <p className="text-xs text-zinc-600 capitalize">{difficulty} · {category}</p>
      </div>
    )
  }

  if (state.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="w-8 h-8 text-amber-400" />
        <p className="text-zinc-300 font-medium">Could not load questions</p>
        <p className="text-zinc-500 text-sm">Please check your connection or try a different difficulty.</p>
        <div className="flex gap-3">
          <Button onClick={loadQuestions}>Retry</Button>
          <Button variant="outline" onClick={() => router.push("/aptitude")}>Back</Button>
        </div>
      </div>
    )
  }

  if (result) {
    const achievement = ACHIEVEMENTS.find(a => result.score >= a.threshold)!
    const bonusXp = Math.round(result.score / 10) * 5
    const finalXp = apiXp ?? (xp + bonusXp)
    const q = state.questions

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score card */}
        <div className="text-center py-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {result.score >= 75 && (
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
            )}
          </div>
          <div className="text-5xl mb-2">{achievement.icon}</div>
          <div className={`text-7xl font-black mb-1 ${result.score >= 70 ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
            {result.score}%
          </div>
          <p className={`text-lg font-semibold mb-1 ${achievement.color}`}>{achievement.label}</p>
          <p className="text-zinc-400 text-sm">{result.correct}/{result.total} correct</p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-1">
                <Zap className="w-5 h-5" />{finalXp}
              </div>
              <div className="text-xs text-zinc-500">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 flex items-center gap-1">
                <Flame className="w-5 h-5" />{streak}
              </div>
              <div className="text-xs text-zinc-500">Answers Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400 capitalize">{difficulty[0].toUpperCase()}</div>
              <div className="text-xs text-zinc-500">Difficulty</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-8">
            <Button onClick={loadQuestions} className="gap-2">
              <RotateCcw className="w-4 h-4" />Retake Test
            </Button>
            <Button variant="outline" onClick={() => router.push("/aptitude")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />All Tests
            </Button>
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs text-zinc-500">Try next level:</span>
          {(["beginner", "intermediate", "advanced"] as const).map(d => (
            <Button
              key={d}
              size="sm"
              variant={d === difficulty ? "default" : "outline"}
              onClick={() => router.push(`/aptitude/test?category=${category}&difficulty=${d}`)}
              className={cn("text-xs capitalize", d === "beginner" ? "border-emerald-500/30 text-emerald-400" : d === "intermediate" ? "border-amber-500/30 text-amber-400" : "border-rose-500/30 text-rose-400")}
            >
              {d}
            </Button>
          ))}
        </div>

        {/* Answer review */}
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
  const difficultyColor = difficulty === "beginner" ? "text-emerald-400" : difficulty === "intermediate" ? "text-amber-400" : "text-rose-400"

  return (
    <div className="max-w-4xl mx-auto">
      {/* Rage-quit modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-5xl text-center mb-4">😤</div>
            <h2 className="text-xl font-bold text-zinc-100 text-center mb-3">Running away already?</h2>
            <p className="text-zinc-300 text-center text-sm leading-relaxed mb-2 italic">
              &ldquo;{currentTaunt}&rdquo;
            </p>
            {xp > 0 && (
              <p className="text-xs text-center text-amber-400 mb-6">
                You&apos;ve earned {xp} XP. Don&apos;t waste it.
              </p>
            )}
            {xp === 0 && <div className="mb-6" />}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setShowQuitModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Keep Going 💪
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowQuitModal(false); router.push('/aptitude') }}
                className="w-full text-zinc-600 hover:text-zinc-400 text-sm"
              >
                Yes, I give up (for now)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-zinc-950/95 backdrop-blur py-3 -mx-6 px-6 border-b border-zinc-800 z-10">
        <div className="flex items-center gap-3">
          <button onClick={attemptQuit} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Badge variant="secondary" className="capitalize">{category}</Badge>
          <Badge variant="outline" className={`capitalize ${difficultyColor} border-current`}>{difficulty}</Badge>
          <span className="text-sm text-zinc-500 hidden sm:inline">{answered}/{totalQ} answered</span>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 3 && (
            <span className="flex items-center gap-1 text-orange-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" /> {streak}
            </span>
          )}
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" /> {xp} XP
          </span>
          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timeColor}`}>
            <Clock className="w-4 h-4" />
            {formatTime(state.timeLeft)}
          </div>
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
                <Trophy className="w-4 h-4 mr-1" />
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

            {/* Difficulty switcher */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-600 mb-2">Difficulty</p>
              <div className="flex flex-col gap-1">
                {(["beginner", "intermediate", "advanced"] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => d !== difficulty && attemptQuit()}
                    className={cn(
                      "text-left text-xs px-2 py-1.5 rounded-md capitalize transition-colors",
                      d === difficulty
                        ? d === "beginner" ? "bg-emerald-500/20 text-emerald-400" : d === "intermediate" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                        : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {d === difficulty ? "▸ " : ""}{d}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={submitTest}
              size="sm"
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500"
            >
              <Star className="w-3.5 h-3.5 mr-1" />
              Submit Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
