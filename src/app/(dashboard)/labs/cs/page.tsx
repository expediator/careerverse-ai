"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, Bot, Code2, Database, BookOpen, ChevronRight } from "lucide-react"

const LANGUAGES = ["python", "javascript", "java", "cpp", "c", "sql"]

const STARTER_CODE: Record<string, string> = {
  python: `# Write your solution here
def solution():
    # Your code
    pass

# Test your solution
print(solution())`,
  javascript: `// Write your solution here
function solution() {
    // Your code
    return null;
}

console.log(solution());`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello World");
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello World" << endl;
    return 0;
}`,
  sql: `-- Write your SQL query here
SELECT * FROM users LIMIT 10;`,
}

const DSA_PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy", topic: "Arrays", acceptance: 47 },
  { id: 2, title: "Valid Parentheses", difficulty: "Easy", topic: "Stack", acceptance: 40 },
  { id: 3, title: "Reverse Linked List", difficulty: "Easy", topic: "Linked List", acceptance: 67 },
  { id: 4, title: "Binary Search", difficulty: "Easy", topic: "Search", acceptance: 55 },
  { id: 5, title: "Maximum Subarray", difficulty: "Medium", topic: "DP", acceptance: 49 },
  { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", topic: "Linked List", acceptance: 60 },
  { id: 7, title: "Climbing Stairs", difficulty: "Easy", topic: "DP", acceptance: 51 },
  { id: 8, title: "LRU Cache", difficulty: "Medium", topic: "Design", acceptance: 39 },
  { id: 9, title: "Binary Tree Level Order", difficulty: "Medium", topic: "Trees", acceptance: 63 },
  { id: 10, title: "Course Schedule", difficulty: "Medium", topic: "Graphs", acceptance: 45 },
  { id: 11, title: "Merge K Sorted Lists", difficulty: "Hard", topic: "Heap", acceptance: 44 },
  { id: 12, title: "Word Break", difficulty: "Medium", topic: "DP", acceptance: 43 },
]

const TOPICS = [
  { label: "Arrays & Strings", count: 45 },
  { label: "Linked Lists", count: 28 },
  { label: "Trees & Graphs", count: 52 },
  { label: "Dynamic Programming", count: 38 },
  { label: "Sorting & Searching", count: 30 },
  { label: "Stack & Queue", count: 25 },
  { label: "Backtracking", count: 20 },
  { label: "Greedy", count: 18 },
  { label: "Bit Manipulation", count: 15 },
  { label: "System Design", count: 22 },
  { label: "OOP Concepts", count: 20 },
  { label: "Database / SQL", count: 35 },
]

export default function CSLabPage() {
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(STARTER_CODE.python)
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [aiReview, setAiReview] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<typeof DSA_PROBLEMS[0] | null>(null)

  function handleLanguageChange(lang: string) {
    setLanguage(lang)
    setCode(STARTER_CODE[lang] ?? "")
    setOutput("")
  }

  async function runCode() {
    setRunning(true)
    setOutput("")
    try {
      const res = await fetch("/api/labs/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      setOutput(data.output ?? data.error ?? "No output")
    } catch {
      setOutput("Execution service unavailable. Set up a code execution API (e.g., Judge0) in your environment.")
    }
    setRunning(false)
  }

  async function getAiReview() {
    setReviewing(true)
    setAiReview("")
    try {
      const res = await fetch("/api/labs/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, problem: selectedProblem?.title }),
      })
      const data = await res.json()
      setAiReview(data.review ?? "Could not get review. Check your API key.")
    } catch {
      setAiReview("AI review requires ANTHROPIC_API_KEY.")
    }
    setReviewing(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-indigo-400" />
            CS & Programming Lab
          </h1>
          <p className="text-zinc-400 mt-1">Code editor, DSA practice, and AI-powered code review.</p>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Code Editor</TabsTrigger>
          <TabsTrigger value="problems">DSA Problems</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="sql">SQL Practice</TabsTrigger>
        </TabsList>

        {/* Code Editor */}
        <TabsContent value="editor" className="mt-4">
          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 space-y-3">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-t-lg px-4 py-2.5">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-36 h-7 text-xs border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => (
                      <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={getAiReview} disabled={reviewing}>
                    {reviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    AI Review
                  </Button>
                  <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500" onClick={runCode} disabled={running}>
                    {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Run
                  </Button>
                </div>
              </div>

              {/* Code textarea */}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full h-80 bg-zinc-900 border border-zinc-800 rounded-b-lg p-4 text-sm font-mono text-zinc-200 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                spellCheck={false}
              />

              {/* Output */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="px-4 py-2 border-b border-zinc-800 text-xs font-medium text-zinc-500">Output</div>
                <pre className="p-4 text-sm font-mono text-zinc-300 min-h-20 whitespace-pre-wrap">
                  {running ? (
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Running...
                    </span>
                  ) : output || <span className="text-zinc-600">Run your code to see output here.</span>}
                </pre>
              </div>

              {/* AI Review */}
              {aiReview && (
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 text-sm font-medium">
                    <Bot className="w-4 h-4" />
                    AI Code Review
                  </div>
                  <p className="text-zinc-300 text-sm whitespace-pre-wrap">{aiReview}</p>
                </div>
              )}
            </div>

            {/* Problem panel */}
            <div className="lg:col-span-2 space-y-3">
              {selectedProblem ? (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{selectedProblem.title}</CardTitle>
                      <Badge variant={selectedProblem.difficulty === "Easy" ? "success" : selectedProblem.difficulty === "Medium" ? "warning" : "destructive"}>
                        {selectedProblem.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <Badge variant="secondary">{selectedProblem.topic}</Badge>
                    <p className="text-sm text-zinc-400">
                      Problem statement will be fetched from the problem bank. Write your solution in the editor.
                    </p>
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setSelectedProblem(null)}>
                      Choose Different Problem
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Select a Problem</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1.5 max-h-96 overflow-y-auto">
                      {DSA_PROBLEMS.slice(0, 8).map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProblem(p)}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm text-zinc-200">{p.title}</p>
                            <p className="text-xs text-zinc-500">{p.topic} · {p.acceptance}%</p>
                          </div>
                          <Badge variant={p.difficulty === "Easy" ? "success" : p.difficulty === "Medium" ? "warning" : "destructive"} className="text-xs">
                            {p.difficulty}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* DSA Problems list */}
        <TabsContent value="problems" className="mt-4">
          <Card className="border-zinc-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500">#</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500">Topic</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500">Difficulty</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500">Acceptance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DSA_PROBLEMS.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer">
                        <td className="py-3 px-4 text-sm text-zinc-500">{p.id}</td>
                        <td className="py-3 px-4 text-sm text-zinc-200 font-medium">{p.title}</td>
                        <td className="py-3 px-4"><Badge variant="secondary" className="text-xs">{p.topic}</Badge></td>
                        <td className="py-3 px-4">
                          <Badge variant={p.difficulty === "Easy" ? "success" : p.difficulty === "Medium" ? "warning" : "destructive"}>
                            {p.difficulty}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-400">{p.acceptance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics */}
        <TabsContent value="topics" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOPICS.map(topic => (
              <div key={topic.label} className="card-hover flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{topic.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{topic.count} problems</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* SQL */}
        <TabsContent value="sql" className="mt-4">
          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-t-lg px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-medium text-zinc-300">SQL Editor</span>
                </div>
                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500" onClick={runCode} disabled={running}>
                  {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Execute
                </Button>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-b-lg p-4 text-sm font-mono text-zinc-200 resize-none focus:outline-none focus:border-sky-500"
                spellCheck={false}
                placeholder="SELECT * FROM employees WHERE salary > 50000;"
              />
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 min-h-20">
                <p className="text-xs text-zinc-500">
                  SQL execution requires a sandbox environment. Configure JUDGE0_API_KEY or use the AI assistant to practice SQL concepts.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Card className="border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">SQL Practice Topics</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {["SELECT Basics", "WHERE Clauses", "JOINs (INNER, LEFT, RIGHT)", "GROUP BY & HAVING", "Subqueries", "Window Functions", "Indexes", "Transactions"].map(t => (
                    <div key={t} className="flex items-center gap-2 text-sm text-zinc-400 py-1 border-b border-zinc-800/50">
                      <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                      {t}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
