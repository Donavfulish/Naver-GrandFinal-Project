// src/components/space/CheckoutModal.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { useSessionStore, SettingsPreview } from "@/lib/store"
import { useGenerateAISpace, SpaceData } from '@/hooks/useGenerateAiSpace'
import { useSpaceFonts } from '@/hooks/useSpaceFonts'
import { Loader } from 'lucide-react'

interface CheckoutModalProps {
    onClose: () => void
    duration: number
    spaceData: SpaceData
}

// KHẮC PHỤC LỖI FK: SỬ DỤNG USER_ID HỢP LỆ TRONG DB
const REAL_USER_ID = "c6d60308-40b9-4706-95c4-f1cdd06726e2" // Cần đảm bảo ID này tồn tại trong DB

const CheckoutModal = ({ onClose, duration, spaceData }: CheckoutModalProps) => {
    const router = useRouter()
    const {
        notes,
        finalSettings,
        resetSession,
    } = useSessionStore()
    
    // Lấy ID mapping để gửi lên backend
    const { clockStyles, textStyles } = useSpaceFonts(); 
    const { confirmSpaceGeneration } = useGenerateAISpace();

    const [step, setStep] = useState<"summary" | "reflection" | "packaging">("summary")
    const [reflectionText, setReflectionText] = useState("")
    const [selectedTags, setSelectedTagsLocal] = useState<string[]>([])
    const [isAnimating, setIsAnimating] = useState(false) // Trạng thái animation đóng gói (packaging)
    const [isSubmitting, setIsSubmitting] = useState(false) // Trạng thái gọi API

    // Hàm tìm ID từ tên style/font (dùng cho payload)
    const findIdByStyleName = (styleName: string) => 
        clockStyles.find(item => item.style === styleName)?.id || null;

    const findIdByFontName = (fontName: string) => 
        textStyles.find(item => item.font_name === fontName)?.id || null;

    // Lấy nội dung note (string array)
    const notesContent = notes
        .map(n => n.text)
        .filter(text => text.trim() !== "");


    const handlePackageCapsule = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setIsAnimating(true); // Bắt đầu animation đóng gói
        
        // 1. Xác định cấu hình cuối cùng
        const finalSettingsUsed = finalSettings || {
            clockStyle: spaceData.clock_font.style || 'minimal',
            clockFont: spaceData.text_font.font_name || 'Inter',
            background: spaceData.background.url,
            layout: 'centered-blur',
        };
        
        // 2. Lấy các ID/URL cuối cùng
        const finalClockFontId = findIdByStyleName(finalSettingsUsed.clockStyle) || spaceData.clock_font.id || null;
        const finalTextFontId = findIdByFontName(finalSettingsUsed.clockFont) || spaceData.text_font.id || null;
        const finalBackgroundUrl = finalSettingsUsed.background;

        // 3. Xây dựng Payload
        const createBody = {
            user_id: REAL_USER_ID, // SỬ DỤNG ID HỢP LỆ
            name: spaceData.name,
            tags: spaceData.tags, // Tạm thời dùng tags gốc từ AI (có thể mở rộng UI để thay đổi tags)
            description: spaceData.description || null,
            mood: spaceData.mood, 
            duration: duration, // Tổng thời lượng session (giây)
            notes: notesContent, // Chỉ nội dung note string
            
            // Cấu hình cuối cùng
            background_url: finalBackgroundUrl,
            clock_font_id: finalClockFontId, 
            text_font_id: finalTextFontId, 
            tracks: spaceData.playlist.tracks.map(t => t.id),
            prompt: spaceData.prompt || null,
        };
        
        // --- API CALL ---
        try {
            await new Promise(r => setTimeout(r, 1000)); // Giả lập animation 1s
            await confirmSpaceGeneration(createBody);
            
            // Thành công
            console.log("Space saved successfully! Redirecting...");
            
        } catch (error) {
            console.error("Lỗi khi lưu gói:", error);
        } finally {
            setIsSubmitting(false);
            setIsAnimating(false);
            resetSession(); // Xóa session store
            router.push("/capsules"); // Chuyển hướng
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-end md:items-center justify-center p-4"
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 30 }}
                className="w-full md:w-full md:max-w-2xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
                {/* Step: Summary */}
                {step === "summary" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-white">Session Complete</h2>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#C7A36B]">{Math.floor(duration / 60)}</div>
                                <div className="text-xs text-white/60 mt-1">minutes</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#7C9A92]">{notes.length}</div>
                                <div className="text-xs text-white/60 mt-1">notes</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-white">{spaceData.mood}</div>
                                <div className="text-xs text-white/60 mt-1">mood</div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/80">Bạn đã hoàn thành một phiên làm việc/thư giãn tuyệt vời.</p>
                        </div>

                        <button
                            onClick={() => setStep("reflection")}
                            className="w-full bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-3 rounded-lg transition"
                        >
                            Continue to Reflection
                        </button>
                    </motion.div>
                )}

                {/* Step: Reflection */}
                {step === "reflection" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-white">Reflect on Your Session</h2>

                        <div className="space-y-3">
                            <p className="text-white font-medium">Bạn học được gì hôm nay?</p>
                            <textarea
                                value={reflectionText}
                                onChange={(e) => setReflectionText(e.target.value)}
                                placeholder="Your thoughts..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C7A36B]/50 min-h-24"
                            />
                        </div>

                        <div className="space-y-3">
                            <p className="text-white font-medium">Tags (Tags gốc từ AI):</p>
                            <div className="flex flex-wrap gap-2">
                                {spaceData.tags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setSelectedTagsLocal((prev) =>
                                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                                            )
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                            selectedTags.includes(tag)
                                                ? "bg-[#C7A36B] text-[#1E1E1E]"
                                                : "bg-white/10 text-white hover:bg-white/20"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep("summary")}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition border border-white/20"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep("packaging")}
                                className="flex-1 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-3 rounded-lg transition"
                            >
                                Package Capsule
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step: Packaging Animation / Final Confirm */}
                {step === "packaging" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 flex flex-col items-center justify-center min-h-64"
                    >
                        {!isAnimating ? (
                            <>
                                <h2 className="text-3xl font-bold text-white text-center">Ready to package?</h2>
                                <button
                                    onClick={handlePackageCapsule}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    Package & Save Space
                                </button>
                                <button onClick={onClose} disabled={isSubmitting} className="text-white/50 hover:text-white transition mt-2">
                                    Cancel
                                </button>
                            </>
                        ) : (
                            // Packaging Animation
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-32 h-32 relative flex items-center justify-center"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] rounded-full opacity-20" />
                                <motion.div
                                    animate={{ scale: [0.8, 1.1, 0.8] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute w-16 h-16 bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] rounded-full flex items-center justify-center text-white text-2xl"
                                >
                                    {isSubmitting ? <Loader size={30} className="animate-spin" /> : '✓'}
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    )
}

export default CheckoutModal