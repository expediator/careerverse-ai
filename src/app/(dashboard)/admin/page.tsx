import { connection } from "next/server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import AdminBroadcastForm from "./AdminBroadcastForm"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())

export default async function AdminPage() {
  await connection()
  const session = await auth()

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    redirect("/dashboard")
  }

  const [userCount, testCount, interviewCount] = await Promise.all([
    db.user.count(),
    db.aptitudeTest.count(),
    db.interview.count(),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Admin Panel</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your CareerVerse AI platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: userCount, icon: "👥" },
          { label: "Aptitude Tests", value: testCount, icon: "📊" },
          { label: "Interviews", value: interviewCount, icon: "🎤" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
            <div className="text-sm text-zinc-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Broadcast form */}
      <div className="rounded-xl border border-zinc-800 p-6">
        <h2 className="text-base font-semibold text-zinc-100 mb-4">📢 Email Broadcast</h2>
        <p className="text-sm text-zinc-400 mb-5">
          Send an email to all <strong className="text-zinc-200">{userCount} users</strong>. Uses your Resend account.
        </p>
        <AdminBroadcastForm userCount={userCount} />
      </div>

      {/* Digest trigger */}
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-6">
        <h2 className="text-base font-semibold text-zinc-100 mb-2">📅 Weekly Digest</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Auto-runs every Monday at 9am IST via Vercel Cron. You can also trigger it manually using the button below (in production only).
        </p>
        <code className="text-xs text-zinc-500 block bg-zinc-800 rounded-lg p-3 mb-4">
          GET /api/email/digest (Authorization: Bearer CRON_SECRET)
        </code>
      </div>
    </div>
  )
}
