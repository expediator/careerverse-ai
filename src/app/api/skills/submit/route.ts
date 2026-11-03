import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  domain: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    type: z.string(),
    topic: z.string(),
    correctAnswer: z.string(),
    userAnswer: z.string().nullable(),
    isCorrect: z.boolean(),
  })),
  score: z.number(),
  timeTaken: z.number().optional(),
})

const SKILL_LEVELS = [
  { min: 91, label: "Expert",        emoji: "🏆", color: "text-amber-400",  desc: "You have mastery-level knowledge. Focus on advanced topics and contributing to real projects." },
  { min: 76, label: "Advanced",      emoji: "⚡", color: "text-indigo-400", desc: "Strong command of core concepts. Work on edge cases and system-level thinking." },
  { min: 61, label: "Intermediate",  emoji: "📈", color: "text-sky-400",    desc: "Solid foundation, some gaps. Deepen understanding of complex topics." },
  { min: 41, label: "Elementary",    emoji: "🌱", color: "text-emerald-400",desc: "Building the foundations. Focus on core concepts and guided practice." },
  { min: 0,  label: "Beginner",      emoji: "🚀", color: "text-violet-400", desc: "Just getting started. Start with fundamentals and build gradually." },
]

const RESOURCES: Record<string, Record<string, Array<{ title: string; url: string; type: string; why: string }>>> = {
  dsa: {
    Beginner:      [{ title: "CS50 Introduction to CS", url: "https://cs50.harvard.edu/x/", type: "course", why: "Best starting point for fundamentals" }, { title: "Visualgo (Visualize DS & Algos)", url: "https://visualgo.net", type: "tool", why: "See algorithms run visually" }, { title: "NeetCode Roadmap", url: "https://neetcode.io/roadmap", type: "practice", why: "Structured LeetCode path from basics" }],
    Elementary:    [{ title: "NeetCode 75", url: "https://neetcode.io/practice", type: "practice", why: "Curated 75 problems covering all core patterns" }, { title: "Introduction to Algorithms (CLRS) Ch 1-6", url: "https://mitpress.mit.edu/9780262046305/", type: "book", why: "The definitive DS&A textbook" }],
    Intermediate:  [{ title: "NeetCode 150", url: "https://neetcode.io/practice", type: "practice", why: "150 problems to ace any SDE interview" }, { title: "CSES Problem Set", url: "https://cses.fi/problemset/", type: "practice", why: "300+ high-quality competitive problems" }],
    Advanced:      [{ title: "CP Algorithms", url: "https://cp-algorithms.com", type: "reference", why: "Advanced algorithm implementations and theory" }, { title: "Codeforces Div 2 Contests", url: "https://codeforces.com", type: "practice", why: "Competitive programming for speed & accuracy" }],
    Expert:        [{ title: "USACO Training Guide", url: "https://usaco.guide", type: "course", why: "Olympiad-level algorithms" }, { title: "MIT 6.006 & 6.046", url: "https://ocw.mit.edu", type: "course", why: "MIT's algorithms curriculum for CS depth" }],
  },
  web: {
    Beginner:      [{ title: "The Odin Project (Foundations)", url: "https://www.theodinproject.com/paths/foundations", type: "course", why: "Best free full-stack web dev curriculum" }, { title: "freeCodeCamp Responsive Web Design", url: "https://www.freecodecamp.org", type: "course", why: "Hands-on HTML/CSS projects" }],
    Elementary:    [{ title: "JavaScript.info", url: "https://javascript.info", type: "reference", why: "The modern JS bible — deep but approachable" }, { title: "CSS Tricks", url: "https://css-tricks.com", type: "reference", why: "Flexbox, Grid, animations — all covered" }],
    Intermediate:  [{ title: "Full Stack Open (Helsinki)", url: "https://fullstackopen.com", type: "course", why: "React, Node, GraphQL — free university course" }, { title: "Roadmap.sh Full Stack", url: "https://roadmap.sh/full-stack", type: "reference", why: "Everything you need to master full stack" }],
    Advanced:      [{ title: "patterns.dev", url: "https://www.patterns.dev", type: "book", why: "Design patterns and performance patterns in JS/React" }, { title: "Web.dev Performance", url: "https://web.dev/performance/", type: "reference", why: "Google's performance optimization guides" }],
    Expert:        [{ title: "YDKJS (You Don't Know JS)", url: "https://github.com/getify/You-Dont-Know-JS", type: "book", why: "Deep JS internals — closures, prototypes, async" }, { title: "Epic React by Kent C. Dodds", url: "https://epicreact.dev", type: "course", why: "Advanced React patterns and performance" }],
  },
  database: {
    Beginner:      [{ title: "SQLZoo", url: "https://sqlzoo.net", type: "practice", why: "Interactive SQL in the browser from scratch" }, { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course", why: "Practical SQL from beginner to analytics" }],
    Elementary:    [{ title: "LeetCode SQL 50", url: "https://leetcode.com/studyplan/top-sql-50/", type: "practice", why: "50 essential SQL problems for interviews" }, { title: "PostgreSQL Official Docs", url: "https://www.postgresql.org/docs/", type: "reference", why: "Master the most popular production database" }],
    Intermediate:  [{ title: "Use The Index, Luke!", url: "https://use-the-index-luke.com", type: "reference", why: "The best resource for SQL performance and indexes" }, { title: "Designing Data-Intensive Applications Ch 2", url: "https://dataintensive.net", type: "book", why: "How databases actually work under the hood" }],
    Advanced:      [{ title: "CMU 15-445 Database Systems", url: "https://15445.courses.cs.cmu.edu", type: "course", why: "University-level DB internals — query optimization, storage" }, { title: "PostgreSQL Internals", url: "https://www.interdb.jp/pg/", type: "reference", why: "Deep dive into Postgres architecture" }],
    Expert:        [{ title: "Designing Data-Intensive Applications", url: "https://dataintensive.net", type: "book", why: "The bible of distributed systems and databases" }],
  },
  python: {
    Beginner:      [{ title: "Python.org Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "course", why: "The official starting point" }, { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com", type: "book", why: "Free book with practical Python projects" }],
    Elementary:    [{ title: "Real Python Tutorials", url: "https://realpython.com", type: "reference", why: "Comprehensive tutorials on all Python concepts" }, { title: "Exercism Python Track", url: "https://exercism.org/tracks/python", type: "practice", why: "Mentored exercises to build muscle memory" }],
    Intermediate:  [{ title: "Fluent Python by Luciano Ramalho", url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", type: "book", why: "Idiomatic Python — how to write it properly" }, { title: "Python Cookbook", url: "https://www.dabeaz.com/cookbook.html", type: "book", why: "Recipes for real-world Python problems" }],
    Advanced:      [{ title: "CPython Internals", url: "https://realpython.com/cpython-source-code-guide/", type: "reference", why: "Understand how Python works under the hood" }, { title: "High Performance Python", url: "https://www.oreilly.com/library/view/high-performance-python/9781492055013/", type: "book", why: "Profiling, optimization, async, Cython" }],
    Expert:        [{ title: "Python Design Patterns", url: "https://python-patterns.guide", type: "reference", why: "Gang of Four patterns in Pythonic style" }],
  },
  "system-design": {
    Beginner:      [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "reference", why: "The most starred system design resource on GitHub" }, { title: "ByteByteGo Newsletter", url: "https://bytebytego.com", type: "reference", why: "Visual system design explanations" }],
    Elementary:    [{ title: "Roadmap.sh System Design", url: "https://roadmap.sh/system-design", type: "reference", why: "Structured path through all system design topics" }, { title: "Grokking System Design (Educative)", url: "https://www.educative.io/courses/grokking-the-system-design-interview", type: "course", why: "Industry-standard interview prep course" }],
    Intermediate:  [{ title: "Designing Data-Intensive Applications", url: "https://dataintensive.net", type: "book", why: "The bible of distributed systems" }, { title: "AWS Architecture Center", url: "https://aws.amazon.com/architecture/", type: "reference", why: "Real-world reference architectures" }],
    Advanced:      [{ title: "The Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/", type: "book", why: "How Google engineers systems at scale — free online" }, { title: "Martin Fowler's Blog", url: "https://martinfowler.com", type: "reference", why: "Microservices, DDD, patterns — authoritative" }],
    Expert:        [{ title: "Papers We Love", url: "https://paperswelove.org", type: "reference", why: "Original research papers behind modern systems" }],
  },
  "data-science": {
    Beginner:      [{ title: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "course", why: "Free, hands-on data science micro-courses" }, { title: "Google Data Analytics Certificate", url: "https://grow.google/certificates/data-analytics/", type: "course", why: "Structured certification for beginners" }],
    Elementary:    [{ title: "StatQuest with Josh Starmer", url: "https://www.youtube.com/@statquest", type: "video", why: "Best statistics and ML explanations on YouTube" }, { title: "Scikit-learn Docs + Examples", url: "https://scikit-learn.org/stable/auto_examples/", type: "practice", why: "Learn ML by running real examples" }],
    Intermediate:  [{ title: "fast.ai Practical Deep Learning", url: "https://fast.ai", type: "course", why: "Top-down practical DL — free university course" }, { title: "Hands-On ML (Géron)", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/", type: "book", why: "The standard ML practitioner's book" }],
    Advanced:      [{ title: "Deep Learning Specialization (Coursera)", url: "https://www.coursera.org/specializations/deep-learning", type: "course", why: "Andrew Ng's canonical DL curriculum" }, { title: "Papers With Code", url: "https://paperswithcode.com", type: "reference", why: "State-of-the-art research with implementations" }],
    Expert:        [{ title: "The Elements of Statistical Learning", url: "https://hastie.su.domains/ElemStatLearn/", type: "book", why: "Graduate-level ML theory — free PDF" }],
  },
  cybersecurity: {
    Beginner:      [{ title: "TryHackMe", url: "https://tryhackme.com", type: "practice", why: "Browser-based CTF labs — perfect beginner environment" }, { title: "CompTIA Security+ Study Guide", url: "https://www.comptia.org/certifications/security", type: "course", why: "Industry entry-level security certification" }],
    Elementary:    [{ title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", type: "practice", why: "Free interactive labs for web security — OWASP Top 10 and beyond" }, { title: "HackTheBox Academy", url: "https://academy.hackthebox.com", type: "practice", why: "Structured learning paths with hands-on machines" }],
    Intermediate:  [{ title: "PentesterLab", url: "https://pentesterlab.com", type: "practice", why: "Real vulnerability exercises with source code" }, { title: "OWASP Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/", type: "reference", why: "The industry standard for web security testing" }],
    Advanced:      [{ title: "Offensive Security PEN-200 (OSCP)", url: "https://www.offsec.com/courses/pen-200/", type: "course", why: "Gold standard offensive security certification" }, { title: "Malware Traffic Analysis", url: "https://malware-traffic-analysis.net", type: "practice", why: "Real PCAP files for network forensics" }],
    Expert:        [{ title: "Azeria Labs (ARM Exploitation)", url: "https://azeria-labs.com", type: "reference", why: "Advanced binary exploitation on ARM" }],
  },
  os: {
    Beginner:      [{ title: "CS50 Computer Science (Week 0-3)", url: "https://cs50.harvard.edu/x/", type: "course", why: "Covers memory, pointers, compilation — OS foundations" }, { title: "Linux Journey", url: "https://linuxjourney.com", type: "course", why: "Learn Linux commands and OS concepts interactively" }],
    Elementary:    [{ title: "Operating Systems: Three Easy Pieces", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", type: "book", why: "Best free OS textbook — concise and readable" }, { title: "Networking Fundamentals (Cisco NetAcad)", url: "https://www.netacad.com", type: "course", why: "Structured TCP/IP networking course" }],
    Intermediate:  [{ title: "Computer Networking: A Top-Down Approach", url: "https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/", type: "book", why: "Kurose & Ross — the standard networking textbook" }, { title: "Beej's Guide to Network Programming", url: "https://beej.us/guide/bgnet/", type: "reference", why: "Practical socket programming in C" }],
    Advanced:      [{ title: "Advanced Programming in the UNIX Environment", url: "https://www.apuebook.com", type: "book", why: "Deep UNIX/Linux system programming — Stevens" }, { title: "Wireshark University", url: "https://www.wireshark.org/docs/wsug_html_chunked/", type: "tool", why: "Packet analysis for deep networking understanding" }],
    Expert:        [{ title: "Linux Kernel Development (Corbet)", url: "https://lwn.net/Kernel/LDD3/", type: "book", why: "Write kernel modules and understand internals" }],
  },
}

function getLevel(score: number) {
  return SKILL_LEVELS.find(l => score >= l.min) ?? SKILL_LEVELS[SKILL_LEVELS.length - 1]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { domain, questions, score, timeTaken } = parsed.data
    const level = getLevel(score)
    const resources = RESOURCES[domain]?.[level.label] ?? []

    // Identify weak and strong topics from wrong answers
    const wrongTopics = questions.filter(q => !q.isCorrect).map(q => q.topic)
    const rightTopics = questions.filter(q => q.isCorrect).map(q => q.topic)
    const weakAreas = [...new Set(wrongTopics)]
    const strongAreas = [...new Set(rightTopics)].filter(t => !weakAreas.includes(t))

    // Save to DB (best-effort — don't fail if auth missing)
    try {
      const session = await auth()
      if (session?.user?.id) {
        await db.userProgress.create({
          data: {
            userId: session.user.id,
            module: "skills",
            subModule: domain,
            score,
            details: {
              level: level.label,
              correct: questions.filter(q => q.isCorrect).length,
              total: questions.length,
              weakAreas,
              strongAreas,
              timeTaken: timeTaken ?? 0,
            },
          },
        })
      }
    } catch { /* silent fail — recommendations still return */ }

    // AI-generated personalized study plan (optional, best-effort)
    let aiPlan: string | null = null
    if (process.env.GROQ_API_KEY && weakAreas.length > 0) {
      try {
        const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
        const completion = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 400,
          temperature: 0.5,
          messages: [{
            role: "user",
            content: `Student scored ${score}% (${level.label} level) in ${domain} skill assessment.
Weak areas: ${weakAreas.slice(0, 4).join(", ")}.
Strong areas: ${strongAreas.slice(0, 3).join(", ")}.
Write a 3-sentence personalized study plan. Be specific, direct, and motivating. No bullet points, just prose.`,
          }],
        })
        aiPlan = completion.choices[0]?.message?.content?.trim() ?? null
      } catch { /* silent fail */ }
    }

    return NextResponse.json({
      level: level.label,
      emoji: level.emoji,
      color: level.color,
      description: level.desc,
      score,
      weakAreas,
      strongAreas,
      resources,
      aiPlan,
    })
  } catch (err) {
    console.error("[SKILLS_SUBMIT]", err)
    return NextResponse.json({ error: "Failed to process results" }, { status: 500 })
  }
}
