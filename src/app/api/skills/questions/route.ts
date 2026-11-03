import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { z } from "zod"

const schema = z.object({
  domain: z.enum(["dsa", "web", "database", "python", "system-design", "data-science", "cybersecurity", "os"]),
  type: z.enum(["theoretical", "quiz", "practical", "mixed"]).default("mixed"),
  count: z.number().min(5).max(20).default(15),
})

// Fallback questions per domain (5 each, covering theory + quiz + practical)
const FALLBACK: Record<string, Array<{ id: string; question: string; options: string[]; correctAnswer: string; explanation: string; topic: string; type: string }>> = {
  dsa: [
    { id: "d1", type: "theoretical", topic: "Big O", question: "What is the time complexity of binary search on a sorted array of n elements?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: "O(log n)", explanation: "Binary search halves the search space each step → O(log n)." },
    { id: "d2", type: "quiz", topic: "Arrays", question: "Which data structure uses LIFO (Last In First Out) ordering?", options: ["Queue", "Stack", "Heap", "Deque"], correctAnswer: "Stack", explanation: "Stack is LIFO — push/pop from the same end." },
    { id: "d3", type: "practical", topic: "Arrays", question: "What does this return? arr = [1,2,3,4,5]; arr.pop()", options: ["[1,2,3,4]", "5", "1", "None"], correctAnswer: "5", explanation: "pop() removes and returns the last element." },
    { id: "d4", type: "theoretical", topic: "Trees", question: "In a binary search tree, where are the smallest values located?", options: ["Root", "Rightmost node", "Leftmost node", "Leaves"], correctAnswer: "Leftmost node", explanation: "BST property: left < root < right, so leftmost = minimum." },
    { id: "d5", type: "quiz", topic: "Sorting", question: "Which sorting algorithm has O(n log n) worst case?", options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"], correctAnswer: "Merge Sort", explanation: "Merge Sort guarantees O(n log n) in all cases; Quick Sort is O(n²) worst case." },
    { id: "d6", type: "theoretical", topic: "Graphs", question: "BFS uses which data structure internally?", options: ["Stack", "Queue", "Heap", "Array"], correctAnswer: "Queue", explanation: "BFS explores level by level using a Queue (FIFO)." },
    { id: "d7", type: "practical", topic: "Linked List", question: "How do you find the middle of a linked list in one pass?", options: ["Count nodes then traverse half", "Two pointers: slow+fast", "Reverse and find end", "Use a hash map"], correctAnswer: "Two pointers: slow+fast", explanation: "Fast moves 2x speed of slow; when fast reaches end, slow is at middle." },
    { id: "d8", type: "quiz", topic: "DP", question: "Dynamic programming is best applied when a problem has:", options: ["Greedy substructure only", "Overlapping subproblems + optimal substructure", "No recurrence", "Only one solution"], correctAnswer: "Overlapping subproblems + optimal substructure", explanation: "DP caches solutions to subproblems (overlapping) and builds up optimal solutions." },
    { id: "d9", type: "theoretical", topic: "Heap", question: "Getting the minimum element from a min-heap is:", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correctAnswer: "O(1)", explanation: "Min-heap always keeps the minimum at the root — direct access." },
    { id: "d10", type: "practical", topic: "Hashing", question: "What is the average time complexity of lookup in a hash table?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: "O(1)", explanation: "Hash tables compute key positions directly, giving O(1) average lookup." },
  ],
  web: [
    { id: "w1", type: "theoretical", topic: "HTML", question: "Which HTML attribute makes an input field mandatory?", options: ["mandatory", "required", "validate", "must"], correctAnswer: "required", explanation: "<input required> prevents form submission if the field is empty." },
    { id: "w2", type: "quiz", topic: "CSS", question: "Which CSS property controls the stacking order of elements?", options: ["layer", "z-index", "order", "stack"], correctAnswer: "z-index", explanation: "z-index controls the z-axis (front-to-back) stacking of positioned elements." },
    { id: "w3", type: "practical", topic: "JavaScript", question: "What does typeof null return in JavaScript?", options: ["'null'", "'undefined'", "'object'", "'string'"], correctAnswer: "'object'", explanation: "typeof null === 'object' is a historical JavaScript bug that was never fixed." },
    { id: "w4", type: "theoretical", topic: "HTTP", question: "What HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], correctAnswer: "404", explanation: "404 Not Found — resource doesn't exist at the requested URL." },
    { id: "w5", type: "quiz", topic: "React", question: "In React, what triggers a component re-render?", options: ["Changing a local variable", "State or props change", "Calling any function", "Using console.log"], correctAnswer: "State or props change", explanation: "React re-renders when state (useState) or props change." },
    { id: "w6", type: "practical", topic: "CSS", question: "display: flex on a parent makes its children:", options: ["Block level", "Inline", "Flex items arranged in a flex container", "Grid items"], correctAnswer: "Flex items arranged in a flex container", explanation: "flexbox lays children in a row (default) and enables flex-specific alignment." },
    { id: "w7", type: "theoretical", topic: "REST", question: "Which HTTP method is idempotent and used to update a resource?", options: ["POST", "PUT", "PATCH", "DELETE"], correctAnswer: "PUT", explanation: "PUT replaces the entire resource and is idempotent (same result on repeat calls)." },
    { id: "w8", type: "quiz", topic: "JavaScript", question: "=== vs == in JavaScript:", options: ["Same thing", "=== checks type too", "== checks type too", "No difference in practice"], correctAnswer: "=== checks type too", explanation: "=== is strict equality (no type coercion); == coerces types before comparing." },
    { id: "w9", type: "practical", topic: "HTML/CSS", question: "Which CSS unit is relative to the viewport width?", options: ["em", "rem", "vw", "px"], correctAnswer: "vw", explanation: "1vw = 1% of the viewport width. Useful for responsive design." },
    { id: "w10", type: "theoretical", topic: "Async JS", question: "What does async/await do in JavaScript?", options: ["Runs code in parallel always", "Makes async code look synchronous", "Blocks the entire thread", "Removes the need for Promises"], correctAnswer: "Makes async code look synchronous", explanation: "async/await is syntactic sugar over Promises, making async code more readable." },
  ],
  database: [
    { id: "db1", type: "theoretical", topic: "SQL", question: "Which SQL clause is used to filter grouped results?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correctAnswer: "HAVING", explanation: "HAVING filters groups (after GROUP BY). WHERE filters rows before grouping." },
    { id: "db2", type: "quiz", topic: "Keys", question: "A foreign key in Table B references:", options: ["Any column in Table A", "The primary key of Table A", "The unique key of Table B", "An index"], correctAnswer: "The primary key of Table A", explanation: "Foreign key = a column that references the primary key of another table." },
    { id: "db3", type: "practical", topic: "SQL", question: "SELECT COUNT(*) FROM users WHERE age > 25 — what does COUNT(*) return?", options: ["Sum of ages", "Number of matching rows", "Number of all columns", "Average age"], correctAnswer: "Number of matching rows", explanation: "COUNT(*) counts all rows that match the WHERE clause." },
    { id: "db4", type: "theoretical", topic: "Normalization", question: "2NF requires:", options: ["No transitive dependencies", "No partial dependencies on composite key", "All columns are atomic", "One table per entity"], correctAnswer: "No partial dependencies on composite key", explanation: "2NF: must be in 1NF AND every non-key column must depend on the whole primary key, not part of it." },
    { id: "db5", type: "quiz", topic: "Joins", question: "INNER JOIN returns:", options: ["All rows from left table", "All rows from right table", "Only matching rows from both tables", "All rows from both tables"], correctAnswer: "Only matching rows from both tables", explanation: "INNER JOIN = intersection: only rows with a match in both tables." },
    { id: "db6", type: "practical", topic: "Indexes", question: "When should you NOT add an index to a column?", options: ["Frequently queried columns", "Primary keys", "Columns with very high cardinality", "Columns rarely used in WHERE clauses"], correctAnswer: "Columns rarely used in WHERE clauses", explanation: "Indexes speed up reads but slow down writes. Indexing rarely-queried columns wastes space." },
    { id: "db7", type: "theoretical", topic: "Transactions", question: "ACID stands for:", options: ["Atomic, Consistent, Isolated, Durable", "Automatic, Current, Independent, Definite", "Atomic, Concurrent, Integrated, Data", "All, Consistent, Integral, Distinct"], correctAnswer: "Atomic, Consistent, Isolated, Durable", explanation: "ACID properties guarantee reliable database transactions." },
    { id: "db8", type: "quiz", topic: "NoSQL", question: "MongoDB stores data as:", options: ["Tables with rows", "XML files", "JSON-like documents", "Key-value pairs only"], correctAnswer: "JSON-like documents", explanation: "MongoDB is a document database storing BSON (Binary JSON) documents." },
    { id: "db9", type: "practical", topic: "SQL", question: "Which query finds duplicate emails? SELECT email, COUNT(*) FROM users GROUP BY email ___", options: ["WHERE COUNT(*) > 1", "HAVING COUNT(*) > 1", "ORDER BY COUNT(*) DESC", "LIMIT 1"], correctAnswer: "HAVING COUNT(*) > 1", explanation: "HAVING filters after grouping. WHERE can't reference aggregate functions." },
    { id: "db10", type: "theoretical", topic: "Indexing", question: "A composite index on (A, B) is used by queries filtering on:", options: ["Only B", "Only A, or A and B", "Only A and B together", "Any combination"], correctAnswer: "Only A, or A and B", explanation: "Composite indexes use the leftmost prefix rule: can use (A) or (A,B) but not (B) alone." },
  ],
  python: [
    { id: "p1", type: "theoretical", topic: "OOP", question: "What is encapsulation in Python OOP?", options: ["Inheriting from a parent class", "Hiding internal state behind methods", "Defining multiple methods with same name", "Creating instances"], correctAnswer: "Hiding internal state behind methods", explanation: "Encapsulation bundles data and methods, restricting direct access to internal state." },
    { id: "p2", type: "practical", topic: "Lists", question: "What does [x**2 for x in range(3)] return?", options: ["[1, 4, 9]", "[0, 1, 4]", "[0, 1, 2]", "[1, 2, 3]"], correctAnswer: "[0, 1, 4]", explanation: "range(3) = [0,1,2]. 0²=0, 1²=1, 2²=4 → [0,1,4]." },
    { id: "p3", type: "quiz", topic: "Data Types", question: "Which Python type is immutable?", options: ["list", "dict", "tuple", "set"], correctAnswer: "tuple", explanation: "Tuples cannot be modified after creation. Lists, dicts, and sets are mutable." },
    { id: "p4", type: "theoretical", topic: "Functions", question: "*args in a Python function definition means:", options: ["A required positional arg", "Variable number of keyword args", "Variable number of positional args", "A default argument"], correctAnswer: "Variable number of positional args", explanation: "*args collects extra positional arguments into a tuple." },
    { id: "p5", type: "practical", topic: "Strings", question: "What is 'hello'[::-1]?", options: ["'hello'", "'olleh'", "Error", "'h'"], correctAnswer: "'olleh'", explanation: "[::-1] slices the string in reverse order." },
    { id: "p6", type: "theoretical", topic: "Decorators", question: "A Python decorator is:", options: ["A type of loop", "A function that wraps another function", "A class method", "A data type"], correctAnswer: "A function that wraps another function", explanation: "Decorators use @syntax to wrap/extend function behavior without modifying it." },
    { id: "p7", type: "practical", topic: "Dicts", question: "d = {'a': 1}; d.get('b', 0) returns:", options: ["KeyError", "None", "0", "1"], correctAnswer: "0", explanation: ".get(key, default) returns default if key doesn't exist — no KeyError." },
    { id: "p8", type: "quiz", topic: "Generators", question: "A Python generator function uses:", options: ["return", "yield", "async", "emit"], correctAnswer: "yield", explanation: "yield produces values lazily — the function pauses and resumes at each yield." },
    { id: "p9", type: "practical", topic: "OOP", question: "def __str__(self) in a class is used to:", options: ["Initialize object", "Compare objects", "Define string representation", "Delete object"], correctAnswer: "Define string representation", explanation: "__str__ controls what str(obj) / print(obj) returns." },
    { id: "p10", type: "theoretical", topic: "Modules", question: "from os import path imports:", options: ["The entire os module", "Only the path submodule/attribute", "Creates a copy", "Nothing — invalid syntax"], correctAnswer: "Only the path submodule/attribute", explanation: "from X import Y brings only Y into the local namespace." },
  ],
  "system-design": [
    { id: "sd1", type: "theoretical", topic: "Scalability", question: "Horizontal scaling means:", options: ["Making servers more powerful", "Adding more servers", "Upgrading RAM", "Increasing CPU cores"], correctAnswer: "Adding more servers", explanation: "Horizontal (scale out) = add more machines. Vertical (scale up) = upgrade existing." },
    { id: "sd2", type: "quiz", topic: "Caching", question: "Cache eviction policy LRU stands for:", options: ["Longest Recently Used", "Least Recently Used", "Last Resource Unloaded", "Least Redundant Unit"], correctAnswer: "Least Recently Used", explanation: "LRU evicts the item not accessed for the longest time." },
    { id: "sd3", type: "practical", topic: "Load Balancing", question: "Round-robin load balancing distributes requests:", options: ["To the server with least load", "To the fastest server", "Equally in rotation", "Based on user location"], correctAnswer: "Equally in rotation", explanation: "Round-robin cycles through available servers in order." },
    { id: "sd4", type: "theoretical", topic: "CAP Theorem", question: "CAP theorem states a distributed system can guarantee at most:", options: ["All three: Consistency, Availability, Partition tolerance", "Two of three", "One of three", "None, it's always a tradeoff"], correctAnswer: "Two of three", explanation: "CAP: you can only guarantee 2 of Consistency, Availability, Partition Tolerance simultaneously." },
    { id: "sd5", type: "quiz", topic: "Databases", question: "A message queue is used to:", options: ["Speed up database queries", "Decouple producers and consumers", "Cache responses", "Route network traffic"], correctAnswer: "Decouple producers and consumers", explanation: "Message queues (Kafka, RabbitMQ) decouple services, enabling async communication." },
  ],
  "data-science": [
    { id: "ds1", type: "theoretical", topic: "ML", question: "Overfitting occurs when a model:", options: ["Performs poorly on training data", "Performs well on training but poorly on test data", "Has too few parameters", "Underfits the data"], correctAnswer: "Performs well on training but poorly on test data", explanation: "Overfit model memorizes training data and fails to generalize." },
    { id: "ds2", type: "quiz", topic: "Statistics", question: "In a normal distribution, what % of data falls within 1 standard deviation?", options: ["50%", "68%", "95%", "99.7%"], correctAnswer: "68%", explanation: "68-95-99.7 rule: 1σ=68%, 2σ=95%, 3σ=99.7%." },
    { id: "ds3", type: "practical", topic: "Pandas", question: "df.dropna() in pandas does:", options: ["Fills NaN with 0", "Drops columns with NaN", "Drops rows with any NaN", "Counts NaN values"], correctAnswer: "Drops rows with any NaN", explanation: "dropna() removes rows containing NaN by default (axis=0)." },
    { id: "ds4", type: "theoretical", topic: "ML", question: "Which algorithm is best for linearly separable data?", options: ["K-Means", "Random Forest", "SVM with linear kernel", "DBSCAN"], correctAnswer: "SVM with linear kernel", explanation: "Linear SVM finds the optimal hyperplane for linearly separable classes." },
    { id: "ds5", type: "quiz", topic: "Evaluation", question: "Precision measures:", options: ["How many actual positives were found", "Of predicted positives, how many are truly positive", "Model accuracy on test set", "Speed of model"], correctAnswer: "Of predicted positives, how many are truly positive", explanation: "Precision = TP / (TP + FP). High precision = few false positives." },
  ],
  cybersecurity: [
    { id: "cs1", type: "theoretical", topic: "Networking", question: "What does HTTPS provide over HTTP?", options: ["Faster speeds", "Encrypted communication via TLS", "Larger file transfers", "More cookies"], correctAnswer: "Encrypted communication via TLS", explanation: "HTTPS encrypts data in transit using TLS, preventing eavesdropping." },
    { id: "cs2", type: "quiz", topic: "Attacks", question: "SQL Injection exploits:", options: ["Weak passwords", "Unsanitized user input in SQL queries", "XSS vulnerabilities", "Open ports"], correctAnswer: "Unsanitized user input in SQL queries", explanation: "SQLi injects malicious SQL by manipulating unvalidated input." },
    { id: "cs3", type: "practical", topic: "Hashing", question: "Why is MD5 no longer recommended for password hashing?", options: ["Too slow", "Vulnerable to collision attacks and rainbow tables", "Not widely supported", "Too expensive"], correctAnswer: "Vulnerable to collision attacks and rainbow tables", explanation: "MD5 is fast (bad for passwords) and has known collision vulnerabilities. Use bcrypt/Argon2." },
    { id: "cs4", type: "theoretical", topic: "Auth", question: "JWT (JSON Web Token) stores user data:", options: ["In the server session", "In an encrypted database", "In the token itself (Base64 encoded)", "In cookies only"], correctAnswer: "In the token itself (Base64 encoded)", explanation: "JWT has header.payload.signature — payload contains claims, Base64 encoded." },
    { id: "cs5", type: "quiz", topic: "Firewall", question: "A stateful firewall tracks:", options: ["Only IP addresses", "Connection state to allow response traffic", "Only ports", "Usernames"], correctAnswer: "Connection state to allow response traffic", explanation: "Stateful firewalls remember active connections, permitting related return packets." },
  ],
  os: [
    { id: "os1", type: "theoretical", topic: "Processes", question: "A deadlock requires all of the following EXCEPT:", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], correctAnswer: "Preemption", explanation: "Deadlock requires: mutual exclusion, hold-and-wait, NO preemption, circular wait." },
    { id: "os2", type: "quiz", topic: "Memory", question: "Virtual memory allows a process to:", options: ["Use only physical RAM", "Use disk space as an extension of RAM", "Bypass the OS kernel", "Access other process memory"], correctAnswer: "Use disk space as an extension of RAM", explanation: "Virtual memory pages unused data to disk, giving processes more address space." },
    { id: "os3", type: "practical", topic: "Scheduling", question: "Round-robin scheduling is best when:", options: ["All processes have same priority", "Fair time-sharing is needed", "Long batch jobs dominate", "Memory is limited"], correctAnswer: "Fair time-sharing is needed", explanation: "Round-robin gives each process equal time slices — fair for interactive systems." },
    { id: "os4", type: "theoretical", topic: "Networking", question: "TCP vs UDP: which guarantees delivery?", options: ["UDP", "TCP", "Both", "Neither"], correctAnswer: "TCP", explanation: "TCP uses acknowledgments and retransmission to guarantee reliable delivery." },
    { id: "os5", type: "quiz", topic: "File Systems", question: "An inode in Unix/Linux stores:", options: ["The file name", "File metadata (size, permissions, owner)", "File content", "Directory listing"], correctAnswer: "File metadata (size, permissions, owner)", explanation: "Inodes contain metadata. File names are stored in directory entries, content in data blocks." },
  ],
}

const DOMAIN_LABELS: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  web: "Web Development",
  database: "SQL & Databases",
  python: "Python Programming",
  "system-design": "System Design",
  "data-science": "Data Science & ML",
  cybersecurity: "Cybersecurity",
  os: "OS & Networking",
}

function getFallback(domain: string, count: number) {
  const pool = FALLBACK[domain] ?? FALLBACK.dsa
  return pool.slice(0, Math.min(count, pool.length))
}

export async function POST(req: NextRequest) {
  let domain = "dsa"
  let count = 15

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
    }

    domain = parsed.data.domain
    count = parsed.data.count
    const type = parsed.data.type

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ questions: getFallback(domain, count), duration: count * 90 })
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const domainLabel = DOMAIN_LABELS[domain]
    const typeInstructions = type === "theoretical"
      ? "Focus on conceptual understanding — definitions, principles, theory."
      : type === "quiz"
      ? "Quick knowledge checks — facts, recall, short answers."
      : type === "practical"
      ? "Code output prediction, scenario analysis, problem-solving."
      : "Mix: 5 theoretical (concepts), 5 quiz (facts/recall), 5 practical (code/scenarios)."

    const prompt = `Generate ${count} skill assessment questions for ${domainLabel}.
${typeInstructions}
Questions should judge actual knowledge depth, not just surface facts.

Return ONLY a valid JSON array (no markdown fences):
[{"id":"q1","type":"theoretical","question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"clear explanation...","topic":"subtopic"}]

type field must be one of: "theoretical", "quiz", "practical"
Rules:
- 4 distinct options per question
- correctAnswer must exactly match one option
- Difficulty: mix of easy (40%), medium (40%), hard (20%)
- Cover ${count > 10 ? "breadth of subtopics" : "core subtopics"} of ${domainLabel}
Return ONLY the JSON array.`

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 5000,
      temperature: 0.35,
      messages: [{ role: "user", content: prompt }],
    })

    const text = completion.choices[0]?.message?.content ?? ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("No JSON in response")

    const questions = JSON.parse(jsonMatch[0])
    if (!Array.isArray(questions) || questions.length === 0) throw new Error("Empty questions")

    return NextResponse.json({ questions, duration: count * 90 })
  } catch (err) {
    console.error("[SKILLS_QUESTIONS]", err)
    return NextResponse.json({ questions: getFallback(domain, count), duration: count * 90 })
  }
}
