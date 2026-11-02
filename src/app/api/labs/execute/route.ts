import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code, language } = await req.json()

    // Judge0 integration — requires JUDGE0_API_KEY
    const judgeKey = process.env.JUDGE0_API_KEY
    const judgeUrl = process.env.JUDGE0_URL ?? "https://judge0-ce.p.rapidapi.com"

    if (!judgeKey) {
      return NextResponse.json({
        output: "Code execution requires Judge0 API.\n\nSetup:\n1. Sign up at rapidapi.com\n2. Subscribe to Judge0 CE\n3. Add JUDGE0_API_KEY to .env.local\n\nAlternatively, use the AI assistant to debug your code logic.",
        error: null,
      })
    }

    const LANGUAGE_IDS: Record<string, number> = {
      python: 71,
      javascript: 63,
      java: 62,
      cpp: 54,
      c: 50,
      sql: 82,
    }

    const langId = LANGUAGE_IDS[language]
    if (!langId) {
      return NextResponse.json({ output: "Language not supported for execution.", error: null })
    }

    const submitRes = await fetch(`${judgeUrl}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": judgeKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: btoa(code),
        encoding: "base64",
      }),
    })

    const { token } = await submitRes.json()

    await new Promise(r => setTimeout(r, 2000))

    const resultRes = await fetch(`${judgeUrl}/submissions/${token}?base64_encoded=true`, {
      headers: {
        "X-RapidAPI-Key": judgeKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    })
    const result = await resultRes.json()

    const output = result.stdout ? atob(result.stdout) : ""
    const error = result.stderr ? atob(result.stderr) : result.compile_output ? atob(result.compile_output) : ""

    return NextResponse.json({ output: output || error || "No output", error: null })
  } catch (err) {
    console.error("[CODE_EXECUTE]", err)
    return NextResponse.json({ output: "Execution failed. Please check the Judge0 configuration.", error: null })
  }
}
