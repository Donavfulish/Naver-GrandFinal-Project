// components/SettingsPanel.tsx
"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
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
  spaceId
}: {
  open: boolean
  onClose: () => void
  initial: SettingsPreview
  onPreviewChange: (p: Partial<SettingsPreview>) => void
  onSave: (p: SettingsPreview) => void
  spaceId: number | string
}) {
    const [clockStyle, setClockStyle] = useState(initial.clockStyle)
    const [clockFont, setClockFont] = useState(initial.clockFont)
    const [background, setBackground] = useState(initial.background)
    const [layout, setLayout] = useState<LayoutKey>(initial.layout)

    const backgroundLibrary = [
        "/img/calming-ambient-environment.png",
        "/img/minimalist-focus-workspace.png",
        "/img/new-custom-space.png",
        "/img/peaceful-meditation-space.png",
    ]

    // live preview
    useEffect(() => {
        onPreviewChange({ clockStyle, clockFont, background, layout })
    }, [clockStyle, clockFont, background, layout, onPreviewChange])

    // Upload custom image
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            const url = URL.createObjectURL(f)
            setBackground(url)
        }
    }

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

            {/* panel */}
            <div className="relative ml-auto w-full sm:w-96 h-full bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] p-6 overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded hover:bg-[#2A2A2A]"
                >
                    <X size={20} className="text-white" />
                </button>

                <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                    <Sliders size={20} className="text-[#C7A36B]" />
                    Customize Space
                </h2>

                {/* ---------------- CLOCK STYLE ---------------- */}
                <section className="mb-6">
                    <h3 className="text-white font-semibold mb-2">Clock Style</h3>

                    <div className="relative">
                        <select
                            value={clockStyle}
                            onChange={(e) => setClockStyle(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-[#2A2A2A] border border-[#444] text-white focus:border-[#C7A36B] focus:outline-none"
                        >
                            <option value="minimal">Minimal</option>
                            <option value="modern">Modern</option>
                            <option value="retro">Retro</option>
                        </select>
                    </div>
                </section>

                {/* ---------------- FONT DROPDOWN ---------------- */}
                <section className="mb-6">
                    <h3 className="text-white font-semibold mb-2">Font Style</h3>

                    <div className="relative">
                        <select
                            value={clockFont}
                            onChange={(e) => setClockFont(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-[#2A2A2A] border border-[#444] text-white focus:border-[#C7A36B] focus:outline-none"
                        >
                            <option value="Inter">Inter</option>
                            <option value="Orbitron">Orbitron</option>
                            <option value="VT323">VT323</option>
                        </select>
                    </div>
                </section>

                {/* ---------------- BACKGROUND ---------------- */}
                <section className="mb-6">
                    <h3 className="text-white font-semibold mb-3">Background</h3>

                    <p className="text-white/60 text-sm mb-2">Choose from library</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {backgroundLibrary.map((src) => (
                            <button
                                key={src}
                                onClick={() => setBackground(src)}
                                className={`relative h-20 rounded overflow-hidden border transition ${background === src
                                    ? "ring-2 ring-[#C7A36B]"
                                    : "border-[#2A2A2A]"
                                    }`}
                            >
                                <Image src={src} alt="" fill className="object-cover" />
                            </button>
                        ))}
                    </div>

                    <p className="text-white/60 text-sm mb-2">Upload from device</p>

                    {/* custom upload button */}
                    <button
                        onClick={openFileDialog}
                        className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#444] rounded-md text-white hover:border-[#C7A36B] transition"
                    >
                        Choose image…
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                    />
                </section>

                {/* ---------------- LAYOUT ---------------- */}
                <section className="mb-6">
                    <h3 className="text-white font-semibold mb-2">Layout Presets</h3>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setLayout("centered-blur")}
                            className={`w-full px-3 py-2 rounded border transition ${layout === "centered-blur"
                                ? "bg-[#C7A36B]/20 border-[#C7A36B] text-white"
                                : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3]"
                                }`}
                        >
                            Centered + Blur
                        </button>

                        <button
                            onClick={() => setLayout("corner")}
                            className={`w-full px-3 py-2 rounded border transition ${layout === "corner"
                                ? "bg-[#C7A36B]/20 border-[#C7A36B] text-white"
                                : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3]"
                                }`}
                        >
                            Corner (No blur)
                        </button>
                    </div>
                </section>

                <button
                    onClick={handleSave}
                    className="w-full mt-4 px-4 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-lg font-semibold hover:bg-[#D4B896]"
                >
                    Apply & Save
                </button>
                <Link
                    href={`/editor/${spaceId}`}
                    className="w-full mt-3 px-4 py-3 bg-[#C7A36B]/20 text-[#C7A36B] rounded-lg font-semibold hover:bg-[#C7A36B]/30 transition block text-center"
                >
                    Full Editor
                </Link>
            </div>
        </div>
    )
}
