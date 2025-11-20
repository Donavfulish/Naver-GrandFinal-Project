"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Mic, MicOff } from 'lucide-react'
import { useSessionStore } from "@/lib/store"
import { generateVibeConfig } from "@/lib/ai-logic"
import { mockSpaces } from "@/lib/mock-spaces"

interface OnboardingChatProps {
    onComplete: (space: any) => void
}

export default function OnboardingChat({ onComplete }: OnboardingChatProps) {
    const [input, setInput] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const { setUserFeeling, setVibeConfig, setSessionStartTime } = useSessionStore()

    useEffect(() => { inputRef.current?.focus() }, [])

    const handleSubmit = async (text: string) => {
        if (!text.trim()) return
        setIsLoading(true)
        await new Promise(r => setTimeout(r, 1000))
        const vibe = generateVibeConfig(text)

        let baseSpace = mockSpaces[0]
        if (vibe.mood === "Creative") baseSpace = mockSpaces[2]
        else if (vibe.mood === "Energetic") baseSpace = mockSpaces[1]

        const fullSpace = {
            ...baseSpace,
            vibeConfig: vibe,
            notes: [],
            sessionStartTime: Date.now(),
            settingPanel: { theme: vibe.theme, font: vibe.font, music: vibe.music, colors: vibe.colors },
        }

        onComplete(fullSpace)
        setIsLoading(false)
    }

    const handleVoiceInput = () => {
        setIsListening(!isListening)
        if (isListening) setInput("I'm feeling overwhelmed with work")
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-8">
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
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !isLoading) { handleSubmit(input); setInput("") } }}
                                placeholder="Type how you feel..."
                                disabled={isLoading}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C7A36B]/50 focus:bg-white/10 transition"
                            />
                            <button onClick={() => handleVoiceInput()} disabled={isLoading} className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 text-white transition disabled:opacity-50">
                                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button onClick={() => { handleSubmit(input); setInput("") }} disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/50 rounded-2xl p-4 text-white font-medium transition disabled:opacity-50">
                                {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Send size={24} /></motion.div> : <Send size={24} />}
                            </button>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-white/50 uppercase tracking-wide">Quick starts</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {["I'm feeling stressed","I'm creative today","I need to focus","I want to relax"].map((prompt) => (
                                    <button key={prompt} onClick={() => { handleSubmit(prompt); setInput("") }} disabled={isLoading} className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/70 hover:text-white transition disabled:opacity-50">
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
