"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DraggableWidget from "./draggable-widget"

interface Customization {
  background: string
  clockStyle: string
  playlist: string
  emotionTags: string[]
}

interface Widget {
  id: string
  type: "clock" | "playlist" | "timer"
  label: string
  x: number
  y: number
}

export default function EditorCanvas({ customization }: { customization: Customization }) {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "1", type: "clock", label: "Clock", x: 50, y: 50 },
    { id: "2", type: "playlist", label: "Playlist", x: 400, y: 50 },
    { id: "3", type: "timer", label: "Timer", x: 50, y: 300 },
  ])

  const getBackgroundStyle = () => {
    const backgrounds: Record<string, string> = {
      "gradient-blue": "bg-gradient-to-br from-blue-900/40 to-blue-700/20",
      "gradient-forest": "bg-gradient-to-br from-green-900/40 to-green-700/20",
      "gradient-sunset": "bg-gradient-to-br from-orange-900/40 to-red-700/20",
      "solid-dark": "bg-slate-900/30",
    }
    return backgrounds[customization.background] || backgrounds["solid-dark"]
  }

  const handleDragEnd = (id: string, x: number, y: number) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }

  return (
    <motion.div
      className={`relative w-full h-96 rounded-3xl border-2 border-dashed border-[#C7A36B]/30 bg-[#2A2A2A] ${getBackgroundStyle()} overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(#C7A36B 1px, transparent 1px), linear-gradient(90deg, #C7A36B 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Widgets */}
      {widgets.map((widget) => (
        <DraggableWidget
          key={widget.id}
          widget={widget}
          onDragEnd={handleDragEnd}
          clockStyle={customization.clockStyle}
        />
      ))}

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-[#B3B3B3]/40 text-center">
          <span className="block text-sm">Drag widgets to customize your space</span>
        </p>
      </div>
    </motion.div>
  )
}
