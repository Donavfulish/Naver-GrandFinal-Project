"use client"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
    SkipBack, SkipForward, Play, Pause, Settings, Maximize, MessageCircle
} from "lucide-react"
import SettingsPanel, { SettingsPreview } from "../space/setting-panel"
import RealClock from "../space/clock"
import StickyNoteCanvas from "../space/sticky-note-canvas"
import { useRouter } from "next/navigation"
import CheckoutModal from "../space/checkout-modal"
import { useSessionStore } from "@/lib/store"

interface ViewSpacePageProps {
    space: any
    activeMode?: boolean
}

export default function ViewSpacePage({ space, activeMode = true }: ViewSpacePageProps) {
    const router = useRouter()
    const [sessionDuration, setSessionDuration] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    const [preview, setPreview] = useState<SettingsPreview>({
        clockStyle: space.clockStyle,
        clockFont: space.clockFont || "Inter",
        background: space.background || space.img,
        layout: "centered-blur",
    })

    useEffect(() => {
        if (!space.sessionStartTime) {
            router.push("/capsules")
            return
        }
        const interval = setInterval(() => {
            setSessionDuration(Math.floor((Date.now() - space.sessionStartTime) / 1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [space.sessionStartTime])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return h > 0 ? `${h}h ${m}m` : `${m}:${s.toString().padStart(2, "0")}`
    }

    const detectFullscreen = () => {
        const domFs = Boolean(document.fullscreenElement)
        const browserFs = window.innerHeight === screen.height
        setIsFullscreen(domFs || browserFs)
    }
    useEffect(() => {
        window.addEventListener("resize", detectFullscreen)
        document.addEventListener("fullscreenchange", detectFullscreen)
        detectFullscreen()
        return () => {
            window.removeEventListener("resize", detectFullscreen)
            document.removeEventListener("fullscreenchange", detectFullscreen)
        }
    }, [])
    const enterFullscreen = () => document.documentElement.requestFullscreen?.()

    const layoutStyle = useMemo(() => ({
        clockClass: "absolute top-[15%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center",
        playerClass: "absolute top-[50%] left-1/2 -translate-x-1/2 z-30 w-full max-w-sm",
        backdropClass: "bg-black/20 backdrop-blur-sm",
    }), [])

    const handlePreviewChange = (p: Partial<SettingsPreview>) =>
        setPreview(prev => ({ ...prev, ...p }))
    const handleSave = (p: SettingsPreview) => {
        Object.assign(space, {
            clockStyle: p.clockStyle,
            clockFont: p.clockFont,
            background: p.background,
        })
    }

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Background */}
            <Image src={preview.background} fill className="object-cover" alt="background" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E]/60 via-transparent to-[#1E1E1E]/80" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-6 py-4 text-white">
                <div>Session: <span className="text-[#C7A36B]">{formatTime(sessionDuration)}</span></div>
                <h2 className="text-lg font-semibold capitalize">{space.vibeConfig.theme.replace(/_/g, " ")}</h2>
                <button
                    onClick={() => setShowCheckout(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20">
                    End Session
                </button>
            </div>

            {/* Sticky / Passive Mode */}
            <div className="absolute inset-0 z-10">
                {activeMode ? <StickyNoteCanvas /> : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center text-white/70">
                        <p className="text-lg font-medium">Just breathe and enjoy the moment</p>
                        <p className="text-sm mt-2 max-w-md">You're in passive mode. Let the ambience guide you.</p>
                    </motion.div>
                )}
            </div>

            {/* CLOCK */}
            <motion.div drag dragElastic={0.2} dragMomentum={false} className={layoutStyle.clockClass}>
                <RealClock styleType={preview.clockStyle as any} size={150} />
                <div className={`mt-4 text-center ${preview.clockFont}`}>
                    <p className="text-white/80">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                    <p className="text-white text-5xl font-semibold">{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
            </motion.div>

            {/* MUSIC PLAYER */}
            <motion.div drag dragElastic={0.2} dragMomentum={false} className={`${layoutStyle.playerClass} rounded-3xl p-5 border border-white/10 shadow-xl bg-black/30 backdrop-blur-2xl`}>
                <p className="text-white text-lg font-semibold">{space.currentTrack}</p>
                <p className="text-white/60 text-sm">{space.artist}</p>
                <input type="range" min={0} max={100} value={40} onChange={() => { }} className="w-full accent-white mt-2" />
                <div className="flex justify-between text-white/50 text-xs mt-1"><span>2:49</span><span>5:56</span></div>
                <div className="flex items-center justify-center gap-10 mt-4 text-white">
                    <button><SkipBack size={28} /></button>
                    <button onClick={() => setIsPlaying(v => !v)}>{isPlaying ? <Pause size={40} /> : <Play size={40} />}</button>
                    <button><SkipForward size={28} /></button>
                </div>
            </motion.div>
            {/* Checkout Modal */}
            {showCheckout && (
                <CheckoutModal onClose={() => setShowCheckout(false)} duration={sessionDuration} />
            )}
            {/* SETTINGS PANEL */}
            <SettingsPanel
                open={showSettings}
                onClose={() => setShowSettings(false)}
                initial={preview}
                onPreviewChange={handlePreviewChange}
                onSave={handleSave}
                spaceId={space.id}
            />
        </div>
    )
}
