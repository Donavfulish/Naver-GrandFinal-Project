"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { RotateCcw, Save } from "lucide-react"

interface GeneratedSpacePreviewProps {
  space: {
    name: string
    description: string
    background: string
    clockStyle: string
    playlist: string
    tags: string[]
  }
  onRegenerate: () => void
}

export default function GeneratedSpacePreview({ space, onRegenerate }: GeneratedSpacePreviewProps) {
  const getBackgroundColor = () => {
    const backgrounds: Record<string, string> = {
      "gradient-blue": "from-blue-900/40 to-blue-700/20",
      "gradient-forest": "from-green-900/40 to-green-700/20",
      "gradient-sunset": "from-orange-900/40 to-red-700/20",
      "solid-dark": "from-slate-900/40 to-slate-800/20",
    }
    return backgrounds[space.background] || "from-slate-900/40 to-slate-800/20"
  }

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* Preview Card */}
      <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] rounded-3xl border border-[#C7A36B]/30 overflow-hidden">
        {/* Preview Image */}
        <div
          className={`relative w-full h-64 bg-gradient-to-br ${getBackgroundColor()} flex items-center justify-center`}
        >
          <div className="absolute inset-0 opacity-40">
            <div
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #C7A36B 1px, transparent 1px), linear-gradient(-45deg, #C7A36B 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-[#C7A36B] text-sm font-semibold mb-2">Preview</p>
            <p className="text-[#F5F5F5] text-2xl font-bold">{space.name}</p>
          </motion.div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">Description</h3>
            <p className="text-[#B3B3B3] leading-relaxed">{space.description}</p>
          </div>

          {/* Configuration Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#1E1E1E] rounded-xl p-4 border border-[#C7A36B]/20">
              <p className="text-xs text-[#B3B3B3] mb-1">Clock Style</p>
              <p className="text-[#F5F5F5] font-semibold capitalize">{space.clockStyle}</p>
            </div>
            <div className="bg-[#1E1E1E] rounded-xl p-4 border border-[#C7A36B]/20">
              <p className="text-xs text-[#B3B3B3] mb-1">Playlist</p>
              <p className="text-[#F5F5F5] font-semibold capitalize">{space.playlist.replace("-", " ")}</p>
            </div>
            <div className="bg-[#1E1E1E] rounded-xl p-4 border border-[#C7A36B]/20">
              <p className="text-xs text-[#B3B3B3] mb-1">Background</p>
              <p className="text-[#F5F5F5] font-semibold capitalize">{space.background.replace("-", " ")}</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F5] mb-3">Mood Tags</h3>
            <div className="flex flex-wrap gap-2">
              {space.tags.map((tag) => (
                <motion.span
                  key={tag}
                  className="px-4 py-2 bg-[#C7A36B]/15 text-[#C7A36B] rounded-full text-sm border border-[#C7A36B]/40"
                  whileHover={{ scale: 1.05 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#2A2A2A]">
            <motion.button
              onClick={onRegenerate}
              className="flex-1 px-6 py-3 bg-[#2A2A2A] text-[#C7A36B] rounded-xl font-semibold hover:bg-[#C7A36B]/10 transition flex items-center justify-center gap-2 border border-[#C7A36B]/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              Regenerate
            </motion.button>
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-xl font-semibold hover:bg-[#D4B896] transition flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Space
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
