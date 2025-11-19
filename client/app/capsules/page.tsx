"use client"

import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { useSessionStore } from "@/lib/store"
import CapsuleOverview from "@/components/capsules/capsule-overview"

export default function CapsulesPage() {
  const router = useRouter()
  const { capsules, resetSession } = useSessionStore()

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col">
      <div className="flex-1 py-12 px-6">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CapsuleOverview capsules={capsules} />

          {/* Action */}
          <div className="flex justify-center pt-12">
            <button
              onClick={() => {
                resetSession()
                router.push("/emotional-capsules")
              }}
              className="px-8 py-3 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] text-[#1E1E1E] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#C7A36B]/30 transition"
            >
              Start New Session
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
