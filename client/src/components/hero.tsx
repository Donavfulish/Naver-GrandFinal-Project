"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C7A36B]/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#7C9A92]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <motion.div
        className="max-w-4xl mx-auto px-6 py-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-[#F5F5F5] mb-6 leading-tight">
          Design Your Mood.
          <br />
          <span className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] bg-clip-text text-transparent">
            Live Your Space.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[#B3B3B3] mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Create immersive digital environments that adapt to your emotions and activities. Transform your workspace
          into a personalized sanctuary.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-[#C7A36B] text-[#1E1E1E] rounded-2xl font-semibold hover:bg-[#D4B896] transition flex items-center justify-center gap-2 group"
          >
            Create Your Space
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </Link>
          <Link
            href="/generate"
            className="px-8 py-4 border-2 border-[#C7A36B] text-[#C7A36B] rounded-2xl font-semibold hover:bg-[#C7A36B]/10 transition"
          >
            Try AI Generator
          </Link>
        </motion.div>

        {/* Preview section */}
        <motion.div variants={itemVariants} className="mt-16 relative">
          <div className="bg-gradient-to-b from-[#2A2A2A] to-transparent p-1 rounded-3xl">
            <div className="bg-[#1E1E1E] rounded-3xl p-8 flex items-center justify-center min-h-80">
              <div className="text-center">
                <div className="text-sm text-[#B3B3B3] mb-4">Featured Spaces Preview</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Focus", "Chill", "Calm", "Happy"].map((space) => (
                    <div
                      key={space}
                      className="h-20 bg-[#2A2A2A] rounded-2xl border border-[#C7A36B]/20 hover:border-[#C7A36B]/50 transition flex items-center justify-center text-[#B3B3B3] text-sm"
                    >
                      {space}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
