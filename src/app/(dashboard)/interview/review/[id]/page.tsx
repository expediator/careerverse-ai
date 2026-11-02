import { connection } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mic2, ArrowLeft, Star, Clock, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react"

export default async function InterviewReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const session = await auth()
  const { id } = await params

  const interview = await db.interview.findUnique({
    where: { id },
    include: { questions: true },
  })

  if (!interview || interview.userId !== (session?.user?.id as string)) notFound()

  const score = interview.overallScore ? Math.round(interview.overallScore) : null
  const scoreColor = !score ? "text-zinc-400" : score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"
  const scoreBg = !score ? "border-zinc-800" : score >= 80 ? "border-emerald-500/20 bg-emerald-500/5" : score >= 60 ? "border-amber-500/20 bg-amber-500/5" : "border-rose-500/20 bg-rose-500/5"

  const answeredQuestions = interview.questions.filter(q => q.userAnswer)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/interview">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Mic2 className="w-6 h-6 text-violet-400" />
            Interview Review
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="capitalize">{interview.type}</Badge>
            {interview.domain && <Badge variant="outline">{interview.domain}</Badge>}
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(interview.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Score overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className={`border ${scoreBg}`}>
          <CardContent className="p-5 text-center">
            <p className="text-xs text-zinc-500 mb-1">Overall Score</p>
            <p className={`text-4xl font-bold ${scoreColor}`}>{score !== null ? `${score}%` : "—"}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {score === null ? "Not scored" : score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs improvement"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-zinc-500 mb-1">Questions Answered</p>
            <p className="text-4xl font-bold text-zinc-100">{answeredQuestions.length}</p>
            <p className="text-xs text-zinc-500 mt-1">of {interview.questions.length} total</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-zinc-500 mb-1">Duration</p>
            <p className="text-4xl font-bold text-zinc-100">
              {interview.duration ? `${Math.round(interview.duration / 60)}` : "—"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Feedback */}
      {interview.feedback && (
        <Card className="border-violet-500/20 bg-violet-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-violet-400" />
              AI Evaluator Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{interview.feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Q&A Review */}
      {answeredQuestions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            Question & Answer Review
          </h2>
          {answeredQuestions.map((q, i) => (
            <Card key={q.id} className="border-zinc-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 flex-1">{q.question}</p>
                </div>

                {q.userAnswer && (
                  <div className="ml-9 space-y-3">
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-600 mb-1">Your answer</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{q.userAnswer}</p>
                    </div>

                    {q.aiEvaluation && (
                      <div className="bg-indigo-500/5 rounded-lg p-3 border border-indigo-500/20">
                        <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          AI Feedback
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{q.aiEvaluation}</p>
                      </div>
                    )}

                    {q.suggestedAnswer && (
                      <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 mb-1">Suggested Answer</p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{q.suggestedAnswer}</p>
                      </div>
                    )}

                    {q.score !== null && q.score !== undefined && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-zinc-500">Score:</p>
                        <Badge variant={q.score >= 7 ? "success" : q.score >= 5 ? "warning" : "destructive"}>
                          {Math.round(q.score)}/10
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-800">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No Q&A data recorded for this interview.</p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="flex gap-3 pb-4">
        <Link href={`/interview/session?type=${interview.type}&mode=text${interview.domain ? `&domain=${interview.domain}` : ""}`}>
          <Button>
            <Mic2 className="w-4 h-4" />
            Practice Again
          </Button>
        </Link>
        <Link href="/interview">
          <Button variant="outline">View All Interviews</Button>
        </Link>
      </div>
    </div>
  )
}
