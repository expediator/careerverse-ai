
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mic2, Video, MessageSquare, Star, Clock, ChevronRight, Brain, Code2, Users } from "lucide-react"
import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

const INTERVIEW_TYPES = [
  {
    id: "hr",
    title: "HR Interview",
    icon: Users,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    desc: "Behavioral, situational, and personality-based questions",
    topics: ["Tell me about yourself", "Strengths & Weaknesses", "Career Goals", "Teamwork", "Leadership", "Conflict Resolution"],
    duration: "15-30 min",
    difficulty: "Variable",
  },
  {
    id: "technical",
    title: "Technical Interview",
    icon: Code2,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    desc: "Domain-specific technical questions with follow-ups",
    topics: ["Data Structures", "Algorithms", "System Design", "OOP", "Database", "Domain Skills"],
    duration: "30-45 min",
    difficulty: "Moderate-Hard",
  },
  {
    id: "behavioral",
    title: "Behavioral Interview",
    icon: Brain,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    desc: "STAR method practice with situational questions",
    topics: ["Problem Solving", "Initiative", "Adaptability", "Communication", "Decision Making"],
    duration: "20-30 min",
    difficulty: "Easy-Moderate",
  },
  {
    id: "case",
    title: "Case Study Interview",
    icon: MessageSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    desc: "Business case analysis and problem-solving",
    topics: ["Market Sizing", "Profitability", "Business Strategy", "Product Launch", "Operations"],
    duration: "30-45 min",
    difficulty: "Hard",
  },
]

const DOMAIN_INTERVIEWS = [
  { id: "cs", label: "Computer Science", icon: "💻" },
  { id: "data-science", label: "Data Science", icon: "📊" },
  { id: "mechanical", label: "Mechanical Eng.", icon: "⚙️" },
  { id: "civil", label: "Civil Eng.", icon: "🏗️" },
  { id: "electrical", label: "Electrical Eng.", icon: "⚡" },
  { id: "electronics", label: "Electronics", icon: "📡" },
  { id: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
  { id: "business", label: "Business/MBA", icon: "💼" },
  { id: "finance", label: "Finance", icon: "📈" },
  { id: "marketing", label: "Marketing", icon: "📣" },
  { id: "design", label: "UI/UX Design", icon: "🎨" },
  { id: "product", label: "Product Mgmt.", icon: "🚀" },
]

export default async function InterviewPage() {
  await connection()
  const session = await auth()
  const userId = session?.user?.id as string

  const interviews = await db.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  })

  const avgScore = interviews.filter(i => i.overallScore).length
    ? Math.round(interviews.reduce((a, i) => a + (i.overallScore ?? 0), 0) / interviews.filter(i => i.overallScore).length)
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Mic2 className="w-6 h-6 text-violet-400" />
            AI Interview Room
          </h1>
          <p className="text-zinc-400 mt-1">
            Practice with a realistic AI interviewer. Text, voice, or video mode available.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Interviews Done", value: interviews.length, icon: Mic2, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Avg Score", value: `${avgScore}%`, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Best Score", value: `${interviews.filter(i => i.overallScore).length ? Math.max(...interviews.filter(i => i.overallScore).map(i => Math.round(i.overallScore!))) : 0}%`, icon: Star, color: "text-emerald-400", bg: "bg-emerald-500/10" },
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

      {/* Interview Types */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Choose Interview Type</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {INTERVIEW_TYPES.map(type => {
            const Icon = type.icon
            return (
              <Card key={type.id} className={`border ${type.bg} card-hover`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${type.bg}`}>
                      <Icon className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />{type.duration}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-zinc-100 mb-1">{type.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{type.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {type.topics.slice(0, 3).map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                    {type.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs text-zinc-500">+{type.topics.length - 3}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/interview/session?type=${type.id}&mode=text`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Text
                      </Button>
                    </Link>
                    <Link href={`/interview/session?type=${type.id}&mode=voice`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Mic2 className="w-3.5 h-3.5" />
                        Voice
                      </Button>
                    </Link>
                    <Link href={`/interview/session?type=${type.id}&mode=video`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Video className="w-3.5 h-3.5" />
                        Video
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Domain interviews */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Domain-Specific Technical Interviews</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {DOMAIN_INTERVIEWS.map(domain => (
            <Link key={domain.id} href={`/interview/session?type=technical&domain=${domain.id}&mode=text`}>
              <div className="card-hover flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <span className="text-xl">{domain.icon}</span>
                <span className="text-sm font-medium text-zinc-200">{domain.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent interviews */}
      {interviews.length > 0 && (
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Interview History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {interviews.map(interview => (
                <div key={interview.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-200 capitalize">{interview.type} Interview</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{interview.domain ?? "General"}</Badge>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {interview.duration ? `${Math.round(interview.duration / 60)}min` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {interview.overallScore ? (
                      <Badge variant={interview.overallScore >= 70 ? "success" : "warning"}>
                        {Math.round(interview.overallScore)}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{interview.status}</Badge>
                    )}
                    {interview.status === "completed" && (
                      <Link href={`/interview/review/${interview.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">Review</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
