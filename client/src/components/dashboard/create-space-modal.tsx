"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface CreateSpaceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (space: any) => void
}

const emotionTags = ["Focus", "Calm", "Cozy", "Happy", "Productive", "Creative", "Relax", "Nature", "Night", "Study"]

export default function CreateSpaceModal({ isOpen, onClose, onCreate }: CreateSpaceModalProps) {
  const [name, setName] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleCreate = () => {
    if (name.trim() && selectedTags.length > 0) {
      onCreate({
        name: name.trim(),
        tags: selectedTags,
      })
      setName("")
      setSelectedTags([])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[#2A2A2A] rounded-3xl border border-[#C7A36B]/30 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#F5F5F5]">Create New Space</h2>
                <button onClick={onClose} className="text-[#B3B3B3] hover:text-[#F5F5F5] transition">
                  <X size={24} />
                </button>
              </div>

              {/* Space Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F5F5F5] mb-2">Space Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Deep Focus"
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#C7A36B]/30 rounded-xl text-[#F5F5F5] placeholder-[#B3B3B3]/50 focus:outline-none focus:border-[#C7A36B] transition"
                  onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              {/* Emotion Tags Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#F5F5F5] mb-3">Emotion Tags</label>
                <div className="flex flex-wrap gap-2">
                  {emotionTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedTags.includes(tag)
                          ? "bg-[#C7A36B] text-[#1E1E1E]"
                          : "bg-[#1E1E1E] text-[#B3B3B3] border border-[#C7A36B]/30 hover:border-[#C7A36B]/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-[#1E1E1E] text-[#B3B3B3] rounded-xl font-medium hover:bg-[#2A2A2A] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || selectedTags.length === 0}
                  className="flex-1 px-4 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-xl font-medium hover:bg-[#D4B896] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
