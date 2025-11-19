"use client"

import { motion } from "framer-motion"
import { Clock, Music, Timer } from "lucide-react"

interface WidgetProps {
  widget: {
    id: string
    type: "clock" | "playlist" | "timer"
    label: string
    x: number
    y: number
  }
  onDragEnd: (id: string, x: number, y: number) => void
  clockStyle: string
}

export default function DraggableWidget({ widget, onDragEnd, clockStyle }: WidgetProps) {
  const getIcon = () => {
    switch (widget.type) {
      case "clock":
        return <Clock size={24} />
      case "playlist":
        return <Music size={24} />
      case "timer":
        return <Timer size={24} />
    }
  }

  const getContent = () => {
    switch (widget.type) {
      case "clock":
        return clockStyle === "minimal" ? "12:34" : "12:34 AM"
      case "playlist":
        return "Now Playing..."
      case "timer":
        return "25:00"
    }
  }

  return (
    <motion.div
      className="absolute bg-[#1E1E1E] border border-[#C7A36B]/40 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:border-[#C7A36B]/60 transition"
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onDragEnd(widget.id, info.offset.x, info.offset.y)
      }}
      initial={{ x: widget.x, y: widget.y, opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, boxShadow: "0 20px 40px rgba(199, 163, 107, 0.2)" }}
    >
      <div className="flex flex-col items-center gap-2 text-[#C7A36B] whitespace-nowrap">
        {getIcon()}
        <span className="text-xs font-medium text-[#B3B3B3]">{widget.label}</span>
        <span className="text-sm text-[#F5F5F5] font-semibold">{getContent()}</span>
      </div>
    </motion.div>
  )
}
