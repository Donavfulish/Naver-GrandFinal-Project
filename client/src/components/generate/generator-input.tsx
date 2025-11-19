"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Sparkles } from "lucide-react"
import MicrophoneInput from "./microphone-input"

interface GeneratorInputProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

const examplePrompts = [
  "A rainy day perfect for focused studying",
  "Sunset vibes for relaxing after work",
  "Midnight code session with lo-fi beats",
  "Forest sanctuary for meditation",
]

export default function GeneratorInput({ onGenerate, isLoading }: GeneratorInputProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt)
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
    onGenerate(example)
  }

  const handleVoiceInput = (voiceText: string) => {
    setPrompt(voiceText)
    onGenerate(voiceText)
  }

  return (
    <div className="space-y-6">
      {/* Input Form with Microphone */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <motion.input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your ideal mood or environment..."
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-[#2A2A2A] border border-[#C7A36B]/30 rounded-2xl text-[#F5F5F5] placeholder-[#B3B3B3]/50 focus:outline-none focus:border-[#C7A36B] transition disabled:opacity-50 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <MicrophoneInput onVoiceInput={handleVoiceInput} />
          <motion.button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="px-6 py-4 bg-[#C7A36B] text-[#1E1E1E] rounded-2xl font-semibold hover:bg-[#D4B896] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
            <span className="hidden sm:inline">Generate</span>
          </motion.button>
        </div>
      </form>

      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <p className="text-sm text-[#B3B3B3] uppercase tracking-wide text-center">Try These Prompts</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {examplePrompts.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="px-4 py-2 bg-[#2A2A2A] text-[#B3B3B3] rounded-full text-sm hover:bg-[#C7A36B]/10 hover:text-[#C7A36B] transition disabled:opacity-50 disabled:cursor-not-allowed border border-[#C7A36B]/20 hover:border-[#C7A36B]/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={14} className="inline mr-2" />
              {example}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
