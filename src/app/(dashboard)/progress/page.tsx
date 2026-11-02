import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  TrendingUp, BarChart3, Mic2, Flame, Target, Trophy,
  Clock, Calendar, BookOpen, ArrowRight, CheckCircle2
} from "lucide-react"

export default async function ProgressPage() {
  await connection()
  const session = await auth()
  const userId = session?.user?.id as string

  const [profile, aptitudeTests, interviews, progressRecords] = await Promise.all([
    db.userProfile.findUnique({ where: { userId } }),
    db.aptitudeTest.findMany({ where: { userId }, orderBy: { completedAt: "desc" } }),
    db.interview.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.userProgress.findMany({ where: { userId }, orderBy: { recordedAt: "desc" } }),
  ])

  const totalActivities = aptitudeTests.length + interviews.length

  const avgAptitude = aptitudeTests.length
    ? aptitudeTests.reduce((a, t) => a + t.score, 0) / aptitudeTests.length
    : 0

  const completedInterviews = interviews.filter(i => i.overallScore)
  const avgInterview = completedInterviews.length
    ? completedInterviews.reduce((a, i) => a + (i.overallScore ?? 0), 0) / completedInterviews.length
    : 0

  const bestAptitude = aptitudeTests.length ? Math.max(...aptitudeTests.map(t => t.score)) : 0
  const bestInterview = completedInterviews.length
    ? Math.max(...completedInterviews.map(i => Math.round(i.overallScore!)))
    : 0

  // Group aptitude by category
  const aptitudeByCategory = aptitudeTests.reduce<Record<string, { total: number; count: number }>>((acc, t) => {
    const cat = t.category
    if (!acc[cat]) acc[cat] = { total: 0, count: 0 }
    acc[cat].total += t.score
    acc[cat].count += 1
    return acc
  }, {})

  // Group interviews by type
  const interviewByType = interviews.reduce<Record<string, { total: number; count: number }>>((acc, i) => {
    const type = i.type
    if (!acc[type]) acc[type] = { total: 0, count: 0 }
    acc[type].total += i.overallScore ?? 0
    acc[type].count += 1
    return acc
  }, {})

  // Weekly activity (last 7 days)
  const now = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const weeklyActivity = weekDays.map(day => {
    const dayStr = day.toDateString()
    const tests = aptitudeTests.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === dayStr).length
    const ivs = interviews.filter(i => new Date(i.createdAt).toDateString() === dayStr).length
    return { day: day.toLocaleDateString("en", { weekday: "short" }), count: tests + ivs }
  })

  const maxActivity = Math.max(...weeklyActivity.map(d => d.count), 1)

  const SKILL_AREAS = [
    { label: "Quantitative Aptitude", score: Math.round(aptitudeByCategory["quantitative"]?.total / (aptitudeByCategory["quantitative"]?.count || 1) || 0), color: "bg-indigo-500", tests: aptitudeByCategory["quantitative"]?.count || 0, href: "/aptitude" },
    { label: "Logical Reasoning", score: Math.round(aptitudeByCategory["logical"]?.total / (aptitudeByCategory["logical"]?.count || 1) || 0), color: "bg-violet-500", tests: aptitudeByCategory["logical"]?.count || 0, href: "/aptitude" },
    { label: "Verbal Ability", score: Math.round(aptitudeByCategory["verbal"]?.total / (aptitudeByCategory["verbal"]?.count || 1) || 0), color: "bg-emerald-500", tests: aptitudeByCategory["verbal"]?.count || 0, href: "/aptitude" },
    { label: "HR Interview", score: Math.round(interviewByType["hr"]?.total / (interviewByType["hr"]?.count || 1) || 0), color: "bg-amber-500", tests: interviewByType["hr"]?.count || 0, href: "/interview" },
    { label: "Technical Interview", score: Math.round(interviewByType["technical"]?.total / (interviewByType["technical"]?.count || 1) || 0), color: "bg-sky-500", tests: interviewByType["technical"]?.count || 0, href: "/interview" },
    { label: "Behavioral Interview", score: Math.round(interviewByType["behavioral"]?.total / (interviewByType["behavioral"]?.count || 1) || 0), color: "bg-rose-500", tests: interviewByType["behavioral"]?.count || 0, href: "/interview" },
  ]

  const userDomains: string[] = Array.isArray(profile?.domains) ? (profile.domains as string[]) : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            My Progress
          </h1>
          <p className="text-zinc-400 mt-1">
            Track your preparation across aptitude, interviews, and domain knowledge.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Activities", value: totalActivities, icon: Target, color: "text-indigo-400", bg: "bg-indigo-500/10", desc: "Tests + Interviews" },
          { label: "Avg Aptitude", value: `${Math.round(avgAptitude)}%`, icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10", desc: `${aptitudeTests.length} tests taken` },
          { label: "Avg Interview", value: `${Math.round(avgInterview)}%`, icon: Mic2, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: `${completedInterviews.length} completed` },
          { label: "Best Score", value: `${Math.max(bestAptitude, bestInterview)}%`, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10", desc: "All-time high" },
        ].map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="border-zinc-800">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <div className="text-3xl font-bold text-zinc-100">{card.value}</div>
                <div className="text-sm font-medium text-zinc-300 mt-0.5">{card.label}</div>
                <div className="text-xs text-zinc-500 mt-1">{card.desc}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Skill Area Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {SKILL_AREAS.map(area => (
                <div key={area.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={area.href} className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
                        {area.label}
                      </Link>
                      <Badge variant="secondary" className="text-xs">{area.tests} {area.tests === 1 ? "session" : "sessions"}</Badge>
                    </div>
                    <span className={`text-sm font-bold ${area.score >= 70 ? "text-emerald-400" : area.score >= 50 ? "text-amber-400" : area.score > 0 ? "text-rose-400" : "text-zinc-600"}`}>
                      {area.score > 0 ? `${area.score}%` : "—"}
                    </span>
                  </div>
                  <Progress
                    value={area.score}
                    className="h-2"
                    indicatorClassName={area.color}
                  />
                </div>
              ))}
              {SKILL_AREAS.every(a => a.score === 0) && (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Complete tests and interviews to see your breakdown here.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Weekly activity */}
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Weekly Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-24">
                {weeklyActivity.map(day => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t bg-indigo-500/30 hover:bg-indigo-500/50 transition-colors min-h-[4px]"
                      style={{ height: `${(day.count / maxActivity) * 80}px` }}
                    />
                    <span className="text-xs text-zinc-600">{day.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-3 text-center">
                {weeklyActivity.reduce((a, d) => a + d.count, 0)} activities this week
              </p>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {totalActivities === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No activity yet. Start with an aptitude test!</p>
                  <Link href="/aptitude">
                    <Button size="sm" variant="outline" className="mt-3">Start Preparation</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    ...aptitudeTests.slice(0, 4).map(t => ({
                      type: "aptitude" as const,
                      label: `${t.subcategory ?? t.category} Test`,
                      sub: `${t.correct}/${t.totalQuestions} correct · ${Math.round(t.timeTaken / 60)}min`,
                      score: Math.round(t.score),
                      date: t.completedAt,
                    })),
                    ...interviews.slice(0, 4).map(i => ({
                      type: "interview" as const,
                      label: `${i.type} Interview`,
                      sub: i.domain ?? "General",
                      score: i.overallScore ? Math.round(i.overallScore) : null,
                      date: i.createdAt,
                    })),
                  ]
                    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
                    .slice(0, 8)
                    .map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.type === "aptitude" ? "bg-indigo-500/10" : "bg-violet-500/10"}`}>
                            {item.type === "aptitude"
                              ? <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                              : <Mic2 className="w-3.5 h-3.5 text-violet-400" />}
                          </div>
                          <div>
                            <p className="text-sm text-zinc-200 capitalize">{item.label}</p>
                            <p className="text-xs text-zinc-500">{item.sub}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.score !== null && item.score !== undefined ? (
                            <Badge variant={item.score >= 70 ? "success" : item.score >= 50 ? "warning" : "destructive"}>
                              {item.score}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary">pending</Badge>
                          )}
                          <span className="text-xs text-zinc-600">
                            {item.date ? new Date(item.date).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Goals */}
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Your Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {userDomains.length > 0 ? (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1.5">Target Domains</p>
                    <div className="flex flex-wrap gap-1.5">
                      {userDomains.slice(0, 4).map((d: string) => (
                        <Badge key={d} variant="secondary" className="text-xs capitalize">{d}</Badge>
                      ))}
                    </div>
                  </div>
                  {profile?.targetRoles && profile.targetRoles.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Target Role</p>
                      <p className="text-sm text-zinc-300">{profile.targetRoles[0]}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500">No goals set yet.</p>
                  <Link href="/onboarding">
                    <Button size="sm" variant="outline" className="mt-2 text-xs">Complete Setup</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { label: "First test taken", achieved: aptitudeTests.length > 0 },
                { label: "First interview", achieved: interviews.length > 0 },
                { label: "Score above 70%", achieved: aptitudeTests.some(t => t.score >= 70) || completedInterviews.some(i => (i.overallScore ?? 0) >= 70) },
                { label: "5 tests completed", achieved: aptitudeTests.length >= 5 },
                { label: "Profile completed", achieved: !!profile?.onboardingComplete },
              ].map(milestone => (
                <div key={milestone.label} className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${milestone.achieved ? "text-emerald-400" : "text-zinc-700"}`} />
                  <span className={`text-sm ${milestone.achieved ? "text-zinc-200" : "text-zinc-600"}`}>
                    {milestone.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next steps */}
          <Card className="border-zinc-800 bg-gradient-to-b from-indigo-600/5 to-violet-600/5">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-zinc-100 mb-3">Recommended Next</p>
              {aptitudeTests.length === 0 ? (
                <Link href="/aptitude/test?category=quantitative&difficulty=beginner">
                  <div className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>Take your first aptitude test</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </div>
                </Link>
              ) : interviews.length === 0 ? (
                <Link href="/interview/session?type=hr&mode=text">
                  <div className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    <Mic2 className="w-4 h-4" />
                    <span>Try your first mock interview</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </div>
                </Link>
              ) : (
                <Link href="/aptitude/test?category=mixed&difficulty=intermediate">
                  <div className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Flame className="w-4 h-4" />
                    <span>Keep up your streak!</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
