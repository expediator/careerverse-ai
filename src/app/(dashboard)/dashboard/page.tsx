import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BarChart3, Mic2, Code2, Brain, TrendingUp, Target, Flame,
  ArrowRight, CheckCircle2, Clock, Zap, Trophy, BookOpen
} from "lucide-react"

async function getDashboardData(userId: string) {
  const [profile, recentTests, recentInterviews, progress] = await Promise.all([
    db.userProfile.findUnique({ where: { userId } }),
    db.aptitudeTest.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    db.interview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.userProgress.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    }),
  ])

  const avgAptitude = recentTests.length
    ? recentTests.reduce((a: number, t: { score: number }) => a + t.score, 0) / recentTests.length
    : 0

  const withScore = recentInterviews.filter((i: { overallScore: number | null }) => i.overallScore)
  const avgInterview = withScore.length
    ? recentInterviews.reduce((a: number, i: { overallScore: number | null }) => a + (i.overallScore ?? 0), 0) / withScore.length
    : 0

  const overallScore = Math.round(
    (avgAptitude + avgInterview + (profile?.onboardingComplete ? 20 : 0)) / 3
  )

  return { profile, recentTests, recentInterviews, progress, overallScore, avgAptitude, avgInterview }
}

export default async function DashboardPage() {
  await connection()
  const session = await auth()
  const userId = session?.user?.id as string

  const { profile, recentTests, recentInterviews, overallScore, avgAptitude, avgInterview } =
    await getDashboardData(userId)

  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  const isNew = !profile?.onboardingComplete

  const SCORE_CARDS = [
    {
      label: "Overall Readiness",
      value: overallScore,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      desc: "Combined preparation score",
    },
    {
      label: "Aptitude Score",
      value: Math.round(avgAptitude),
      icon: BarChart3,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      desc: `From ${recentTests.length} tests taken`,
    },
    {
      label: "Interview Score",
      value: Math.round(avgInterview),
      icon: Mic2,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      desc: `From ${recentInterviews.length} mock interviews`,
    },
    {
      label: "Practice Streak",
      value: 0,
      icon: Flame,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      desc: "Days in a row",
      suffix: "d",
    },
  ]

  const QUICK_ACTIONS = [
    { href: "/aptitude", icon: BarChart3, label: "Start Aptitude Test", color: "text-indigo-400", bg: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20" },
    { href: "/interview", icon: Mic2, label: "Mock Interview", color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20" },
    { href: "/labs/cs", icon: Code2, label: "Coding Practice", color: "text-sky-400", bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20" },
    { href: "/assistant", icon: Zap, label: "Ask AI Assistant", color: "text-emerald-400", bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20" },
    { href: "/resume", icon: BookOpen, label: "Analyze Resume", color: "text-amber-400", bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20" },
    { href: "/personality", icon: Brain, label: "Communication Coach", color: "text-rose-400", bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20" },
  ]

  const PREP_AREAS = [
    { label: "Aptitude", score: Math.round(avgAptitude), color: "bg-indigo-500", href: "/aptitude" },
    { label: "Technical Interview", score: Math.round(avgInterview * 0.8), color: "bg-violet-500", href: "/interview" },
    { label: "HR Interview", score: Math.round(avgInterview * 0.9), color: "bg-emerald-500", href: "/interview?type=hr" },
    { label: "Communication", score: 0, color: "bg-amber-500", href: "/personality" },
    { label: "Coding Skills", score: 0, color: "bg-sky-500", href: "/labs/cs" },
    { label: "Domain Knowledge", score: 0, color: "bg-rose-500", href: "/labs" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Good day, {userName} 👋
          </h1>
          <p className="text-zinc-400 mt-1">
            {isNew
              ? "Complete your profile to get a personalized preparation roadmap."
              : "Here's your preparation overview. Keep up the momentum!"}
          </p>
        </div>
        {profile?.onboardingComplete && (
          <Badge variant="success" className="hidden sm:flex">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Profile Complete
          </Badge>
        )}
      </div>

      {/* Onboarding nudge */}
      {isNew && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">Complete your profile for a personalized roadmap</p>
              <p className="text-sm text-zinc-400">Takes 3 minutes. Get AI-curated preparation based on your goals.</p>
            </div>
          </div>
          <Link href="/onboarding">
            <Button size="sm">
              Complete Setup <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SCORE_CARDS.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="border-zinc-800">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <div className="text-3xl font-bold text-zinc-100">
                  {card.value}{card.suffix ?? "%"}
                </div>
                <div className="text-sm font-medium text-zinc-300 mt-0.5">{card.label}</div>
                <div className="text-xs text-zinc-500 mt-1">{card.desc}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-zinc-100">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <div className={`card-hover flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${action.bg}`}>
                    <Icon className={`w-5 h-5 ${action.color} shrink-0`} />
                    <span className="text-sm font-medium text-zinc-200">{action.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Recent activity */}
          <div className="mt-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-4">Preparation Areas</h2>
            <Card className="border-zinc-800">
              <CardContent className="p-5 space-y-4">
                {PREP_AREAS.map(area => (
                  <Link key={area.label} href={area.href}>
                    <div className="flex items-center gap-3 group">
                      <div className="w-28 text-sm text-zinc-400 shrink-0 group-hover:text-zinc-200 transition-colors">
                        {area.label}
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={area.score}
                          className="h-2"
                          indicatorClassName={area.color}
                        />
                      </div>
                      <div className="w-10 text-right text-sm font-medium text-zinc-400">
                        {area.score}%
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Recent interviews */}
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Recent Interviews
                <Link href="/interview" className="text-xs text-indigo-400 font-normal">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentInterviews.length === 0 ? (
                <div className="text-center py-6">
                  <Mic2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No interviews yet</p>
                  <Link href="/interview">
                    <Button size="sm" variant="outline" className="mt-3 text-xs">
                      Start Interview
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentInterviews.slice(0, 4).map(interview => (
                    <div key={interview.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm text-zinc-300 capitalize">{interview.type}</p>
                        <p className="text-xs text-zinc-500">{interview.domain ?? "General"}</p>
                      </div>
                      <div className="text-right">
                        {interview.overallScore ? (
                          <Badge variant={interview.overallScore >= 70 ? "success" : "warning"}>
                            {Math.round(interview.overallScore)}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{interview.status}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent tests */}
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Recent Tests
                <Link href="/aptitude" className="text-xs text-indigo-400 font-normal">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentTests.length === 0 ? (
                <div className="text-center py-6">
                  <BarChart3 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No tests yet</p>
                  <Link href="/aptitude">
                    <Button size="sm" variant="outline" className="mt-3 text-xs">
                      Start Test
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTests.slice(0, 4).map(test => (
                    <div key={test.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm text-zinc-300 capitalize">{test.subcategory ?? test.category}</p>
                        <p className="text-xs text-zinc-500">{test.correct}/{test.totalQuestions} correct</p>
                      </div>
                      <Badge variant={test.score >= 70 ? "success" : test.score >= 50 ? "warning" : "destructive"}>
                        {Math.round(test.score)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Tips */}
          <Card className="border-zinc-800 bg-gradient-to-b from-indigo-600/5 to-violet-600/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-zinc-100">AI Tip of the Day</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Focus on your weakest aptitude topics first. Consistent 30-minute daily practice beats marathon sessions.
                Start with Number Systems if you&apos;re new.
              </p>
              <Link href="/assistant">
                <Button size="sm" variant="outline" className="mt-3 text-xs w-full">
                  Ask AI for personalized tips
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
