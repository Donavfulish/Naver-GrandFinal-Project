"use client"

import { motion } from "framer-motion"
import { Capsule } from "@/lib/store"
import { useState } from "react"
import { useSpaceDetail } from "@/hooks/useSpaceDetails"
import SpaceDetailModal from "./space-details"

interface CapsuleCardProps {
    capsule: Capsule
    onContinue: () => void
}

export default function CapsuleCard({ capsule, onContinue }: CapsuleCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, isLoading, error } = useSpaceDetail(isModalOpen ? capsule.id : null);

    const date = new Date(capsule.created_at || Date.now())
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })

    const getMoodColor = (mood: string) => {
        const colors: Record<string, string> = {
            exhausted: "from-gray-600 to-slate-700",    
            frustrated: "from-red-600 to-orange-600",     
            anxious: "from-yellow-600 to-amber-600",     
            neutral: "from-gray-400 to-slate-400",       
            content: "from-blue-400 to-cyan-400",        
            happy: "from-green-400 to-emerald-400",      
            inspired: "from-purple-500 to-pink-500",    
            joyful: "from-yellow-400 to-orange-400"
        }

        for (const [key, color] of Object.entries(colors)) {
            if (mood.toLowerCase().includes(key)) return color
        }
        return "from-[#C7A36B] to-[#7C9A92]"
    }

    const notesCount = capsule.notes?.length || 0;
    const tagList = capsule.tags || [];
    const summary = capsule.description || "No specific reflection recorded.";

    return (
        <>
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4 group cursor-pointer"
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white capitalize">{capsule.name}</h3>
                        <p className="text-sm text-white/50">{formattedDate}</p>
                    </div>
                    {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            <span className={`bg-gradient-to-br ${getMoodColor(capsule.mood)} px-2 py-1 rounded text-white text-[11px]`}>
                                {capsule.mood}
                            </span>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-sm text-white/70">{summary}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-sm font-bold text-[#C7A36B]">
                            {(capsule.duration / 1000 > 0)
                                ? `${capsule.duration / 1000} m`
                                : `${capsule.duration} s`}
                        </div>
                        <div className="text-xs text-white/50">duration</div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-sm font-bold text-[#7C9A92]">{notesCount}</div>
                        <div className="text-xs text-white/50">notes</div>
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-[50%] bg-gradient-to-r from-[#534666] to-[#4A707A] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-2 rounded-lg transition"
                >
                    View Space
                </button>
            </motion.div>

            {/* Modal */}
            <SpaceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                space={data}
                isLoading={isLoading}
            />
        </>
    )
}