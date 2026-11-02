"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, BookOpen, ChevronRight, CheckCircle2, FlaskConical } from "lucide-react"

const ENGINEERING_DOMAINS = [
  {
    id: "mechanical",
    label: "Mechanical Engineering",
    icon: "⚙️",
    color: "bg-amber-500/10 border-amber-500/20",
    accent: "text-amber-400",
    subjects: [
      { name: "Thermodynamics", topics: ["Laws of thermodynamics", "Carnot cycle", "Steam tables", "Rankine cycle", "Refrigeration cycles"] },
      { name: "Fluid Mechanics", topics: ["Bernoulli's equation", "Viscosity & laminar flow", "Turbulent flow", "Pipe flow losses", "Hydraulic machines"] },
      { name: "Strength of Materials", topics: ["Stress-strain diagrams", "Bending moment diagrams", "Shear force diagrams", "Torsion", "Columns & buckling"] },
      { name: "Machine Design", topics: ["Fasteners & joints", "Gear trains", "Bearings", "Springs", "Fatigue analysis"] },
    ],
  },
  {
    id: "civil",
    label: "Civil Engineering",
    icon: "🏗️",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    subjects: [
      { name: "Structural Analysis", topics: ["Truss analysis", "Frame analysis", "Influence lines", "Virtual work method", "Slope deflection method"] },
      { name: "Concrete Technology", topics: ["Mix design", "IS codes for concrete", "Reinforcement details", "Pre-stressed concrete", "Quality control"] },
      { name: "Geotechnical Eng.", topics: ["Soil classification", "Permeability & seepage", "Consolidation theory", "Bearing capacity", "Slope stability"] },
      { name: "Transportation", topics: ["Highway design", "Pavement design", "Traffic engineering", "IRC codes", "Railway track geometry"] },
    ],
  },
  {
    id: "electrical",
    label: "Electrical Engineering",
    icon: "⚡",
    color: "bg-sky-500/10 border-sky-500/20",
    accent: "text-sky-400",
    subjects: [
      { name: "Power Systems", topics: ["Load flow analysis", "Fault analysis", "Protection relays", "HVDC transmission", "Power quality"] },
      { name: "Electrical Machines", topics: ["DC machines", "Induction motors", "Synchronous machines", "Transformers", "Motor starters"] },
      { name: "Control Systems", topics: ["Transfer functions", "Bode plots", "Nyquist criterion", "PID controllers", "State-space analysis"] },
      { name: "Electronics", topics: ["Diodes & rectifiers", "BJT & FET amplifiers", "Op-amps", "Digital logic", "ADC/DAC converters"] },
    ],
  },
  {
    id: "electronics",
    label: "Electronics & Communication",
    icon: "📡",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    subjects: [
      { name: "Signals & Systems", topics: ["Fourier transform", "Laplace transform", "Z-transform", "Sampling theorem", "Convolution"] },
      { name: "Communication", topics: ["AM/FM modulation", "Digital modulation (QAM, PSK)", "Error correction codes", "OFDM", "Spread spectrum"] },
      { name: "VLSI Design", topics: ["CMOS logic design", "Timing analysis", "Power optimization", "HDL (Verilog/VHDL)", "IC fabrication"] },
      { name: "Microprocessors", topics: ["8085/8086 architecture", "Assembly programming", "Interrupts", "Memory interfacing", "ARM basics"] },
    ],
  },
]

const GATE_TIPS = [
  { label: "Focus on Previous Years", desc: "Solve last 10 years' GATE papers. 60–70% questions follow repeating patterns.", icon: "📅" },
  { label: "Strengthen Weak Subjects", desc: "Identify your weak areas from mock tests. Targeted improvement gives maximum gain.", icon: "🎯" },
  { label: "Formula Sheets", desc: "Maintain a running formula sheet per subject. Revise 1 hour before the exam.", icon: "📄" },
  { label: "Numerical Practice", desc: "GATE has many numericals. Practice dimensional analysis and unit checks.", icon: "🔢" },
  { label: "Standard Textbooks", desc: "Refer to standard texts (R.K. Bansal, Timoshenko, etc.) for concept clarity.", icon: "📚" },
  { label: "Time Management", desc: "Spend no more than 3 min on 1-mark questions, 5 min on 2-mark questions.", icon: "⏰" },
]

export default function MechanicalLabPage() {
  const [selectedDomain, setSelectedDomain] = useState(ENGINEERING_DOMAINS[0])
  const [selectedSubject, setSelectedSubject] = useState(ENGINEERING_DOMAINS[0].subjects[0])
  const [aiExplanation, setAiExplanation] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  async function explainTopic(topic: string, domain: string) {
    setAiLoading(true)
    setActiveTopic(topic)
    setAiExplanation("")
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `I'm an engineering student preparing for placements and GATE. Explain "${topic}" in ${domain}. Include: key formulas, common question types, and 1 solved example. Keep it concise and exam-focused.`,
          }],
          mode: "exam",
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let result = ""
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try { result += JSON.parse(data).text ?? "" } catch {}
          }
        }
        setAiExplanation(result)
      }
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-amber-400" />
          Engineering Domain Labs
        </h1>
        <p className="text-zinc-400 mt-1">
          Mechanical, Civil, Electrical, and Electronics — placement and GATE preparation.
        </p>
      </div>

      {/* Domain selector */}
      <div className="flex flex-wrap gap-2">
        {ENGINEERING_DOMAINS.map(domain => (
          <button
            key={domain.id}
            onClick={() => { setSelectedDomain(domain); setSelectedSubject(domain.subjects[0]) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selectedDomain.id === domain.id
                ? `border-indigo-500/50 bg-indigo-500/10 text-indigo-300`
                : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <span>{domain.icon}</span>
            {domain.label}
          </button>
        ))}
      </div>

      <Tabs defaultValue="subjects">
        <TabsList className="mb-6">
          <TabsTrigger value="subjects">Subjects & Topics</TabsTrigger>
          <TabsTrigger value="gate">GATE Tips</TabsTrigger>
          <TabsTrigger value="interview">Interview Questions</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Subject list */}
            <div className="space-y-2">
              {selectedDomain.subjects.map(subject => (
                <button
                  key={subject.name}
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${
                    selectedSubject.name === subject.name
                      ? `${selectedDomain.color} ${selectedDomain.accent}`
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-sm font-medium">{subject.name}</span>
                  <Badge variant="secondary" className="text-xs">{subject.topics.length}</Badge>
                </button>
              ))}
            </div>

            {/* Topics panel */}
            <div className="lg:col-span-2 space-y-4">
              <Card className={`border ${selectedDomain.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-zinc-100">{selectedSubject.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {selectedSubject.topics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => explainTopic(topic, selectedDomain.label)}
                      className={`w-full flex items-center gap-2 text-sm transition-colors text-left group py-1 px-2 rounded hover:bg-zinc-800 ${activeTopic === topic ? "text-indigo-300" : "text-zinc-300"}`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeTopic === topic ? "text-indigo-400" : selectedDomain.accent}`} />
                      <span>{topic}</span>
                      <Zap className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity shrink-0" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* AI Explanation */}
              {(aiLoading || aiExplanation) && (
                <Card className="border-indigo-500/20 bg-indigo-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-indigo-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI Explanation: {activeTopic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {aiLoading && !aiExplanation ? (
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        Generating explanation...
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{aiExplanation}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* GATE Tips */}
        <TabsContent value="gate">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GATE_TIPS.map((tip, i) => (
              <Card key={i} className="border-zinc-800">
                <CardContent className="p-5">
                  <div className="text-2xl mb-3">{tip.icon}</div>
                  <p className="text-sm font-semibold text-zinc-100 mb-1">{tip.label}</p>
                  <p className="text-sm text-zinc-400">{tip.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-zinc-800 mt-6">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Need a study plan?</p>
                <p className="text-xs text-zinc-500">Ask the AI Assistant for a personalized GATE preparation schedule.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.location.href = `/assistant?q=${encodeURIComponent(`Create a 3-month GATE preparation plan for ${selectedDomain.label}`)}`
                }}
              >
                Get Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Q&A */}
        <TabsContent value="interview">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Common placement interview questions for {selectedDomain.label}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {selectedDomain.subjects.flatMap(s =>
                s.topics.slice(0, 2).map(topic => ({
                  q: `Explain ${topic} and its applications in engineering`,
                  subject: s.name,
                }))
              ).map((item, i) => (
                <button
                  key={i}
                  onClick={() => explainTopic(item.q.replace("Explain ", "").replace(" and its applications in engineering", ""), selectedDomain.label)}
                  className="text-left p-4 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{item.q}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                  </div>
                  <Badge variant="secondary" className="text-xs mt-2">{item.subject}</Badge>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
