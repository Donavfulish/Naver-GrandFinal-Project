"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function FullscreenWrapper({ children }: { children: React.ReactNode }) {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const detectFullscreen = () => {
        const domFs = Boolean(document.fullscreenElement)
        const browserFs = window.innerHeight === screen.height
        setIsFullscreen(domFs || browserFs)
    }

    useEffect(() => {
        // DOM fullscreen (via API)
        document.addEventListener("fullscreenchange", detectFullscreen)

        // Browser fullscreen (F11)
        window.addEventListener("resize", detectFullscreen)

        detectFullscreen()

        return () => {
            document.removeEventListener("fullscreenchange", detectFullscreen)
            window.removeEventListener("resize", detectFullscreen)
        }
    }, [])

    return (
        <div className="flex flex-col min-h-screen font-sans">
            {!isFullscreen && <Header />}
            <div className="flex-1">{children}</div>
            {!isFullscreen && <Footer />}
        </div>
    )
}
