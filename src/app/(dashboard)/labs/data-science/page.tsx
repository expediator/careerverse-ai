"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Brain, BookOpen, Zap, ChevronRight, CheckCircle2, Play } from "lucide-react"

const DS_TOPICS = [
  {
    category: "Python & Pandas",
    icon: "🐍",
    color: "bg-indigo-500/10 border-indigo-500/20",
    accent: "text-indigo-400",
    topics: [
      "NumPy arrays and operations",
      "Pandas DataFrames and Series",
      "Data cleaning and preprocessing",
      "GroupBy and aggregation",
      "Merging and joining datasets",
      "Time series with Pandas",
    ],
  },
  {
    category: "Machine Learning",
    icon: "🤖",
    color: "bg-violet-500/10 border-violet-500/20",
    accent: "text-violet-400",
    topics: [
      "Linear & Logistic Regression",
      "Decision Trees & Random Forest",
      "SVM & KNN",
      "K-Means Clustering",
      "Gradient Boosting (XGBoost)",
      "Model evaluation metrics",
    ],
  },
  {
    category: "Statistics",
    icon: "📐",
    color: "bg-emerald-500/10 border-emerald-500/20",
    accent: "text-emerald-400",
    topics: [
      "Descriptive statistics",
      "Probability distributions",
      "Hypothesis testing",
      "Confidence intervals",
      "Correlation & causation",
      "A/B testing",
    ],
  },
  {
    category: "SQL & Data Engineering",
    icon: "🗄️",
    color: "bg-amber-500/10 border-amber-500/20",
    accent: "text-amber-400",
    topics: [
      "Window functions (RANK, ROW_NUMBER)",
      "CTEs and subqueries",
      "JOINs (INNER, LEFT, SELF)",
      "GROUP BY and HAVING",
      "Index optimization",
      "Stored procedures",
    ],
  },
]

const INTERVIEW_QUESTIONS = [
  { q: "What is the difference between supervised and unsupervised learning?", difficulty: "Easy" },
  { q: "Explain the bias-variance tradeoff.", difficulty: "Medium" },
  { q: "How does gradient descent work?", difficulty: "Medium" },
  { q: "What is cross-validation and why is it used?", difficulty: "Easy" },
  { q: "Explain the curse of dimensionality.", difficulty: "Hard" },
  { q: "What are precision and recall? When would you optimize for each?", difficulty: "Medium" },
  { q: "How do you handle class imbalance in a dataset?", difficulty: "Medium" },
  { q: "What is regularization? Explain L1 vs L2.", difficulty: "Hard" },
  { q: "Walk me through building a recommendation system from scratch.", difficulty: "Hard" },
  { q: "How would you detect and handle outliers in a dataset?", difficulty: "Easy" },
]

const DIFF_COLOR: Record<string, "success" | "warning" | "destructive"> = {
  Easy: "success", Medium: "warning", Hard: "destructive",
}

const PYTHON_SNIPPETS = [
  {
    title: "Pandas: Load & Explore",
    code: `import pandas as pd
import numpy as np

df = pd.read_csv('data.csv')
print(df.shape)         # (rows, cols)
print(df.head())        # first 5 rows
print(df.info())        # dtypes & nulls
print(df.describe())    # statistics`,
  },
  {
    title: "Handle Missing Values",
    code: `# Check nulls
print(df.isnull().sum())

# Fill with median
df['col'] = df['col'].fillna(df['col'].median())

# Drop rows with any null
df = df.dropna()

# Forward fill for time series
df = df.ffill()`,
  },
  {
    title: "Sklearn: Train a Model",
    code: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
preds = model.predict(X_test)
print(classification_report(y_test, preds))`,
  },
  {
    title: "SQL: Window Functions",
    code: `-- Rank employees by salary within dept
SELECT
  name, department, salary,
  RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
  ) AS salary_rank
FROM employees;

-- Running total
SELECT date, revenue,
  SUM(revenue) OVER (ORDER BY date) AS cumulative
FROM sales;`,
  },
]

export default function DataScienceLabPage() {
  const [selectedQ, setSelectedQ] = useState<number | null>(null)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeSnippet, setActiveSnippet] = useState(0)

  async function getAnswerHelp(question: string) {
    setLoading(true)
    setFeedback("")
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Data Science Interview Question: "${question}"\n\nProvide a concise, accurate answer suitable for a Data Science interview. Include key points and any relevant formulas or code if applicable.` }],
          mode: "interview",
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let result = ""
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try { result += JSON.parse(data).text ?? "" } catch {}
          }
        }
        setFeedback(result)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-violet-400" />
          Data Science Lab
        </h1>
        <p className="text-zinc-400 mt-1">Python, ML, Statistics, SQL — complete Data Science interview prep.</p>
      </div>

      <Tabs defaultValue="topics">
        <TabsList className="mb-6">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
          <TabsTrigger value="interview">Interview Q&A</TabsTrigger>
        </TabsList>

        {/* Topics Tab */}
        <TabsContent value="topics">
          <div className="grid sm:grid-cols-2 gap-6">
            {DS_TOPICS.map(section => (
              <Card key={section.category} className={`border ${section.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-zinc-100">{section.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {section.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${section.accent} shrink-0`} />
                      {topic}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => {
                      const q = `Explain ${section.topics[0]} for a data science interview with examples and code`
                      window.location.href = `/assistant?q=${encodeURIComponent(q)}`
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Learn with AI
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Snippets Tab */}
        <TabsContent value="snippets">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              {PYTHON_SNIPPETS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSnippet(i)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                    activeSnippet === i
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
            <div className="lg:col-span-3">
              <Card className="border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                    {PYTHON_SNIPPETS[activeSnippet].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto border border-zinc-800 font-mono leading-relaxed">
                    {PYTHON_SNIPPETS[activeSnippet].code}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Interview Q&A Tab */}
        <TabsContent value="interview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Questions */}
            <div className="space-y-2">
              <p className="text-sm text-zinc-400 mb-3">Click a question to see the answer</p>
              {INTERVIEW_QUESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedQ(i); setAnswer(""); setFeedback(""); getAnswerHelp(item.q) }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
                    selectedQ === i
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-sm text-zinc-300">{item.q}</span>
                  <Badge variant={DIFF_COLOR[item.difficulty]} className="text-xs shrink-0">{item.difficulty}</Badge>
                </button>
              ))}
            </div>

            {/* Answer panel */}
            <div>
              {selectedQ !== null ? (
                <Card className="border-violet-500/20 bg-violet-500/5 sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-violet-300 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Model Answer
                    </CardTitle>
                    <p className="text-xs text-zinc-500">{INTERVIEW_QUESTIONS[selectedQ].q}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {loading ? (
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                        Generating answer...
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{feedback}</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-zinc-800">
                  <div className="text-center">
                    <ChevronRight className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">Select a question to see the answer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
