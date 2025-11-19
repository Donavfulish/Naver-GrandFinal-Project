"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { useSessionStore } from "@/lib/store"
import CapsuleCard from "./capsule-card"

export default function CapsulesList() {
  const router = useRouter()
  const { capsules, loadCapsule, resetSession } = useSessionStore()
  const [filter, setFilter] = useState<string | null>(null)

  const moods = Array.from(new Set(capsules.map((c) => c.mood)))
  const filtered = filter ? capsules.filter((c) => c.mood === filter) : capsules

  const handleContinueSession = (capsuleId: string) => {
    const capsule = capsules.find((c) => c.id === capsuleId)
    if (capsule) {
      resetSession()
      loadCapsule(capsule)
      router.push("/space")
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white">My Capsules</h1>
        <p className="text-white/60">Moments of emotional clarity, preserved in time</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === null
              ? "bg-[#C7A36B] text-[#1E1E1E]"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          All ({capsules.length})
        </button>
        {moods.map((mood) => {
          const count = capsules.filter((c) => c.mood === mood).length
          return (
            <button
              key={mood}
              onClick={() => setFilter(mood)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                filter === mood
                  ? "bg-[#C7A36B] text-[#1E1E1E]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {mood} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((capsule, index) => (
            <motion.div key={capsule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <CapsuleCard
                capsule={capsule}
                onContinue={() => handleContinueSession(capsule.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-white/60"
        >
          No capsules yet. Start a new session to create one.
        </motion.div>
      )}

      {/* Action Button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => {
            resetSession()
            router.push("/onboarding")
          }}
          className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Start New Session
        </button>
      </div>
    </div>
  )
}
