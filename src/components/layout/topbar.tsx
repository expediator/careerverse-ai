"use client"
import { signOut } from "next-auth/react"
import { Bell, LogOut, User, Settings, Moon } from "lucide-react"
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

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function TopBar({ user }: TopBarProps) {
  const initials = user.name
    ?.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U"

  return (
    <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <div className="text-sm text-zinc-400">
          Welcome back, <span className="text-zinc-100 font-medium">{user.name?.split(" ")[0] ?? "there"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </Button>

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
