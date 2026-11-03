export const SKILL_LEVELS = [
  {
    rank: 8, label: "Super Expert", minScore: 88, xpPerCorrect: 55,
    emoji: "🏆", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    scoreRange: "88–100%", correctRange: "13–15 / 15",
    description: "Mastery level. You can teach, architect, and push the frontier of this domain.",
    milestone: "Mentor others, contribute to open source, and lead architectural decisions at scale.",
    nextStep: "Publish content, contribute to major open-source projects, target L5/L6 engineering roles.",
  },
  {
    rank: 7, label: "Expert", minScore: 76, xpPerCorrect: 40,
    emoji: "⭐", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    scoreRange: "76–87%", correctRange: "12–13 / 15",
    description: "Deep expertise. You handle complex problems and edge cases with confidence and speed.",
    milestone: "Crack most technical interviews, build production systems independently, no hand-holding needed.",
    nextStep: "Tackle Super Expert topics, competitive programming, lead real production systems.",
  },
  {
    rank: 6, label: "Intermediate", minScore: 63, xpPerCorrect: 30,
    emoji: "🔷", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30",
    badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    scoreRange: "63–75%", correctRange: "10–11 / 15",
    description: "Solid foundation with growing depth. You handle standard problems independently.",
    milestone: "Build projects, contribute to codebases, handle medium-difficulty interview questions.",
    nextStep: "Focus on advanced topics and time-pressured problem solving to reach Expert.",
  },
  {
    rank: 5, label: "Skilled", minScore: 51, xpPerCorrect: 22,
    emoji: "🔵", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30",
    badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    scoreRange: "51–62%", correctRange: "8–9 / 15",
    description: "Core concepts are clear. You apply them to familiar problems and are building intuition for complex ones.",
    milestone: "Build guided projects, solve easy interview questions, follow and understand complex codebases.",
    nextStep: "Bridge theory to practice — build a full project that uses this domain end-to-end.",
  },
  {
    rank: 4, label: "Novice", minScore: 38, xpPerCorrect: 16,
    emoji: "🟢", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30",
    badge: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    scoreRange: "38–50%", correctRange: "6–7 / 15",
    description: "You know the fundamentals but concepts aren't fully connected yet. Structured practice accelerates you.",
    milestone: "Understand basic concepts, read code in this domain, follow tutorials without getting lost.",
    nextStep: "Pick one topic and go deep — don't spread too thin at this stage.",
  },
  {
    rank: 3, label: "Rookie", minScore: 26, xpPerCorrect: 12,
    emoji: "🟡", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    scoreRange: "26–37%", correctRange: "4–5 / 15",
    description: "Early stage. You have some exposure to the domain but key concepts are still forming.",
    milestone: "Follow along with tutorials and understand what code is trying to do, even if you can't write it yet.",
    nextStep: "Build a very small project. Theory without application won't stick at this stage.",
  },
  {
    rank: 2, label: "Beginner", minScore: 13, xpPerCorrect: 8,
    emoji: "🟠", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30",
    badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    scoreRange: "13–25%", correctRange: "2–3 / 15",
    description: "Starting out. You're building basic awareness — most concepts in this domain are still new to you.",
    milestone: "You know what this domain is about and can identify its major areas.",
    nextStep: "Start with the recommended foundational course. Commit to 30 min of practice daily.",
  },
  {
    rank: 1, label: "New", minScore: 0, xpPerCorrect: 5,
    emoji: "🆕", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/30",
    badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    scoreRange: "0–12%", correctRange: "0–1 / 15",
    description: "Just getting started. You're brand new to this domain — that's perfectly fine. Everyone starts here.",
    milestone: "You're at the beginning. The only direction is up.",
    nextStep: "Watch a 5-minute intro video on this domain. See if it sparks curiosity — then dive in.",
  },
]

export function getSkillLevel(score: number) {
  return SKILL_LEVELS.find(l => score >= l.minScore) ?? SKILL_LEVELS[SKILL_LEVELS.length - 1]
}

export const LEVEL_BADGE_MAP: Record<string, string> = Object.fromEntries(
  SKILL_LEVELS.map(l => [l.label, l.badge])
)

// XP-based global ranking system (unlocked after 5 tests)
export const XP_RANKS = [
  { label: "Bronze",   minXp: 0,     next: 300,   emoji: "🥉", color: "text-amber-700",  bg: "bg-amber-900/20",   border: "border-amber-800/40",   badge: "bg-amber-900/30 text-amber-600 border-amber-800/50" },
  { label: "Silver",   minXp: 300,   next: 800,   emoji: "🥈", color: "text-slate-300",  bg: "bg-slate-500/10",   border: "border-slate-500/30",   badge: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
  { label: "Gold",     minXp: 800,   next: 2000,  emoji: "🥇", color: "text-yellow-400", bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  { label: "Platinum", minXp: 2000,  next: 5000,  emoji: "💠", color: "text-cyan-400",   bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  { label: "Diamond",  minXp: 5000,  next: 12000, emoji: "💎", color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/30",  badge: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  { label: "Master",   minXp: 12000, next: 99999, emoji: "👑", color: "text-rose-400",   bg: "bg-rose-500/10",    border: "border-rose-500/30",    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
]

export function getXpRank(totalXp: number) {
  return [...XP_RANKS].reverse().find(r => totalXp >= r.minXp) ?? XP_RANKS[0]
}
