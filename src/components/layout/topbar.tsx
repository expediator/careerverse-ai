"use client"
import { useState, useCallback } from "react"
import { signOut } from "next-auth/react"
import { Bell, LogOut, User, Settings, CheckCheck, Info, AlertTriangle, Trophy, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  success: <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
  error:   <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
  tip:     <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />,
  info:    <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
}

export function TopBar({ user }: TopBarProps) {
  const initials = user.name
    ?.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U"

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (loaded) return
    setLoading(true)
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [loaded])

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <div className="text-sm text-zinc-400">
          Welcome back, <span className="text-zinc-100 font-medium">{user.name?.split(" ")[0] ?? "there"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications dropdown */}
        <DropdownMenu onOpenChange={open => { if (open) fetchNotifications() }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-semibold text-zinc-100">
                Notifications {unreadCount > 0 && <span className="ml-1 text-xs text-indigo-400">({unreadCount} new)</span>}
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />

            {loading && (
              <div className="py-6 text-center text-sm text-zinc-500">Loading…</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-8 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-zinc-500">No notifications yet</p>
                <p className="text-xs text-zinc-600 mt-1">Complete tasks to earn achievements</p>
              </div>
            )}

            {!loading && notifications.map(n => {
              const content = (
                <div className={`flex items-start gap-2.5 px-3 py-2.5 w-full hover:bg-zinc-800/50 transition-colors cursor-pointer ${!n.isRead ? "bg-zinc-800/30" : ""}`}>
                  <div className="mt-0.5">{TYPE_ICON[n.type] ?? TYPE_ICON.info}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-medium truncate ${n.isRead ? "text-zinc-300" : "text-zinc-100"}`}>{n.title}</p>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )

              return n.actionUrl ? (
                <Link key={n.id} href={n.actionUrl}>{content}</Link>
              ) : (
                <div key={n.id}>{content}</div>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 hover:bg-zinc-800 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-500 font-normal">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile"><User className="w-4 h-4" />Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings"><Settings className="w-4 h-4" />Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-rose-400 focus:text-rose-400">
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
