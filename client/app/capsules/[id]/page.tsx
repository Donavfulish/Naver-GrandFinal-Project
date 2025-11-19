"use client"

import { useParams, useRouter } from 'next/navigation'
import { motion } from "framer-motion"
import { ChevronLeft, Play } from 'lucide-react'
import { useSessionStore } from "@/lib/store"

export default function CapsuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { capsules, loadCapsule, resetSession } = useSessionStore()

  const capsule = capsules.find((c) => c.id === params.id)

  if (!capsule) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center">
        <p className="text-[#B3B3B3]">Capsule not found</p>
      </div>
    )
  }

  const handleForkSession = () => {
    resetSession()
    loadCapsule(capsule)
    router.push("/view-space/1?fork=true")
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col">
      <div className="flex-1 py-12 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#B3B3B3] hover:text-[#C7A36B] transition mb-8"
          >
            <ChevronLeft size={20} />
            Back to Capsules
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold text-[#F5F5F5] mb-2">{capsule.mood}</h1>
                <p className="text-[#B3B3B3]">
                  {new Date(capsule.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Session Summary */}
              <motion.div
                className="p-6 bg-[#2A2A2A] rounded-xl border border-[#C7A36B]/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-[#B3B3B3] text-sm mb-2">Session Summary</p>
                <p className="text-[#F5F5F5] text-lg">{capsule.session_summary}</p>
              </motion.div>

              {/* Original Notes */}
              {capsule.notes.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-[#F5F5F5]">Your Thoughts</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {capsule.notes.map((note) => (
                      <div
                        key={note.id}
                        className={`${note.color} p-4 rounded-lg shadow-md transform hover:scale-105 transition`}
                      >
                        <p className="text-[#1E1E1E]">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Reflection */}
              <motion.div
                className="p-6 bg-[#2A2A2A] rounded-xl border border-[#7C9A92]/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Your Reflection</h2>
                <p className="text-[#B3B3B3] leading-relaxed">{capsule.reflection_answer}</p>
              </motion.div>

              {/* AI Insight */}
              <motion.div
                className="p-6 bg-gradient-to-br from-[#C7A36B]/10 to-[#7C9A92]/10 rounded-xl border border-[#C7A36B]/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-2">AI Insight</h2>
                <p className="text-[#B3B3B3]">
                  {capsule.notes.length > 0
                    ? `You actively processed ${capsule.notes.length} thought${capsule.notes.length !== 1 ? "s" : ""} during this session. This active engagement helps build emotional clarity and resilience.`
                    : "You embraced a restorative session, allowing your mind to recharge naturally without external stimulation."}
                </p>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Duration & Stats */}
              <motion.div
                className="p-6 bg-[#2A2A2A] rounded-xl border border-[#C7A36B]/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-[#B3B3B3] text-sm">Duration</p>
                    <p className="text-2xl font-bold text-[#C7A36B]">{capsule.duration} min</p>
                  </div>
                  <div>
                    <p className="text-[#B3B3B3] text-sm">Thoughts Captured</p>
                    <p className="text-2xl font-bold text-[#C7A36B]">{capsule.notes.length}</p>
                  </div>
                </div>
              </motion.div>

              {/* Theme & Music */}
              <motion.div
                className="p-6 bg-[#2A2A2A] rounded-xl border border-[#7C9A92]/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-[#B3B3B3] text-sm">Theme</p>
                    <p className="text-[#F5F5F5] font-semibold capitalize">{capsule.vibe_config.theme.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-[#B3B3B3] text-sm">Music</p>
                    <p className="text-[#F5F5F5] font-semibold capitalize">{capsule.vibe_config.music.replace("_", " ")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Tags */}
              {capsule.tags.length > 0 && (
                <motion.div
                  className="p-6 bg-[#2A2A2A] rounded-xl border border-[#C7A36B]/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-[#B3B3B3] text-sm mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {capsule.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#C7A36B]/20 text-[#C7A36B] text-sm rounded-full border border-[#C7A36B]/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Fork Button */}
              <motion.button
                onClick={handleForkSession}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] text-[#1E1E1E] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C7A36B]/30 transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Play size={20} />
                Continue Session
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
