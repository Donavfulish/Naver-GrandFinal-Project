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
import SpacePreviewModal from "../onboarding/SpacePreviewModal" // Đảm bảo import SpacePreviewModal
import { useSessionStore, StickyNote } from "@/lib/store" 

interface ViewSpacePageProps {
    space: SpaceData & { 
        sessionStartTime?: number, 
        id?: string,
        initialSettings?: SettingsPreview // Thêm type cho initialSettings
    } 
    activeMode?: boolean
}

export default function ViewSpacePage({ space, activeMode = true }: ViewSpacePageProps) {
    const router = useRouter()
    const [sessionDuration, setSessionDuration] = useState(0)
    const [showSettings, setShowSettings] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    
    // Logic mới: Hiển thị Preview Modal nếu finalSettings chưa có (nghĩa là lần đầu vào ViewSpacePage)
    const [showPreviewModal, setShowPreviewModal] = useState(false) 
    const [isConfirming, setIsConfirming] = useState(false) // Trạng thái cho nút Confirm trong Preview

    const { finalSettings, setFinalSettings } = useSessionStore();

    // Sử dụng initialSettings nếu có, nếu không thì dùng data từ space và fallback
    const initialBackgroundUrl = space.initialSettings?.background || finalSettings?.background || space.background?.url || "/images/default-bg.jpg"
    const initialTextFontName = space.initialSettings?.clockFont || finalSettings?.clockFont || space.text_font?.font_name || "Inter"
    const initialClockStyle = space.initialSettings?.clockStyle || finalSettings?.clockStyle || space.clock_font?.style || "minimal"
    
    const [preview, setPreview] = useState<SettingsPreview>({
        clockStyle: initialClockStyle as any, // Cần ép kiểu nếu style là string
        clockFont: initialTextFontName,
        background: initialBackgroundUrl,
        layout: "centered-blur",
    })

    const clockFontFamily = getFontFamily(preview.clockFont);

    useEffect(() => {
        // Nếu đây là lần đầu vào ViewSpacePage (chưa có finalSettings)
        if (space.sessionStartTime && !finalSettings) { 
            setShowPreviewModal(true); // Hiển thị Preview Modal
        }
        
        // Timer tính thời gian session (giữ nguyên)
        if (space.sessionStartTime) {
            const interval = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - space.sessionStartTime!) / 1000))
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [space.sessionStartTime, finalSettings]) 
    
    // Thao tác Confirm từ SpacePreviewModal
    const handlePreviewConfirm = () => {
        setIsConfirming(true); // Bắt đầu trạng thái Confirming
        // Thường sẽ có một API call để lưu session settings
        // Giả lập delay 1s
        setTimeout(() => {
            setFinalSettings(preview); // Lưu settings hiện tại vào session store
            setShowPreviewModal(false); // Ẩn modal
            setIsConfirming(false); 
        }, 1000); 
    }

    // Thao tác Regenerate (chuyển về màn hình OnboardingChat, không cần thay đổi)
    const handleRegenerate = () => {
        // Chuyển hướng người dùng về trang Dashboard (hoặc trang Onboarding chính)
        router.push('/') 
    }
    
    // ... (Các hàm khác: formatTime, detectFullscreen, layoutStyle, handlePreviewChange, handleSave) ...
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return h > 0 ? `${h}h ${m}m ${s}s` : `${m}:${s.toString().padStart(2, "0")}`
    }

    const detectFullscreen = () => {
        const domFs = Boolean(document.fullscreenElement)
        const browserFs = window.innerHeight === screen.height
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

    const layoutStyle = useMemo(() => ({
        clockClass: "absolute top-[15%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center",
        playerClass: "absolute top-[50%] left-1/2 -translate-x-1/2 z-30 w-full max-w-sm",
        backdropClass: "bg-black/20 backdrop-blur-sm",
    }), [])

    const handlePreviewChange = (p: Partial<SettingsPreview>) =>
        setPreview(prev => ({ ...prev, ...p }))

    const handleSave = (p: SettingsPreview) => {
        setPreview(p); 
        setShowSettings(false);
        setFinalSettings(p); // Cập nhật finalSettings khi lưu từ SettingPanel
    }
    // ... (Kết thúc các hàm khác) ...


    const artistName = space.playlist?.name || space.name
    const isSessionEnded = !!space.AiGeneratedContent

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            <AnimatePresence>
                {/* HIỂN THỊ PREVIEW MODAL KHI MỚI VÀO VIEWSPACEPAGE */}
                {showPreviewModal && (
                    <SpacePreviewModal 
                        space={space} 
                        onConfirm={handlePreviewConfirm} // Xác nhận chuyển vào Space
                        onRegenerate={handleRegenerate} // Quay về OnboardingChat
                        isConfirming={isConfirming} 
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

            {/* Các thành phần còn lại của Space chỉ hiển thị nếu KHÔNG có Preview Modal */}
            {!showPreviewModal && (
                <>
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-6 py-4 text-white">
                        <div>Session: <span className="text-[#C7A36B]">{formatTime(sessionDuration)}</span></div>
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
                                {/* HIỂN THỊ CÁC THÔNG ĐIỆP GIỚI THIỆU TỪ API (đã xem ở IntroModal) */}
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
                        isSessionEnded={isSessionEnded}
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
                </>
            )}
        </div>
    )
}