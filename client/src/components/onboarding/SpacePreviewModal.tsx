// src/components/SpacePreviewModal.tsx
"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { Zap, Check, RefreshCw, Loader, Music, Type, Clock } from 'lucide-react'
import { SpaceData } from "@/types/space"

interface SpacePreviewModalProps {
    space: SpaceData
    onConfirm: () => void
    onRegenerate: () => void
    isConfirming: boolean
}

export default function SpacePreviewModal({ space, onConfirm, onRegenerate, isConfirming }: SpacePreviewModalProps) {
    const trackCount = space.playlist?.tracks?.length || 0

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength) + '...'
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="bg-gradient-to-br from-zinc-900 to-black border border-slate-800 border-2 rounded-3xl shadow-2xl max-w-5xl w-full text-white overflow-hidden flex flex-col md:flex-row h-auto md:h-[580px]"
            >
                {/* Image Preview with Better Overlay */}
                <div className="relative w-full md:w-[45%] h-64 md:h-full bg-gray-900 overflow-hidden group">
                    <Image
                        src={space.background.url}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-130"
                        alt="Space Preview"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Mood Badge - Repositioned */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20">
                        <Zap size={20} className="text-[#C7A36B]" />
                        <span className="text-lg font-semibold">{space.mood}</span>
                    </div>
                </div>

                {/* Details Panel - Improved Layout */}
                <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-between bg-gradient-to-br from-zinc-900/50 to-transparent overflow-y-auto">
                    <div className="space-y-5 flex-1">
                        {/* Header */}
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#C7A36B] via-[#D4B886] to-[#7C9A92] bg-clip-text text-transparent leading-tight">
                                {space.name}
                            </h2>

                            {/* Prompt Section - More Distinctive */}
                            <div className="bg-gradient-to-r from-white/5 to-transparent border-l-2 border-[#C7A36B] pl-4 py-2.5 rounded-r-lg pr-6">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-1.5 h-1.5 bg-[#C7A36B] rounded-full" />
                                    <span className="text-xs text-[#C7A36B] uppercase tracking-wider font-bold">
                                        Description
                                    </span>
                                </div>
                                <p className="text-sm text-white/70 italic leading-relaxed line-clamp-2" title={space.prompt}>
                                    "{truncateText(space.description, 120)}"
                                </p>
                            </div>
                        </div>

                        {/* Space Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 mt-4 ">
                            {/* Clock Font Info */}
                            {space.clock_font && (
                                <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors">
                                    <div className="mt-0.5">
                                        <Clock size={18} className="text-[#D4B886]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/50 mb-0.5">Clock Style</p>
                                        <p className="text-sm text-white/90 font-medium capitalize">
                                            {space.clock_font.style}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Text Font Info */}
                            {space.text_font && (
                                <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors">
                                    <div className="mt-0.5">
                                        <Type size={18} className="text-[#C7A36B]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/50 mb-0.5">Text Font</p>
                                        <p className="text-sm text-white/90 font-medium" style={{ fontFamily: space.text_font.font_name }}>
                                            {space.text_font.font_name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Playlist Info */}
                            {space.playlist && (
                                <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl sm:col-span-2 hover:bg-white/[0.07] transition-colors">
                                    <div className="mt-0.5">
                                        <Music size={18} className="text-[#7C9A92]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/50 mb-0.5">Playlist</p>
                                        <p className="text-sm text-white/90 font-medium truncate" title={space.playlist.name}>
                                            {space.playlist.name}
                                        </p>
                                        <p className="text-xs text-white/60 mt-0.5">
                                            {trackCount} tracks curated
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Enhanced */}
                    <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onRegenerate}
                            disabled={isConfirming}
                            className="flex items-center justify-center px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <RefreshCw size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                            <span className="font-medium">Regenerate</span>
                        </button>

                        <button
                            onClick={onConfirm}
                            disabled={isConfirming}
                            className="flex-1 flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-xl hover:shadow-[#C7A36B]/30 hover:scale-[1.02] rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isConfirming ? (
                                <>
                                    <Loader size={18} className="animate-spin mr-2" />
                                    Entering Space...
                                </>
                            ) : (
                                <>
                                    <Check size={18} className="mr-2" />
                                    Confirm
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}