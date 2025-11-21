// "use client"

// import { useRef, useState } from "react"
// import { motion } from "framer-motion"
// import { useSessionStore, StickyNote } from "@/lib/store"
// import StickyNoteComponent from "./sticky-note"

// export default function StickyNoteCanvas() {
//   const canvasRef = useRef<HTMLDivElement>(null)
//   const { notes, addNote, removeNote, updateNote } = useSessionStore()
//   const [isDragging, setIsDragging] = useState(false)

//   const handleCanvasClick = (e: React.MouseEvent) => {
//     if (isDragging || (e.target !== canvasRef.current && !isDragging)) return

//     const rect = canvasRef.current?.getBoundingClientRect()
//     if (!rect) return

//     const x = e.clientX - rect.left
//     const y = e.clientY - rect.top

//     const newNote: StickyNote = {
//       id: `note-${Date.now()}`,
//       x,
//       y,
//       text: "",
//       color: ["bg-yellow-100", "bg-pink-100", "bg-blue-100", "bg-green-100"][
//         Math.floor(Math.random() * 4)
//       ],
//     }

//     addNote(newNote)
//   }

//   return (
//     <div
//       ref={canvasRef}
//       onClick={handleCanvasClick}
//       className="relative w-full h-full cursor-crosshair overflow-hidden"
//     >
//       {/* Helper text */}
//       {notes.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           className="absolute inset-0 flex items-center justify-center text-white/30 pointer-events-none"
//         >
//         </motion.div>
//       )}

//       {/* Sticky notes */}
//       {notes.map((note) => (
//         <StickyNoteComponent
//           key={note.id}
//           note={note}
//           onUpdate={(text) => updateNote(note.id, { text })}
//           onRemove={() => removeNote(note.id)}
//           onDragStart={() => setIsDragging(true)}
//           onDragEnd={() => setIsDragging(false)}
//         />
//       ))}
//     </div>
//   )
// }

// src/components/space/StickyNoteCanvas.tsx
"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useSessionStore, StickyNote } from "@/lib/store"
// Giả định bạn có component StickyNoteComponent
import StickyNoteComponent from "./sticky-note" 

export default function StickyNoteCanvas() {
    const canvasRef = useRef<HTMLDivElement>(null)
    const { notes, addNote, removeNote, updateNote } = useSessionStore()
    const [isDragging, setIsDragging] = useState(false)

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (isDragging || (e.target !== canvasRef.current && !isDragging)) return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newNote: StickyNote = {
            id: `note-${Date.now()}`,
            x, // Lưu tọa độ
            y, // Lưu tọa độ
            text: "",
            color: ["bg-yellow-100", "bg-pink-100", "bg-blue-100", "bg-green-100"][
                Math.floor(Math.random() * 4)
            ],
        }

        addNote(newNote)
    }

    return (
        <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative w-full h-full cursor-crosshair overflow-hidden"
        >
            {/* Helper text */}
            {notes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center text-white/30 pointer-events-none"
                >
                    {/* Bạn có thể thêm text hướng dẫn ở đây */}
                </motion.div>
            )}

            {/* Sticky notes */}
            {notes.map((note) => (
                <StickyNoteComponent
                    key={note.id}
                    note={note}
                    onUpdate={(text) => updateNote(note.id, { text })}
                    onRemove={() => removeNote(note.id)}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                />
            ))}
        </div>
    )
}
