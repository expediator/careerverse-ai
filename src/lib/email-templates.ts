function base(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px">
              🎓 CareerVerse AI
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px">
              by Expediator Inc.
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center">
              © 2026 Expediator Inc. · CareerVerse AI<br>
              <a href="https://careerverse-ai-sigma.vercel.app" style="color:#6366f1;text-decoration:none">careerverse-ai-sigma.vercel.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-top:8px">${label} →</a>`
}

// ── Welcome email ────────────────────────────────────────────────────
export function welcomeEmail({ name }: { name: string }) {
  return base(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Welcome, ${name || "future achiever"}! 🎉</h2>
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6">
      You've just unlocked your AI-powered career preparation platform. Here's what you can do right now:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${[
        ["🤖", "AI Career Coach", "Get instant answers on any topic — CS, interviews, placements."],
        ["🎤", "Mock Interviews", "Practice real questions with AI feedback and scoring."],
        ["📊", "Aptitude Tests", "Sharpen your quant, logical, and verbal skills."],
        ["📄", "Resume ATS Scan", "Upload your resume and get an ATS score in seconds."],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 12px;background:#f9fafb;border-radius:8px;margin-bottom:8px;border-left:3px solid #4f46e5;margin:0 0 8px">
            <span style="font-size:18px">${icon}</span>
            <strong style="display:block;color:#111827;font-size:14px;margin:2px 0">${title}</strong>
            <span style="color:#6b7280;font-size:13px">${desc}</span>
          </td>
        </tr>
        <tr><td style="height:8px"></td></tr>
      `).join("")}
    </table>
    ${btn("Complete your profile", "https://careerverse-ai-sigma.vercel.app/onboarding")}
    <p style="margin:20px 0 0;color:#9ca3af;font-size:13px">
      Takes 2 minutes. Your profile unlocks personalized career path recommendations.
    </p>
  `)
}

// ── OTP / Password reset ─────────────────────────────────────────────
export function otpEmail({ otp, email }: { otp: string; email: string }) {
  return base(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Reset your password</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
      We received a request to reset the password for <strong>${email}</strong>.
      Enter the code below — it expires in <strong>15 minutes</strong>.
    </p>
    <div style="text-align:center;margin:24px 0">
      <div style="display:inline-block;background:#f0f0ff;border:2px solid #4f46e5;border-radius:12px;padding:16px 40px">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#4f46e5;font-family:monospace">${otp}</span>
      </div>
    </div>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center">
      If you didn't request this, you can safely ignore this email.
    </p>
  `)
}

// ── Broadcast / announcement ─────────────────────────────────────────
export function broadcastEmail({
  subject,
  message,
  ctaLabel,
  ctaUrl,
}: {
  subject: string
  message: string
  ctaLabel?: string
  ctaUrl?: string
}) {
  return base(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#111827">${subject}</h2>
    <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-line">${message}</div>
    ${ctaLabel && ctaUrl ? `<div style="margin-top:24px">${btn(ctaLabel, ctaUrl)}</div>` : ""}
  `)
}

// ── Weekly digest ────────────────────────────────────────────────────
export function weeklyDigestEmail({
  name,
  tests,
  interviews,
  resumes,
  tipTitle,
  tipBody,
}: {
  name: string
  tests: number
  interviews: number
  resumes: number
  tipTitle: string
  tipBody: string
}) {
  const total = tests + interviews + resumes
  const hasActivity = total > 0

  return base(`
    <h2 style="margin:0 0 4px;font-size:22px;color:#111827">Your weekly recap 📅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${name || "there"}, here's how your week looked.</p>

    ${hasActivity ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        ${[
          ["📊", tests, "Aptitude Tests"],
          ["🎤", interviews, "Interviews"],
          ["📄", resumes, "Resume Scans"],
        ].map(([icon, count, label]) => `
          <td width="33%" style="text-align:center;padding:16px 8px;background:#f9fafb;border-radius:8px">
            <div style="font-size:24px">${icon}</div>
            <div style="font-size:28px;font-weight:700;color:#4f46e5;margin:4px 0">${count}</div>
            <div style="font-size:12px;color:#6b7280">${label}</div>
          </td>
        `).join('<td width="8px"></td>')}
      </tr>
    </table>
    ` : `
    <div style="text-align:center;padding:24px;background:#f9fafb;border-radius:8px;margin-bottom:24px">
      <p style="margin:0;color:#374151;font-size:15px">No activity this week — let's change that! 🚀</p>
    </div>
    `}

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-weight:600;color:#92400e;font-size:14px">💡 Tip of the week: ${tipTitle}</p>
      <p style="margin:0;color:#78350f;font-size:13px;line-height:1.6">${tipBody}</p>
    </div>

    ${btn("Continue your prep", "https://careerverse-ai-sigma.vercel.app/dashboard")}
  `)
}
