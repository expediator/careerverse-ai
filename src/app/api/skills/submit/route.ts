import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import Groq from "groq-sdk"
import { z } from "zod"
import { getSkillLevel } from "@/lib/skill-levels"

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
  level: z.string().optional(),
})

const XP_PER_CORRECT: Record<string, number> = {
  "New": 5, "Beginner": 8, "Rookie": 12, "Novice": 16,
  "Skilled": 22, "Intermediate": 30, "Expert": 40, "Super Expert": 55,
}

// Resources keyed by domain → level label
const RESOURCES: Record<string, Record<string, Array<{ title: string; url: string; type: string; why: string }>>> = {
  dsa: {
    New:          [{ title: "CS50x Introduction to Computer Science", url: "https://cs50.harvard.edu/x/", type: "course", why: "Harvard's beginner-friendly gateway — starts from zero" }, { title: "Visualgo (Algorithm Visualiser)", url: "https://visualgo.net", type: "tool", why: "Watch algorithms run step by step — ideal for absolute beginners" }],
    Beginner:     [{ title: "NeetCode DSA Roadmap", url: "https://neetcode.io/roadmap", type: "reference", why: "Structured path through every DSA topic from scratch" }, { title: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com", type: "reference", why: "Master time complexity at a glance" }, { title: "GeeksforGeeks DSA Basics", url: "https://www.geeksforgeeks.org/data-structures/", type: "reference", why: "Comprehensive articles on every basic data structure" }],
    Rookie:       [{ title: "Striver's A2Z DSA Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/", type: "practice", why: "The most structured free DSA course from basics to advanced" }, { title: "LeetCode Easy Problems (NeetCode 75 — Easy tier)", url: "https://neetcode.io/practice", type: "practice", why: "Build confidence with solvable problems before going harder" }],
    Novice:       [{ title: "NeetCode 75", url: "https://neetcode.io/practice", type: "practice", why: "Curated 75 problems covering every core pattern — interviews ready" }, { title: "CLRS Chapters 1–6 (Introduction to Algorithms)", url: "https://mitpress.mit.edu/9780262046305/", type: "book", why: "The definitive DS&A textbook for serious learners" }],
    Skilled:      [{ title: "NeetCode 150", url: "https://neetcode.io/practice", type: "practice", why: "The gold standard 150-problem list for SDE interviews" }, { title: "CSES Problem Set", url: "https://cses.fi/problemset/", type: "practice", why: "300+ quality problems covering graphs, trees, DP, and more" }],
    Intermediate: [{ title: "CP Algorithms", url: "https://cp-algorithms.com", type: "reference", why: "Advanced algorithm implementations with full explanations" }, { title: "Codeforces Div 2 Contests", url: "https://codeforces.com", type: "practice", why: "Competitive programming for speed, accuracy, and advanced patterns" }],
    Expert:       [{ title: "USACO Guide", url: "https://usaco.guide", type: "course", why: "Olympiad-level algorithms — Platinum and beyond" }, { title: "MIT 6.006 & 6.046 OCW", url: "https://ocw.mit.edu", type: "course", why: "MIT's algorithms curriculum — rigorous theoretical depth" }],
    "Super Expert": [{ title: "MIT 6.854 Advanced Algorithms", url: "https://ocw.mit.edu", type: "course", why: "Graduate-level algorithm theory — randomized, approximation, online" }, { title: "Papers We Love (Algorithms)", url: "https://paperswelove.org", type: "reference", why: "Original research papers behind modern algorithms" }],
  },
  web: {
    New:          [{ title: "The Odin Project — Foundations", url: "https://www.theodinproject.com/paths/foundations", type: "course", why: "The best free web dev curriculum — starts from absolute zero" }, { title: "freeCodeCamp Responsive Web Design", url: "https://www.freecodecamp.org", type: "course", why: "Hands-on HTML/CSS projects with certification" }],
    Beginner:     [{ title: "MDN Web Docs — HTML Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "reference", why: "The authoritative reference for all web technologies" }, { title: "CSS Tricks — Box Model & Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "reference", why: "The clearest Flexbox explanation on the web" }],
    Rookie:       [{ title: "JavaScript.info", url: "https://javascript.info", type: "reference", why: "The modern JS bible — deep, structured, and free" }, { title: "30 Days of JavaScript (freeCodeCamp)", url: "https://www.freecodecamp.org/news/30-days-of-javascript/", type: "course", why: "Daily JS challenges to build muscle memory fast" }],
    Novice:       [{ title: "Full Stack Open (University of Helsinki)", url: "https://fullstackopen.com", type: "course", why: "Free university course: React, Node, GraphQL, TypeScript — all in one" }, { title: "Traversy Media (YouTube)", url: "https://www.youtube.com/@TraversyMedia", type: "video", why: "Project-based tutorials covering every web tech" }],
    Skilled:      [{ title: "Roadmap.sh — Frontend & Backend", url: "https://roadmap.sh", type: "reference", why: "Everything you need to know to master full stack — visual map" }, { title: "CS50W Web Programming (Harvard)", url: "https://cs50.harvard.edu/web/", type: "course", why: "Harvard's web course: Django, React, APIs, security" }],
    Intermediate: [{ title: "Patterns.dev", url: "https://www.patterns.dev", type: "book", why: "Design patterns and performance patterns in modern JS/React" }, { title: "Web.dev Performance by Google", url: "https://web.dev/performance/", type: "reference", why: "Google's authoritative web performance optimization guides" }],
    Expert:       [{ title: "You Don't Know JS (YDKJS)", url: "https://github.com/getify/You-Dont-Know-JS", type: "book", why: "Deep JS internals — closures, prototypes, async — free on GitHub" }, { title: "Epic React by Kent C. Dodds", url: "https://epicreact.dev", type: "course", why: "Advanced React patterns, performance, and accessibility" }],
    "Super Expert": [{ title: "V8 Engine Blog (Google)", url: "https://v8.dev/blog", type: "reference", why: "How JavaScript actually runs at the engine level" }, { title: "TC39 Proposals (GitHub)", url: "https://github.com/tc39/proposals", type: "reference", why: "Stay at the absolute frontier of JavaScript language evolution" }],
  },
  database: {
    New:          [{ title: "SQLZoo — Interactive SQL", url: "https://sqlzoo.net", type: "practice", why: "Run SQL in the browser from zero — no setup needed" }, { title: "Khan Academy SQL", url: "https://www.khanacademy.org/computing/computer-programming/sql", type: "course", why: "Gentle visual introduction to databases and SQL" }],
    Beginner:     [{ title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course", why: "Practical SQL from SELECT to analytics — free" }, { title: "W3Schools SQL", url: "https://www.w3schools.com/sql/", type: "reference", why: "Quick reference for every SQL keyword with examples" }],
    Rookie:       [{ title: "LeetCode SQL 50", url: "https://leetcode.com/studyplan/top-sql-50/", type: "practice", why: "50 essential SQL interview problems — industry standard" }, { title: "PostgreSQL Official Tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html", type: "reference", why: "Learn the world's most advanced open-source DB directly" }],
    Novice:       [{ title: "Use The Index, Luke!", url: "https://use-the-index-luke.com", type: "reference", why: "The best free resource on SQL performance and indexes" }, { title: "Database Design Course (freeCodeCamp)", url: "https://www.freecodecamp.org/news/database-design-course-for-beginners/", type: "course", why: "ER diagrams, normalization, and schema design" }],
    Skilled:      [{ title: "Designing Data-Intensive Applications Ch.1–2", url: "https://dataintensive.net", type: "book", why: "How databases actually work under the hood — industry bible" }, { title: "CMU 15-445 Database Systems (YouTube)", url: "https://15445.courses.cs.cmu.edu", type: "course", why: "University-level DB internals — storage, indexing, query optimization" }],
    Intermediate: [{ title: "CMU 15-445 Full Course", url: "https://15445.courses.cs.cmu.edu", type: "course", why: "The most rigorous free database course available" }, { title: "High-Performance MySQL (O'Reilly)", url: "https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/", type: "book", why: "Production MySQL optimization from the experts" }],
    Expert:       [{ title: "Designing Data-Intensive Applications (Full)", url: "https://dataintensive.net", type: "book", why: "Distributed systems, replication, sharding — the definitive guide" }, { title: "PostgreSQL Internals (The Internals of PostgreSQL)", url: "https://www.interdb.jp/pg/", type: "reference", why: "Deep dive into Postgres architecture — free online" }],
    "Super Expert": [{ title: "Readings in Database Systems (Red Book)", url: "http://www.redbook.io", type: "reference", why: "The canonical collection of database research papers" }, { title: "Andy Pavlo's Keynotes (CMU)", url: "https://www.youtube.com/@CMUDatabaseGroup", type: "video", why: "State-of-the-art database research explained" }],
  },
  python: {
    New:          [{ title: "Python.org Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "course", why: "The official starting point — comprehensive and authoritative" }, { title: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com", type: "book", why: "Free book with immediately practical Python projects" }],
    Beginner:     [{ title: "Python for Everybody (Coursera — Dr. Chuck)", url: "https://www.coursera.org/specializations/python", type: "course", why: "The most popular Python course on Coursera — free to audit" }, { title: "freeCodeCamp Python Full Course (YouTube)", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "video", why: "4-hour complete Python beginner course — free" }],
    Rookie:       [{ title: "Real Python — Tutorials", url: "https://realpython.com", type: "reference", why: "Comprehensive tutorials on every Python topic imaginable" }, { title: "Exercism Python Track", url: "https://exercism.org/tracks/python", type: "practice", why: "Mentored exercises to build Python muscle memory" }],
    Novice:       [{ title: "Python OOP Tutorial (Corey Schafer, YouTube)", url: "https://www.youtube.com/@coreyms", type: "video", why: "The clearest OOP explanations for Python on YouTube" }, { title: "Python Tricks: The Book (Dan Bader)", url: "https://realpython.com/products/python-tricks-book/", type: "book", why: "Intermediate Pythonic idioms and patterns" }],
    Skilled:      [{ title: "Fluent Python (Luciano Ramalho)", url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", type: "book", why: "Idiomatic Python — how to write it properly at an advanced level" }, { title: "Python Cookbook (David Beazley)", url: "https://www.dabeaz.com/cookbook.html", type: "book", why: "Recipes for real-world Python problems — reference for professionals" }],
    Intermediate: [{ title: "High Performance Python", url: "https://www.oreilly.com/library/view/high-performance-python/9781492055013/", type: "book", why: "Profiling, optimization, async, Cython, multiprocessing" }, { title: "Python Concurrency (Real Python)", url: "https://realpython.com/python-concurrency/", type: "reference", why: "Threading, multiprocessing, asyncio — when to use which" }],
    Expert:       [{ title: "CPython Internals (Real Python)", url: "https://realpython.com/cpython-source-code-guide/", type: "reference", why: "Understand how Python works at the interpreter level" }, { title: "Python Design Patterns", url: "https://python-patterns.guide", type: "reference", why: "Gang of Four patterns in idiomatic Pythonic style" }],
    "Super Expert": [{ title: "CPython Source Code (GitHub)", url: "https://github.com/python/cpython", type: "reference", why: "Read and contribute to the Python interpreter itself" }, { title: "Writing a Python C Extension", url: "https://docs.python.org/3/extending/extending.html", type: "reference", why: "Extend Python with C for maximum performance" }],
  },
  "system-design": {
    New:          [{ title: "ByteByteGo — What Happens When You Visit a URL", url: "https://bytebytego.com", type: "reference", why: "Visual intro to how the internet and servers work" }, { title: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", type: "reference", why: "The most starred system design resource on GitHub" }],
    Beginner:     [{ title: "Roadmap.sh System Design", url: "https://roadmap.sh/system-design", type: "reference", why: "Structured path through all system design topics with visuals" }, { title: "ByteByteGo Newsletter", url: "https://bytebytego.com", type: "reference", why: "Weekly visual system design breakdowns — free newsletter" }],
    Rookie:       [{ title: "Grokking System Design (Educative)", url: "https://www.educative.io/courses/grokking-the-system-design-interview", type: "course", why: "Industry-standard interview prep course used by thousands" }, { title: "System Design Interview Vol 1 (Alex Xu)", url: "https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/B08CMF2CQF", type: "book", why: "The definitive system design interview book" }],
    Novice:       [{ title: "Tech Dummies System Design (YouTube)", url: "https://www.youtube.com/@TechDummiesNarendraL", type: "video", why: "Beginner-friendly walkthroughs of popular system design problems" }, { title: "Gaurav Sen System Design (YouTube)", url: "https://www.youtube.com/@gkcs", type: "video", why: "Clear explanations of distributed systems concepts" }],
    Skilled:      [{ title: "Designing Data-Intensive Applications (DDIA)", url: "https://dataintensive.net", type: "book", why: "The bible of distributed systems — required reading for engineers" }, { title: "AWS Architecture Center", url: "https://aws.amazon.com/architecture/", type: "reference", why: "Real-world reference architectures from AWS — production quality" }],
    Intermediate: [{ title: "System Design Interview Vol 2 (Alex Xu)", url: "https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119", type: "book", why: "Advanced design problems — payment systems, hotel booking, maps" }, { title: "Google SRE Book (Free Online)", url: "https://sre.google/sre-book/table-of-contents/", type: "book", why: "How Google engineers systems at scale — free and authoritative" }],
    Expert:       [{ title: "Martin Fowler's Architecture Blog", url: "https://martinfowler.com", type: "reference", why: "Microservices, DDD, event-driven patterns — authoritative writing" }, { title: "High Scalability Blog", url: "http://highscalability.com", type: "reference", why: "Real architecture case studies from major tech companies" }],
    "Super Expert": [{ title: "Papers We Love (Distributed Systems)", url: "https://paperswelove.org", type: "reference", why: "Original research papers — Raft, Dynamo, Spanner, Bigtable" }, { title: "The Morning Paper (archived)", url: "https://blog.acolyer.org", type: "reference", why: "Daily summaries of CS research papers by Adrian Colyer" }],
  },
  "data-science": {
    New:          [{ title: "Kaggle Learn — Python & Intro to ML", url: "https://www.kaggle.com/learn", type: "course", why: "Free hands-on micro-courses — run code in browser immediately" }, { title: "Google Data Analytics Certificate", url: "https://grow.google/certificates/data-analytics/", type: "course", why: "Structured entry-level certification from Google" }],
    Beginner:     [{ title: "StatQuest with Josh Starmer (YouTube)", url: "https://www.youtube.com/@statquest", type: "video", why: "The clearest statistics and ML explanations on the internet" }, { title: "Pandas Getting Started", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", type: "reference", why: "Official pandas tutorial — the backbone of data science in Python" }],
    Rookie:       [{ title: "Matplotlib & Seaborn Tutorial (Real Python)", url: "https://realpython.com/python-matplotlib-guide/", type: "reference", why: "Data visualization fundamentals for Python" }, { title: "Kaggle Titanic Competition", url: "https://www.kaggle.com/c/titanic", type: "practice", why: "The classic beginner competition — teaches the full EDA → model pipeline" }],
    Novice:       [{ title: "Scikit-learn Official Examples", url: "https://scikit-learn.org/stable/auto_examples/", type: "practice", why: "Learn every ML algorithm by running real examples in the browser" }, { title: "Andrew Ng ML Specialization (Coursera)", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "course", why: "The canonical ML introduction — free to audit" }],
    Skilled:      [{ title: "Hands-On ML with Scikit-Learn & Keras (Géron)", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/", type: "book", why: "The standard ML practitioner's book — practical and complete" }, { title: "fast.ai Practical Deep Learning", url: "https://fast.ai", type: "course", why: "Top-down practical DL — free university course with full code" }],
    Intermediate: [{ title: "Deep Learning Specialization (Coursera — Andrew Ng)", url: "https://www.coursera.org/specializations/deep-learning", type: "course", why: "The gold-standard deep learning curriculum — 5 courses" }, { title: "Papers With Code", url: "https://paperswithcode.com", type: "reference", why: "SOTA research with implementations — stay at the frontier" }],
    Expert:       [{ title: "The Elements of Statistical Learning (Free PDF)", url: "https://hastie.su.domains/ElemStatLearn/", type: "book", why: "Graduate-level ML theory from Stanford professors" }, { title: "MLOps Zoomcamp (DataTalks.Club)", url: "https://github.com/DataTalksClub/mlops-zoomcamp", type: "course", why: "Deploy, monitor, and maintain models in production — free" }],
    "Super Expert": [{ title: "Andrej Karpathy's Neural Networks From Scratch (YouTube)", url: "https://www.youtube.com/@AndrejKarpathy", type: "video", why: "Build GPT from scratch — the ultimate deep learning deep dive" }, { title: "Distill.pub", url: "https://distill.pub", type: "reference", why: "Beautiful interactive visualizations of cutting-edge ML research" }],
  },
  cybersecurity: {
    New:          [{ title: "TryHackMe — Pre-Security Path", url: "https://tryhackme.com/path/outline/presecurity", type: "course", why: "Browser-based labs from absolute zero — no setup required" }, { title: "Cybersecurity Basics (Cisco NetAcad)", url: "https://www.netacad.com/courses/cybersecurity", type: "course", why: "Free structured course covering CIA triad, threats, and defenses" }],
    Beginner:     [{ title: "Professor Messer Security+ (YouTube)", url: "https://www.youtube.com/@professormesser", type: "video", why: "Free CompTIA Security+ study course — clear and comprehensive" }, { title: "TryHackMe — Complete Beginner Path", url: "https://tryhackme.com/path/outline/beginner", type: "practice", why: "Guided hands-on labs covering networking, Linux, and web security basics" }],
    Rookie:       [{ title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", type: "practice", why: "Free interactive labs for every OWASP Top 10 vulnerability and beyond" }, { title: "OWASP Top 10 Guide", url: "https://owasp.org/www-project-top-ten/", type: "reference", why: "The industry-standard web security vulnerability list" }],
    Novice:       [{ title: "HackTheBox Academy", url: "https://academy.hackthebox.com", type: "practice", why: "Structured learning paths with real hands-on machines" }, { title: "PicoCTF (CTF Competitions)", url: "https://picoctf.org", type: "practice", why: "Carnegie Mellon's beginner CTF — hundreds of problems by category" }],
    Skilled:      [{ title: "PentesterLab", url: "https://pentesterlab.com", type: "practice", why: "Real vulnerability exercises with source code — pro tier is worth it" }, { title: "TCM Security Practical Ethical Hacking", url: "https://academy.tcm-sec.com", type: "course", why: "The best practical ethical hacking course for the money" }],
    Intermediate: [{ title: "OWASP Testing Guide v4", url: "https://owasp.org/www-project-web-security-testing-guide/", type: "reference", why: "The industry standard for comprehensive web application security testing" }, { title: "HackTheBox Pro Labs", url: "https://www.hackthebox.com/hacker/pro-labs", type: "practice", why: "Enterprise-grade lab environments simulating real corporate networks" }],
    Expert:       [{ title: "Offensive Security PEN-200 (OSCP)", url: "https://www.offsec.com/courses/pen-200/", type: "course", why: "The gold-standard offensive security certification — hands-on 24hr exam" }, { title: "Malware Traffic Analysis", url: "https://www.malware-traffic-analysis.net", type: "practice", why: "Real PCAP files for network forensics and incident response practice" }],
    "Super Expert": [{ title: "Azeria Labs (ARM Binary Exploitation)", url: "https://azeria-labs.com", type: "reference", why: "Advanced binary exploitation on ARM — post-exploitation and research" }, { title: "LiveOverflow (YouTube)", url: "https://www.youtube.com/@LiveOverflow", type: "video", why: "Advanced binary exploitation, CTF write-ups, and security research" }],
  },
  os: {
    New:          [{ title: "CS50x — Week 0–3 (Harvard)", url: "https://cs50.harvard.edu/x/", type: "course", why: "Covers memory, compilation, and OS fundamentals from scratch" }, { title: "Linux Journey", url: "https://linuxjourney.com", type: "course", why: "Learn Linux commands and OS concepts interactively — free" }],
    Beginner:     [{ title: "Crash Course Computer Science (YouTube)", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo", type: "video", why: "PBS series covering OS concepts visually — perfect for beginners" }, { title: "The Linux Command Line (Free Book)", url: "https://linuxcommand.org/tlcl.php", type: "book", why: "Comprehensive free book on using Linux effectively" }],
    Rookie:       [{ title: "Operating Systems: Three Easy Pieces (OSTEP)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", type: "book", why: "The best free OS textbook — concise, readable, rigorous" }, { title: "Neso Academy — OS Lectures (YouTube)", url: "https://www.youtube.com/@nesoacademy", type: "video", why: "Clear lectures on processes, scheduling, memory management" }],
    Novice:       [{ title: "Cisco NetAcad — Networking Fundamentals", url: "https://www.netacad.com", type: "course", why: "Structured TCP/IP networking course with labs — free" }, { title: "Beej's Guide to Network Programming", url: "https://beej.us/guide/bgnet/", type: "reference", why: "Practical socket programming in C — free and definitive" }],
    Skilled:      [{ title: "Computer Networking: A Top-Down Approach (Kurose & Ross)", url: "https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/", type: "book", why: "The standard university networking textbook used worldwide" }, { title: "Linux From Scratch", url: "https://www.linuxfromscratch.org", type: "practice", why: "Build a complete Linux system from source — deep OS understanding" }],
    Intermediate: [{ title: "Advanced Programming in the UNIX Environment (Stevens)", url: "https://www.apuebook.com", type: "book", why: "Deep UNIX system programming — sockets, IPC, signals, file systems" }, { title: "Wireshark Labs", url: "https://gaia.cs.umass.edu/kurose_ross/wireshark.htm", type: "practice", why: "Analyze real network packets — reinforces every networking concept" }],
    Expert:       [{ title: "Linux Kernel Development (Robert Love)", url: "https://www.informit.com/store/linux-kernel-development-9780672329463", type: "book", why: "Write kernel modules and understand Linux internals deeply" }, { title: "xv6 Operating System (MIT)", url: "https://pdos.csail.mit.edu/6.828/2023/xv6.html", type: "practice", why: "Build a real Unix-like OS in C — MIT's teaching OS" }],
    "Super Expert": [{ title: "Linux Kernel Source (GitHub)", url: "https://github.com/torvalds/linux", type: "reference", why: "Read and contribute to the most complex production codebase in existence" }, { title: "OSDev Wiki", url: "https://wiki.osdev.org", type: "reference", why: "Write a bootloader, kernel, and OS from scratch — the frontier" }],
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { domain, questions, score, timeTaken, level: difficultyLevel } = parsed.data
    const level = getSkillLevel(score)
    const correctCount = questions.filter(q => q.isCorrect).length
    const xpEarned = correctCount * (XP_PER_CORRECT[difficultyLevel ?? "Novice"] ?? 16)
    const resources = RESOURCES[domain]?.[level.label] ?? []

    const wrongTopics = questions.filter(q => !q.isCorrect).map(q => q.topic)
    const rightTopics = questions.filter(q => q.isCorrect).map(q => q.topic)
    const weakAreas = [...new Set(wrongTopics)]
    const strongAreas = [...new Set(rightTopics)].filter(t => !weakAreas.includes(t))

    // Save to DB (best-effort)
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
              difficultyLevel: difficultyLevel ?? "Novice",
              correct: correctCount,
              total: questions.length,
              xpEarned,
              weakAreas,
              strongAreas,
              timeTaken: timeTaken ?? 0,
            },
          },
        })
      }
    } catch { /* silent fail — recommendations still return */ }

    // AI personalised study plan
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
            content: `Student scored ${score}% (${level.label} level, rank ${level.rank}/8) in ${domain} skill assessment.
Weak areas: ${weakAreas.slice(0, 4).join(", ")}.
Strong areas: ${strongAreas.slice(0, 3).join(", ")}.
Write a 3-sentence personalised study plan to reach the next level. Be specific, direct, and motivating. No bullet points, just prose.`,
          }],
        })
        aiPlan = completion.choices[0]?.message?.content?.trim() ?? null
      } catch { /* silent fail */ }
    }

    return NextResponse.json({
      level: level.label,
      rank: level.rank,
      emoji: level.emoji,
      color: level.color,
      description: level.description,
      score,
      xpEarned,
      difficultyLevel: difficultyLevel ?? "Novice",
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
