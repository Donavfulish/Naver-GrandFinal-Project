"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart } from 'lucide-react'

const communitySpaces = [
  {
    id: 1,
    name: "Focus Flow",
    author: "Alex Chen",
    tags: ["Focus", "Productive"],
    background: "bg-gradient-to-br from-blue-900/40 to-blue-800/20",
    likes: 342,
  },
  {
    id: 2,
    name: "Evening Calm",
    author: "Jordan Smith",
    tags: ["Relax", "Calm"],
    background: "bg-gradient-to-br from-purple-900/40 to-purple-800/20",
    likes: 289,
  },
  {
    id: 3,
    name: "Creative Energy",
    author: "Taylor Myers",
    tags: ["Inspire", "Bright"],
    background: "bg-gradient-to-br from-orange-900/40 to-orange-800/20",
    likes: 215,
  },
  {
    id: 4,
    name: "Midnight Code",
    author: "Sam Park",
    tags: ["Focus", "Night"],
    background: "bg-gradient-to-br from-slate-900/40 to-slate-800/20",
    likes: 187,
  },
  {
    id: 5,
    name: "Zen Garden",
    author: "Casey Lee",
    tags: ["Calm", "Nature"],
    background: "bg-gradient-to-br from-green-900/40 to-green-800/20",
    likes: 156,
  },
  {
    id: 6,
    name: "Sunset Vibes",
    author: "Morgan Davis",
    tags: ["Relax", "Happy"],
    background: "bg-gradient-to-br from-pink-900/40 to-pink-800/20",
    likes: 201,
  },
]

export default function Community() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-4">Community Spaces</h2>
          <p className="text-[#B3B3B3] max-w-2xl mx-auto">
            Discover spaces created by our community. Get inspired and find your next perfect environment.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {communitySpaces.map((space) => (
            <motion.div
              key={space.id}
              variants={itemVariants}
              className="group relative rounded-3xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-[#C7A36B]/20 hover:border-[#C7A36B]/50 transition overflow-hidden"
              whileHover={{ y: -4 }}
            >
              {/* Background preview */}
              <div className={`w-full h-40 ${space.background} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent opacity-80" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">{space.name}</h3>
                <p className="text-sm text-[#B3B3B3] mb-4">by {space.author}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {space.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-[#C7A36B]/10 text-[#C7A36B] border border-[#C7A36B]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Like and explore */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#B3B3B3] hover:text-[#C7A36B] transition">
                    <Heart size={16} />
                    {space.likes}
                  </button>
                  <Link
                    href={`/view-space/${space.id}`}
                    className="px-4 py-2 bg-[#C7A36B] text-[#1E1E1E] rounded-lg text-sm font-medium hover:bg-[#D4B896] transition"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
