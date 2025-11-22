// src/components/capsules/capsule-card.tsx
"use client"

import { motion } from "framer-motion"
import { Play } from 'lucide-react'
import { Capsule } from "@/lib/store"

interface CapsuleCardProps {
    capsule: Capsule
    onContinue: () => void
}

export default function CapsuleCard({ capsule, onContinue }: CapsuleCardProps) {
    const date = new Date(capsule.created_at || Date.now())
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })

    const getMoodColor = (mood: string) => {
        const colors: Record<string, string> = {
            inspired: "from-red-500 to-orange-500",
            focused: "from-yellow-500 to-orange-500",
            productive: "from-purple-500 to-pink-500",
            peaceful: "from-green-500 to-blue-500",
            tired: "from-indigo-500 to-purple-500",
        }

        for (const [key, color] of Object.entries(colors)) {
            if (mood.toLowerCase().includes(key)) return color
        }
        return "from-[#C7A36B] to-[#7C9A92]"
    }

    // SỬ DỤNG CÁC TRƯỜNG ĐÃ ĐƯỢC MAPPING
    const notesCount = capsule.notes?.length || 0;
    const tagList = capsule.tags || [];
    const summary = capsule.description || "No specific reflection recorded.";


    return (
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
                {/* Tags */}
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
                onClick={onContinue}
                className="w-[50%] bg-gradient-to-r from-[#534666] to-[#4A707A] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-2 rounded-lg transition"
            >
                View Space
            </button>
        </motion.div>
    )
}