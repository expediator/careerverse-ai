"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Mic2, Send, Loader2, RotateCcw, ChevronRight,
  Bot, User, CheckCircle2, Star, AlertCircle, Video
} from "lucide-react"

interface Message {
  role: "interviewer" | "user"
  content: string
  timestamp: Date
}

interface InterviewState {
  sessionId: string | null
  messages: Message[]
  currentQuestion: number
  isLoading: boolean
  isFinished: boolean
  score: number | null
  feedback: string | null
}

export default function InterviewSessionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get("type") ?? "hr"
  const domain = searchParams.get("domain")
  const mode = searchParams.get("mode") ?? "text"

  const [state, setState] = useState<InterviewState>({
    sessionId: null,
    messages: [],
    currentQuestion: 0,
    isLoading: false,
    isFinished: false,
    score: null,
    feedback: null,
  })
  const [answer, setAnswer] = useState("")
  const [started, setStarted] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  async function startInterview() {
    setStartLoading(true)
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, domain, difficulty: "intermediate" }),
      })
      const data = await res.json()

      setState(s => ({
        ...s,
        sessionId: data.sessionId,
        messages: [{ role: "interviewer", content: data.firstQuestion, timestamp: new Date() }],
      }))
      setStarted(true)
    } catch {
      setState(s => ({
        ...s,
        messages: [{
          role: "interviewer",
          content: "Hello! I'm your AI interviewer today. Let's start with a classic: Tell me about yourself and why you're interested in this role.",
          timestamp: new Date()
        }],
      }))
      setStarted(true)
    }
    setStartLoading(false)
  }

  async function sendAnswer() {
    if (!answer.trim() || state.isLoading) return

    const userMessage: Message = {
      role: "user",
      content: answer.trim(),
      timestamp: new Date(),
    }

    setState(s => ({
      ...s,
      messages: [...s.messages, userMessage],
      isLoading: true,
      currentQuestion: s.currentQuestion + 1,
    }))
    setAnswer("")

    try {
      const res = await fetch("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          type,
          domain,
          history: [...state.messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          questionNumber: state.currentQuestion + 1,
        }),
      })

      const data = await res.json()

      if (data.finished) {
        setState(s => ({
          ...s,
          isLoading: false,
          isFinished: true,
          score: data.score,
          feedback: data.feedback,
          messages: [...s.messages, {
            role: "interviewer",
            content: data.closingMessage,
            timestamp: new Date(),
          }],
        }))
      } else {
        setState(s => ({
          ...s,
          isLoading: false,
          messages: [...s.messages, {
            role: "interviewer",
            content: data.nextQuestion,
            timestamp: new Date(),
          }],
        }))
      }
    } catch {
      setState(s => ({
        ...s,
        isLoading: false,
        messages: [...s.messages, {
          role: "interviewer",
          content: "Thank you for that answer. Could you elaborate on a specific example from your experience?",
          timestamp: new Date(),
        }],
      }))
    }
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          {mode === "video" ? <Video className="w-8 h-8 text-violet-400" /> : <Mic2 className="w-8 h-8 text-violet-400" />}
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          {type === "hr" ? "HR Interview" : type === "technical" ? "Technical Interview" : "Behavioral Interview"}
        </h1>
        {domain && (
          <Badge variant="secondary" className="mb-4 capitalize">{domain.replace("-", " ")}</Badge>
        )}
        <p className="text-zinc-400 mb-8">
          The AI interviewer will ask you questions one at a time. Answer naturally.
          Follow-up questions will be based on your responses.
        </p>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-left mb-8 space-y-3">
          <h3 className="font-medium text-zinc-200 mb-3">How it works:</h3>
          {[
            "AI asks realistic interview questions based on your domain",
            "Type your answer and click Send",
            "AI evaluates your answer and asks a follow-up",
            "After 8-10 questions, get detailed feedback and score",
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              {tip}
            </div>
          ))}
        </div>

        {mode === "video" && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-sm text-amber-300">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Video mode requires camera access. Your recording stays local and is not uploaded.
          </div>
        )}

        <Button
          size="lg"
          onClick={startInterview}
          loading={startLoading}
          className="px-10"
        >
          Start Interview
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  if (state.isFinished && state.score !== null) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Interview Complete!</h2>
          <div className={`text-5xl font-bold mt-4 ${state.score >= 70 ? "text-emerald-400" : state.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
            {state.score}%
          </div>
          <p className="text-zinc-400 mt-2">Overall Interview Score</p>
        </div>

        {state.feedback && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-zinc-100 mb-3">AI Feedback</h3>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{state.feedback}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => { setStarted(false); setState({ sessionId: null, messages: [], currentQuestion: 0, isLoading: false, isFinished: false, score: null, feedback: null }) }} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
          <Button onClick={() => router.push("/interview")} className="flex-1">
            Back to Interviews
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">AI Interviewer</p>
            <p className="text-xs text-zinc-500 capitalize">{type} Interview {domain ? `· ${domain}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Q{state.currentQuestion + 1}</Badge>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-zinc-500">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-96 max-h-[60vh]">
        {state.messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "interviewer" ? "bg-violet-500/20" : "bg-indigo-500/20"
            )}>
              {msg.role === "interviewer"
                ? <Bot className="w-4 h-4 text-violet-400" />
                : <User className="w-4 h-4 text-indigo-400" />
              }
            </div>
            <div className={cn(
              "max-w-[80%] rounded-xl px-4 py-3 text-sm",
              msg.role === "interviewer"
                ? "bg-zinc-900 border border-zinc-800 text-zinc-200"
                : "bg-indigo-600/20 border border-indigo-500/20 text-zinc-200"
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {state.isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Answer input */}
      {!state.isFinished && (
        <div className="space-y-3">
          <Textarea
            placeholder="Type your answer here..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="min-h-[100px] resize-none"
            onKeyDown={e => {
              if (e.key === "Enter" && e.ctrlKey) sendAnswer()
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600">Ctrl+Enter to send</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/interview")}
              >
                End Interview
              </Button>
              <Button
                size="sm"
                onClick={sendAnswer}
                disabled={!answer.trim() || state.isLoading}
              >
                <Send className="w-3.5 h-3.5" />
                Send Answer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
