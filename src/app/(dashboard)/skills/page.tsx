import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Gauge, ArrowRight, Trophy, Target, TrendingUp, Star, ChevronRight, Zap, BookOpen, Layers } from "lucide-react"
import { LEVEL_BADGE_MAP } from "@/lib/skill-levels"

const DOMAINS = [
  { id: "dsa",           label: "DSA",              icon: "🌲", full: "Data Structures & Algorithms", color: "bg-indigo-500/10 border-indigo-500/20", accent: "text-indigo-400", desc: "Arrays, Trees, Graphs, DP, Sorting" },
  { id: "web",           label: "Web Dev",           icon: "🌐", full: "Web Development",              color: "bg-sky-500/10 border-sky-500/20",    accent: "text-sky-400",    desc: "HTML/CSS/JS, React, REST APIs" },
  { id: "database",      label: "Databases",         icon: "🗄️", full: "SQL & Databases",              color: "bg-amber-500/10 border-amber-500/20", accent: "text-amber-400",  desc: "SQL, Normalization, Indexing, NoSQL" },
  { id: "python",        label: "Python",            icon: "🐍", full: "Python Programming",            color: "bg-emerald-500/10 border-emerald-500/20", accent: "text-emerald-400", desc: "OOP, Decorators, Libraries, Idiomatic code" },
  { id: "system-design", label: "System Design",     icon: "🏗️", full: "System Design",                color: "bg-violet-500/10 border-violet-500/20", accent: "text-violet-400", desc: "Scalability, CAP, Load Balancing, Caching" },
  { id: "data-science",  label: "Data Science",      icon: "📊", full: "Data Science & ML",             color: "bg-pink-500/10 border-pink-500/20",   accent: "text-pink-400",   desc: "ML, Statistics, Pandas, Evaluation" },
  { id: "cybersecurity", label: "Cybersecurity",     icon: "🔒", full: "Cybersecurity",                 color: "bg-rose-500/10 border-rose-500/20",   accent: "text-rose-400",   desc: "Networking, OWASP, Auth, Encryption" },
  { id: "os",            label: "OS & Networks",     icon: "⚙️", full: "OS & Networking",               color: "bg-zinc-500/10 border-zinc-500/20",   accent: "text-zinc-400",   desc: "Processes, Memory, TCP/IP, Scheduling" },
]

// Badge classes from shared skill-levels lib (covers all 8 levels)
const LEVEL_COLORS = LEVEL_BADGE_MAP

export default async function SkillsPage() {
  await connection()
  const session = await auth()
  const userId = session?.user?.id as string

  const skillData = userId ? await db.userProgress.findMany({
    where: { userId, module: "skills" },
    orderBy: { recordedAt: "desc" },
  }) : []

  // Latest result per domain
  const latestByDomain: Record<string, typeof skillData[0]> = {}
  for (const record of skillData) {
    if (record.subModule && !latestByDomain[record.subModule]) {
      latestByDomain[record.subModule] = record
    }
  }

  const assessedCount = Object.keys(latestByDomain).length
  const avgScore = assessedCount > 0
    ? Math.round(Object.values(latestByDomain).reduce((s, r) => s + r.score, 0) / assessedCount)
    : 0

  const details = (r: typeof skillData[0]) => r.details as Record<string, unknown> | null

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-indigo-400" />
            Skill Assessment
          </h1>
          <p className="text-zinc-400 mt-1">
            Find out exactly where you stand — 8 skill levels, quiz + theory + practical questions per domain.
          </p>
        </div>
        <div className="hidden sm:flex gap-2 shrink-0">
          <Link href="/skills/levels">
            <Button variant="outline" className="gap-2">
              <Layers className="w-4 h-4" />
              Level Guide
            </Button>
          </Link>
          <Link href="/skills/assess?domain=dsa">
            <Button className="gap-2">
              <Zap className="w-4 h-4" />
              Quick Check
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Domains Assessed", value: assessedCount, icon: Target, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Avg Score", value: assessedCount > 0 ? `${avgScore}%` : "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Domains Available", value: 8, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Best Score", value: assessedCount > 0 ? `${Math.round(Math.max(...Object.values(latestByDomain).map(r => r.score)))}%` : "—", icon: Trophy, color: "text-violet-400", bg: "bg-violet-500/10" },
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

      {/* Domain grid */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Choose a Domain</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOMAINS.map(domain => {
            const result = latestByDomain[domain.id]
            const level = result ? (details(result)?.level as string) : null
            const score = result ? Math.round(result.score) : null

            return (
              <Card key={domain.id} className={`border ${domain.color} hover:border-opacity-60 transition-all group`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{domain.icon}</span>
                    {level && (
                      <Badge className={`text-xs border ${LEVEL_COLORS[level] ?? ""}`}>
                        {level}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-zinc-100 text-sm mb-1">{domain.full}</h3>
                  <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{domain.desc}</p>

                  {score !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">Last score</span>
                        <span className={`font-semibold ${score >= 76 ? "text-emerald-400" : score >= 51 ? "text-amber-400" : "text-rose-400"}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${score >= 76 ? "bg-emerald-500" : score >= 51 ? "bg-amber-500" : "bg-rose-500"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/skills/learn/${domain.id}`} className="flex-shrink-0">
                      <Button size="sm" variant="ghost" className="gap-1 text-zinc-500 hover:text-zinc-300 px-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        Learn
                      </Button>
                    </Link>
                    <Link href={`/skills/assess?domain=${domain.id}`} className="flex-1">
                      <Button size="sm" variant={result ? "outline" : "default"} className="w-full gap-1.5 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                        {result ? "Retake" : "Assess"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent results */}
      {skillData.length > 0 && (
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {skillData.slice(0, 8).map(record => {
                const d = details(record)
                const domainInfo = DOMAINS.find(x => x.id === record.subModule)
                const lvl = d?.level as string
                return (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{domainInfo?.icon ?? "📌"}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{domainInfo?.full ?? record.subModule}</p>
                        <p className="text-xs text-zinc-500">{new Date(record.recordedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lvl && <Badge className={`text-xs border ${LEVEL_COLORS[lvl] ?? ""}`}>{lvl}</Badge>}
                      <span className={`font-bold text-sm ${record.score >= 76 ? "text-emerald-400" : record.score >= 51 ? "text-amber-400" : "text-rose-400"}`}>
                        {Math.round(record.score)}%
                      </span>
                      <Link href={`/skills/assess?domain=${record.subModule}`}>
                        <Button size="sm" variant="ghost" className="text-xs text-zinc-500">Retry <ArrowRight className="w-3 h-3 ml-1" /></Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
