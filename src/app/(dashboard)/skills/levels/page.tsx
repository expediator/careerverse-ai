import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SKILL_LEVELS } from "@/lib/skill-levels"
import { ArrowRight, Layers, Zap } from "lucide-react"

const DOMAIN_EXAMPLES: Record<string, { label: string; icon: string }> = {
  dsa:           { label: "DSA",           icon: "🌲" },
  web:           { label: "Web Dev",       icon: "🌐" },
  database:      { label: "SQL & DB",      icon: "🗄️" },
  python:        { label: "Python",        icon: "🐍" },
  "system-design": { label: "Sys Design", icon: "🏗️" },
  "data-science":  { label: "Data & ML",  icon: "📊" },
  cybersecurity: { label: "Security",      icon: "🔒" },
  os:            { label: "OS & Net",      icon: "⚙️" },
}

export default function LevelsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          Skill Level System
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">The 8 Skill Levels</h1>
        <p className="text-zinc-400 max-w-xl">
          Every domain on CareerVerse AI uses the same 8-level progression system.
          Each level maps to a score range, a clear milestone, and a specific next step.
          Your badge colour changes as you advance.
        </p>
      </div>

      {/* Level ladder */}
      <div className="space-y-3">
        {SKILL_LEVELS.map((lvl, i) => (
          <div
            key={lvl.label}
            className={`rounded-xl border ${lvl.border} ${lvl.bg} p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-opacity-80 transition-all`}
          >
            {/* Rank + emoji */}
            <div className="flex items-center gap-3 sm:w-20 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900/80 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-800 shrink-0">
                {lvl.rank}
              </div>
              <span className="text-2xl">{lvl.emoji}</span>
            </div>

            {/* Label + scores */}
            <div className="sm:w-44 shrink-0">
              <Badge className={`text-sm font-semibold border ${lvl.badge} mb-1`}>
                {lvl.label}
              </Badge>
              <div className="flex gap-3 mt-1">
                <span className={`text-xs font-mono font-semibold ${lvl.color}`}>{lvl.scoreRange}</span>
                <span className="text-xs text-zinc-600">{lvl.correctRange}</span>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 font-medium mb-1">{lvl.description}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{lvl.milestone}</p>
            </div>

            {/* Next step */}
            <div className="sm:w-52 shrink-0 hidden lg:block">
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Next step</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{lvl.nextStep}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How scoring works */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-base font-semibold text-zinc-100 mb-4">How scoring works</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-zinc-400">
          <div>
            <p className="font-medium text-zinc-200 mb-1">Three question types</p>
            <p>Every assessment includes <span className="text-sky-400">Quiz</span> (fast recall), <span className="text-violet-400">Theory</span> (conceptual depth), and <span className="text-emerald-400">Practical</span> (applied coding/analysis) questions — 15 per session.</p>
          </div>
          <div>
            <p className="font-medium text-zinc-200 mb-1">Your level = % correct</p>
            <p>Score 88%+ (13/15) for Super Expert. Each level has a score range that maps directly to the number of correct answers. Partial credit is not given — answer quality matters.</p>
          </div>
          <div>
            <p className="font-medium text-zinc-200 mb-1">Personalised plan</p>
            <p>After submission, an AI identifies your weak areas by topic and generates a 3-sentence study plan specific to your gaps, paired with curated resources matched to your exact level.</p>
          </div>
        </div>
      </div>

      {/* Level colours reference */}
      <div>
        <h2 className="text-base font-semibold text-zinc-100 mb-4">Quick colour reference</h2>
        <div className="flex flex-wrap gap-2">
          {SKILL_LEVELS.map(lvl => (
            <Badge key={lvl.label} className={`border ${lvl.badge} text-sm`}>
              {lvl.emoji} {lvl.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Domain links */}
      <div>
        <h2 className="text-base font-semibold text-zinc-100 mb-4">Pick a domain to learn or assess</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(DOMAIN_EXAMPLES).map(([id, d]) => (
            <div key={id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{d.icon}</span>
                <span className="text-sm font-medium text-zinc-200">{d.label}</span>
              </div>
              <div className="flex gap-1.5">
                <Link href={`/skills/learn/${id}`} className="flex-1">
                  <Button size="sm" variant="ghost" className="w-full text-xs text-zinc-500 hover:text-zinc-300 px-2 h-7">Learn</Button>
                </Link>
                <Link href={`/skills/assess?domain=${id}`} className="flex-1">
                  <Button size="sm" className="w-full text-xs h-7 px-2 gap-1"><Zap className="w-3 h-3" />Test</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Link href="/skills">
          <Button variant="outline"><ArrowRight className="w-4 h-4 mr-2 rotate-180" />Back to Skill Check</Button>
        </Link>
        <Link href="/skills/assess?domain=dsa">
          <Button><Zap className="w-4 h-4 mr-2" />Start an Assessment</Button>
        </Link>
      </div>
    </div>
  )
}
