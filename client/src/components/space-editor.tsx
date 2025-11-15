"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import EditorCanvas from "./editor-canvas"
import EditorToolbar from "./editor-toolbar"
import { Save } from "lucide-react"

interface CustomizationState {
  background: string
  clockStyle: string
  playlist: string
  emotionTags: string[]
}

export default function SpaceEditor({ spaceId }: { spaceId: string }) {
  const router = useRouter()
  const [customization, setCustomization] = useState<CustomizationState>({
    background: "gradient-blue",
    clockStyle: "minimal",
    playlist: "focus-beats",
    emotionTags: ["Focus"],
  })

  const [isSaved, setIsSaved] = useState(false)

  const handleCustomizationChange = (key: keyof CustomizationState, value: any) => {
    setCustomization((prev) => ({
      ...prev,
      [key]: value,
    }))
    setIsSaved(false)
  }

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => {
      router.push(`/view-space/${spaceId}`)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-[#1E1E1E]">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#1E1E1E]/80 backdrop-blur-lg border-b border-[#2A2A2A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Space Editor</h1>
            <p className="text-sm text-[#B3B3B3]">ID: {spaceId}</p>
          </div>
          <motion.button
            onClick={handleSave}
            className="px-6 py-2 bg-[#C7A36B] text-[#1E1E1E] rounded-xl font-semibold hover:bg-[#D4B896] transition flex items-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <Save size={18} />
            {isSaved ? "Saved!" : "Save & Go to My Space"}
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <EditorCanvas customization={customization} />
        </div>

        {/* Toolbar */}
        <div className="lg:col-span-1">
          <EditorToolbar customization={customization} onCustomizationChange={handleCustomizationChange} />
        </div>
      </div>
    </main>
  )
}
