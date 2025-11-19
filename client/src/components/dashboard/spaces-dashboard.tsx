"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import SpaceCard from "./space-card"
import CreateSpaceModal from "./create-space-modal"
import { Plus } from "lucide-react"

// Mock data for spaces
const mockSpaces = [
  {
    id: 1,
    name: "Deep Focus",
    tags: ["Focus", "Productive"],
    background: "bg-blue-900/20",
    img: "/img/calming-ambient-environment.png",
    accent: "#C7A36B"
  },
  {
    id: 2,
    name: "Rainy Study",
    tags: ["Calm", "Cozy"],
    background: "bg-slate-900/20",
    img: "/img/minimalist-focus-workspace.png",
    accent: "#7C9A92",
  },
  {
    id: 3,
    name: "Creative Flow",
    tags: ["Creative", "Happy"],
    background: "bg-purple-900/20",
    img: "/img/calming-ambient-environment.png",
    accent: "#C7A36B",
  },
  {
    id: 4,
    name: "Midnight Code",
    tags: ["Focus", "Night"],
    background: "bg-gray-900/20",
    img: "/img/peaceful-meditation-space.png",
    accent: "#7C9A92",
  },
  {
    id: 5,
    name: "Zen Garden",
    tags: ["Calm", "Nature"],
    background: "bg-green-900/20",
    img: "/img/peaceful-meditation-space.png",
    accent: "#C7A36B",
  },
  {
    id: 6,
    name: "Sunset Vibes",
    tags: ["Relax", "Happy"],
    background: "bg-orange-900/20",
    img: "/img/peaceful-meditation-space.png",
    accent: "#7C9A92",
  },
]

export default function SpacesDashboard() {
  const [spaces, setSpaces] = useState(mockSpaces)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateSpace = (newSpace: any) => {
    const space = {
      id: spaces.length + 1,
      ...newSpace,
      background: "bg-slate-900/20",
      accent: "#C7A36B",
    }
    setSpaces([...spaces, space])
    setIsModalOpen(false)
  }

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
      transition: { duration: 0.4 },
    },
  }

  return (
    <main className="min-h-screen bg-[#1E1E1E] pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-2">My Spaces</h1>
          <p className="text-[#B3B3B3]">
            {spaces.length} personalized environment{spaces.length !== 1 ? "s" : ""} created
          </p>
        </motion.div>

        {/* Create New Space Button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="mb-8 px-6 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-2xl font-semibold hover:bg-[#D4B896] transition flex items-center gap-2 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Create New Space
        </motion.button>

        {/* Spaces Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {spaces.map((space) => (
            <motion.div key={space.id} variants={itemVariants}>
              <SpaceCard space={space} />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {spaces.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#B3B3B3] mb-4">No spaces yet. Create your first one!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-2xl font-semibold hover:bg-[#D4B896] transition"
            >
              Create Space
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Space Modal */}
      <CreateSpaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateSpace} />
    </main>
  )
}
