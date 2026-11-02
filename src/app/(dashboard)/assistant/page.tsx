"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bot, User, Send, Loader2, Zap, RotateCcw } from "lucide-react"

interface Message {
  role: "assistant" | "user"
  content: string
}

const SUGGESTIONS = [
  { label: "Explain Binary Search", prompt: "Explain binary search algorithm with a real-world example and code in Python." },
  { label: "Mock HR Question", prompt: "Ask me an HR interview question and evaluate my answer after I respond." },
  { label: "Study Plan", prompt: "Create a 4-week study plan for TCS placement preparation from scratch." },
  { label: "STAR Template", prompt: "Show me the STAR method template for behavioral interview answers with an example." },
  { label: "SQL Basics", prompt: "Explain SQL JOINs with examples and a practice question." },
  { label: "Resume Tips", prompt: "What are the top 5 resume mistakes that get candidates rejected in ATS systems?" },
  { label: "DSA Roadmap", prompt: "Give me a prioritized DSA roadmap for interview preparation in 6 weeks." },
  { label: "Career Advice", prompt: "I'm a B.Tech student. Should I focus on placements, higher studies, or startups? Help me think through this." },
]

const MODE_OPTIONS = [
  { id: "default", label: "Adaptive" },
  { id: "beginner", label: "Beginner" },
  { id: "technical", label: "Technical" },
  { id: "interview", label: "Interview" },
  { id: "exam", label: "Exam-focused" },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("default")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(content?: string) {
    const text = (content ?? input).trim()
    if (!text || loading) return

    const userMessage: Message = { role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.delta?.text ?? parsed.content ?? ""
              if (delta) {
                assistantMessage += delta
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: "assistant", content: assistantMessage }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, I couldn't process that request. Please check your API key in the settings or try again. Make sure ANTHROPIC_API_KEY is set in your environment."
      }])
    }
    setLoading(false)
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-100">AI Learning Assistant</h1>
            <p className="text-xs text-zinc-500">Powered by Claude · Ask anything about your preparation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {MODE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  mode === opt.id ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4" style={{ minHeight: "400px", maxHeight: "55vh" }}>
        {messages.length === 0 ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-100">Ask me anything</h2>
              <p className="text-zinc-400 text-sm mt-1">
                I can explain concepts, solve problems, generate questions, review code, and build study plans.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3 text-center">Quick Start</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.prompt)}
                    className="card-hover text-left p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300 hover:text-zinc-100"
                  >
                    <span className="font-medium">{s.label}</span>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{s.prompt.slice(0, 50)}...</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "assistant" ? "bg-indigo-500/20" : "bg-zinc-700"
              )}>
                {msg.role === "assistant"
                  ? <Zap className="w-4 h-4 text-indigo-400" />
                  : <User className="w-4 h-4 text-zinc-300" />
                }
              </div>
              <div className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-200 whitespace-pre-wrap"
                  : "bg-indigo-600/20 border border-indigo-500/20 text-zinc-200"
              )}>
                {msg.content || (msg.role === "assistant" && loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            placeholder="Ask me to explain a concept, solve a problem, generate questions, review code..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="min-h-[80px] pr-14 resize-none"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-zinc-600 text-center">
          Enter to send · Shift+Enter for new line · Powered by Claude Haiku
        </p>
      </div>
    </div>
  )
}
