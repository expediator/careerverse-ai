
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Clock, Target, TrendingUp, BookOpen, Zap, ChevronRight } from "lucide-react"
import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

const APTITUDE_CATEGORIES = [
  {
    id: "quantitative",
    label: "Quantitative Aptitude",
    icon: "🔢",
    color: "bg-indigo-500/10 border-indigo-500/20",
    accent: "text-indigo-400",
    topics: [
      "Number Systems", "Percentages", "Profit & Loss", "Simple Interest",
      "Compound Interest", "Time & Work", "Time Speed Distance", "Ratio & Proportion",
      "Averages", "Probability", "Permutations & Combinations", "Algebra",
      "Geometry", "Mensuration", "Data Interpretation"
    ]
  },
  {
    id: "logical",
    label: "Logical Reasoning",
    icon: "🧠",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    topics: [
      "Number Series", "Coding-Decoding", "Blood Relations", "Directions",
      "Seating Arrangements", "Puzzles", "Syllogisms", "Logical Deductions",
      "Pattern Recognition", "Statement & Conclusions"
    ]
  },
  {
    id: "verbal",
    label: "Verbal Ability",
    icon: "📝",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    topics: [
      "Grammar", "Vocabulary", "Reading Comprehension", "Sentence Correction",
      "Para Jumbles", "Verbal Reasoning", "Synonyms & Antonyms", "Fill in the Blanks"
    ]
  },
]

const COMPANIES = [
  { name: "TCS", tests: 12 },
  { name: "Infosys", tests: 10 },
  { name: "Wipro", tests: 8 },
  { name: "Accenture", tests: 9 },
  { name: "Cognizant", tests: 7 },
  { name: "HCL", tests: 6 },
  { name: "Capgemini", tests: 8 },
  { name: "Tech Mahindra", tests: 6 },
]

export default async function AptitudePage() {
  await connection()
  const session = await auth()
  const userId = session?.user?.id as string

  const recentTests = await db.aptitudeTest.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 5,
  })

  const totalTests = recentTests.length
  const avgScore = totalTests
    ? Math.round(recentTests.reduce((a, t) => a + t.score, 0) / totalTests)
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Aptitude Preparation
          </h1>
          <p className="text-zinc-400 mt-1">
            Master Quantitative, Logical, and Verbal skills for any placement test.
          </p>
        </div>
        <Link href="/aptitude/test?category=mixed&difficulty=intermediate">
          <Button className="hidden sm:flex">
            <Zap className="w-4 h-4" />
            Quick Test
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tests Taken", value: totalTests, icon: Target, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Topics Covered", value: 0, icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Best Score", value: `${recentTests.length ? Math.max(...recentTests.map(t => Math.round(t.score))) : 0}%`, icon: BarChart3, color: "text-amber-400", bg: "bg-amber-500/10" },
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

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100">Practice by Category</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {APTITUDE_CATEGORIES.map(cat => (
            <Card key={cat.id} className={`border ${cat.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-zinc-100">{cat.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {cat.topics.slice(0, 6).map(topic => (
                    <Link
                      key={topic}
                      href={`/aptitude/practice?category=${cat.id}&topic=${encodeURIComponent(topic)}`}
                    >
                      <Badge variant="secondary" className="cursor-pointer hover:bg-zinc-700 text-xs">
                        {topic}
                      </Badge>
                    </Link>
                  ))}
                  {cat.topics.length > 6 && (
                    <Badge variant="outline" className="text-xs text-zinc-500">
                      +{cat.topics.length - 6} more
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                  {(["Beginner", "Intermediate", "Advanced"] as const).map(level => (
                    <Link
                      key={level}
                      href={`/aptitude/test?category=${cat.id}&difficulty=${level.toLowerCase()}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full text-xs ${level === "Beginner" ? "border-emerald-500/30 text-emerald-400" : level === "Intermediate" ? "border-amber-500/30 text-amber-400" : "border-rose-500/30 text-rose-400"}`}
                      >
                        {level}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company-specific tests */}
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Company-Specific Mock Tests</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {COMPANIES.map(company => (
                <Link
                  key={company.name}
                  href={`/aptitude/test?company=${encodeURIComponent(company.name)}`}
                >
                  <div className="card-hover flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
                    <span className="text-sm font-medium text-zinc-200">{company.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-500">{company.tests} tests</span>
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent tests */}
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Recent Test History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTests.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No tests taken yet</p>
                <Link href="/aptitude/test?category=quantitative&difficulty=beginner">
                  <Button size="sm" variant="outline" className="mt-3">Take your first test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTests.map(test => (
                  <div key={test.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-200 capitalize">
                        {test.subcategory ?? test.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{test.difficulty}</Badge>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(test.timeTaken / 60)}min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${test.score >= 70 ? "text-emerald-400" : test.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                        {Math.round(test.score)}%
                      </div>
                      <div className="text-xs text-zinc-500">{test.correct}/{test.totalQuestions}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
