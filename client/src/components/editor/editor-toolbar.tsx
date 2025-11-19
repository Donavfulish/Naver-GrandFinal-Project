"use client"

import { motion } from "framer-motion"

interface Customization {
  background: string
  clockStyle: string
  playlist: string
  emotionTags: string[]
}

interface EditorToolbarProps {
  customization: Customization
  onCustomizationChange: (key: keyof Customization, value: any) => void
}

const backgroundOptions = [
  { id: "gradient-blue", label: "Ocean Blue", color: "from-blue-900 to-blue-700" },
  { id: "gradient-forest", label: "Forest Green", color: "from-green-900 to-green-700" },
  { id: "gradient-sunset", label: "Sunset", color: "from-orange-900 to-red-700" },
  { id: "solid-dark", label: "Dark", color: "from-slate-900 to-slate-800" },
]

const clockStyles = [
  { id: "minimal", label: "Minimal" },
  { id: "analog", label: "Analog" },
  { id: "digital", label: "Digital" },
]

const playlists = [
  { id: "focus-beats", label: "Focus Beats" },
  { id: "nature-sounds", label: "Nature Sounds" },
  { id: "lo-fi", label: "Lo-Fi Hip Hop" },
  { id: "ambient", label: "Ambient" },
]

const emotionOptions = ["Focus", "Calm", "Cozy", "Happy", "Creative", "Productive", "Relax"]

export default function EditorToolbar({ customization, onCustomizationChange }: EditorToolbarProps) {
  const handleTagToggle = (tag: string) => {
    const newTags = customization.emotionTags.includes(tag)
      ? customization.emotionTags.filter((t) => t !== tag)
      : [...customization.emotionTags, tag]
    onCustomizationChange("emotionTags", newTags)
  }

  return (
    <motion.div
      className="space-y-6 sticky top-28"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Background Selection */}
      <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-[#C7A36B]/20">
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-3">Background</h3>
        <div className="space-y-2">
          {backgroundOptions.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onCustomizationChange("background", bg.id)}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                customization.background === bg.id
                  ? "bg-[#C7A36B] text-[#1E1E1E]"
                  : "bg-[#1E1E1E] text-[#B3B3B3] hover:text-[#F5F5F5]"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clock Style Selection */}
      <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-[#C7A36B]/20">
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-3">Clock Style</h3>
        <div className="space-y-2">
          {clockStyles.map((clock) => (
            <button
              key={clock.id}
              onClick={() => onCustomizationChange("clockStyle", clock.id)}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                customization.clockStyle === clock.id
                  ? "bg-[#C7A36B] text-[#1E1E1E]"
                  : "bg-[#1E1E1E] text-[#B3B3B3] hover:text-[#F5F5F5]"
              }`}
            >
              {clock.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Selection */}
      <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-[#C7A36B]/20">
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-3">Playlist</h3>
        <select
          value={customization.playlist}
          onChange={(e) => onCustomizationChange("playlist", e.target.value)}
          className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#C7A36B]/30 rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#C7A36B] transition"
        >
          {playlists.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#2A2A2A]">
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Emotion Tags */}
      <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-[#C7A36B]/20">
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-3">Emotions</h3>
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map((emotion) => (
            <button
              key={emotion}
              onClick={() => handleTagToggle(emotion)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                customization.emotionTags.includes(emotion)
                  ? "bg-[#C7A36B] text-[#1E1E1E]"
                  : "bg-[#1E1E1E] text-[#B3B3B3] border border-[#C7A36B]/30 hover:border-[#C7A36B]/50"
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
