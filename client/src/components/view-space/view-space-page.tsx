// ViewSpacePage.tsx
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
import { SpaceData } from "@/hooks/useGenerateAiSpace" // Đảm bảo import interface SpaceData

interface ViewSpacePageProps {
    space: SpaceData & { sessionStartTime?: number, id?: string } // Thêm sessionStartTime & id (vì API không trả về)
    activeMode?: boolean
}

// Giả định: SettingsPanel/SettingsPreview vẫn sử dụng các trường này:
// clockStyle (string), clockFont (string), background (string URL), layout (string)

export default function ViewSpacePage({ space, activeMode = true }: ViewSpacePageProps) {
    const router = useRouter()
    const [sessionDuration, setSessionDuration] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)

    // Lấy thông tin cần thiết từ SpaceData (cấu trúc API)
    const initialBackgroundUrl = space.background?.url || "/images/default-bg.jpg" // Dùng url từ background
    const initialClockFont = space.clock_font?.style || "Inter" // Dùng style từ clock_font
    const initialClockStyle = "default" // Giả định kiểu đồng hồ mặc định nếu API không cung cấp

    const [preview, setPreview] = useState<SettingsPreview>({
        // Khởi tạo từ cấu trúc API
        clockStyle: initialClockStyle,
        clockFont: initialClockFont,
        background: initialBackgroundUrl,
        layout: "centered-blur",
    })

    useEffect(() => {
        // Kiểm tra sessionStartTime
        if (!space.sessionStartTime) {
            // Tạm thời comment out để tránh redirect trong môi trường dev nếu chưa có logic session
            // router.push("/capsules")
            // return
        }
        
        // Timer cho session duration
        if (space.sessionStartTime) {
            const interval = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - space.sessionStartTime!) / 1000))
            }, 1000)
            return () => clearInterval(interval)
        }
        
    }, [space.sessionStartTime]) // Sử dụng space.sessionStartTime

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return h > 0 ? `${h}h ${m}m ${s}s` : `${m}:${s.toString().padStart(2, "0")}`
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
        
    // Logic này cần được cập nhật để lưu cấu hình preview (thay đổi bởi người dùng) vào space object nếu cần.
    const handleSave = (p: SettingsPreview) => {
        // Cần lưu state này lên backend hoặc local state tùy theo thiết kế của bạn.
        // Ở đây, ta chỉ cập nhật object space local (chỉ là ví dụ, không phải state)
        // Object.assign(space, { 
        //     // ... cập nhật các trường tương ứng trong space object nếu có
        // });
        console.log("Settings saved:", p);
    }
    
    // Lấy thông tin bài hát hiện tại
    const currentTrack = space.playlist?.tracks?.[0]
    const trackName = currentTrack?.name || "No Track Playing"
    // Giả định artist là tên playlist nếu không có trường artist riêng
    const artistName = space.playlist?.name || space.name 

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Background */}
            <Image 
                src={preview.background} 
                fill 
                className="object-cover" 
                alt="background" 
                priority // Tải sớm ảnh nền
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
                <RealClock 
                    styleType={preview.clockStyle as any} 
                    size={150} 
                />
                <div className={`mt-4 text-center text-white/80`}>
                    <p className={`text-white text-5xl font-semibold ${preview.clockFont}`}>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                </div>
            </motion.div>

            {/* MUSIC PLAYER */}
            <motion.div drag dragElastic={0.2} dragMomentum={false} className={`${layoutStyle.playerClass} rounded-3xl p-5 border border-white/10 shadow-xl bg-black/30 backdrop-blur-2xl`}>
                {/* HIỂN THỊ DỮ LIỆU BÀI HÁT TỪ API */}
                <p className="text-white text-lg font-semibold">{trackName}</p>
                <p className="text-white/60 text-sm">{artistName}</p>
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
                // Giả định space.id cần được bổ sung trong component cha (nếu API không cung cấp)
                spaceId={space.id || "temp-id"} 
            />
        </div>
    )
}