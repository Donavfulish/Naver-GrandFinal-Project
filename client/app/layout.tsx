import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const manrope = Manrope({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AuraSpace - Design Your Mood. Live Your Space.",
  description: "Create immersive digital environments tailored to your emotions and activities.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={manrope.className}>
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        {/* <Header /> */}
        <div className="flex-1">{children}</div>
        {/* <Footer /> */}
        <Analytics />
      </body>
    </html>
  )
}
