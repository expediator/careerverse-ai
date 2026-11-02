import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, FlaskConical } from "lucide-react"

const LABS = [
  {
    id: "cs",
    title: "CS & Programming",
    icon: "💻",
    color: "bg-indigo-500/10 border-indigo-500/20",
    accent: "text-indigo-400",
    status: "available",
    features: [
      "Multi-language code editor (Python, Java, C++, JS)",
      "DSA problems with test cases",
      "AI code review & debugging",
      "SQL practice environment",
      "Output prediction exercises",
    ],
    stats: { topics: 150, problems: 500 },
    href: "/labs/cs",
  },
  {
    id: "data-science",
    title: "Data Science & AI",
    icon: "📊",
    color: "bg-sky-500/10 border-sky-500/20",
    accent: "text-sky-400",
    status: "available",
    features: [
      "Python data analysis exercises",
      "Statistics & probability problems",
      "ML algorithm explanations",
      "SQL for data science",
      "Case study datasets",
    ],
    stats: { topics: 80, problems: 200 },
    href: "/labs/data-science",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    icon: "🔒",
    color: "bg-rose-500/10 border-rose-500/20",
    accent: "text-rose-400",
    status: "available",
    features: [
      "Networking fundamentals",
      "OWASP Top 10 practice",
      "Cryptography exercises",
      "Log analysis challenges",
      "CTF-style challenges",
    ],
    stats: { topics: 60, problems: 150 },
    href: "/labs/cybersecurity",
  },
  {
    id: "mechanical",
    title: "Mechanical Engineering",
    icon: "⚙️",
    color: "bg-amber-500/10 border-amber-500/20",
    accent: "text-amber-400",
    status: "available",
    features: [
      "Engineering mechanics problems",
      "Thermodynamics calculations",
      "Fluid mechanics exercises",
      "Machine design problems",
      "Manufacturing case studies",
    ],
    stats: { topics: 70, problems: 300 },
    href: "/labs/mechanical",
  },
  {
    id: "civil",
    title: "Civil Engineering",
    icon: "🏗️",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    status: "available",
    features: [
      "Structural analysis calculators",
      "Geotechnical problems",
      "Transportation engineering",
      "Estimation & costing",
      "Construction management",
    ],
    stats: { topics: 65, problems: 250 },
    href: "/labs/civil",
  },
  {
    id: "electrical",
    title: "Electrical & Electronics",
    icon: "⚡",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    status: "available",
    features: [
      "Circuit analysis problems",
      "Power systems questions",
      "Digital electronics exercises",
      "Control systems",
      "Microcontroller basics",
    ],
    stats: { topics: 75, problems: 280 },
    href: "/labs/electrical",
  },
  {
    id: "business",
    title: "Business & Management",
    icon: "💼",
    color: "bg-zinc-500/10 border-zinc-500/20",
    accent: "text-zinc-400",
    status: "available",
    features: [
      "Business case studies",
      "Financial analysis problems",
      "Marketing scenarios",
      "Excel exercises",
      "Management concepts",
    ],
    stats: { topics: 55, problems: 180 },
    href: "/labs/business",
  },
  {
    id: "finance",
    title: "Finance & Accounting",
    icon: "📈",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    status: "available",
    features: [
      "Financial statement analysis",
      "Ratio calculations",
      "Investment concepts",
      "Valuation methods",
      "Accounting principles",
    ],
    stats: { topics: 50, problems: 160 },
    href: "/labs/finance",
  },
]

export default function LabsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-amber-400" />
          Domain Laboratories
        </h1>
        <p className="text-zinc-400 mt-1">
          Practical, interactive workspaces for every major engineering and professional domain.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {LABS.map(lab => (
          <Card key={lab.id} className={`border ${lab.color} card-hover`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lab.icon}</span>
                  <div>
                    <h3 className="font-semibold text-zinc-100">{lab.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{lab.stats.topics} topics</Badge>
                      <Badge variant="secondary" className="text-xs">{lab.stats.problems} problems</Badge>
                    </div>
                  </div>
                </div>
                <Badge variant="success" className="text-xs shrink-0">Active</Badge>
              </div>

              <ul className="space-y-1.5 mb-5">
                {lab.features.slice(0, 4).map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${lab.accent.replace("text-", "bg-")}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={lab.href}>
                <Button size="sm" className="w-full" variant="outline">
                  Enter Lab
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center">
        <p className="text-zinc-300 font-medium mb-1">More domains coming soon</p>
        <p className="text-sm text-zinc-500">
          Healthcare, Aerospace, Chemical Engineering, Agriculture, and more. Request a domain in the AI assistant.
        </p>
      </div>
    </div>
  )
}
