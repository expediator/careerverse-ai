"use client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SKILL_LEVELS } from "@/lib/skill-levels"
import { ArrowLeft, BookOpen, Award, PlayCircle, Zap, ExternalLink, CheckCircle2, ChevronRight } from "lucide-react"

// ────────────────────────────────────────────────────────────
// DOMAIN CONTENT
// ────────────────────────────────────────────────────────────
interface LevelTopics { what: string; topics: string[]; practise: string }
interface Cert { name: string; provider: string; level: string; cost: string; url: string; desc: string }
interface Course { name: string; platform: string; cost: string; url: string; desc: string; forLevel: string }

interface Domain {
  id: string; label: string; icon: string; color: string; bg: string; border: string
  overview: string
  outcome: string
  levelTopics: Record<string, LevelTopics>
  certs: Cert[]
  courses: Course[]
}

const DOMAINS: Record<string, Domain> = {
  dsa: {
    id: "dsa", label: "Data Structures & Algorithms", icon: "🌲",
    color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20",
    overview: "Data Structures & Algorithms is the foundation of all software engineering. It teaches you how to organise data efficiently and design step-by-step solutions to problems. Mastering DSA unlocks the ability to solve complex problems quickly — it's tested in virtually every technical interview at top companies.",
    outcome: "Write efficient code, crack coding interviews, understand time/space complexity, and reason through any algorithmic problem.",
    levelTopics: {
      New:          { what: "Understand what algorithms and data structures are — no coding yet.", topics: ["What is an algorithm?", "What is a data structure?", "Real-world examples (arrays in playlists, queues in printing)", "Why time complexity matters"], practise: "Watch a 5-min YouTube intro on 'What is an algorithm'" },
      Beginner:     { what: "Learn the very basics — arrays, loops, and how to measure efficiency.", topics: ["Arrays and how they store data", "Basic sorting (Bubble, Selection, Insertion Sort)", "Big-O notation — O(1), O(n), O(n²)", "Simple recursion (factorial, fibonacci)"], practise: "Solve LeetCode #1 Two Sum and #217 Contains Duplicate" },
      Rookie:       { what: "Tackle foundational data structures and common searching techniques.", topics: ["Strings and string operations", "Linked Lists (singly, doubly)", "Stacks and Queues", "Binary Search (O(log n))", "Two pointers pattern"], practise: "Solve 10 Easy problems on LeetCode — focus on arrays and strings" },
      Novice:       { what: "Learn non-linear structures and key problem-solving patterns.", topics: ["Hash Tables / Hash Maps", "Binary Trees and Binary Search Trees", "Tree traversal (inorder, preorder, postorder)", "Sliding Window pattern", "Merge Sort and Quick Sort analysis"], practise: "NeetCode 75 — complete the Arrays & Hashing section" },
      Skilled:      { what: "Master graphs, heaps, and complex algorithmic patterns.", topics: ["Graphs (adjacency list, adjacency matrix)", "BFS and DFS (both iterative and recursive)", "Heaps / Priority Queues", "Backtracking (subsets, permutations, N-Queens)", "Tries (prefix trees)"], practise: "NeetCode 150 — complete Trees, Graphs, and Heap sections" },
      Intermediate: { what: "Tackle dynamic programming and advanced graph algorithms.", topics: ["Dynamic Programming — memoization and tabulation", "1D DP (climbing stairs, house robber, coin change)", "2D DP (unique paths, longest common subsequence)", "Union-Find / Disjoint Set", "Topological Sort, Dijkstra's Algorithm"], practise: "CSES Problem Set — Complete Dynamic Programming section" },
      Expert:       { what: "Master advanced DP variants and complex graph algorithms.", topics: ["Knapsack variants, Interval DP, Bitmask DP", "Bellman-Ford, Floyd-Warshall", "Minimum Spanning Tree (Prim's, Kruskal's)", "Segment Trees and Fenwick Trees / BIT", "String algorithms (KMP, Rabin-Karp)"], practise: "Codeforces Div 2 Problems C and D — competitive-level" },
      "Super Expert": { what: "Research-level algorithms and competitive programming techniques.", topics: ["Suffix Arrays and Suffix Automata", "Heavy-Light Decomposition", "Convex Hull Trick, Li Chao Trees", "Network Flow (Ford-Fulkerson, Dinic's)", "Randomised algorithms, approximation algorithms"], practise: "USACO Platinum level / Codeforces Div 1" },
    },
    certs: [
      { name: "HackerRank Software Engineer Certificate", provider: "HackerRank", level: "Beginner–Intermediate", cost: "Free", url: "https://www.hackerrank.com/certificates/", desc: "Widely recognised by recruiters — tests DSA, problem solving, and coding ability" },
      { name: "Meta Coding Interview Preparation", provider: "Coursera / Meta", level: "Intermediate", cost: "Free Audit", url: "https://www.coursera.org/professional-certificates/meta-backend-developer", desc: "Meta's official prep course used internally — covers full DSA interview curriculum" },
      { name: "Google STEP / Kick Start Participation", provider: "Google", level: "Intermediate–Expert", cost: "Free", url: "https://codingcompetitions.withgoogle.com/kickstart", desc: "Competitive coding rounds that signal strong algorithmic ability to Google recruiters" },
      { name: "Algorithms Specialization", provider: "Coursera / Stanford", level: "Intermediate", cost: "Free Audit", url: "https://www.coursera.org/specializations/algorithms", desc: "Tim Roughgarden's canonical 4-course DSA series — covers theory and practice" },
    ],
    courses: [
      { name: "Striver's A2Z DSA Course", platform: "TakeUForward", cost: "Free", url: "https://takeuforward.org/strivers-a2z-dsa-course/", desc: "The most structured free DSA course — 450+ problems from basics to advanced", forLevel: "Beginner → Expert" },
      { name: "NeetCode.io Courses", platform: "NeetCode", cost: "Free / Paid", url: "https://neetcode.io", desc: "Video-based pattern-focused learning with curated LeetCode problem sets", forLevel: "Rookie → Expert" },
      { name: "Algorithms by Tim Roughgarden", platform: "Coursera / Stanford", cost: "Free Audit", url: "https://www.coursera.org/specializations/algorithms", desc: "Rigorous theory: divide & conquer, graph search, greedy, DP, NP-completeness", forLevel: "Skilled → Super Expert" },
      { name: "CS50 Introduction to CS", platform: "Harvard / edX", cost: "Free", url: "https://cs50.harvard.edu/x/", desc: "The world's best intro CS course — starts from zero, covers memory and algorithms", forLevel: "New → Beginner" },
      { name: "CSES Problem Set", platform: "CSES.fi", cost: "Free", url: "https://cses.fi/problemset/", desc: "300+ curated competitive problems — the ultimate practice resource for placements", forLevel: "Skilled → Super Expert" },
    ],
  },
  web: {
    id: "web", label: "Web Development", icon: "🌐",
    color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20",
    overview: "Web Development is the craft of building applications that run in browsers and on servers. It spans HTML/CSS for structure and styling, JavaScript for interactivity, React for building component-based UIs, and Node.js for server-side logic. It's one of the highest-demand skill sets in the job market.",
    outcome: "Build full-stack web applications, land front-end/back-end/full-stack roles, contribute to real codebases, and understand how the modern web works.",
    levelTopics: {
      New:          { what: "Understand what the web is and how browsers work.", topics: ["What is HTML, CSS, and JavaScript?", "How browsers request and render web pages", "What is a server? What is a URL?", "Frontend vs Backend vs Full Stack"], practise: "Open browser DevTools (F12) and inspect any website" },
      Beginner:     { what: "Build basic web pages with HTML and CSS.", topics: ["HTML: headings, paragraphs, links, images, lists, forms", "CSS: selectors, colours, fonts, margins, padding, border", "Box model (margin, border, padding, content)", "Semantic HTML (header, main, nav, footer, article)"], practise: "Build a personal profile page with HTML/CSS only" },
      Rookie:       { what: "Make pages responsive and start writing JavaScript.", topics: ["CSS Flexbox (arrange items in rows/columns)", "CSS Grid (2D layouts)", "JavaScript: variables, functions, loops, arrays, objects", "DOM manipulation (getElementById, querySelector, addEventListener)", "Basic responsive design (media queries)"], practise: "Build a to-do list app with vanilla JavaScript — add/delete items" },
      Novice:       { what: "Write modern JavaScript and connect to APIs.", topics: ["ES6+: arrow functions, destructuring, spread/rest, template literals", "Promises and async/await", "fetch API (GET and POST requests)", "JSON: parse and stringify", "localStorage for simple state persistence"], practise: "Build a weather app that calls a public API" },
      Skilled:      { what: "Build applications with React and connect to databases.", topics: ["React: components, JSX, props, state (useState)", "React hooks: useEffect, useRef, useContext", "Routing with React Router or Next.js App Router", "REST API integration from React", "Basic authentication (JWT, sessions)"], practise: "Build a CRUD app (notes, tasks) with React + a backend API" },
      Intermediate: { what: "Build production-quality applications with proper architecture.", topics: ["Node.js/Express backend (routes, middleware, error handling)", "Database integration (PostgreSQL, MongoDB, Prisma ORM)", "Authentication with NextAuth / OAuth", "TypeScript fundamentals for React and Node", "Testing with Jest and React Testing Library"], practise: "Build a full-stack app with auth, CRUD, and deployed on Vercel" },
      Expert:       { what: "Optimise performance, apply patterns, and understand the runtime.", topics: ["Code splitting, lazy loading, React.memo, useMemo, useCallback", "Server-Side Rendering (SSR) vs Static Site Generation (SSG)", "Web performance (Core Web Vitals, Lighthouse, bundle analysis)", "Design patterns in JavaScript (Factory, Observer, Singleton)", "Security best practices (XSS, CSRF, CSP headers, input sanitisation)"], practise: "Audit your existing app with Lighthouse and achieve 90+ in all categories" },
      "Super Expert": { what: "Understand engines, write compilers, and push the frontier of the web.", topics: ["JavaScript engine internals (V8, JIT compilation, hidden classes)", "WebAssembly — compile C/Rust to run in the browser", "Micro-frontends architecture", "Custom bundler/compiler (Babel plugins, Webpack loaders)", "Contributing to open-source frameworks (React, Next.js)"], practise: "Write a custom Babel plugin or contribute a PR to an open-source repo" },
    },
    certs: [
      { name: "freeCodeCamp Responsive Web Design", provider: "freeCodeCamp", level: "Beginner", cost: "Free", url: "https://www.freecodecamp.org/certification/", desc: "500 hours of HTML/CSS projects — widely recognised entry-level certification" },
      { name: "freeCodeCamp JavaScript Algorithms & DS", provider: "freeCodeCamp", level: "Beginner–Intermediate", cost: "Free", url: "https://www.freecodecamp.org/certification/", desc: "Covers ES6, data structures, algorithms, and OOP in JavaScript" },
      { name: "Meta Front-End Developer Professional Certificate", provider: "Coursera / Meta", level: "Intermediate", cost: "Free Audit", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer", desc: "Official Meta course — React, UX, version control, Figma, testing" },
      { name: "AWS Certified Developer Associate", provider: "AWS", level: "Intermediate", cost: "~$150 USD", url: "https://aws.amazon.com/certification/certified-developer-associate/", desc: "Cloud deployment skills every full-stack developer should have" },
    ],
    courses: [
      { name: "The Odin Project", platform: "theodinproject.com", cost: "Free", url: "https://www.theodinproject.com", desc: "The best free full-stack curriculum — HTML/CSS, JavaScript, React, Node, databases", forLevel: "New → Intermediate" },
      { name: "Full Stack Open", platform: "University of Helsinki", cost: "Free", url: "https://fullstackopen.com", desc: "University-grade course: React, Node.js, GraphQL, TypeScript, testing, CI/CD", forLevel: "Skilled → Expert" },
      { name: "CS50W Web Programming", platform: "Harvard / edX", cost: "Free", url: "https://cs50.harvard.edu/web/", desc: "Django, React, SQL, CI/CD, security — real projects from Harvard", forLevel: "Novice → Skilled" },
      { name: "JavaScript.info", platform: "javascript.info", cost: "Free", url: "https://javascript.info", desc: "The modern JavaScript bible — every concept from basics to advanced, no fluff", forLevel: "Beginner → Intermediate" },
      { name: "Epic React", platform: "Kent C. Dodds", cost: "Paid", url: "https://epicreact.dev", desc: "Advanced React patterns, performance, testing, and accessibility — worth every dollar", forLevel: "Intermediate → Super Expert" },
    ],
  },
  database: {
    id: "database", label: "SQL & Databases", icon: "🗄️",
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20",
    overview: "Databases are the persistent backbone of every application. SQL (Structured Query Language) lets you store, retrieve, and manipulate data in relational databases. Understanding indexes, joins, transactions, and query optimisation is essential for any backend role — and database questions appear in virtually every technical interview.",
    outcome: "Write complex SQL queries, design schemas, optimise slow queries, and choose between SQL and NoSQL for the right use case.",
    levelTopics: {
      New:          { what: "Understand what databases are and why they exist.", topics: ["What is a database? Why not just use files?", "Rows and columns — think of a spreadsheet", "SQL vs NoSQL — what's the difference?", "Examples: PostgreSQL, MySQL, MongoDB, SQLite"], practise: "Open SQLiteOnline.com and create a table — run your first SELECT" },
      Beginner:     { what: "Read and write data with basic SQL commands.", topics: ["SELECT, FROM, WHERE, ORDER BY, LIMIT", "INSERT INTO, UPDATE, DELETE", "Basic data types: INT, VARCHAR, DATE, BOOLEAN", "NULL values and IS NULL / IS NOT NULL"], practise: "Complete all SELECT sections on SQLZoo.net" },
      Rookie:       { what: "Combine tables and aggregate data.", topics: ["INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN", "GROUP BY and HAVING", "Aggregate functions: COUNT, SUM, AVG, MIN, MAX", "DISTINCT and deduplication", "CASE WHEN expressions"], practise: "Complete LeetCode SQL 50 — Easy problems (first 20)" },
      Novice:       { what: "Write complex queries and understand data modelling.", topics: ["Subqueries and correlated subqueries", "CTEs (WITH clause) for readable complex queries", "Indexes: what they are, why they help, when to add them", "Primary keys, foreign keys, and referential integrity", "ER diagrams and basic schema design"], practise: "LeetCode SQL 50 — complete all 50 problems" },
      Skilled:      { what: "Understand database design principles and transactions.", topics: ["Normalisation: 1NF, 2NF, 3NF, BCNF", "ACID properties: Atomicity, Consistency, Isolation, Durability", "Transactions: BEGIN, COMMIT, ROLLBACK", "Stored procedures and triggers", "Window functions: ROW_NUMBER, RANK, LAG, LEAD, PARTITION BY"], practise: "Design a schema for a real app (Twitter, Uber, Amazon) from scratch" },
      Intermediate: { what: "Optimise queries and understand database internals.", topics: ["EXPLAIN ANALYZE — read and understand query plans", "B-tree vs Hash indexes, composite indexes, partial indexes", "Query optimisation: avoiding full table scans, index-only scans", "Database replication (primary/replica)", "NoSQL basics: when to use MongoDB, Redis, or Cassandra"], practise: "Use EXPLAIN ANALYZE on 3 slow queries and rewrite them" },
      Expert:       { what: "Distributed databases and advanced architecture.", topics: ["Sharding — horizontal partitioning strategies", "CAP theorem — consistency, availability, partition tolerance", "Consistent hashing for distributed DB routing", "MVCC (Multi-Version Concurrency Control)", "Designing for scale: Instagram-scale read-heavy systems"], practise: "Read 'Designing Data-Intensive Applications' Chapters 1–5" },
      "Super Expert": { what: "Database internals, research, and custom storage.", topics: ["B-tree implementation internals — page splits, merges", "WAL (Write-Ahead Logging) for crash recovery", "LSM Trees vs B-Trees (RocksDB vs PostgreSQL)", "Query compiler theory — parsing, optimiser, execution engine", "Contributing to PostgreSQL or building a toy DB in C/Go"], practise: "Read the CMU 15-721 Advanced Database Systems course materials" },
    },
    certs: [
      { name: "Oracle Database SQL Certified Associate", provider: "Oracle", level: "Beginner–Intermediate", cost: "~$245 USD", url: "https://education.oracle.com/oracle-database-sql-certified-associate/pexam_1Z0-071", desc: "Industry-standard SQL certification recognised globally, especially in enterprise roles" },
      { name: "PostgreSQL Associate Certification", provider: "EDB", level: "Intermediate", cost: "~$200 USD", url: "https://www.enterprisedb.com/training/postgres-certification", desc: "Official PostgreSQL certification from EnterpriseDB — validates production Postgres skills" },
      { name: "MongoDB Certified Developer Associate", provider: "MongoDB", level: "Intermediate", cost: "~$150 USD", url: "https://university.mongodb.com/certification", desc: "The standard certification for NoSQL/MongoDB expertise in modern applications" },
      { name: "Microsoft Certified: Azure Database Administrator", provider: "Microsoft", level: "Intermediate–Expert", cost: "~$165 USD", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-database-administrator-associate/", desc: "Cloud database skills for Azure SQL, PostgreSQL, and MySQL — valuable for cloud roles" },
    ],
    courses: [
      { name: "SQLZoo — Interactive SQL", platform: "SQLZoo.net", cost: "Free", url: "https://sqlzoo.net", desc: "Run SQL in the browser from zero — the gentlest, most interactive SQL intro available", forLevel: "New → Rookie" },
      { name: "LeetCode SQL 50", platform: "LeetCode", cost: "Free", url: "https://leetcode.com/studyplan/top-sql-50/", desc: "50 essential SQL interview problems — the standard prep resource used by thousands", forLevel: "Novice → Skilled" },
      { name: "CMU 15-445 Database Systems", platform: "CMU (YouTube)", cost: "Free", url: "https://15445.courses.cs.cmu.edu", desc: "University-level database internals — storage engines, query optimisation, transactions", forLevel: "Intermediate → Super Expert" },
      { name: "Use The Index, Luke!", platform: "use-the-index-luke.com", cost: "Free", url: "https://use-the-index-luke.com", desc: "The best resource for understanding SQL indexes and query performance — free online book", forLevel: "Novice → Expert" },
      { name: "Designing Data-Intensive Applications", platform: "O'Reilly (Book)", cost: "Paid", url: "https://dataintensive.net", desc: "The bible of distributed systems and databases — every senior engineer has read this", forLevel: "Expert → Super Expert" },
    ],
  },
  python: {
    id: "python", label: "Python Programming", icon: "🐍",
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    overview: "Python is the most versatile programming language in the world — used for web development, data science, AI/ML, automation, scripting, and systems programming. Its clean syntax makes it ideal for beginners, while its depth (metaclasses, decorators, async) challenges even experienced engineers. Python knowledge is essential in data science, backend development, and automation roles.",
    outcome: "Write clean, idiomatic Python for scripts, web apps, data pipelines, and automation. Understand the language deeply enough to optimise and extend it.",
    levelTopics: {
      New:          { what: "Understand what Python is and write your very first lines of code.", topics: ["What is Python? Why is it popular?", "Installing Python and running scripts", "The REPL (interactive Python shell)", "print(), variables, and data types overview"], practise: "Install Python, open IDLE or a browser REPL (repl.it), and print 'Hello World'" },
      Beginner:     { what: "Master the fundamentals of Python syntax and built-in types.", topics: ["Variables and data types: int, float, str, bool", "Lists, tuples, dictionaries, sets", "if/elif/else conditional logic", "for and while loops", "Functions (def, return, arguments, defaults)"], practise: "Write a number-guessing game using random.randint and a while loop" },
      Rookie:       { what: "Write practical Python scripts that do useful things.", topics: ["List comprehensions and dict comprehensions", "File I/O: open(), read(), write(), with statement", "Error handling: try/except/finally, custom exceptions", "Modules and imports (os, sys, math, random)", "String formatting: f-strings, .format(), .join(), .split()"], practise: "Build a CSV file reader that calculates averages from a dataset" },
      Novice:       { what: "Write object-oriented Python and understand the data model.", topics: ["Classes and objects (class, __init__, self)", "Inheritance, super(), method overriding", "Dunder methods (__str__, __repr__, __len__, __eq__)", "Lambda functions, map(), filter(), sorted() with key", "Regular expressions with the re module"], practise: "Model a library system: Book, Author, Library classes with methods" },
      Skilled:      { what: "Write Pythonic code using advanced language features.", topics: ["Decorators: function and class decorators, functools.wraps", "Generators and iterators: yield, __iter__, __next__", "Context managers: with statement, __enter__ / __exit__", "Type hints and mypy for static analysis", "Virtual environments, pip, and project structure"], practise: "Write a retry decorator with exponential backoff and a context manager for timing" },
      Intermediate: { what: "Build production-quality Python with async, testing, and optimisation.", topics: ["Async/await and asyncio event loop", "Threading vs multiprocessing vs async — when to use each", "Testing with pytest: fixtures, parametrize, mocks", "Dataclasses, NamedTuple, TypedDict for structured data", "Common libraries: requests, pathlib, click, pydantic"], practise: "Build a CLI tool with click that fetches data from an API concurrently using asyncio" },
      Expert:       { what: "Understand CPython internals and write high-performance Python.", topics: ["CPython internals: GIL, reference counting, gc module", "Metaclasses and class creation protocol", "Descriptors: __get__, __set__, __delete__", "Memory profiling: tracemalloc, memory_profiler", "Profiling with cProfile and line_profiler"], practise: "Profile a slow function, identify the bottleneck, and optimise it — measure before/after" },
      "Super Expert": { what: "Extend Python, write C extensions, and contribute to CPython.", topics: ["Writing C extensions with the Python C API", "Cython for compiled Python modules", "Contributing to CPython — reading PEPs, writing patches", "Python's import system internals — __import__, importlib", "AST manipulation for metaprogramming"], practise: "Write a simple Python C extension or contribute to a major Python library" },
    },
    certs: [
      { name: "PCEP — Certified Entry-Level Python Programmer", provider: "Python Institute", level: "Beginner", cost: "~$59 USD", url: "https://pythoninstitute.org/pcep", desc: "The official entry-level Python certification — validates fundamentals and basic OOP" },
      { name: "PCAP — Certified Associate in Python Programming", provider: "Python Institute", level: "Intermediate", cost: "~$295 USD", url: "https://pythoninstitute.org/pcap", desc: "Validates Python OOP, exception handling, modules, and file processing at intermediate level" },
      { name: "Google IT Automation with Python", provider: "Coursera / Google", level: "Beginner–Intermediate", cost: "Free Audit", url: "https://www.coursera.org/professional-certificates/google-it-automation", desc: "Practical Python for IT automation: scripts, Git, debugging — comes with a Google certificate" },
      { name: "Python for Everybody Specialization", provider: "Coursera / University of Michigan", level: "Beginner", cost: "Free Audit", url: "https://www.coursera.org/specializations/python", desc: "Dr. Chuck's 5-course Python series — the most popular programming course on Coursera" },
    ],
    courses: [
      { name: "Automate the Boring Stuff with Python", platform: "automatetheboringstuff.com", cost: "Free", url: "https://automatetheboringstuff.com", desc: "Free online book — practical Python projects for web scraping, PDFs, Excel, and more", forLevel: "Beginner → Rookie" },
      { name: "Corey Schafer Python Tutorials", platform: "YouTube", cost: "Free", url: "https://www.youtube.com/@coreyms", desc: "The clearest Python tutorials on YouTube — OOP, decorators, generators, asyncio", forLevel: "Novice → Expert" },
      { name: "Fluent Python (2nd Edition)", platform: "O'Reilly (Book)", cost: "Paid", url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", desc: "The definitive guide to idiomatic Python — required reading for senior Python engineers", forLevel: "Skilled → Expert" },
      { name: "Real Python Tutorials", platform: "realpython.com", cost: "Free / Paid", url: "https://realpython.com", desc: "Comprehensive tutorials on every Python topic — from beginner projects to CPython internals", forLevel: "Beginner → Super Expert" },
      { name: "Python for Everybody", platform: "Coursera (Dr. Chuck)", cost: "Free Audit", url: "https://www.coursera.org/specializations/python", desc: "5-course specialisation from University of Michigan — databases, APIs, data visualisation", forLevel: "New → Novice" },
    ],
  },
  "system-design": {
    id: "system-design", label: "System Design", icon: "🏗️",
    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20",
    overview: "System Design is the discipline of designing large-scale distributed systems — the kind that serve millions of users, handle thousands of requests per second, and stay available 99.99% of the time. It's tested in senior engineering interviews and is fundamental to understanding how real-world software is built at scale. It requires reasoning about trade-offs rather than finding a single correct answer.",
    outcome: "Design scalable systems confidently, explain architectural trade-offs, crack system design interview rounds at senior+ levels, and understand how production systems at scale actually work.",
    levelTopics: {
      New:          { what: "Understand what system design means and what a 'system' is.", topics: ["What happens when you type a URL in a browser?", "What is a server? What is a client?", "What is an API? (Explained simply)", "The concept of load and scale — why systems need design"], practise: "Draw a diagram of what happens when you visit google.com" },
      Beginner:     { what: "Learn the fundamental building blocks of any web system.", topics: ["Client-server architecture", "HTTP/HTTPS — how requests and responses work", "What is a REST API?", "Databases — why we need them, SQL vs NoSQL overview", "DNS — how domain names resolve to IP addresses"], practise: "Draw a simple social media system: user posts, database, API, browser" },
      Rookie:       { what: "Learn how systems handle more users and stay fast.", topics: ["Vertical vs horizontal scaling", "Load balancers — what they do and types (round robin, least connections)", "Caching basics — what to cache, where (client, CDN, server)", "CDN — Content Delivery Network explained", "Stateless vs stateful services"], practise: "Design a simple URL shortener (Bitly) — database schema, API, redirect logic" },
      Novice:       { what: "Understand distributed systems trade-offs and message passing.", topics: ["CAP Theorem — Consistency, Availability, Partition Tolerance", "SQL vs NoSQL — when to use each (trade-offs, not just definitions)", "Message queues: Kafka, RabbitMQ — pub/sub pattern", "Microservices vs monolith — advantages and when to choose each", "API gateway — what it does and why you need it"], practise: "Design a rate limiter: token bucket algorithm, Redis backend, API integration" },
      Skilled:      { what: "Apply concepts to design real interview-style systems.", topics: ["Consistent hashing — how it enables horizontal DB scaling", "Database sharding strategies (range, hash, directory-based)", "Read replicas — read-heavy workload optimisation", "Designing a cache (LRU eviction, write-through vs write-back)", "Real-time features: WebSockets vs Server-Sent Events vs polling"], practise: "Design Instagram: uploads, feeds, follows, CDN, caching — draw the full diagram" },
      Intermediate: { what: "Design complex systems with focus on reliability and observability.", topics: ["Event-driven architecture — event sourcing, CQRS", "Distributed transactions — 2-phase commit, saga pattern", "Observability: logging (structured), metrics (RED method), tracing (OpenTelemetry)", "Multi-region deployments — geo-routing, active-active vs active-passive", "SLA/SLO/SLI — defining and measuring reliability"], practise: "Design Twitter: tweets, timelines, trending, notifications, search — justify every choice" },
      Expert:       { what: "Reason about consensus, failure modes, and large-scale reliability.", topics: ["Raft and Paxos — distributed consensus algorithms", "Vector clocks and logical time — causality in distributed systems", "Bloom filters, HyperLogLog — probabilistic data structures", "Backpressure and flow control in distributed pipelines", "Chaos engineering — Netflix Chaos Monkey, failure injection testing"], practise: "Read the Amazon Dynamo paper and the Google Bigtable paper — summarise each" },
      "Super Expert": { what: "Novel design, research-level distributed systems.", topics: ["Designing systems with no prior art — inventing new solutions", "Global-scale consensus (Google Spanner, TrueTime)", "Formal verification of distributed protocols", "Research papers: Raft, Dynamo, Spanner, Zanzibar, TAO", "Contributing to distributed systems open source (etcd, CockroachDB)"], practise: "Design a global-scale system (like Google Maps or Stripe) with full trade-off analysis" },
    },
    certs: [
      { name: "AWS Solutions Architect Associate", provider: "AWS", level: "Intermediate", cost: "~$150 USD", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", desc: "The most sought-after cloud certification — validates architectural reasoning on AWS" },
      { name: "Google Professional Cloud Architect", provider: "Google Cloud", level: "Expert", cost: "~$200 USD", url: "https://cloud.google.com/learn/certification/cloud-architect", desc: "Google's architecture certification — covers scalability, reliability, and security at scale" },
      { name: "AWS Solutions Architect Professional", provider: "AWS", level: "Expert", cost: "~$300 USD", url: "https://aws.amazon.com/certification/certified-solutions-architect-professional/", desc: "Advanced cloud architecture for complex, multi-account enterprise systems" },
      { name: "Grokking Modern System Design", provider: "Educative.io", level: "Intermediate", cost: "~$60/mo", url: "https://www.educative.io/courses/grokking-modern-system-design-interview", desc: "Not a formal cert but the most widely used paid system design prep course" },
    ],
    courses: [
      { name: "System Design Primer", platform: "GitHub (Free)", cost: "Free", url: "https://github.com/donnemartin/system-design-primer", desc: "The most starred system design resource on GitHub — covers every topic with examples", forLevel: "New → Skilled" },
      { name: "ByteByteGo (Alex Xu)", platform: "bytebytego.com", cost: "Paid", url: "https://bytebytego.com", desc: "System Design Interview books and newsletters — visual, practical, industry-standard", forLevel: "Rookie → Expert" },
      { name: "Gaurav Sen System Design (YouTube)", platform: "YouTube", cost: "Free", url: "https://www.youtube.com/@gkcs", desc: "Clear explanations of distributed systems and design problems — free and excellent", forLevel: "Novice → Intermediate" },
      { name: "Designing Data-Intensive Applications", platform: "O'Reilly (Book)", cost: "Paid", url: "https://dataintensive.net", desc: "The definitive book on distributed systems — every serious engineer reads this", forLevel: "Intermediate → Super Expert" },
      { name: "Google SRE Book", platform: "sre.google (Free)", cost: "Free", url: "https://sre.google/sre-book/table-of-contents/", desc: "How Google actually builds and runs systems at scale — free online", forLevel: "Expert → Super Expert" },
    ],
  },
  "data-science": {
    id: "data-science", label: "Data Science & ML", icon: "📊",
    color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20",
    overview: "Data Science combines statistics, programming, and domain knowledge to extract insights from data. Machine Learning extends this by building models that learn from data to make predictions and decisions. Together, they power recommendation systems, fraud detection, natural language processing, computer vision, and much more — it's one of the highest-paying fields in tech.",
    outcome: "Build end-to-end ML pipelines, perform exploratory data analysis, train and evaluate models, deploy them in production, and communicate findings clearly.",
    levelTopics: {
      New:          { what: "Understand what data science and ML actually are.", topics: ["What is data science? Real examples (Netflix recommendations, spam filters)", "What is machine learning? (teaching computers from examples)", "Python vs R — which to learn first", "What does a data scientist actually do day to day?"], practise: "Watch '3Blue1Brown: But what is a neural network?' on YouTube — 20 mins" },
      Beginner:     { what: "Learn the core Python tools for data analysis.", topics: ["NumPy: arrays, operations, broadcasting", "Pandas: DataFrames, Series, read_csv, head, describe", "Data cleaning: handling nulls (dropna, fillna), duplicates", "Basic matplotlib: line charts, bar charts, scatter plots"], practise: "Load the Titanic dataset from Kaggle — print shape, check nulls, describe statistics" },
      Rookie:       { what: "Explore data and engineer features for modelling.", topics: ["Exploratory Data Analysis (EDA) — patterns, distributions, correlations", "Seaborn: heatmaps, histograms, pairplots", "Feature engineering: creating new columns, encoding categoricals", "Train/test split (train_test_split from scikit-learn)", "Basic statistics: mean, median, std, skewness, correlation"], practise: "Complete the Kaggle Titanic competition — build a simple model with 75%+ accuracy" },
      Novice:       { what: "Train and evaluate supervised learning models.", topics: ["Linear Regression — assumptions, coefficients, R²", "Logistic Regression — classification, probability output", "Decision Trees — splits, depth, overfitting", "Model evaluation: accuracy, precision, recall, F1-score, ROC-AUC", "Cross-validation (k-fold) — avoiding data leakage"], practise: "Train a logistic regression model on any classification dataset — tune threshold, plot ROC" },
      Skilled:      { what: "Master ensemble methods and unsupervised learning.", topics: ["Random Forests — bagging, feature importance", "Gradient Boosting, XGBoost, LightGBM", "K-Means Clustering and how to choose K (elbow method)", "PCA (Principal Component Analysis) for dimensionality reduction", "Hyperparameter tuning: GridSearchCV, RandomizedSearchCV"], practise: "Win a Kaggle competition with a top-30% score using XGBoost + feature engineering" },
      Intermediate: { what: "Build neural networks and understand deep learning fundamentals.", topics: ["Neural networks: neurons, layers, weights, activation functions", "Backpropagation and gradient descent — how networks learn", "Keras/PyTorch — build a simple MLP and CNN", "Regularisation: dropout, L1/L2, batch normalisation", "Convolutional Neural Networks (CNNs) for image classification"], practise: "Train a CNN on MNIST or CIFAR-10 — achieve 98%+ on MNIST" },
      Expert:       { what: "Work with transformers, MLOps, and production ML systems.", topics: ["Attention mechanism and Transformer architecture (BERT, GPT basics)", "Transfer learning — fine-tuning pre-trained models", "MLOps: model serving, versioning, monitoring, drift detection", "Feature stores and ML pipelines (MLflow, DVC)", "A/B testing for ML models — statistical significance"], practise: "Fine-tune a Hugging Face model on a custom text classification task and deploy it" },
      "Super Expert": { what: "Research-level ML and building novel architectures.", topics: ["Reading and implementing research papers (ArXiv)", "Custom loss functions, custom optimisers, custom layers", "Distributed training (DDP, FSDP, model parallelism)", "Mixture of Experts (MoE), RLHF, Constitutional AI", "Contributing to PyTorch, Hugging Face, or publishing ML research"], practise: "Implement a Transformer from scratch without using transformer libraries — just numpy/torch" },
    },
    certs: [
      { name: "IBM Data Science Professional Certificate", provider: "Coursera / IBM", level: "Beginner", cost: "Free Audit", url: "https://www.coursera.org/professional-certificates/ibm-data-science", desc: "9-course series covering Python, SQL, data viz, ML, and capstone — widely recognised" },
      { name: "Google Data Analytics Certificate", provider: "Coursera / Google", level: "Beginner", cost: "Paid (~$50/mo)", url: "https://grow.google/certificates/data-analytics/", desc: "Google's official data analytics certification — Excel, SQL, Tableau, R basics" },
      { name: "TensorFlow Developer Certificate", provider: "Google / TensorFlow", level: "Intermediate", cost: "~$100 USD", url: "https://www.tensorflow.org/certificate", desc: "Official Google certification testing neural networks, NLP, and computer vision with TensorFlow" },
      { name: "AWS Certified Machine Learning Specialty", provider: "AWS", level: "Expert", cost: "~$300 USD", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", desc: "Advanced certification for ML on AWS — data engineering, modelling, deployment, monitoring" },
    ],
    courses: [
      { name: "Kaggle Learn", platform: "kaggle.com/learn", cost: "Free", url: "https://www.kaggle.com/learn", desc: "Free micro-courses: Python, Pandas, ML, deep learning, SQL — run code in the browser", forLevel: "New → Skilled" },
      { name: "Andrew Ng ML Specialization", platform: "Coursera (Stanford)", cost: "Free Audit", url: "https://www.coursera.org/specializations/machine-learning-introduction", desc: "The canonical ML introduction — supervised/unsupervised learning, neural networks, best practices", forLevel: "Novice → Skilled" },
      { name: "fast.ai Practical Deep Learning", platform: "fast.ai", cost: "Free", url: "https://fast.ai", desc: "Top-down deep learning — build state-of-the-art models from lesson 1, then learn the theory", forLevel: "Skilled → Expert" },
      { name: "StatQuest (YouTube)", platform: "YouTube", cost: "Free", url: "https://www.youtube.com/@statquest", desc: "The clearest statistics and ML explanations online — statistics, ML algorithms, neural nets", forLevel: "Beginner → Intermediate" },
      { name: "Andrej Karpathy's Neural Net Zero to Hero", platform: "YouTube", cost: "Free", url: "https://www.youtube.com/@AndrejKarpathy", desc: "Build GPT from scratch — the definitive deep learning deep dive from OpenAI's former director", forLevel: "Expert → Super Expert" },
    ],
  },
  cybersecurity: {
    id: "cybersecurity", label: "Cybersecurity", icon: "🔒",
    color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20",
    overview: "Cybersecurity is the practice of protecting systems, networks, and data from attacks. It covers offensive security (finding vulnerabilities before attackers do), defensive security (building resilient systems), cryptography, network security, and digital forensics. As every system goes online, security skills are in massive demand — and severely undersupplied.",
    outcome: "Identify and exploit common vulnerabilities, build secure applications, perform penetration testing, and think like both an attacker and a defender.",
    levelTopics: {
      New:          { what: "Understand what cybersecurity is and why it matters.", topics: ["CIA Triad — Confidentiality, Integrity, Availability", "Types of attackers (script kiddie, hacktivists, APTs, insiders)", "Types of attacks (phishing, malware, ransomware, DDoS)", "Why every application has security responsibilities"], practise: "Read 'What is Phishing?' on Have I Been Pwned — check your own email for breaches" },
      Beginner:     { what: "Understand the basics of networking and encryption.", topics: ["IP addresses, ports, protocols (TCP vs UDP)", "HTTP vs HTTPS — why the 'S' matters", "What is encryption? Symmetric vs asymmetric (RSA, AES)", "Common attacks overview: phishing, MITM, social engineering"], practise: "Use the TryHackMe Pre-Security path — complete the first 3 rooms" },
      Rookie:       { what: "Learn the OWASP Top 10 web vulnerabilities.", topics: ["SQL Injection — how it works, how to prevent it", "Cross-Site Scripting (XSS) — reflected vs stored vs DOM-based", "Cross-Site Request Forgery (CSRF) — how tokens prevent it", "Authentication attacks — credential stuffing, brute force", "Broken access control — IDOR vulnerabilities"], practise: "Complete OWASP Juice Shop (owasp.org/www-project-juice-shop/) — find first 5 vulnerabilities" },
      Novice:       { what: "Understand secure coding and authentication systems.", topics: ["Password security: bcrypt/Argon2 hashing, salting, never store plaintext", "Session management: HttpOnly/Secure cookie flags, SameSite", "JWT tokens — structure, verification, pitfalls (alg:none attack)", "Input validation and output encoding", "Security headers: CSP, HSTS, X-Frame-Options"], practise: "Audit a simple web app you built — check for SQL injection, XSS, CSRF, and missing headers" },
      Skilled:      { what: "Perform basic penetration testing and use security tools.", topics: ["Penetration testing methodology: recon, scanning, exploitation, reporting", "nmap — network scanning and OS fingerprinting", "Burp Suite — intercepting and modifying HTTP requests", "Metasploit Framework — exploit modules, payloads", "CTF fundamentals — capture the flag competitions"], practise: "Complete a TryHackMe room or HackTheBox Starting Point machine end-to-end" },
      Intermediate: { what: "Advanced web exploitation and privilege escalation.", topics: ["Advanced SQL injection — blind, time-based, out-of-band", "Server-Side Request Forgery (SSRF) and XXE injection", "File upload vulnerabilities and bypasses", "Linux privilege escalation techniques", "Windows privilege escalation — UAC bypass, token impersonation"], practise: "Complete OSCP labs (TryHackMe 'Jr Penetration Tester' path) or HackTheBox Easy machines" },
      Expert:       { what: "Binary exploitation and malware analysis.", topics: ["Buffer overflows — stack smashing, NX bypass, ASLR bypass", "Return-Oriented Programming (ROP chains)", "Format string vulnerabilities", "Static malware analysis (IDA Free, Ghidra)", "Network forensics — PCAP analysis with Wireshark"], practise: "Complete OSCP or pwn.college — solve 5 binary exploitation challenges" },
      "Super Expert": { what: "Research-level exploitation and zero-day development.", topics: ["Heap exploitation (use-after-free, heap spray, tcache poisoning)", "Kernel exploitation — privilege escalation via kernel bugs", "Advanced reverse engineering with IDA Pro / Binary Ninja", "CVE research — finding new vulnerabilities in production software", "Custom C2 (Command & Control) framework development"], practise: "Find and responsibly disclose a CVE, or contribute research to a security conference" },
    },
    certs: [
      { name: "CompTIA Security+ (SY0-701)", provider: "CompTIA", level: "Beginner–Intermediate", cost: "~$392 USD", url: "https://www.comptia.org/certifications/security", desc: "The entry-level security certification required by many government and enterprise roles (DoD 8570)" },
      { name: "Google Cybersecurity Certificate", provider: "Coursera / Google", level: "Beginner", cost: "Free Audit", url: "https://grow.google/certificates/cybersecurity/", desc: "Google's official cybersecurity certificate — SIEM, IDS, Python, Linux, and network security" },
      { name: "Certified Ethical Hacker (CEH)", provider: "EC-Council", level: "Intermediate", cost: "~$950 USD", url: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/", desc: "The most recognised ethical hacking certification — offensive techniques, tools, and reporting" },
      { name: "OSCP (Offensive Security Certified Professional)", provider: "OffSec", level: "Expert", cost: "~$1499 USD", url: "https://www.offsec.com/courses/pen-200/", desc: "The gold standard offensive security certification — 24-hour practical exam on real machines" },
    ],
    courses: [
      { name: "TryHackMe", platform: "tryhackme.com", cost: "Free / Paid", url: "https://tryhackme.com", desc: "Browser-based gamified CTF labs — best beginner environment, zero setup, guided paths", forLevel: "New → Skilled" },
      { name: "PortSwigger Web Security Academy", platform: "portswigger.net", cost: "Free", url: "https://portswigger.net/web-security", desc: "Free interactive labs for every OWASP category — the best web security training available", forLevel: "Rookie → Intermediate" },
      { name: "TCM Security Academy", platform: "academy.tcm-sec.com", cost: "Paid (~$30/course)", url: "https://academy.tcm-sec.com", desc: "Practical ethical hacking, privilege escalation, network penetration testing — very affordable", forLevel: "Skilled → Expert" },
      { name: "HackTheBox Academy", platform: "academy.hackthebox.com", cost: "Free / Paid", url: "https://academy.hackthebox.com", desc: "Structured learning paths with real machines — industry respected, used by professionals", forLevel: "Novice → Expert" },
      { name: "pwn.college (Binary Exploitation)", platform: "pwn.college", cost: "Free", url: "https://pwn.college", desc: "Arizona State's free binary exploitation course — from beginner to advanced shellcoding", forLevel: "Expert → Super Expert" },
    ],
  },
  os: {
    id: "os", label: "OS & Networking", icon: "⚙️",
    color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20",
    overview: "Operating Systems and Networking form the foundation that every application runs on. OS concepts — processes, threads, memory management, file systems, scheduling — explain why your code behaves the way it does. Networking — TCP/IP, HTTP, DNS, sockets — explains how every internet application communicates. These are tested heavily in core CS interviews and essential for systems programming, DevOps, and infrastructure roles.",
    outcome: "Understand how your code actually runs at the OS level, debug low-level issues, configure networks, write socket programs, and reason about concurrency and performance.",
    levelTopics: {
      New:          { what: "Understand what an OS and network are at a high level.", topics: ["What does an operating system do? (resource management)", "What is a kernel? (the core of the OS)", "What is a computer network? Why do we need them?", "What happens when two computers communicate?"], practise: "Open a terminal — type 'top' or 'htop' to see processes. Observe what's running" },
      Beginner:     { what: "Learn basic OS concepts and essential Linux commands.", topics: ["Programs vs processes — what happens when you run code", "CPU scheduling overview (who gets to run and when?)", "Basic Linux commands: ls, cd, mkdir, rm, cp, mv, cat, grep", "File system structure: /, /home, /etc, /var, /tmp", "Users, permissions, chmod, chown"], practise: "Complete Linux Journey (linuxjourney.com) — Grasshopper section" },
      Rookie:       { what: "Understand process lifecycle and thread concepts.", topics: ["Process states: new → ready → running → waiting → terminated", "Context switching — how the OS saves and restores process state", "System calls — the bridge between user space and kernel space", "Threads vs processes — shared vs private memory", "IPC basics: pipes, signals, shared memory"], practise: "Write a shell script that forks a background process and monitors it with ps" },
      Novice:       { what: "Learn memory management and file system internals.", topics: ["Virtual memory — why every process thinks it has the whole address space", "Paging — fixed-size blocks mapped between virtual and physical memory", "Page tables and TLB (Translation Lookaside Buffer)", "Segmentation and memory protection", "File system concepts: inodes, directory entries, journaling (ext4, NTFS)"], practise: "Run 'cat /proc/meminfo' and 'vmstat' — interpret the output and explain each value" },
      Skilled:      { what: "Master TCP/IP networking and understand the protocol stack.", topics: ["TCP/IP model: Application, Transport, Internet, Link layers", "OSI model: all 7 layers with examples", "IP addressing, subnets, CIDR notation, private vs public IPs", "DNS resolution — recursive vs iterative, caching, TTL", "HTTP/HTTPS — request/response lifecycle, headers, status codes"], practise: "Use Wireshark to capture a DNS + HTTP request. Identify each layer in the capture" },
      Intermediate: { what: "Understand concurrency, synchronisation, and advanced networking.", topics: ["TCP vs UDP — segment structure, three-way handshake, congestion control", "Socket programming — creating TCP and UDP sockets in C or Python", "Synchronisation: mutex, semaphore, spinlock, condition variables", "Deadlock conditions (HOLD-and-WAIT, etc.) and prevention strategies", "CPU scheduling algorithms: FCFS, SJF, Round Robin, MLFQ, CFS"], practise: "Write a multi-threaded TCP echo server in Python or C — handle concurrency correctly" },
      Expert:       { what: "Understand kernel architecture and advanced networking.", topics: ["Linux kernel architecture — process scheduler (CFS), VFS, memory subsystem", "NUMA (Non-Uniform Memory Access) — performance implications", "Network namespaces, cgroups, and containers (how Docker works)", "TLS handshake internals — certificate validation, cipher negotiation", "Advanced TCP tuning: send/receive buffers, Nagle's algorithm, BBR congestion control"], practise: "Write a kernel module (kmod) that logs a message on every system call — test in a VM" },
      "Super Expert": { what: "Kernel development, custom OS components, and research.", topics: ["Writing Linux kernel modules — character devices, proc filesystem entries", "Building your own bootloader in x86 assembly", "Implementing a simple scheduler or memory allocator from scratch", "xv6 — reading and modifying a real Unix-like teaching OS", "Contributing to the Linux kernel — submitting patches to LKML"], practise: "Complete MIT 6.828 / xv6 labs — implement a basic OS component (page tables, scheduler)" },
    },
    certs: [
      { name: "CompTIA Network+ (N10-009)", provider: "CompTIA", level: "Beginner–Intermediate", cost: "~$338 USD", url: "https://www.comptia.org/certifications/network", desc: "The entry-level networking certification — OSI model, TCP/IP, routing, switching, subnetting" },
      { name: "Cisco CCNA", provider: "Cisco", level: "Intermediate", cost: "~$330 USD", url: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html", desc: "The most recognised networking certification — routing, switching, VLANs, security basics" },
      { name: "Linux Foundation Certified System Admin (LFCS)", provider: "Linux Foundation", level: "Intermediate", cost: "~$395 USD", url: "https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/", desc: "Hands-on Linux sysadmin exam — file systems, processes, networking, users, permissions" },
      { name: "Red Hat RHCSA", provider: "Red Hat", level: "Intermediate", cost: "~$400 USD", url: "https://www.redhat.com/en/services/certification/rhcsa", desc: "The enterprise Linux standard — SELinux, systemd, storage, networking — highly valued in infra roles" },
    ],
    courses: [
      { name: "Operating Systems: Three Easy Pieces (OSTEP)", platform: "ostep.org (Free Book)", cost: "Free", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", desc: "The best free OS textbook — virtualisation, concurrency, persistence — concise and rigorous", forLevel: "Rookie → Intermediate" },
      { name: "Neso Academy OS & Networks (YouTube)", platform: "YouTube", cost: "Free", url: "https://www.youtube.com/@nesoacademy", desc: "Clear structured lectures on processes, scheduling, memory, TCP/IP — ideal for GATE prep", forLevel: "Beginner → Intermediate" },
      { name: "Computer Networking: A Top-Down Approach", platform: "Pearson (Book)", cost: "Paid", url: "https://gaia.cs.umass.edu/kurose_ross/index.php", desc: "The standard university networking textbook — excellent labs and Wireshark exercises available free", forLevel: "Skilled → Expert" },
      { name: "Linux From Scratch", platform: "linuxfromscratch.org", cost: "Free", url: "https://www.linuxfromscratch.org", desc: "Build a complete Linux system from source code — the deepest possible OS learning experience", forLevel: "Intermediate → Expert" },
      { name: "MIT 6.828 Operating System Engineering", platform: "MIT OCW", cost: "Free", url: "https://pdos.csail.mit.edu/6.828/", desc: "MIT's OS course — implement a real OS (xv6) from scratch in C — used by top engineers globally", forLevel: "Expert → Super Expert" },
    ],
  },
}

const TABS = ["Learning Path", "Certifications", "Courses"] as const
type Tab = typeof TABS[number]

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const domainId = (params.domain as string) ?? "dsa"
  const domain = DOMAINS[domainId] ?? DOMAINS.dsa
  const [tab, setTab] = useState<Tab>("Learning Path")
  const [openLevel, setOpenLevel] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      {/* Hero */}
      <div className={`rounded-2xl ${domain.bg} border ${domain.border} p-6 sm:p-8`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{domain.icon}</span>
            <div>
              <h1 className={`text-2xl font-bold ${domain.color}`}>{domain.label}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">8-level progression · Quiz + Theory + Practical</p>
            </div>
          </div>
          <Link href={`/skills/assess?domain=${domainId}`}>
            <Button className="gap-2 shrink-0"><Zap className="w-4 h-4" />Assess Now</Button>
          </Link>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed mb-3">{domain.overview}</p>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-300">{domain.outcome}</p>
        </div>
      </div>

      {/* Level strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {SKILL_LEVELS.map(lvl => (
          <Badge
            key={lvl.label}
            className={`border ${lvl.badge} text-xs whitespace-nowrap cursor-pointer`}
            onClick={() => { setTab("Learning Path"); setOpenLevel(openLevel === lvl.label ? null : lvl.label) }}
          >
            {lvl.emoji} {lvl.label}
          </Badge>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? `border-current ${domain.color}`
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t === "Learning Path" && <BookOpen className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
              {t === "Certifications" && <Award className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
              {t === "Courses" && <PlayCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── LEARNING PATH ─────────────────────────────── */}
      {tab === "Learning Path" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Click any level to see exactly what to learn and practise at that stage.</p>
          {SKILL_LEVELS.map((lvl) => {
            const content = domain.levelTopics[lvl.label]
            const isOpen = openLevel === lvl.label
            return (
              <div key={lvl.label} className={`rounded-xl border ${lvl.border} overflow-hidden transition-all`}>
                <button
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors`}
                  onClick={() => setOpenLevel(isOpen ? null : lvl.label)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl shrink-0">{lvl.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`border ${lvl.badge} text-xs`}>
                          Level {lvl.rank} — {lvl.label}
                        </Badge>
                        <span className={`text-xs font-mono ${lvl.color}`}>{lvl.scoreRange}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 truncate">{content?.what}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 text-zinc-600 shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && content && (
                  <div className={`px-5 pb-5 ${lvl.bg} border-t ${lvl.border}`}>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Topics to master</p>
                        <ul className="space-y-1.5">
                          {content.topics.map(t => (
                            <li key={t} className="flex items-start gap-2 text-sm text-zinc-300">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${lvl.color} shrink-0 mt-0.5`} />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Milestone</p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{lvl.milestone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Practice exercise</p>
                          <p className={`text-sm ${lvl.color} leading-relaxed font-medium`}>{content.practise}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Next step</p>
                          <p className="text-xs text-zinc-500 leading-relaxed">{lvl.nextStep}</p>
                        </div>
                        <Link href={`/skills/assess?domain=${domainId}`}>
                          <Button size="sm" variant="outline" className={`gap-1.5 border ${lvl.border} ${lvl.color} hover:${lvl.bg}`}>
                            <Zap className="w-3.5 h-3.5" />Test at {lvl.label} level
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── CERTIFICATIONS ────────────────────────────── */}
      {tab === "Certifications" && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Recommended certifications for {domain.label} — ordered from entry-level to advanced.</p>
          {domain.certs.map(cert => (
            <Card key={cert.name} className="border-zinc-800 hover:border-zinc-600 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-zinc-100 text-sm">{cert.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{cert.provider}</Badge>
                      <Badge variant="secondary" className="text-xs">{cert.level}</Badge>
                      <span className={`text-xs font-semibold ${cert.cost === "Free" || cert.cost === "Free Audit" ? "text-emerald-400" : "text-amber-400"}`}>{cert.cost}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{cert.desc}</p>
                  </div>
                  <a href={cert.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />View
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 mt-4">
            <p className="text-xs text-zinc-500 leading-relaxed">
              <span className="text-zinc-300 font-medium">Cert strategy: </span>
              Don&apos;t chase certifications before you have practical skills. Build something real first, then certify to validate what you know. Assessors at top companies weigh projects and GitHub contributions higher than certificates — but certs open doors at mid-market companies and satisfy HR filters.
            </p>
          </div>
        </div>
      )}

      {/* ── COURSES ───────────────────────────────────── */}
      {tab === "Courses" && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Curated courses for {domain.label} — including free and paid options across all skill levels.</p>
          {domain.courses.map(course => (
            <Card key={course.name} className="border-zinc-800 hover:border-zinc-600 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-100 text-sm mb-1">{course.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className="text-xs">{course.platform}</Badge>
                      <span className={`text-xs font-semibold ${course.cost === "Free" ? "text-emerald-400" : course.cost === "Free Audit" ? "text-sky-400" : "text-amber-400"}`}>{course.cost}</span>
                      <Badge variant="secondary" className="text-xs">{course.forLevel}</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{course.desc}</p>
                  </div>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />Open
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="flex gap-3 pt-2 border-t border-zinc-800">
        <Link href="/skills">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />All Domains</Button>
        </Link>
        <Link href={`/skills/assess?domain=${domainId}`}>
          <Button className="gap-2"><Zap className="w-4 h-4" />Start {domain.label} Assessment</Button>
        </Link>
        <Link href="/skills/levels">
          <Button variant="ghost" className="gap-2 text-zinc-500 hover:text-zinc-300">Level Guide</Button>
        </Link>
      </div>
    </div>
  )
}
