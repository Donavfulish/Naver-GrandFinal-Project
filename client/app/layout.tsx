import type { Metadata } from "next"
import { Geist, Geist_Mono, Manrope, Inter, Orbitron, VT323 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import FullscreenWrapper from "./FullScreenWrapper"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const manrope = Manrope({ subsets: ["latin"] })

export const inter = Inter({ subsets: ["latin"] })
export const orbitron = Orbitron({ subsets: ["latin"] })
export const vt323 = VT323({ subsets: ["latin"], weight: "400" })


export const fontMap = {
    Inter: inter.className,
    Orbitron: orbitron.className,
    VT323: vt323.className,
}

export const metadata: Metadata = {
    title: "AuraSpace - Design Your Mood. Live Your Space.",
    description: "Create immersive digital environments tailored to your emotions and activities.",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: "v0.app",
    icons: {
        icon: [
            { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
            { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
            { url: "/icon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-icon.png",
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={manrope.className}>
            <body className="font-sans antialiased">
                <FullscreenWrapper>
                    {children}
                </FullscreenWrapper>
                <Analytics />
            </body>
        </html>
    )
}
