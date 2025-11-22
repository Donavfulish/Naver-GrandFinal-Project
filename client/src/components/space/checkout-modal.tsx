// src/components/space/CheckoutModal.tsx
"use client"

import React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from 'next/navigation'
import { useSessionStore, SettingsPreview } from "@/lib/store"
import { useGenerateAISpace } from '@/hooks/useGenerateAiSpace'
import { useSpaceFonts } from "@/hooks/useSpaceFonts"
import { SpaceData } from "@/types/space"
import { Loader } from 'lucide-react'
import { USER_ID } from "@/lib/constants"

interface CheckoutModalProps {
    onClose: () => void
    duration: number
    spaceData: SpaceData
}

const REDIRECT_DELAY_MS = 5000;

const CheckoutModal = ({ onClose, duration, spaceData }: CheckoutModalProps) => {
    const router = useRouter()
    const {
        notes,
        finalSettings,
        resetSession,
    } = useSessionStore()

    const { clockStyles, textStyles } = useSpaceFonts();
    const { confirmSpaceGeneration, checkoutSpace } = useGenerateAISpace();

    const [step, setStep] = useState<"summary" | "packaging" | "reflection_ai">("summary")
    const [aiReflection, setAiReflection] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFinishing, setIsFinishing] = useState(false) // Trạng thái chờ redirect
    const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 3000);

    const findIdByStyleName = (styleName: string) =>
        clockStyles.find(item => item.style === styleName)?.id || null;

    const findIdByFontName = (fontName: string) =>
        textStyles.find(item => item.font_name === fontName)?.id || null;

    const notesContent = notes
        .map(n => n.text)
        .filter(text => text.trim() !== "");

    const handlePackageCapsule = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setStep("packaging");

        const finalSettingsUsed = finalSettings || {
            clockStyle: spaceData.clock_font.style || 'minimal',
            clockFont: spaceData.text_font.font_name || 'Inter',
            background: spaceData.background.url,
            layout: 'centered-blur',
        };

        const finalClockFontId = findIdByStyleName(finalSettingsUsed.clockStyle) || spaceData.clock_font.id || null;
        const finalTextFontId = findIdByFontName(finalSettingsUsed.clockFont) || spaceData.text_font.id || null;
        const finalBackgroundUrl = finalSettingsUsed.background;

        const createBody = {
            user_id: USER_ID as string,
            name: spaceData.name,
            tags: spaceData.tags,
            description: spaceData.description || null,
            mood: spaceData.mood,
            duration: duration,
            notes: notesContent,
            background_url: finalBackgroundUrl,
            clock_font_id: finalClockFontId,
            text_font_id: finalTextFontId,
            tracks: spaceData.playlist.tracks.map(t => t.id),
            prompt: spaceData.prompt || null,
        };

        let spaceId: string | undefined;

        try {
            await new Promise(r => setTimeout(r, 1000));
            const saveResult = await confirmSpaceGeneration(createBody);

            spaceId = saveResult?.data?.id;

            if (!spaceId) {
                throw new Error("Could not retrieve Space ID after saving.");
            }

            setStep("reflection_ai");
            setIsSubmitting(false);
            setIsFinishing(true);
            const checkoutResult = await checkoutSpace(spaceId);

            if (checkoutResult.success && checkoutResult.data?.content) {
                setAiReflection(checkoutResult.data.content);
            } else {
                setAiReflection("Không thể tạo Phản ánh AI. Space đã được lưu, chuyển hướng sau 3 giây.");
            }

        } catch (error) {
            console.error("Lỗi trong quá trình Lưu hoặc Checkout:", error);
            resetSession();
            router.push("/capsules");
        } finally {
            setIsFinishing(false);
        }
    }

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let countdownInterval: NodeJS.Timeout;

        if (step === "reflection_ai" && aiReflection && !isFinishing) {
            setCountdown(REDIRECT_DELAY_MS / 4000);

            countdownInterval = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            timer = setTimeout(() => {
                resetSession();
                router.push("/capsules");
            }, REDIRECT_DELAY_MS);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(countdownInterval);
        };
    }, [step, aiReflection, isFinishing, resetSession, router]);

    const handleFinishAndRedirect = () => {
        setIsFinishing(true);

        setTimeout(() => {
            resetSession();
            router.push("/capsules");
        }, 100);
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

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition border border-white/20"
                            >
                                Back (Cancel)
                            </button>
                            <button
                                onClick={handlePackageCapsule}
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                Package & Save Capsule
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ----------------- Step: Packaging Animation (Saving) ----------------- */}
                {step === "packaging" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 flex flex-col items-center justify-center min-h-64"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 relative flex items-center justify-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] rounded-full opacity-20" />
                            <motion.div
                                animate={{ scale: [0.8, 1.1, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute w-16 h-16 bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] rounded-full flex items-center justify-center text-white text-2xl"
                            >
                                <Loader size={30} className="animate-spin" />
                            </motion.div>
                        </motion.div>
                        <h2 className="text-xl font-medium text-white text-center">Packaging and Saving Space...</h2>
                    </motion.div>
                )}

                {/* ----------------- Step: AI Reflection (NEW - CHILL UI) ----------------- */}
                {step === "reflection_ai" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8 flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            <h2 className="text-4xl font-extrabold text-white tracking-tight">
                                Your Capsule Reflection 🧠
                            </h2>
                            <p className="text-white/60 text-lg">
                                Moment captured. Insight generated.
                            </p>
                        </div>

                        {/* Hiển thị Loading/Content */}
                        {isFinishing && aiReflection === "" ? (
                            <div className="flex flex-col items-center justify-center h-48 text-white/70">
                                <Loader className="animate-spin mb-3" size={32} />
                                <p className="text-lg font-medium">Generating deep insight...</p>
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.8 }}
                                    className="bg-white/5 rounded-xl p-8 border border-white/10 shadow-2xl min-h-[150px] space-y-4"
                                >
                                    {/* HIỂN THỊ NỘI DUNG TĨNH (CHILL HƠN) */}
                                    <p className="text-white text-xl font-light whitespace-pre-wrap leading-relaxed">
                                        {aiReflection || "Không có phản ánh được tạo."}
                                    </p>
                                </motion.div>

                                <div className="flex justify-between items-center pt-2">
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="text-white/50 text-sm font-medium"
                                    >
                                        {aiReflection ? `Auto redirect in ${countdown}s` : 'Redirecting now...'}
                                    </motion.p>
                                    <button
                                        onClick={handleFinishAndRedirect}
                                        disabled={isFinishing}
                                        className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50"
                                    >
                                        Go to Capsules Now
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    )
}

export default CheckoutModal