// src/components/AILoadingModal.tsx
"use client"
import { motion } from "framer-motion"
import { Sparkles, Loader } from 'lucide-react'

interface AILoadingModalProps {
    prompt: string
}

export default function AILoadingModal({ prompt }: AILoadingModalProps) {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 50 }} 
                animate={{ scale: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center text-white space-y-4"
            >
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="mx-auto w-12 h-12 flex items-center justify-center text-[#C7A36B]"
                >
                    <Sparkles size={40} />
                </motion.div>
                <h3 className="text-xl font-bold">Crafting Your Inner Space...</h3>
                <p className="text-white/70 text-sm italic line-clamp-2">"Based on: {prompt}"</p>
                <div className="flex items-center justify-center pt-2">
                    <Loader size={20} className="animate-spin mr-2 text-[#7C9A92]" />
                    <p className="text-sm text-white/50">Analyzing mood and generating ambience...</p>
                </div>
            </motion.div>
        </motion.div>
    )
}