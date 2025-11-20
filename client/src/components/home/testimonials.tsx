"use client"

import { motion } from "framer-motion"
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: "Alex Chen",
    role: "Creative Designer",
    content: "AuraSpace transformed how I work. My focus space keeps me centered for 8+ hours straight.",
    rating: 5,
  },
  {
    name: "Jordan Smith",
    role: "Software Engineer",
    content: "The AI generator is incredible. It understands my mood and creates exactly what I need.",
    rating: 5,
  },
  {
    name: "Taylor Myers",
    role: "Content Creator",
    content: "Finally, a tool that makes my environment work for me instead of against me.",
    rating: 5,
  },
]

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-4">Loved by Creators</h2>
          <p className="text-[#B3B3B3] max-w-2xl mx-auto">
            See how AuraSpace is changing the way people work and create.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 rounded-3xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-[#C7A36B]/20 hover:border-[#C7A36B]/50 transition"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-[#C7A36B] text-[#C7A36B]" />
                ))}
              </div>
              <p className="text-[#B3B3B3] mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-[#F5F5F5]">{testimonial.name}</p>
                <p className="text-sm text-[#B3B3B3]">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
