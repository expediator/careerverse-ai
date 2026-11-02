import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatRelativeTime(date: Date | string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-amber-400"
  return "text-rose-400"
}

export function getScoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20"
  if (score >= 60) return "bg-amber-500/10 border-amber-500/20"
  return "bg-rose-500/10 border-rose-500/20"
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "beginner": return "text-emerald-400"
    case "intermediate": return "text-amber-400"
    case "advanced": return "text-rose-400"
    default: return "text-zinc-400"
  }
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export const DOMAINS = [
  { id: "cs", label: "Computer Science", icon: "💻" },
  { id: "it", label: "Information Technology", icon: "🖥️" },
  { id: "data-science", label: "Data Science & AI", icon: "📊" },
  { id: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
  { id: "mechanical", label: "Mechanical Engineering", icon: "⚙️" },
  { id: "civil", label: "Civil Engineering", icon: "🏗️" },
  { id: "electrical", label: "Electrical Engineering", icon: "⚡" },
  { id: "electronics", label: "Electronics & Communication", icon: "📡" },
  { id: "business", label: "Business & Management", icon: "💼" },
  { id: "finance", label: "Finance & Accounting", icon: "📈" },
  { id: "marketing", label: "Marketing & Sales", icon: "📣" },
  { id: "design", label: "UI/UX Design", icon: "🎨" },
  { id: "product", label: "Product Management", icon: "🚀" },
  { id: "operations", label: "Operations & Supply Chain", icon: "🏭" },
  { id: "healthcare", label: "Healthcare & Biomedical", icon: "🏥" },
  { id: "chemical", label: "Chemical Engineering", icon: "🧪" },
  { id: "aerospace", label: "Aerospace Engineering", icon: "✈️" },
  { id: "agriculture", label: "Agriculture & Food Tech", icon: "🌾" },
  { id: "law", label: "Law & Legal Studies", icon: "⚖️" },
  { id: "education", label: "Education & Teaching", icon: "📚" },
] as const

export type DomainId = typeof DOMAINS[number]["id"]

export const EXPERIENCE_LEVELS = [
  { id: "student", label: "Student (No Experience)" },
  { id: "fresher", label: "Fresher (0-1 year)" },
  { id: "junior", label: "Junior (1-3 years)" },
  { id: "mid", label: "Mid Level (3-5 years)" },
  { id: "senior", label: "Senior (5+ years)" },
] as const
