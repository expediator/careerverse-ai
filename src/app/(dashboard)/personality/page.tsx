"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain, Mic2, MessageSquare, TrendingUp, CheckCircle2,
  Zap, BookOpen, Target, Star, Volume2, ChevronRight, RefreshCw
} from "lucide-react"

const COMMUNICATION_TIPS = [
  {
    category: "Body Language",
    icon: "🤝",
    color: "bg-indigo-500/10 border-indigo-500/20",
    accent: "text-indigo-400",
    tips: [
      "Maintain eye contact for 3–5 seconds at a time",
      "Keep posture upright — avoid slouching or crossing arms",
      "Use open hand gestures to convey openness",
      "Nod occasionally to show active listening",
      "Mirror the interviewer's energy level subtly",
    ],
  },
  {
    category: "Verbal Skills",
    icon: "🗣️",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    tips: [
      "Speak at a measured pace — slow down when making key points",
      "Eliminate filler words: 'um', 'uh', 'like', 'you know'",
      "Use the STAR method for behavioral answers",
      "Pause briefly before answering — shows thoughtfulness",
      "Vary your tone and emphasis to stay engaging",
    ],
  },
  {
    category: "Confidence",
    icon: "💪",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    tips: [
      "Prepare a 60-second polished self-introduction",
      "Practice power poses for 2 minutes before interviews",
      "Acknowledge gaps honestly — shows self-awareness",
      "Ask clarifying questions when unsure",
      "End with a strong closing statement and a thank-you",
    ],
  },
  {
    category: "Active Listening",
    icon: "👂",
    color: "bg-amber-500/10 border-amber-500/20",
    accent: "text-amber-400",
    tips: [
      "Paraphrase the question before answering to confirm understanding",
      "Don't interrupt — let the interviewer finish",
      "Note key words in questions and address them directly",
      "Ask follow-up questions that show genuine interest",
      "Summarize multi-part questions before tackling them",
    ],
  },
]

const PRACTICE_SCENARIOS = [
  { id: "intro", label: "Self Introduction", prompt: "Give me a 60-second self-introduction as if I'm an interviewer asking 'Tell me about yourself.'" },
  { id: "strength", label: "Strength & Weakness", prompt: "What is your greatest strength and one area you're actively improving? Frame it professionally." },
  { id: "conflict", label: "Conflict Resolution", prompt: "Describe a time you disagreed with a teammate and how you resolved it." },
  { id: "stress", label: "Handling Pressure", prompt: "Tell me about a time you worked under tight deadlines. How did you manage?" },
  { id: "leadership", label: "Leadership Story", prompt: "Give an example of a time you led a project or initiative, even informally." },
  { id: "why", label: "Why This Company", prompt: "Why do you want to work here? What excites you about this role?" },
]

const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally", "actually", "so yeah", "right?", "kind of"]

export default function PersonalityPage() {
  const [activeScenario, setActiveScenario] = useState<typeof PRACTICE_SCENARIOS[0] | null>(null)
  const [userText, setUserText] = useState("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [fillerCount, setFillerCount] = useState<{ word: string; count: number }[]>([])

  function analyzeFillers(text: string) {
    const lower = text.toLowerCase()
    const found = FILLER_WORDS
      .map(w => ({ word: w, count: (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length }))
      .filter(f => f.count > 0)
    setFillerCount(found)
  }

  async function getFeedback() {
    if (!userText.trim() || !activeScenario) return
    setLoading(true)
    analyzeFillers(userText)
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Scenario: "${activeScenario.label}"\n\nMy answer:\n"${userText}"\n\nPlease give concise, actionable feedback on:\n1. Structure and clarity (2 sentences)\n2. What I did well (1-2 points)\n3. What to improve (2-3 specific tips)\n4. A better phrasing suggestion for the weakest part`,
            },
          ],
          mode: "interview",
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let result = ""
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
              result += parsed.text ?? ""
            } catch {}
          }
        }
        setFeedback(result)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-violet-400" />
          Communication & Personality Coach
        </h1>
        <p className="text-zinc-400 mt-1">
          Build executive presence, eliminate filler words, and master interview communication.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Practice Sessions", value: 0, icon: Mic2, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Filler Words Caught", value: 0, icon: Volume2, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Tips Reviewed", value: 0, icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Confidence Score", value: "—", icon: Star, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-zinc-800">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="practice">
        <TabsList className="mb-6">
          <TabsTrigger value="practice">AI Practice</TabsTrigger>
          <TabsTrigger value="tips">Communication Tips</TabsTrigger>
          <TabsTrigger value="vocabulary">Power Vocabulary</TabsTrigger>
        </TabsList>

        {/* AI Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Scenario list */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-400 mb-3">Choose a scenario</p>
              {PRACTICE_SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => { setActiveScenario(scenario); setUserText(""); setFeedback(""); setFillerCount([]) }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between group ${
                    activeScenario?.id === scenario.id
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-sm font-medium">{scenario.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Practice area */}
            <div className="lg:col-span-2 space-y-4">
              {activeScenario ? (
                <>
                  <Card className="border-indigo-500/20 bg-indigo-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-300">Interviewer asks:</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{activeScenario.prompt}</p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Textarea
                      value={userText}
                      onChange={e => setUserText(e.target.value)}
                      placeholder="Type your answer here. Speak naturally, as you would in a real interview..."
                      className="min-h-[140px] bg-zinc-900 border-zinc-700 text-zinc-100 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{userText.split(/\s+/).filter(Boolean).length} words</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setUserText(""); setFeedback(""); setFillerCount([]) }}>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Clear
                        </Button>
                        <Button size="sm" onClick={getFeedback} disabled={!userText.trim() || loading}>
                          <Zap className="w-3.5 h-3.5" />
                          {loading ? "Analyzing..." : "Get AI Feedback"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Filler word analysis */}
                  {fillerCount.length > 0 && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5" />
                          Filler words detected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {fillerCount.map(f => (
                            <Badge key={f.word} variant="warning" className="text-xs">
                              &quot;{f.word}&quot; × {f.count}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Feedback */}
                  {feedback && (
                    <Card className="border-violet-500/20 bg-violet-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-violet-300 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          AI Coach Feedback
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{feedback}</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-zinc-800">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">Select a scenario to start practicing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips">
          <div className="grid sm:grid-cols-2 gap-6">
            {COMMUNICATION_TIPS.map(section => (
              <Card key={section.category} className={`border ${section.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-zinc-100">{section.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2.5">
                  {section.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${section.accent}`} />
                      <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Instead of 'I did'",
                weak: ["I did", "I made", "I helped"],
                strong: ["I spearheaded", "I architected", "I facilitated"],
                color: "border-indigo-500/20 bg-indigo-500/5",
              },
              {
                label: "Leadership Words",
                weak: ["in charge of", "worked on", "part of"],
                strong: ["orchestrated", "championed", "drove adoption of"],
                color: "border-violet-500/20 bg-violet-500/5",
              },
              {
                label: "Impact Words",
                weak: ["improved", "helped", "worked to"],
                strong: ["delivered 40% improvement", "reduced X by Y%", "scaled to 10K users"],
                color: "border-emerald-500/20 bg-emerald-500/5",
              },
              {
                label: "Problem-Solving",
                weak: ["figured out", "fixed", "dealt with"],
                strong: ["diagnosed root cause", "implemented a strategic fix", "mitigated the risk"],
                color: "border-amber-500/20 bg-amber-500/5",
              },
              {
                label: "Teamwork",
                weak: ["worked with others", "in a team", "we did"],
                strong: ["cross-functional collaboration", "aligned stakeholders", "co-designed with"],
                color: "border-sky-500/20 bg-sky-500/5",
              },
              {
                label: "Closing Strong",
                weak: ["that's about it", "I think so", "yeah"],
                strong: ["in summary", "the key takeaway is", "my biggest learning was"],
                color: "border-rose-500/20 bg-rose-500/5",
              },
            ].map(group => (
              <Card key={group.label} className={`border ${group.color}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">{group.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1.5">Weak</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.weak.map(w => (
                        <Badge key={w} variant="secondary" className="text-xs line-through opacity-50">{w}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 mb-1.5">Strong</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.strong.map(s => (
                        <Badge key={s} variant="success" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
