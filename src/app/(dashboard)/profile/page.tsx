"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, GraduationCap, Target, Bell, Shield, CheckCircle2, Loader2 } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const DOMAINS = [
  { id: "cs", label: "Computer Science" },
  { id: "data-science", label: "Data Science" },
  { id: "mechanical", label: "Mechanical Eng." },
  { id: "civil", label: "Civil Eng." },
  { id: "electrical", label: "Electrical Eng." },
  { id: "electronics", label: "Electronics" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "business", label: "Business / MBA" },
  { id: "finance", label: "Finance" },
  { id: "marketing", label: "Marketing" },
  { id: "design", label: "UI/UX Design" },
  { id: "product", label: "Product Management" },
]

interface ProfileData {
  degree?: string | null
  college?: string | null
  branch?: string | null
  graduationYear?: number | null
  targetRoles?: string[]
  domains?: string[]
  experienceLevel?: string | null
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData>({ domains: [], targetRoles: [] })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(data => { setProfile(data ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function saveProfile() {
    setSaving(true)
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function toggleDomain(id: string) {
    const current = profile.domains ?? []
    setProfile(p => ({
      ...p,
      domains: current.includes(id) ? current.filter(d => d !== id) : [...current, id],
    }))
  }

  const initials = session?.user?.name
    ?.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Profile & Settings
        </h1>
        <p className="text-zinc-400 mt-1">Manage your account, goals, and preferences.</p>
      </div>

      {/* Avatar card */}
      <Card className="border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold text-zinc-100">{session?.user?.name ?? "User"}</p>
              <p className="text-zinc-400">{session?.user?.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {profile.experienceLevel ?? "Student"}
                </Badge>
                {profile.domains && profile.domains.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {profile.domains.length} domain{profile.domains.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="education">
        <TabsList className="mb-6">
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="goals">Goals & Domains</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Education Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Degree / Programme</Label>
                  <Input
                    value={profile.degree ?? ""}
                    onChange={e => setProfile(p => ({ ...p, degree: e.target.value }))}
                    placeholder="e.g. B.Tech Computer Science"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Institution / College</Label>
                  <Input
                    value={profile.college ?? ""}
                    onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                    placeholder="e.g. IIT Delhi"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Branch / Specialization</Label>
                  <Input
                    value={profile.branch ?? ""}
                    onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Graduation Year</Label>
                  <Input
                    type="number"
                    value={profile.graduationYear ?? ""}
                    onChange={e => setProfile(p => ({ ...p, graduationYear: parseInt(e.target.value) || undefined }))}
                    placeholder="e.g. 2026"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Experience Level</Label>
                  <select
                    value={profile.experienceLevel ?? ""}
                    onChange={e => setProfile(p => ({ ...p, experienceLevel: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="">Select level</option>
                    <option value="student">Student</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-2 years">1–2 Years Exp.</option>
                    <option value="3-5 years">3–5 Years Exp.</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Career Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target Role</Label>
                  <Input
                    value={profile.targetRoles?.[0] ?? ""}
                    onChange={e => setProfile(p => ({ ...p, targetRoles: e.target.value ? [e.target.value] : [] }))}
                    placeholder="e.g. Software Engineer"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <Label className="mb-3 block">Target Domains (select all that apply)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOMAINS.map(domain => {
                    const selected = (profile.domains ?? []).includes(domain.id)
                    return (
                      <button
                        key={domain.id}
                        onClick={() => toggleDomain(domain.id)}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          selected
                            ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        {domain.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Email</p>
                  <p className="text-sm text-zinc-500">{session?.user?.email}</p>
                </div>
                <Badge variant="success" className="text-xs">Verified</Badge>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Authentication</p>
                  <p className="text-sm text-zinc-500">OAuth / Email & Password</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <CardTitle className="text-base text-rose-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
