"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Brain, Code2, Mic2, BookOpen, BarChart3,
  FlaskConical, FileText, Target, Settings, User,
  Zap, ChevronRight, GraduationCap, Briefcase, TrendingUp,
  Shield, Cpu, Beaker
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/progress", icon: TrendingUp, label: "My Progress" },
    ],
  },
  {
    title: "Preparation",
    items: [
      { href: "/aptitude", icon: BarChart3, label: "Aptitude" },
      { href: "/interview", icon: Mic2, label: "AI Interview" },
      { href: "/personality", icon: Brain, label: "Communication" },
      { href: "/resume", icon: FileText, label: "Resume" },
    ],
  },
  {
    title: "Domain Labs",
    items: [
      { href: "/labs/cs", icon: Code2, label: "CS & Coding" },
      { href: "/labs/data-science", icon: Cpu, label: "Data Science" },
      { href: "/labs/cybersecurity", icon: Shield, label: "Cybersecurity" },
      { href: "/labs/mechanical", icon: Beaker, label: "Engineering" },
      { href: "/labs", icon: FlaskConical, label: "All Labs →" },
    ],
  },
  {
    title: "Career",
    items: [
      { href: "/career", icon: Briefcase, label: "Career Paths" },
      { href: "/assistant", icon: Zap, label: "AI Assistant" },
    ],
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const initials = user.name
    ?.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U"

  return (
    <aside className="w-60 bg-zinc-900/80 border-r border-zinc-800 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-zinc-100">
            CareerVerse<span className="text-indigo-400"> AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="px-2 mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-indigo-600/15 text-indigo-400 font-medium"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-400" : "text-zinc-500")} />
                    {item.label}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400/60" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-zinc-800">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">{user.name ?? "User"}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
        </Link>
      </div>
    </aside>
  )
}
