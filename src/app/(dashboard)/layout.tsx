import { connection } from "next/server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
    id: session.user.id as string,
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
