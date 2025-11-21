// OnboardingChat.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion" // Import AnimatePresence
import { Send } from "lucide-react"

// Import Hook và Components mới
import { useGenerateAISpace, SpaceData } from "@/hooks/useGenerateAiSpace" 
import AILoadingModal from "../view-space/AILoadingModal"
import SpacePreviewModal from "./SpacePreviewModal"

// Giả định userId được lấy từ context/store
const MOCK_USER_ID = "cca57402-8009-4dcb-b0ff-348268a00213" 

interface OnboardingChatProps { 
    onComplete: (space: SpaceData & { sessionStartTime: number }) => void 
}

export default function OnboardingChat({ onComplete }: OnboardingChatProps) {
    const [input, setInput] = useState("")
    const [lastPrompt, setLastPrompt] = useState("") // Lưu prompt cuối cùng
    const [generatedSpace, setGeneratedSpace] = useState<SpaceData | null>(null)
    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false) // Trạng thái gọi API Confirm
    
    const inputRef = useRef<HTMLInputElement>(null)
    
    const { generateSpace, confirmSpaceGeneration, isGenerating: isLoading } = useGenerateAISpace()

    useEffect(() => { inputRef.current?.focus() }, [])

    const handleGenerate = async (text: string) => {
        if (!text.trim() || isLoading) return
        
        setLastPrompt(text)
        setGeneratedSpace(null)
        setShowPreviewModal(false)

        try {
            // 1. Gọi hook để gọi API và nhận SpaceData (Modal Loading sẽ hiện tự động qua state isLoading)
            const spaceData = await generateSpace(text)
            
            // 2. Lưu space data và hiện modal preview
            setGeneratedSpace(spaceData)
            setShowPreviewModal(true)
        } catch (error) {
            console.error("Error during space generation:", error)
            alert("Could not generate space. Please check the console for details.")
        }
    }
    
    const handleConfirm = async () => {
        if (!generatedSpace || isConfirming) return

        setIsConfirming(true)

        try {
            // 1. Gọi API Confirm
            const confirmResult = await confirmSpaceGeneration(generatedSpace, MOCK_USER_ID)
            
            // 2. Chuyển sang giao diện Space (onComplete)
            const finalSpace = {
                ...generatedSpace,
                sessionStartTime: Date.now(), // Thêm trường sessionStartTime trước khi chuyển
            }
            onComplete(finalSpace)

        } catch (error) {
            console.error("Error confirming space:", error)
            alert("Failed to confirm space. Please try again.")
            setIsConfirming(false)
        }
        // Note: Không cần setIsConfirming(false) nếu onComplete chuyển trang thành công.
    }
    
    const handleRegenerate = () => {
        // Đóng modal preview và quay lại giao diện nhập prompt
        setGeneratedSpace(null)
        setShowPreviewModal(false)
        inputRef.current?.focus()
    }
    
    // Hàm này được gọi từ input và quick starts
    const handleSubmit = (text: string) => {
        handleGenerate(text)
        setInput("") // Reset input sau khi submit
    }


    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-2xl mx-auto">
            
            <AnimatePresence>
                {/* 1. MODAL LOADING */}
                {isLoading && <AILoadingModal prompt={lastPrompt} />}
                
                {/* 2. MODAL PREVIEW */}
                {showPreviewModal && generatedSpace && (
                    <SpacePreviewModal 
                        space={generatedSpace} 
                        onConfirm={handleConfirm} 
                        onRegenerate={handleRegenerate} 
                        isConfirming={isConfirming}
                    />
                )}
            </AnimatePresence>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-8">
                    {/* ... (Phần tiêu đề và mô tả giữ nguyên) ... */}
                    <div className="text-center space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            How are you{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C7A36B] to-[#7C9A92]">
                                feeling
                            </span>{" "}
                            today?
                        </h1>
                        <p className="text-white/60 text-lg">Share what's on your mind. We'll create a space for you.</p>
                    </div>
                    
                    {/* Input và Quick Starts */}
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { 
                                    if (e.key === "Enter" && !isLoading && !showPreviewModal) { 
                                        handleSubmit(input);
                                    } 
                                }}
                                placeholder="Type how you feel..."
                                disabled={isLoading || showPreviewModal}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C7A36B]/50 focus:bg-white/10 transition"
                            />
                            <button 
                                onClick={() => handleSubmit(input)} 
                                disabled={isLoading || !input.trim() || showPreviewModal} 
                                className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/50 rounded-2xl p-4 text-white font-medium transition disabled:opacity-50"
                            >
                                {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Send size={24} /></motion.div> : <Send size={24} />}
                            </button>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-white/50 uppercase tracking-wide">Quick starts</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {["I'm feeling stressed","I'm creative today","I need to focus","I want to relax"].map((prompt) => (
                                    <button 
                                        key={prompt} 
                                        onClick={() => handleSubmit(prompt)} 
                                        disabled={isLoading || showPreviewModal} 
                                        className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/70 hover:text-white transition disabled:opacity-50"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 opacity-50">
                            {[0,1,2].map(i => <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 2, delay: i*0.3, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[#C7A36B]" />)}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}