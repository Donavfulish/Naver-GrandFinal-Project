"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Edit3, Trash2 } from 'lucide-react'
import Image from "next/image"

interface SpaceCardProps {
    space: {
        id: number
        name: string
        tags: string[]
        background: string
        img: string
        accent: string
    }
}

export default function SpaceCard({ space }: SpaceCardProps) {
    return (
        <motion.div
            className="group relative rounded-3xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-[#C7A36B]/20 hover:border-[#C7A36B]/50 transition overflow-hidden"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            {/* Background + Title + Tags */}
            <div className="w-full h-50 rounded-2xl rounded-b-none mb-6 relative overflow-hidden">
                <Image
                    src={space.img}
                    alt={space.name}
                    fill
                    className="object-cover"
                />

                {/* dark gradient để chữ nổi */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content nằm trên background */}
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {space.name}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {space.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 p-6 border-t  border-[#2A2A2A]">
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
