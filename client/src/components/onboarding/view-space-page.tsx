// ViewSpacePage.tsx
"use client"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
    Settings
} from "lucide-react"
import SettingsPanel, { SettingsPreview } from "../space/setting-panel"
import RealClock from "../space/clock"
import StickyNoteCanvas from "../space/sticky-note-canvas"
import { useRouter } from "next/navigation"
import CheckoutModal from "../space/checkout-modal"
import { SpaceData } from "@/types/space"
import { getFontFamily } from '@/utils/fonts'
import MusicPlayer from "../space/musicplayer"
import IntroModal from "../space/intro-modal" // Import Intro Modal
import { useSessionStore, StickyNote } from "@/lib/store" // Import store

interface ViewSpacePageProps {
    // space.id sẽ không tồn tại nếu là session mới từ Onboarding
    space: SpaceData & { sessionStartTime?: number, id?: string } 
    activeMode?: boolean
}

export default function ViewSpacePage({ space, activeMode = true }: ViewSpacePageProps) {
    const router = useRouter()
    const [sessionDuration, setSessionDuration] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    const [showIntro, setShowIntro] = useState(false) // State quản lý Intro Modal
    
    const { finalSettings, setFinalSettings } = useSessionStore();

    // 1. LẤY CẤU HÌNH BAN ĐẦU (Ưu tiên FinalSettings nếu tồn tại)
    const initialBackgroundUrl = finalSettings?.background || space.background?.url || "/images/default-bg.jpg"
    const initialTextFontName = finalSettings?.clockFont || space.text_font?.font_name || "Inter"
    const initialClockStyle = finalSettings?.clockStyle || space.clock_font?.style || "minimal"
    
    // Khởi tạo state Preview
    const [preview, setPreview] = useState<SettingsPreview>({
        clockStyle: initialClockStyle,
        clockFont: initialTextFontName,
        background: initialBackgroundUrl,
        layout: "centered-blur",
    })

    const clockFontFamily = getFontFamily(preview.clockFont);

    // 2. LOGIC QUẢN LÝ SESSION VÀ INTRO MODAL
    useEffect(() => {
        // Nếu đây là lần đầu tiên vào ViewSpacePage (sessionStartTime vừa được set)
        // và finalSettings chưa được lưu (chưa hoàn thành Intro/Save Settings lần đầu)
        if (space.sessionStartTime && !finalSettings) { 
            setShowIntro(true);
        }
        
        // Timer cho session duration
        if (space.sessionStartTime) {
            const interval = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - space.sessionStartTime!) / 1000))
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [space.sessionStartTime, finalSettings]) 
    
    const handleIntroComplete = () => {
        setShowIntro(false);
        // LƯU CẤU HÌNH GỐC LÀM FINAL SETTINGS LẦN ĐẦU
        // (Đây là cấu hình AI nếu người dùng không mở SettingsPanel)
        setFinalSettings(preview);
    }
    // ----------------------------------------------------

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return h > 0 ? `${h}h ${m}m ${s}s` : `${m}:${s.toString().padStart(2, "0")}`
    }

    const detectFullscreen = () => {
        const domFs = Boolean(document.fullscreenElement)
        const browserFs = window.innerHeight === screen.height
        // Logic fullscreen giữ nguyên
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
    // const enterFullscreen = () => document.documentElement.requestFullscreen?.() // Không dùng

    const layoutStyle = useMemo(() => ({
        clockClass: "absolute top-[15%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center",
        playerClass: "absolute top-[50%] left-1/2 -translate-x-1/2 z-30 w-full max-w-sm",
        backdropClass: "bg-black/20 backdrop-blur-sm",
    }), [])

    const handlePreviewChange = (p: Partial<SettingsPreview>) =>
        setPreview(prev => ({ ...prev, ...p }))

    // Logic này được gọi khi nút Apply & Save trong SettingsPanel được nhấn
    const handleSave = (p: SettingsPreview) => {
        // SettingsPanel đã lưu FinalSettings vào store, ta chỉ cần cập nhật preview
        setPreview(p); 
        setShowSettings(false);
    }

    const artistName = space.playlist?.name || space.name

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            <AnimatePresence>
                {/* HIỂN THỊ INTRO MODAL */}
                {showIntro && (
                    <IntroModal
                        introPages={[space.introPage1, space.introPage2, space.introPage3]}
                        onComplete={handleIntroComplete}
                    />
                )}
            </AnimatePresence>
            
            {/* Background */}
            <Image
                src={preview.background}
                fill
                className="object-cover"
                alt="background"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E]/60 via-transparent to-[#1E1E1E]/80" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-6 py-4 text-white">
                <div>Session: <span className="text-[#C7A36B]">{formatTime(sessionDuration)}</span></div>
                {/* HIỂN THỊ TÊN SPACE */}
                <h2 className="text-lg font-semibold capitalize">{space.name} ({space.mood})</h2>
                <button
                    onClick={() => setShowCheckout(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20">
                    End Session
                </button>
            </div>

            {/* Settings Button */}
            <motion.div
                className="absolute bottom-16 right-8 z-20 flex flex-col gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition "
                >
                    <Settings size={20} />
                </button>
            </motion.div>

            {/* Sticky / Passive Mode */}
            <div className="absolute inset-0 z-10">
                {activeMode ? <StickyNoteCanvas /> : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center text-white/70">
                        {/* HIỂN THỊ CÁC THÔNG ĐIỆP GIỚI THIỆU TỪ API */}
                        <p className="text-lg font-medium">{space.introPage1}</p>
                        <p className="text-sm mt-2 max-w-md">{space.description}</p>
                    </motion.div>
                )}
            </div>

            {/* CLOCK */}
            <motion.div drag dragElastic={0.2} dragMomentum={false} className={layoutStyle.clockClass}>
                <RealClock styleType={preview.clockStyle as any} size={150} />
                <div className={`mt-4 text-center text-white/80`}>
                    <p 
                        className={`text-white text-5xl font-semibold`} 
                        style={{ fontFamily: clockFontFamily }}
                    >
                        {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p style={{ fontFamily: clockFontFamily }}>
                        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                </div>
            </motion.div>

            {/* MUSIC PLAYER */}
            <MusicPlayer
                playlist={space.playlist}
                artistName={artistName}
                playerClass={layoutStyle.playerClass}
            />

            {/* Checkout Modal */}
            {showCheckout && (
                <CheckoutModal 
                    onClose={() => setShowCheckout(false)} 
                    duration={sessionDuration} 
                    spaceData={space} 
                />
            )}

            {/* SETTINGS PANEL */}
            <SettingsPanel
                open={showSettings}
                onClose={() => setShowSettings(false)}
                initial={preview}
                onPreviewChange={handlePreviewChange}
                onSave={handleSave}
                space={space}
                spaceId={space.id || "temp-id"}
            />
        </div>
    )
}