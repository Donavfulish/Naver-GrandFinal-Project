"use client"

import { motion } from "framer-motion"
import { Sparkles, Palette, Music } from "lucide-react"

const steps = [
  {
    icon: Palette,
    title: "Customize",
    description: "Choose backgrounds, colors, and layouts that match your mood.",
  },
  {
    icon: Music,
    title: "Add Music",
    description: "Create or select playlists to accompany your space.",
  },
  {
    icon: Sparkles,
    title: "Live",
    description: "Immerse yourself in your personalized digital sanctuary.",
  },
]

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section id="how-it-works" className="py-24 px-6 bg-[#2A2A2A]/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-4">How It Works</h2>
          <p className="text-[#B3B3B3] max-w-2xl mx-auto">
            Three simple steps to create your perfect digital environment.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative p-8 rounded-3xl bg-[#1E1E1E] border border-[#C7A36B]/20 hover:border-[#C7A36B]/50 transition group"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#C7A36B] rounded-full flex items-center justify-center text-[#1E1E1E] font-bold text-sm">
                  {index + 1}
                </div>
                <Icon className="w-12 h-12 text-[#C7A36B] mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-semibold text-[#F5F5F5] mb-2">{step.title}</h3>
                <p className="text-[#B3B3B3]">{step.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
