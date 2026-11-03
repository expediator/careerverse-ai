import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "CareerVerse AI — AI-Powered Career Preparation",
    template: "%s | CareerVerse AI",
  },
  description:
    "Master interviews, aptitude tests, technical skills, and personality development with AI-powered coaching. From student to job-ready.",
  keywords: ["career preparation", "AI interview", "aptitude test", "placement", "mock interview"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
