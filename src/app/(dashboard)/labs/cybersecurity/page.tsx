"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Lock, Globe, Cpu, AlertTriangle, CheckCircle2, Zap, Terminal, ChevronRight } from "lucide-react"

const TOPICS = [
  {
    category: "Network Security",
    icon: "🌐",
    color: "bg-indigo-500/10 border-indigo-500/20",
    accent: "text-indigo-400",
    subtopics: [
      "OSI model & TCP/IP stack",
      "Firewalls, IDS/IPS",
      "VPNs and tunneling protocols",
      "DNS poisoning & MITM attacks",
      "Packet analysis with Wireshark",
      "Network scanning (Nmap)",
    ],
  },
  {
    category: "Web Application Security",
    icon: "🔒",
    color: "bg-rose-500/10 border-rose-500/20",
    accent: "text-rose-400",
    subtopics: [
      "OWASP Top 10",
      "SQL Injection (SQLi)",
      "Cross-Site Scripting (XSS)",
      "CSRF attacks",
      "Authentication & session flaws",
      "SSRF, XXE, IDOR",
    ],
  },
  {
    category: "Cryptography",
    icon: "🔐",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    subtopics: [
      "Symmetric vs asymmetric encryption",
      "AES, RSA, ECC algorithms",
      "Hashing (SHA-256, bcrypt)",
      "Digital signatures & PKI",
      "SSL/TLS handshake",
      "Common crypto attacks",
    ],
  },
  {
    category: "System & OS Security",
    icon: "🖥️",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    subtopics: [
      "Linux privilege escalation",
      "Windows Active Directory attacks",
      "Buffer overflow basics",
      "Malware analysis fundamentals",
      "Log analysis and SIEM",
      "Incident response process",
    ],
  },
]

const CTF_CHALLENGES = [
  {
    id: 1, title: "Caesar Cipher Decode", category: "Cryptography", difficulty: "Easy",
    desc: "Decode this message encrypted with a Caesar cipher: 'KHOOR ZRUOG'. What shift was used?",
    hint: "Try shifts of 3 and 13. 'KHOOR' → shift back by 3 → ?",
    answer: "HELLO WORLD (shift 3)",
  },
  {
    id: 2, title: "Base64 Treasure Hunt", category: "Cryptography", difficulty: "Easy",
    desc: "Decode this Base64 string to find the hidden message: SGVsbG8gZnJvbSBDYXJlZXJWZXJzZSE=",
    hint: "Use an online Base64 decoder or Python: `import base64; base64.b64decode(...)`",
    answer: "Hello from CareerVerse!",
  },
  {
    id: 3, title: "SQL Injection Basics", category: "Web Security", difficulty: "Medium",
    desc: "A login form accepts username/password. What input would bypass authentication if the backend uses: `SELECT * FROM users WHERE user='$input' AND pass='$pass'`?",
    hint: "Think about how SQL string termination and OR conditions work...",
    answer: "Username: `admin'--` (comments out the password check)",
  },
  {
    id: 4, title: "XSS Payload Hunt", category: "Web Security", difficulty: "Medium",
    desc: "A search box reflects your input directly in the page as `<p>You searched for: INPUT</p>`. Write a payload that would show an alert box.",
    hint: "HTML tags can be injected if input is not sanitized.",
    answer: "`<script>alert('XSS')</script>` — outputs a JS alert",
  },
  {
    id: 5, title: "Hash Crack Challenge", category: "Cryptography", difficulty: "Hard",
    desc: "Identify what hash algorithm produced this: `5f4dcc3b5aa765d61d8327deb882cf99`. Then find the plaintext using common password lists.",
    hint: "Check the hash length. 32 hex chars = MD5. What common word hashes to this in MD5?",
    answer: "MD5 hash of 'password'",
  },
  {
    id: 6, title: "Port Scan Analysis", category: "Network Security", difficulty: "Medium",
    desc: "An Nmap scan shows ports 22, 80, 443, 3306 open on a server. What services are likely running and what attack vectors should be investigated first?",
    hint: "Each port maps to a standard service. Which one is database-facing and shouldn't be public?",
    answer: "SSH(22), HTTP(80), HTTPS(443), MySQL(3306). Port 3306 public is a critical misconfiguration.",
  },
]

const INTERVIEW_QA = [
  { q: "What is the difference between authentication and authorization?", a: "Authentication verifies identity (who you are), while authorization determines access rights (what you can do). Authentication happens before authorization." },
  { q: "Explain the CIA triad.", a: "Confidentiality (data accessible only to authorized parties), Integrity (data is accurate and unmodified), Availability (data is accessible when needed). These are the three pillars of information security." },
  { q: "What is a zero-day vulnerability?", a: "A security flaw unknown to the vendor and for which no patch exists. 'Zero-day' means defenders have zero days to prepare once it's exploited." },
  { q: "Describe the difference between symmetric and asymmetric encryption.", a: "Symmetric uses one shared key for encryption/decryption (AES, fast). Asymmetric uses public/private key pairs (RSA, slower but enables secure key exchange). HTTPS uses both: asymmetric for key exchange, then symmetric for data transfer." },
  { q: "What is a penetration test?", a: "A simulated cyberattack on a system with explicit permission to find vulnerabilities before malicious actors do. Phases: Reconnaissance → Scanning → Exploitation → Post-exploitation → Reporting." },
  { q: "How does HTTPS/TLS work?", a: "TLS uses asymmetric cryptography to establish a session key, then encrypts all subsequent communication symmetrically. The server's certificate (signed by a CA) authenticates its identity." },
]

const DIFF_COLOR: Record<string, "success" | "warning" | "destructive"> = {
  Easy: "success", Medium: "warning", Hard: "destructive",
}

export default function CybersecurityLabPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<typeof CTF_CHALLENGES[0] | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [expandedQA, setExpandedQA] = useState<number | null>(null)
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  async function explainTopic(topic: string) {
    setAiLoading(true)
    setAiResponse("")
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Explain "${topic}" for a cybersecurity student/interview. Cover: what it is, how it works, real-world examples, and defense strategies. Keep it concise and technical.` }],
          mode: "technical",
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
        setAiResponse(result)
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
          <Shield className="w-6 h-6 text-rose-400" />
          Cybersecurity Lab
        </h1>
        <p className="text-zinc-400 mt-1">
          Network security, web exploitation, cryptography, and CTF challenges.
        </p>
      </div>

      <Tabs defaultValue="topics">
        <TabsList className="mb-6">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="ctf">CTF Challenges</TabsTrigger>
          <TabsTrigger value="interview">Interview Q&A</TabsTrigger>
        </TabsList>

        {/* Topics */}
        <TabsContent value="topics">
          <div className="grid sm:grid-cols-2 gap-6">
            {TOPICS.map(section => (
              <Card key={section.category} className={`border ${section.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-zinc-100">{section.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {section.subtopics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => explainTopic(topic)}
                      className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors text-left group py-0.5"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${section.accent} shrink-0`} />
                      <span>{topic}</span>
                      <Zap className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity shrink-0" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          {(aiLoading || aiResponse) && (
            <Card className="border-indigo-500/20 bg-indigo-500/5 mt-6">
              <CardContent className="p-5">
                {aiLoading && !aiResponse ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    Generating explanation...
                  </div>
                ) : (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CTF Challenges */}
        <TabsContent value="ctf">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400 mb-3">Select a challenge to attempt</p>
              {CTF_CHALLENGES.map(challenge => (
                <button
                  key={challenge.id}
                  onClick={() => { setSelectedChallenge(challenge); setShowHint(false); setShowAnswer(false) }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
                    selectedChallenge?.id === challenge.id
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{challenge.title}</p>
                    <p className="text-xs text-zinc-500">{challenge.category}</p>
                  </div>
                  <Badge variant={DIFF_COLOR[challenge.difficulty]} className="text-xs shrink-0">{challenge.difficulty}</Badge>
                </button>
              ))}
            </div>

            {selectedChallenge ? (
              <Card className="border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-rose-400" />
                    {selectedChallenge.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={DIFF_COLOR[selectedChallenge.difficulty]} className="text-xs">{selectedChallenge.difficulty}</Badge>
                    <Badge variant="secondary" className="text-xs">{selectedChallenge.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedChallenge.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/30 text-amber-400"
                      onClick={() => setShowHint(h => !h)}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400"
                      onClick={() => setShowAnswer(a => !a)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {showAnswer ? "Hide Answer" : "Reveal Answer"}
                    </Button>
                  </div>
                  {showHint && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-xs text-amber-400 mb-1">Hint</p>
                      <p className="text-sm text-zinc-300">{selectedChallenge.hint}</p>
                    </div>
                  )}
                  {showAnswer && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-xs text-emerald-400 mb-1">Answer</p>
                      <p className="text-sm text-zinc-300 font-mono">{selectedChallenge.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-zinc-800">
                <div className="text-center">
                  <ChevronRight className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Select a challenge to begin</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Interview Q&A */}
        <TabsContent value="interview">
          <div className="space-y-3">
            {INTERVIEW_QA.map((item, i) => (
              <Card key={i} className="border-zinc-800">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-5 flex items-start justify-between gap-3"
                    onClick={() => setExpandedQA(expandedQA === i ? null : i)}
                  >
                    <div className="flex items-start gap-3">
                      <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-zinc-200">{item.q}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform ${expandedQA === i ? "rotate-90" : ""}`} />
                  </button>
                  {expandedQA === i && (
                    <div className="px-5 pb-5 ml-7">
                      <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                        <p className="text-sm text-zinc-300 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
