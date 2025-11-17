// components/SettingsPanel.tsx
"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Sliders, X } from "lucide-react"

type LayoutKey = "centered-blur" | "corner"

export type SettingsPreview = {
  clockStyle: string
  clockFont: string
  background: string
  layout: LayoutKey
}

export default function SettingsPanel({
  open,
  onClose,
  initial,
  onPreviewChange,
  onSave,
}: {
  open: boolean
  onClose: () => void
  initial: SettingsPreview
  onPreviewChange: (p: Partial<SettingsPreview>) => void
  onSave: (p: SettingsPreview) => void
}) {
  const [clockStyle, setClockStyle] = useState(initial.clockStyle)
  const [clockFont, setClockFont] = useState(initial.clockFont)
  const [background, setBackground] = useState(initial.background)
  const [layout, setLayout] = useState<LayoutKey>(initial.layout)

  // local library (declare images you have in /public/img)
  const backgroundLibrary = [
    "/img/calming-ambient-environment.png",
    "/img/minimalist-focus-workspace.png",
    "/img/new-custom-space.png",
    "/img/peaceful-meditation-space.png"
  ]

  // notify parent for live preview whenever local state changes
  useEffect(() => {
    onPreviewChange({ clockStyle, clockFont, background, layout })
  }, [clockStyle, clockFont, background, layout, onPreviewChange])

  // handle file upload -> createObjectURL
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const url = URL.createObjectURL(f)
      setBackground(url)
    }
  }

  // handle paste link input
  const handleBackgroundLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackground(e.target.value)
  }

  // Save: call onSave with the chosen settings
  const handleSave = () => {
    onSave({ clockStyle, clockFont, background, layout })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative ml-auto w-full sm:w-96 h-full bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] p-6 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded hover:bg-[#2A2A2A]"
          aria-label="Close settings"
        >
          <X size={20} className="text-white" />
        </button>

        <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
          <Sliders size={20} className="text-[#C7A36B]" />
          Customize Space
        </h2>

        {/* Clock Style */}
        <section className="mb-6">
          <h3 className="text-white font-semibold mb-2">Clock Style</h3>
          <div className="flex gap-3">
            {["minimal", "modern", "retro"].map((s) => (
              <button
                key={s}
                onClick={() => setClockStyle(s)}
                className={`px-3 py-2 rounded-md capitalize border transition ${
                  clockStyle === s
                    ? "bg-[#C7A36B]/20 border-[#C7A36B] text-white"
                    : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Font Selection */}
        <section className="mb-6">
          <h3 className="text-white font-semibold mb-2">Font</h3>
          <div className="flex gap-3">
            {["Inter", "Orbitron", "VT323"].map((f) => (
              <button
                key={f}
                onClick={() => setClockFont(f)}
                className={`px-3 py-2 rounded-md border transition ${
                  clockFont === f
                    ? "bg-[#C7A36B]/20 border-[#C7A36B] text-white"
                    : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Background */}
        <section className="mb-6">
          <h3 className="text-white font-semibold mb-2">Background</h3>

          <div className="mb-3">
            <div className="grid grid-cols-3 gap-2">
              {backgroundLibrary.map((src) => (
                <button
                  key={src}
                  onClick={() => setBackground(src)}
                  className={`relative h-20 rounded overflow-hidden border transition ${
                    background === src ? "ring-2 ring-[#C7A36B]" : "border-[#2A2A2A]"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-white/70">Upload from device</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full text-sm text-white/80"
            />

          </div>
        </section>

        {/* Layout Presets */}
        <section className="mb-6">
          <h3 className="text-white font-semibold mb-2">Layout Presets</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setLayout("centered-blur")}
              className={`w-full px-3 py-2 rounded border transition ${
                layout === "centered-blur"
                  ? "bg-[#C7A36B]/20 border-[#C7A36B] text-white"
                  : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3]"
              }`}
            >
              Centered + Blur
            </button>

            <button
              onClick={() => setLayout("corner")}
              className={`w-full px-3 py-2 rounded border transition ${
                layout === "corner"
                  ? "bg-[#C7A36B]/20 border-[#C7A36B] text-white"
                  : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3]"
              }`}
            >
              Corner (no blur)
            </button>
          </div>
        </section>

        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-lg font-semibold hover:bg-[#D4B896]"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  )
}
