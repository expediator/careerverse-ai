import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BrainCircuit, Code2, BarChart3, Mic2,
  Zap, Star, ArrowRight,
  FlaskConical, Briefcase
} from "lucide-react"

const STATS = [
  { value: "50K+", label: "Students Prepared" },
  { value: "300+", label: "Practice Topics" },
  { value: "20+", label: "Career Domains" },
  { value: "95%", label: "Placement Rate" },
]

const FEATURES = [
  {
    icon: BrainCircuit,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    title: "AI Mock Interviews",
    description: "Realistic AI interviewer with follow-up questions, difficulty scaling, and instant detailed feedback.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Aptitude Engine",
    description: "300+ topics across Quantitative, Logical, and Verbal with timed tests and company-specific practice.",
  },
  {
    icon: Code2,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    title: "Coding Labs",
    description: "In-browser code editor with multi-language support, AI code review, DSA practice, and test cases.",
  },
  {
    icon: Mic2,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Communication Coach",
    description: "Record video interviews, analyze speaking patterns, get feedback on pace, clarity, and filler words.",
  },
  {
    icon: FlaskConical,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Domain Laboratories",
    description: "Practical workspaces for CS, Mechanical, Civil, Electrical, Data Science, Cybersecurity and 15+ domains.",
  },
  {
    icon: Briefcase,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    title: "Resume Intelligence",
    description: "ATS score, skills gap detection, and interview question generation from your resume content.",
  },
]

const DOMAINS = [
  { icon: "💻", label: "Computer Science" },
  { icon: "📊", label: "Data Science & AI" },
  { icon: "🔒", label: "Cybersecurity" },
  { icon: "⚙️", label: "Mechanical Eng." },
  { icon: "🏗️", label: "Civil Engineering" },
  { icon: "⚡", label: "Electrical Eng." },
  { icon: "📡", label: "Electronics" },
  { icon: "💼", label: "Business & MBA" },
  { icon: "📈", label: "Finance" },
  { icon: "🎨", label: "UI/UX Design" },
  { icon: "🚀", label: "Product Management" },
  { icon: "🏥", label: "Healthcare" },
  { icon: "🧪", label: "Chemical Eng." },
  { icon: "✈️", label: "Aerospace" },
  { icon: "📣", label: "Marketing" },
  { icon: "⚖️", label: "Law & Legal" },
  { icon: "🌾", label: "Agriculture" },
  { icon: "📚", label: "Education" },
  { icon: "🏭", label: "Operations" },
  { icon: "🖥️", label: "IT & Systems" },
]

const STEPS = [
  { step: "01", title: "Create Your Profile", desc: "Tell us your domain, education, skills, and target roles." },
  { step: "02", title: "Get Your Roadmap", desc: "AI generates a personalized prep plan based on your goals." },
  { step: "03", title: "Practice Daily", desc: "Aptitude, interviews, labs, and coaching — all in one place." },
  { step: "04", title: "Land Your Role", desc: "Track progress, fix weaknesses, walk in confident." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-zinc-100">
                CareerVerse<span className="text-indigo-400"> AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
              <Link href="#features" className="hover:text-zinc-100 transition-colors">Features</Link>
              <Link href="#domains" className="hover:text-zinc-100 transition-colors">Domains</Link>
              <Link href="#how-it-works" className="hover:text-zinc-100 transition-colors">How it Works</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 dot-grid">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6">
            <Star className="w-3 h-3" />
            AI-Powered Career Preparation Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-zinc-100">From Student to</span>
            <br />
            <span className="gradient-text">Job-Ready in Weeks</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform combining AI mock interviews, aptitude training,
            domain labs, and personality coaching — personalized for your career path.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 text-base font-semibold px-8">
                Start Preparing Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-100">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Everything You Need</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              One platform. Complete preparation.
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Every tool you need to go from uncertain to confident — built with AI at the core.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className={`card-hover rounded-xl border p-6 ${f.bg}`}>
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${f.bg}`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-zinc-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section id="domains" className="py-24 px-4 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">20+ Domains</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Whatever your field, we&apos;ve got you covered
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Specialized content, labs, and interview prep for every major career domain.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {DOMAINS.map((d) => (
              <div key={d.label} className="card-hover flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 cursor-pointer">
                <span className="text-xl">{d.icon}</span>
                <span className="text-sm text-zinc-300 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Go from zero to interview-ready
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.step}>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-600/10 to-violet-600/5 p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Your dream job is waiting.
            </h2>
            <p className="text-zinc-400 mb-8 text-lg">
              Join thousands of students preparing smarter with CareerVerse AI.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 font-semibold px-8">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-xs text-zinc-500 mt-4">No credit card required · Free forever plan</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-zinc-400">CareerVerse AI</span>
          </div>
          <p className="text-sm text-zinc-600">© 2026 <a href="https://github.com/expediator" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Expediator Inc.</a> — All rights reserved.</p>
          <div className="flex gap-4 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
