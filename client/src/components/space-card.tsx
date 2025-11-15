"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Edit3, Trash2 } from 'lucide-react'

interface SpaceCardProps {
  space: {
    id: number
    name: string
    tags: string[]
    background: string
    accent: string
  }
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <motion.div
      className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-[#C7A36B]/20 hover:border-[#C7A36B]/50 transition overflow-hidden"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`w-full h-32 ${space.background} rounded-2xl mb-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-60" />
      </div>

      {/* Space Title */}
      <h3 className="text-xl font-semibold text-[#F5F5F5] mb-3 group-hover:text-[#C7A36B] transition">{space.name}</h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {space.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-xs rounded-full bg-[#C7A36B]/10 text-[#C7A36B] border border-[#C7A36B]/30"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t border-[#2A2A2A]">
        <Link
          href={`/view-space/${space.id}`}
          className="flex-1 px-4 py-2 bg-[#C7A36B] text-[#1E1E1E] rounded-xl text-sm font-medium hover:bg-[#D4B896] transition flex items-center justify-center gap-2"
        >
          <Edit3 size={16} />
          Open
        </Link>
        <button className="px-4 py-2 bg-[#2A2A2A] text-[#B3B3B3] rounded-xl text-sm font-medium hover:bg-red-900/30 hover:text-red-400 transition flex items-center justify-center gap-2">
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
}
