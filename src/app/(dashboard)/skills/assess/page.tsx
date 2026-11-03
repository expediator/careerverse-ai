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
  AlertCircle, Loader2, Flame, Zap, ArrowLeft, RotateCcw, BookOpen,
  ExternalLink, Brain, Code2, Trophy, Star,
} from "lucide-react"

const DOMAIN_META: Record<string, { label: string; icon: string; color: string }> = {
  dsa:           { label: "DSA",              icon: "🌲", color: "text-indigo-400" },
  web:           { label: "Web Dev",          icon: "🌐", color: "text-sky-400" },
  database:      { label: "Databases",        icon: "🗄️", color: "text-amber-400" },
  python:        { label: "Python",           icon: "🐍", color: "text-emerald-400" },
  "system-design": { label: "System Design", icon: "🏗️", color: "text-violet-400" },
  "data-science":  { label: "Data Science",  icon: "📊", color: "text-pink-400" },
  cybersecurity: { label: "Cybersecurity",    icon: "🔒", color: "text-rose-400" },
  os:            { label: "OS & Networks",    icon: "⚙️", color: "text-zinc-400" },
}

const QUIT_TAUNTS = [
  "Your future interviewer will ask exactly this. Just saying.",
  "Every engineer you admire powered through this exact moment.",
  "You've answered this many questions. Quitting erases nothing — but finishing adds everything.",
  "Placements are won by people who don't quit when it gets uncomfortable.",
  "Recruiters don't see effort. They see results. Finish.",
  "The study plan at the end is personalized to YOU. You won't see it if you leave.",
  "One more section. You're not tired, you're close.",
  "Your competitor is still going. So should you.",
]

const TYPE_ICON: Record<string, React.ElementType> = {
  theoretical: Brain,
  quiz: Zap,
  practical: Code2,
}

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  topic: string
  type: string
}

interface SkillResult {
  level: string
  emoji: string
  color: string
  description: string
  score: number
  weakAreas: string[]
  strongAreas: string[]
  resources: Array<{ title: string; url: string; type: string; why: string }>
  aiPlan: string | null
}

export default function SkillAssessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const domain = searchParams.get("domain") ?? "dsa"
  const meta = DOMAIN_META[domain] ?? DOMAIN_META.dsa

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [marked, setMarked] = useState<Set<number>>(new Set())
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(1350)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<SkillResult | null>(null)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [quitTaunt, setQuitTaunt] = useState("")
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const prevAnsweredRef = useRef(0)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setAnswers({})
    setMarked(new Set())
    setCurrent(0)
    setXp(0)
    setStreak(0)
    setSubmitted(false)
    setResult(null)
    try {
      const res = await fetch("/api/skills/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, type: "mixed", count: 15 }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setTimeLeft(data.duration ?? 1350)
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [domain])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  // XP + streak
  useEffect(() => {
    const count = Object.keys(answers).length
    if (count > prevAnsweredRef.current && !submitted) {
      setXp(p => p + 10)
      setStreak(s => s + 1)
    }
    prevAnsweredRef.current = count
  }, [answers, submitted])

  // Timer
  useEffect(() => {
    if (submitted || loading || questions.length === 0) return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { handleSubmit(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, loading, questions.length])

  // Beforeunload
  useEffect(() => {
    if (submitted || loading) return
    const fn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', fn)
    return () => window.removeEventListener('beforeunload', fn)
  }, [submitted, loading])

  async function handleSubmit() {
    if (submitted) return
    setSubmitted(true)
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0

    try {
      const res = await fetch("/api/skills/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          score,
          questions: questions.map((q, i) => ({
            question: q.question,
            type: q.type,
            topic: q.topic,
            correctAnswer: q.correctAnswer,
            userAnswer: answers[i] ?? null,
            isCorrect: answers[i] === q.correctAnswer,
          })),
          timeTaken: 1350 - timeLeft,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        // Fallback local result
        const level = score >= 91 ? "Expert" : score >= 76 ? "Advanced" : score >= 61 ? "Intermediate" : score >= 41 ? "Elementary" : "Beginner"
        setResult({ level, emoji: "📊", color: "text-indigo-400", description: "", score, weakAreas: [], strongAreas: [], resources: [], aiPlan: null })
      }
    } catch {
      const level = score >= 91 ? "Expert" : score >= 76 ? "Advanced" : score >= 61 ? "Intermediate" : score >= 41 ? "Elementary" : "Beginner"
      setResult({ level, emoji: "📊", color: "text-indigo-400", description: "", score, weakAreas: [], strongAreas: [], resources: [], aiPlan: null })
    }
  }

  function attemptQuit() {
    if (submitted) { router.push('/skills'); return }
    setQuitTaunt(QUIT_TAUNTS[Math.floor(Math.random() * QUIT_TAUNTS.length)])
    setShowQuitModal(true)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-zinc-400">Generating your skill assessment...</p>
      <p className="text-xs text-zinc-600">{meta.icon} {meta.label} · 15 questions · Quiz + Theory + Practical</p>
    </div>
  )

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <AlertCircle className="w-8 h-8 text-amber-400" />
      <p className="text-zinc-300 font-medium">Could not load questions</p>
      <div className="flex gap-3">
        <Button onClick={loadQuestions}>Retry</Button>
        <Button variant="outline" onClick={() => router.push("/skills")}>Back</Button>
      </div>
    </div>
  )

  // Results screen
  if (result) {
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length
    const LEVEL_BADGES: Record<string, string> = {
      Expert: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      Advanced: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      Intermediate: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      Elementary: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      Beginner: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Skill level card */}
        <div className="text-center py-10 rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="text-5xl mb-2">{result.emoji}</div>
          <div className={`text-7xl font-black mb-1 ${result.score >= 76 ? "text-emerald-400" : result.score >= 51 ? "text-amber-400" : "text-rose-400"}`}>
            {result.score}%
          </div>
          <Badge className={`text-base px-4 py-1.5 border font-semibold mb-2 ${LEVEL_BADGES[result.level] ?? ""}`}>
            {meta.icon} {result.level}
          </Badge>
          <p className="text-zinc-400 text-sm mt-2 max-w-sm mx-auto">{result.description}</p>
          <p className="text-zinc-500 text-sm mt-1">{correct}/{questions.length} correct</p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-1 justify-center"><Zap className="w-5 h-5" />{xp + Math.round(result.score / 10) * 5}</div>
              <div className="text-xs text-zinc-500">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 flex items-center gap-1 justify-center"><Flame className="w-5 h-5" />{streak}</div>
              <div className="text-xs text-zinc-500">Answer Streak</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-8">
            <Button onClick={loadQuestions} className="gap-2"><RotateCcw className="w-4 h-4" />Retake</Button>
            <Button variant="outline" onClick={() => router.push("/skills")} className="gap-2"><ArrowLeft className="w-4 h-4" />All Domains</Button>
          </div>
        </div>

        {/* AI Study Plan */}
        {result.aiPlan && (
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Personalized Study Plan
              </p>
              <p className="text-zinc-300 text-sm leading-relaxed">{result.aiPlan}</p>
            </CardContent>
          </Card>
        )}

        {/* Weak / Strong areas */}
        {(result.weakAreas.length > 0 || result.strongAreas.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {result.weakAreas.length > 0 && (
              <Card className="border-rose-500/20">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">Needs Work</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.weakAreas.map(t => (
                      <Badge key={t} variant="outline" className="text-xs border-rose-500/30 text-rose-300">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {result.strongAreas.length > 0 && (
              <Card className="border-emerald-500/20">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Strong Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.strongAreas.map(t => (
                      <Badge key={t} variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recommended resources */}
        {result.resources.length > 0 && (
          <Card className="border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Recommended for {result.level}s
              </p>
              <div className="space-y-3">
                {result.resources.map(r => (
                  <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate">{r.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{r.why}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs capitalize">{r.type}</Badge>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question review */}
        <div className="space-y-3">
          <h3 className="font-semibold text-zinc-100">Question Review</h3>
          {questions.map((q, i) => {
            const userAns = answers[i]
            const isCorrect = userAns === q.correctAnswer
            const TypeIcon = TYPE_ICON[q.type] ?? Brain
            return (
              <Card key={i} className={`border ${isCorrect ? "border-emerald-500/20" : "border-rose-500/20"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                        <span className="text-xs text-zinc-600 flex items-center gap-0.5 capitalize"><TypeIcon className="w-3 h-3" /> {q.type}</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 mb-3">{i + 1}. {q.question}</p>
                      <div className="space-y-1.5 mb-3">
                        {q.options.map(opt => (
                          <div key={opt} className={cn("text-xs px-3 py-2 rounded-md",
                            opt === q.correctAnswer ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                            opt === userAns && !isCorrect ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" :
                            "bg-zinc-800/50 text-zinc-400")}>
                            {opt}{opt === q.correctAnswer && " ✓"}{opt === userAns && !isCorrect && " ✗"}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-400 bg-zinc-800/50 rounded-md px-3 py-2">
                        <span className="font-medium text-zinc-300">Why: </span>{q.explanation}
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

  const q = questions[current]
  const answered = Object.keys(answers).length
  const timeColor = timeLeft < 180 ? "text-rose-400" : timeLeft < 360 ? "text-amber-400" : "text-zinc-300"
  const TypeIcon = TYPE_ICON[q?.type] ?? Brain

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quit modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-5xl text-center mb-4">😤</div>
            <h2 className="text-xl font-bold text-zinc-100 text-center mb-3">Leaving already?</h2>
            <p className="text-zinc-300 text-center text-sm leading-relaxed mb-2 italic">&ldquo;{quitTaunt}&rdquo;</p>
            {xp > 0 && <p className="text-xs text-center text-amber-400 mb-6">You&apos;ve earned {xp} XP — your study plan is almost ready.</p>}
            {xp === 0 && <div className="mb-6" />}
            <div className="flex flex-col gap-3">
              <Button onClick={() => setShowQuitModal(false)} className="w-full bg-indigo-600 hover:bg-indigo-500">Keep Going 💪</Button>
              <Button variant="ghost" onClick={() => { setShowQuitModal(false); router.push('/skills') }} className="w-full text-zinc-600 hover:text-zinc-400 text-sm">Yes, I quit (for now)</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-zinc-950/95 backdrop-blur py-3 -mx-6 px-6 border-b border-zinc-800 z-10">
        <div className="flex items-center gap-3">
          <button onClick={attemptQuit} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-lg">{meta.icon}</span>
          <Badge variant="secondary" className={`${meta.color}`}>{meta.label}</Badge>
          <span className="text-sm text-zinc-500 hidden sm:inline">{answered}/{questions.length} answered</span>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 3 && <span className="flex items-center gap-1 text-orange-400 text-xs font-bold"><Flame className="w-3.5 h-3.5" />{streak}</span>}
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />{xp} XP
          </span>
          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timeColor}`}>
            <Clock className="w-4 h-4" />{formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <Progress value={(answered / questions.length) * 100} className="mb-6" />

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                <span className="text-xs text-zinc-600 flex items-center gap-1 capitalize"><TypeIcon className="w-3 h-3" />{q.type}</span>
              </div>
              <button onClick={() => setMarked(prev => {
                const s = new Set(prev)
                if (s.has(current)) s.delete(current); else s.add(current)
                return s
              })} className={cn("flex items-center gap-1.5 text-xs transition-colors", marked.has(current) ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300")}>
                <Flag className="w-3.5 h-3.5" />{marked.has(current) ? "Marked" : "Mark"}
              </button>
            </div>
            <p className="text-zinc-100 leading-relaxed mb-6 font-medium">Q{current + 1}. {q.question}</p>
            <div className="space-y-2.5">
              {q.options.map(opt => (
                <button key={opt} onClick={() => setAnswers(a => ({ ...a, [current]: opt }))}
                  className={cn("w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                    answers[current] === opt ? "border-indigo-500 bg-indigo-500/15 text-indigo-200" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800")}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
              <ChevronLeft className="w-4 h-4" />Previous
            </Button>
            {current < questions.length - 1
              ? <Button onClick={() => setCurrent(c => c + 1)}>Next<ChevronRight className="w-4 h-4" /></Button>
              : <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500"><Trophy className="w-4 h-4 mr-1" />Submit & Get Results</Button>}
          </div>
        </div>

        {/* Palette */}
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sticky top-24">
            <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={cn("w-8 h-8 rounded-md text-xs font-medium transition-all",
                    i === current ? "bg-indigo-600 text-white" :
                    marked.has(i) ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                    answers[i] ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-zinc-800 text-zinc-500 hover:bg-zinc-700")}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500/20" />Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500/20" />Marked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-zinc-800" />Not answered</div>
            </div>
            <Button onClick={handleSubmit} size="sm" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500">
              <Star className="w-3.5 h-3.5 mr-1" />Submit & See Level
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
