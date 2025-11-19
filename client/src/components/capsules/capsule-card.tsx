"use client"

import { motion } from "framer-motion"
import { Play } from 'lucide-react'
import { Capsule } from "@/lib/store"

interface CapsuleCardProps {
  capsule: Capsule
  onContinue: () => void
}

export default function CapsuleCard({ capsule, onContinue }: CapsuleCardProps) {
  const date = new Date(capsule.created_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      stressed: "from-red-500 to-orange-500",
      happy: "from-yellow-500 to-orange-500",
      creative: "from-purple-500 to-pink-500",
      peaceful: "from-green-500 to-blue-500",
      tired: "from-indigo-500 to-purple-500",
    }

    for (const [key, color] of Object.entries(colors)) {
      if (mood.toLowerCase().includes(key)) return color
    }
    return "from-[#C7A36B] to-[#7C9A92]"
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white capitalize">{capsule.mood}</h3>
          <p className="text-sm text-white/50">{formattedDate}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`bg-gradient-to-br ${getMoodColor(capsule.mood)} p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition`}
        >
          <Play size={16} fill="white" />
        </motion.div>
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-lg p-3">
        <p className="text-sm text-white/70">{capsule.session_summary}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded p-2 text-center">
          <div className="text-sm font-bold text-[#C7A36B]">{capsule.duration}m</div>
          <div className="text-xs text-white/50">duration</div>
        </div>
        <div className="bg-white/5 rounded p-2 text-center">
          <div className="text-sm font-bold text-[#7C9A92]">{capsule.notes.length}</div>
          <div className="text-xs text-white/50">notes</div>
        </div>
        <div className="bg-white/5 rounded p-2 text-center">
          <div className="text-sm font-bold text-white">{capsule.tags.length}</div>
          <div className="text-xs text-white/50">tags</div>
        </div>
      </div>

      {/* Tags */}
      {capsule.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {capsule.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {capsule.tags.length > 2 && (
            <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
              +{capsule.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Button */}
      <button
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-2 rounded-lg transition"
      >
        Continue Session
      </button>
    </motion.div>
  )
}
