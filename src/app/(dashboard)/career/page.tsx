import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Briefcase, Code2, TrendingUp, ArrowRight, CheckCircle2,
  Star, Users, DollarSign, BookOpen, Target, Zap
} from "lucide-react"

const CAREER_PATHS = [
  {
    id: "swe",
    title: "Software Engineer",
    domain: "Computer Science",
    icon: "💻",
    color: "bg-indigo-500/10 border-indigo-500/20",
    accent: "text-indigo-400",
    salaryRange: "₹6–30 LPA",
    avgPackage: "₹12 LPA",
    demand: "Very High",
    topCompanies: ["Google", "Microsoft", "Amazon", "Flipkart", "Paytm"],
    coreSkills: ["DSA", "System Design", "OOP", "Git", "SQL"],
    prepPath: [
      { label: "Master DSA (LeetCode 150)", href: "/labs/cs" },
      { label: "Learn System Design basics", href: "/assistant" },
      { label: "Practice technical interviews", href: "/interview/session?type=technical&domain=cs&mode=text" },
    ],
  },
  {
    id: "data",
    title: "Data Scientist / Analyst",
    domain: "Data Science",
    icon: "📊",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    salaryRange: "₹5–25 LPA",
    avgPackage: "₹10 LPA",
    demand: "High",
    topCompanies: ["Amazon", "Walmart", "Mu Sigma", "Fractal", "Tiger Analytics"],
    coreSkills: ["Python", "SQL", "ML", "Statistics", "Tableau"],
    prepPath: [
      { label: "Python & Pandas practice", href: "/labs/data-science" },
      { label: "Statistics fundamentals", href: "/assistant" },
      { label: "Data Science interview prep", href: "/interview/session?type=technical&domain=data-science&mode=text" },
    ],
  },
  {
    id: "cyber",
    title: "Cybersecurity Analyst",
    domain: "Cybersecurity",
    icon: "🔒",
    color: "bg-rose-500/10 border-rose-500/20",
    accent: "text-rose-400",
    salaryRange: "₹5–20 LPA",
    avgPackage: "₹9 LPA",
    demand: "High",
    topCompanies: ["Infosys", "TCS", "Wipro", "HCL", "IBM Security"],
    coreSkills: ["Networking", "Ethical Hacking", "SIEM", "Linux", "Python"],
    prepPath: [
      { label: "Network security basics", href: "/labs/cybersecurity" },
      { label: "Ethical hacking CTF", href: "/labs/cybersecurity" },
      { label: "Security interview prep", href: "/interview/session?type=technical&domain=cybersecurity&mode=text" },
    ],
  },
  {
    id: "mech",
    title: "Mechanical Engineer",
    domain: "Mechanical",
    icon: "⚙️",
    color: "bg-amber-500/10 border-amber-500/20",
    accent: "text-amber-400",
    salaryRange: "₹3–15 LPA",
    avgPackage: "₹5 LPA",
    demand: "Moderate",
    topCompanies: ["L&T", "Tata Motors", "BHEL", "Mahindra", "SAIL"],
    coreSkills: ["CAD/CAM", "Thermodynamics", "Manufacturing", "SolidWorks", "GD&T"],
    prepPath: [
      { label: "Core subject revision", href: "/labs/mechanical" },
      { label: "GATE numerical practice", href: "/aptitude" },
      { label: "Technical interview prep", href: "/interview/session?type=technical&domain=mechanical&mode=text" },
    ],
  },
  {
    id: "civil",
    title: "Civil Engineer",
    domain: "Civil",
    icon: "🏗️",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    salaryRange: "₹3–14 LPA",
    avgPackage: "₹5 LPA",
    demand: "Moderate",
    topCompanies: ["L&T Construction", "DLF", "NHAI", "AECOM", "PWD"],
    coreSkills: ["AutoCAD", "Structural Analysis", "Concrete Design", "Surveying", "Project Mgmt"],
    prepPath: [
      { label: "Structural analysis practice", href: "/labs/mechanical" },
      { label: "GATE civil prep", href: "/aptitude" },
      { label: "Technical interview prep", href: "/interview/session?type=technical&domain=civil&mode=text" },
    ],
  },
  {
    id: "electrical",
    title: "Electrical Engineer",
    domain: "Electrical",
    icon: "⚡",
    color: "bg-sky-500/10 border-sky-500/20",
    accent: "text-sky-400",
    salaryRange: "₹3–15 LPA",
    avgPackage: "₹5.5 LPA",
    demand: "Moderate",
    topCompanies: ["ABB", "Siemens", "NTPC", "PGCIL", "Schneider Electric"],
    coreSkills: ["Circuit Analysis", "Power Systems", "Control Systems", "MATLAB", "PLC"],
    prepPath: [
      { label: "Power systems fundamentals", href: "/labs/mechanical" },
      { label: "Technical aptitude tests", href: "/aptitude" },
      { label: "Electrical interview prep", href: "/interview/session?type=technical&domain=electrical&mode=text" },
    ],
  },
  {
    id: "business",
    title: "Business Analyst / MBA",
    domain: "Business",
    icon: "💼",
    color: "bg-pink-500/10 border-pink-500/20",
    accent: "text-pink-400",
    salaryRange: "₹4–20 LPA",
    avgPackage: "₹9 LPA",
    demand: "High",
    topCompanies: ["McKinsey", "BCG", "Deloitte", "KPMG", "Bain"],
    coreSkills: ["Case Studies", "Excel", "SQL", "PowerPoint", "Strategy"],
    prepPath: [
      { label: "Case study practice", href: "/interview/session?type=case&mode=text" },
      { label: "Aptitude for MBA entrance", href: "/aptitude" },
      { label: "Business interview prep", href: "/interview/session?type=behavioral&mode=text" },
    ],
  },
  {
    id: "product",
    title: "Product Manager",
    domain: "Product",
    icon: "🚀",
    color: "bg-orange-500/10 border-orange-500/20",
    accent: "text-orange-400",
    salaryRange: "₹8–35 LPA",
    avgPackage: "₹18 LPA",
    demand: "Very High",
    topCompanies: ["Google", "Meta", "Swiggy", "Zomato", "Razorpay"],
    coreSkills: ["Product Thinking", "Metrics", "Roadmapping", "SQL", "User Research"],
    prepPath: [
      { label: "Product case interviews", href: "/interview/session?type=case&mode=text" },
      { label: "PM behavioral questions", href: "/interview/session?type=behavioral&mode=text" },
      { label: "AI for product research", href: "/assistant" },
    ],
  },
]

const DEMAND_COLOR: Record<string, string> = {
  "Very High": "success",
  "High": "warning",
  "Moderate": "secondary",
}

export default async function CareerPage() {
  await connection()
  const session = await auth()
  const userId = session?.user?.id as string

  const profile = await db.userProfile.findUnique({ where: { userId } })
  const userDomains: string[] = Array.isArray(profile?.domains) ? (profile.domains as string[]) : []

  const sortedPaths = [...CAREER_PATHS].sort((a, b) => {
    const aMatch = userDomains.some(d => a.domain.toLowerCase().includes(d.toLowerCase()))
    const bMatch = userDomains.some(d => b.domain.toLowerCase().includes(d.toLowerCase()))
    return (bMatch ? 1 : 0) - (aMatch ? 1 : 0)
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Career Paths
          </h1>
          <p className="text-zinc-400 mt-1">
            Explore roles, required skills, and get a personalized preparation roadmap.
          </p>
        </div>
      </div>

      {/* Profile nudge if no domains */}
      {userDomains.length === 0 && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">Set your target domains for personalized recommendations</p>
              <p className="text-sm text-zinc-400">Complete your profile to get tailored career path suggestions.</p>
            </div>
          </div>
          <Link href="/onboarding">
            <Button size="sm">
              Set Goals <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Career path cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedPaths.map(path => {
          const isRecommended = userDomains.some(d =>
            path.domain.toLowerCase().includes(d.toLowerCase())
          )
          return (
            <Card key={path.id} className={`border ${path.color} relative flex flex-col`}>
              {isRecommended && (
                <div className="absolute top-3 right-3">
                  <Badge variant="success" className="text-xs">
                    <Star className="w-2.5 h-2.5 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{path.icon}</span>
                  <div>
                    <CardTitle className="text-sm text-zinc-100">{path.title}</CardTitle>
                    <CardDescription className="text-xs">{path.domain}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col gap-4">
                {/* Salary */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-zinc-600">Range</p>
                    <p className={`text-sm font-semibold ${path.accent}`}>{path.salaryRange}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Avg</p>
                    <p className="text-sm font-semibold text-zinc-300">{path.avgPackage}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={DEMAND_COLOR[path.demand] as "success" | "warning" | "secondary"} className="text-xs">
                      {path.demand}
                    </Badge>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">Core Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {path.coreSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">Top Recruiters</p>
                  <div className="flex flex-wrap gap-1">
                    {path.topCompanies.slice(0, 3).map(c => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                    {path.topCompanies.length > 3 && (
                      <Badge variant="outline" className="text-xs text-zinc-600">+{path.topCompanies.length - 3}</Badge>
                    )}
                  </div>
                </div>

                {/* Prep steps */}
                <div className="space-y-1.5 mt-auto">
                  <p className="text-xs text-zinc-600 mb-1.5">Preparation Path</p>
                  {path.prepPath.map((step, i) => (
                    <Link key={i} href={step.href}>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors group py-0.5">
                        <CheckCircle2 className="w-3 h-3 text-zinc-700 group-hover:text-indigo-400 shrink-0 transition-colors" />
                        <span>{step.label}</span>
                        <ArrowRight className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick prep links */}
      <Card className="border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Quick Preparation Links</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Aptitude Practice", desc: "Quant, Logical, Verbal", href: "/aptitude", icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { label: "Mock Interviews", desc: "HR, Technical, Behavioral", href: "/interview", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
              { label: "Domain Labs", desc: "CS, Data, Cyber, Mech", href: "/labs", icon: BookOpen, color: "text-sky-400", bg: "bg-sky-500/10" },
              { label: "AI Career Coach", desc: "Ask anything", href: "/assistant", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map(link => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`card-hover flex items-center gap-3 p-4 rounded-xl border border-zinc-800 ${link.bg}`}>
                    <Icon className={`w-5 h-5 ${link.color} shrink-0`} />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{link.label}</p>
                      <p className="text-xs text-zinc-500">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
