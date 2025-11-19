"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, X } from 'lucide-react'
import { StickyNote as StickyNoteType } from "@/lib/store"

interface StickyNoteProps {
  note: StickyNoteType
  onUpdate: (text: string) => void
  onRemove: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

export default function StickyNote({
  note,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
}: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(note.text === "")
  const [text, setText] = useState(note.text)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return

    setIsDragging(true)
    onDragStart()

    const rect = noteRef.current?.getBoundingClientRect()
    if (!rect) return

    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !noteRef.current) return

    const parent = noteRef.current.parentElement
    if (!parent) return

    const parentRect = parent.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - parentRect.left - offset.x, parentRect.width - 200))
    const y = Math.max(0, Math.min(e.clientY - parentRect.top - offset.y, parentRect.height - 200))

    noteRef.current.style.left = `${x}px`
    noteRef.current.style.top = `${y}px`
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    onDragEnd()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, offset])

  return (
    <motion.div
      ref={noteRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`absolute w-48 ${note.color} rounded-lg shadow-lg p-4 space-y-2 cursor-move hover:shadow-xl transition`}
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1" />
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-200/50 rounded transition"
          title="Delete note"
        >
          <Trash2 size={16} className="text-red-600" />
        </button>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false)
            onUpdate(text)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsEditing(false)
              setText(note.text)
            }
          }}
          placeholder="What's on your mind?"
          className="w-full h-20 bg-transparent resize-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-20 text-sm text-gray-700 cursor-text whitespace-pre-wrap break-words"
        >
          {text || <span className="text-gray-400 italic">Click to add text...</span>}
        </div>
      )}
    </motion.div>
  )
}
