"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  FileText, Upload, Loader2, CheckCircle2, XCircle, AlertCircle,
  Brain, Briefcase, Star, Code2
} from "lucide-react"

interface ResumeAnalysis {
  atsScore: number
  strengths: string[]
  improvements: string[]
  missingSkills: string[]
  extractedSkills: string[]
  interviewQuestions: string[]
  summary: string
}

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste")
  const fileRef = useRef<HTMLInputElement>(null)

  async function analyzeResume() {
    if (!resumeText.trim()) return
    setLoading(true)
    setAnalysis(null)

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      })
      const data = await res.json()
      setAnalysis(data.analysis)
    } catch {
      setAnalysis({
        atsScore: 0,
        strengths: [],
        improvements: ["Could not analyze resume. Please check your API key."],
        missingSkills: [],
        extractedSkills: [],
        interviewQuestions: [],
        summary: "Analysis failed. Please add ANTHROPIC_API_KEY to your environment.",
      })
    }
    setLoading(false)
  }

  const scoreColor = !analysis
    ? "text-zinc-400"
    : analysis.atsScore >= 80
    ? "text-emerald-400"
    : analysis.atsScore >= 60
    ? "text-amber-400"
    : "text-rose-400"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" />
          Resume Analyzer
        </h1>
        <p className="text-zinc-400 mt-1">
          Get ATS scores, skills analysis, improvement suggestions, and interview questions from your resume.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${activeTab === "paste" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${activeTab === "upload" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Upload PDF
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activeTab === "paste" ? (
                <Textarea
                  placeholder="Paste your resume text here (copy-paste from your Word/PDF document)..."
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  className="min-h-64 resize-none font-mono text-xs"
                />
              ) : (
                <div
                  className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">Click to upload PDF or DOCX</p>
                  <p className="text-xs text-zinc-600 mt-1">Max 5MB · PDF text will be extracted</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = ev => setResumeText(ev.target?.result as string ?? "")
                        reader.readAsText(file)
                        setActiveTab("paste")
                      }
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job Description (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                placeholder="Paste a job description to get a match score and missing skills analysis..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="min-h-32 resize-none text-xs"
              />
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={analyzeResume}
            disabled={!resumeText.trim() || loading}
            loading={loading}
          >
            <Brain className="w-4 h-4" />
            Analyze with AI
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!analysis && !loading && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center h-full flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium">Your analysis will appear here</p>
              <p className="text-sm text-zinc-600 mt-1">Paste your resume and click Analyze</p>
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-zinc-400">Analyzing your resume with AI...</p>
            </div>
          )}

          {analysis && (
            <>
              {/* ATS Score */}
              <Card className="border-zinc-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-zinc-100">ATS Score</span>
                    </div>
                    <span className={`text-3xl font-bold ${scoreColor}`}>{analysis.atsScore}%</span>
                  </div>
                  <Progress
                    value={analysis.atsScore}
                    className="mb-2"
                    indicatorClassName={analysis.atsScore >= 80 ? "bg-emerald-500" : analysis.atsScore >= 60 ? "bg-amber-500" : "bg-rose-500"}
                  />
                  <p className="text-xs text-zinc-500">{analysis.summary}</p>
                </CardContent>
              </Card>

              {/* Skills */}
              {analysis.extractedSkills.length > 0 && (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      Extracted Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extractedSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-1.5">
                    {analysis.strengths.map((s, i) => (
                      <p key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-1.5">
                    {analysis.improvements.map((item, i) => (
                      <p key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        {item}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Missing Skills */}
              {analysis.missingSkills.length > 0 && (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-rose-400">
                      <XCircle className="w-4 h-4" />
                      Missing Skills (for JD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingSkills.map(skill => (
                        <Badge key={skill} variant="destructive" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interview Questions */}
              {analysis.interviewQuestions.length > 0 && (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-violet-400" />
                      Likely Interview Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {analysis.interviewQuestions.map((q, i) => (
                      <p key={i} className="text-sm text-zinc-300 border-b border-zinc-800 pb-2 last:border-0">
                        {i + 1}. {q}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
