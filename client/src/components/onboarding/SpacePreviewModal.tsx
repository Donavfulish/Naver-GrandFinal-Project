// src/components/SpacePreviewModal.tsx
"use client"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Zap, CornerDownLeft, Check, RefreshCw, Loader } from 'lucide-react'
import { SpaceData } from "@/types/space"

interface SpacePreviewModalProps {
    space: SpaceData
    onConfirm: () => void
    onRegenerate: () => void
    isConfirming: boolean
}

export default function SpacePreviewModal({ space, onConfirm, onRegenerate, isConfirming }: SpacePreviewModalProps) {
    const trackCount = space.playlist?.tracks?.length || 0

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div 
                initial={{ scale: 0.8, y: 100 }} 
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 100 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full text-white overflow-hidden flex flex-col md:flex-row h-[70vh] md:h-[500px]"
            >
                {/* Image Preview */}
                <div className="relative w-full md:w-1/2 h-1/3 md:h-full bg-gray-900">
                    <Image 
                        src={space.background.url} 
                        fill 
                        className="object-cover" 
                        alt="Space Preview" 
                        priority 
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Zap size={32} className="text-[#C7A36B] mr-2" />
                        <span className="text-2xl font-bold">{space.mood} Vibe</span>
                    </div>
                </div>

                {/* Details and Actions */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-[#C7A36B]">{space.name}</h2>
                        <p className="text-white/70 text-sm italic">Prompt: "{space.prompt}"</p>
                        <p className="text-base text-white/90">{space.description}</p>
                        
                        <div className="pt-2 space-y-2 text-white/80">
                            <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-white/10 pb-1">Configuration</h3>
                            <p>🎧 Music: **{space.playlist.name}** ({trackCount} tracks)</p>
                            <p>🖼️ Background: **{space.background.tags.join(', ')}**</p>
                            <p>⏱️ Clock Style: **{space.clock_font.style}**</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="pt-6 flex gap-4">
                        <button 
                            onClick={onRegenerate} 
                            disabled={isConfirming}
                            className="flex-1 flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-white/70 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Regenerate
                        </button>
                        <button 
                            onClick={onConfirm} 
                            disabled={isConfirming}
                            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/50 rounded-xl transition font-semibold disabled:opacity-50"
                        >
                            {isConfirming ? (
                                <>
                                    <Loader size={18} className="animate-spin mr-2" />
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    <Check size={18} className="mr-2" />
                                    Confirm & Enter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}