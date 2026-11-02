"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DOMAINS, EXPERIENCE_LEVELS } from "@/lib/utils"
import { CheckCircle2, ArrowRight, ArrowLeft, Zap, GraduationCap, Target, Clock, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "education", icon: GraduationCap, title: "Your Education", desc: "Tell us about your academic background" },
  { id: "domains", icon: Target, title: "Your Domains", desc: "Select all domains you want to prepare for" },
  { id: "goals", icon: Briefcase, title: "Career Goals", desc: "What roles are you targeting?" },
  { id: "schedule", icon: Clock, title: "Study Schedule", desc: "How much time can you commit daily?" },
]

const TARGET_ROLES = [
  "Software Engineer", "Data Scientist", "Product Manager", "Business Analyst",
  "Mechanical Design Engineer", "Civil Site Engineer", "Electrical Engineer",
  "Cybersecurity Analyst", "UI/UX Designer", "DevOps Engineer",
  "Financial Analyst", "Marketing Manager", "HR Executive",
  "Operations Manager", "Research Scientist",
]

const HOURS_OPTIONS = [
  { value: "0.5", label: "30 min/day" },
  { value: "1", label: "1 hour/day" },
  { value: "2", label: "2 hours/day" },
  { value: "3", label: "3 hours/day" },
  { value: "4", label: "4+ hours/day" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    experienceLevel: "student",
    domains: [] as string[],
    targetRoles: [] as string[],
    hoursPerDay: "2",
    daysPerWeek: "5",
  })

  function toggleDomain(id: string) {
    setData(prev => ({
      ...prev,
      domains: prev.domains.includes(id)
        ? prev.domains.filter(d => d !== id)
        : [...prev.domains, id]
    }))
  }

  function toggleRole(role: string) {
    setData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }))
  }

  async function handleFinish() {
    setLoading(true)
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      router.push("/dashboard")
    } catch {
      router.push("/dashboard")
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-zinc-100">CareerVerse <span className="text-indigo-400">AI</span></span>
          </div>
          <span className="text-sm text-zinc-400">Step {step + 1} of {STEPS.length}</span>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Step header */}
          <div className="text-center mb-8">
            {(() => {
              const S = STEPS[step]
              const Icon = S.icon
              return (
                <>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-100">{S.title}</h2>
                  <p className="text-zinc-400 mt-1">{S.desc}</p>
                </>
              )
            })()}
          </div>

          {/* Step content */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>College / University</Label>
                    <Input
                      placeholder="HBTU Kanpur"
                      value={data.college}
                      onChange={e => setData(p => ({ ...p, college: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Select value={data.degree} onValueChange={v => setData(p => ({ ...p, degree: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                      <SelectContent>
                        {["B.Tech", "B.E.", "B.Sc", "BCA", "B.Com", "BBA", "M.Tech", "MBA", "MCA", "M.Sc", "Ph.D", "Diploma", "Other"].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch / Specialization</Label>
                    <Input
                      placeholder="Computer Science"
                      value={data.branch}
                      onChange={e => setData(p => ({ ...p, branch: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Graduation Year</Label>
                    <Select value={data.graduationYear} onValueChange={v => setData(p => ({ ...p, graduationYear: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setData(p => ({ ...p, experienceLevel: level.id }))}
                        className={cn(
                          "text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                          data.experienceLevel === level.id
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="text-sm text-zinc-500 mb-4">Select all domains you want to prepare for. You can add more later.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                  {DOMAINS.map(domain => (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => toggleDomain(domain.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all text-left",
                        data.domains.includes(domain.id)
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      <span>{domain.icon}</span>
                      <span className="truncate">{domain.label}</span>
                      {data.domains.includes(domain.id) && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0 text-indigo-400" />}
                    </button>
                  ))}
                </div>
                {data.domains.length > 0 && (
                  <p className="text-xs text-indigo-400 mt-3">{data.domains.length} domain{data.domains.length !== 1 ? "s" : ""} selected</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm text-zinc-500 mb-4">Select your target roles. This helps us personalize interview questions and preparation.</p>
                <div className="flex flex-wrap gap-2">
                  {TARGET_ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm transition-all",
                        data.targetRoles.includes(role)
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>How many hours per day can you study?</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {HOURS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setData(p => ({ ...p, hoursPerDay: opt.value }))}
                        className={cn(
                          "px-3 py-2.5 rounded-lg border text-sm transition-all text-center",
                          data.hoursPerDay === opt.value
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Days per week</Label>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6, 7].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setData(p => ({ ...p, daysPerWeek: String(days) }))}
                        className={cn(
                          "w-10 h-10 rounded-lg border text-sm font-medium transition-all",
                          data.daysPerWeek === String(days)
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        )}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4">
                  <p className="text-sm text-indigo-300 font-medium">
                    Your commitment: {data.hoursPerDay}h × {data.daysPerWeek} days/week =&nbsp;
                    <strong>{(parseFloat(data.hoursPerDay) * parseInt(data.daysPerWeek)).toFixed(1)}h/week</strong>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    We&apos;ll set up smart notifications to keep you on track.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} loading={loading} className="bg-gradient-to-r from-indigo-600 to-violet-600">
                Launch My Roadmap
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-zinc-600 mt-4">
            You can update these details anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  )
}
