"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, GraduationCap, Target, Shield, CheckCircle2, Loader2, FileText, Upload, Trash2, ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react"
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

interface ResumeAnalysis {
  atsScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  extractedSkills: string[]
  missingSkills: string[]
  interviewQuestions: string[]
}

interface ResumeUpload {
  id: string
  fileName: string
  atsScore: number | null
  feedback: string | null
  extractedSkills: string[]
  createdAt: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData>({ domains: [], targetRoles: [] })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Resume state
  const [resumeText, setResumeText] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [resumeUploads, setResumeUploads] = useState<ResumeUpload[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(data => { setProfile(data ?? {}); setLoading(false) })
      .catch(() => setLoading(false))

    fetch("/api/resume/upload")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setResumeUploads(data) })
      .catch(() => {})
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

  async function handleFileRead(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text()
      setResumeText(text)
    } else {
      alert("Please upload a .txt file, or paste your resume text directly. For PDFs, copy-paste the text content.")
    }
    e.target.value = ""
  }

  async function analyzeResume() {
    if (!resumeText.trim()) return
    setUploading(true)
    setAnalysis(null)
    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc || undefined }),
      })
      const data = await res.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
        setShowAnalysis(true)
      }
      if (data.upload) {
        setResumeUploads(prev => [data.upload, ...prev].slice(0, 5))
      }
    } finally {
      setUploading(false)
    }
  }

  async function deleteResume(id: string) {
    await fetch("/api/resume/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setResumeUploads(prev => prev.filter(r => r.id !== id))
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
          <TabsTrigger value="resume">Resume</TabsTrigger>
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

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-6">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Upload Your Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Resume Content</Label>
                <p className="text-xs text-zinc-500">Paste your resume text, or upload a .txt file. For PDFs, open the PDF and copy-paste the text.</p>
                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your full resume text here&#10;&#10;Name: Akshansh Yadav&#10;Email: akshansh@example.com&#10;&#10;Education:&#10;B.Tech Computer Science, HBTU Kanpur (2024–2028)&#10;&#10;Projects:&#10;- CareerVerse AI: Full-stack AI career prep platform...&#10;&#10;Skills: Next.js, TypeScript, Python, SQL..."
                  rows={10}
                  className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y font-mono"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload .txt file
                </Button>
                <input ref={fileInputRef} type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileRead} />
                {resumeText && (
                  <span className="text-xs text-zinc-500">{resumeText.length.toLocaleString()} characters loaded</span>
                )}
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-1.5">
                <Label>Job Description (optional)</Label>
                <p className="text-xs text-zinc-500">Paste a job description to see skill gap analysis and tailored feedback.</p>
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here to get tailored analysis..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
                />
              </div>

              <Button onClick={analyzeResume} disabled={!resumeText.trim() || uploading} className="w-full sm:w-auto">
                {uploading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  : <><Sparkles className="w-4 h-4 mr-2" /> Analyze & Save Resume</>
                }
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card className="border-zinc-800">
              <CardHeader className="cursor-pointer" onClick={() => setShowAnalysis(v => !v)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Analysis Results
                    <Badge
                      className={`ml-2 text-xs ${analysis.atsScore >= 70 ? "bg-green-500/20 text-green-400 border-green-500/30" : analysis.atsScore >= 50 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                      variant="outline"
                    >
                      ATS Score: {analysis.atsScore}/100
                    </Badge>
                  </CardTitle>
                  {showAnalysis ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
              </CardHeader>
              {showAnalysis && (
                <CardContent className="space-y-5">
                  {analysis.summary && (
                    <p className="text-sm text-zinc-300 bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">{analysis.summary}</p>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {analysis.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                        </p>
                        <ul className="space-y-1">
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex gap-2">
                              <span className="text-green-500 shrink-0">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.improvements?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Improvements
                        </p>
                        <ul className="space-y-1">
                          {analysis.improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex gap-2">
                              <span className="text-yellow-500 shrink-0">•</span>{imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {analysis.extractedSkills?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-2">Detected Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.extractedSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.missingSkills?.length > 0 && analysis.missingSkills[0] !== "Paste a job description to see skill gaps" && (
                    <div>
                      <p className="text-xs font-medium text-rose-400 mb-2">Skill Gaps (from JD)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs border-rose-500/30 text-rose-400">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.interviewQuestions?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-indigo-400 mb-2">Likely Interview Questions</p>
                      <ul className="space-y-1.5">
                        {analysis.interviewQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-zinc-300 bg-zinc-900/40 rounded px-3 py-1.5 border border-zinc-800/60">
                            {i + 1}. {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Previous Uploads */}
          {resumeUploads.length > 0 && (
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base">Previous Analyses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resumeUploads.map(upload => (
                  <div key={upload.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div>
                        <p className="text-sm text-zinc-200">{upload.fileName}</p>
                        <p className="text-xs text-zinc-500">{new Date(upload.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {upload.atsScore != null && (
                        <Badge variant="outline" className={`text-xs ${upload.atsScore >= 70 ? "border-green-500/30 text-green-400" : upload.atsScore >= 50 ? "border-yellow-500/30 text-yellow-400" : "border-red-500/30 text-red-400"}`}>
                          {upload.atsScore}/100
                        </Badge>
                      )}
                      <button
                        onClick={() => deleteResume(upload.id)}
                        className="text-zinc-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
