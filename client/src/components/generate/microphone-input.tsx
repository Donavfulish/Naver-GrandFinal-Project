"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mic } from "lucide-react"

interface MicrophoneInputProps {
  onVoiceInput: (text: string) => void
}

export default function MicrophoneInput({ onVoiceInput }: MicrophoneInputProps) {
  const [isListening, setIsListening] = useState(false)

  const handleMicrophoneClick = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        onVoiceInput("Create a calm space for meditation")
      }, 2000)
    }
  }

  return (
    <motion.button
      onClick={handleMicrophoneClick}
      className={`p-4 rounded-2xl transition flex items-center justify-center ${
        isListening
          ? "bg-red-500/20 border border-red-500/50"
          : "bg-[#2A2A2A] border border-[#C7A36B]/30 hover:border-[#C7A36B]/50"
      }`}
      whileHover={!isListening ? { scale: 1.05 } : {}}
      whileTap={{ scale: 0.95 }}
    >
      {isListening ? (
        <>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
            <Mic className="text-red-500" size={20} />
          </motion.div>
        </>
      ) : (
        <Mic className="text-[#C7A36B]" size={20} />
      )}
    </motion.button>
  )
}
