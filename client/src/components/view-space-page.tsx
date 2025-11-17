// components/ViewSpacePage.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
    ChevronLeft,
    Settings,
    MessageCircle,
    Maximize,
    SkipBack,
    SkipForward,
    Play,
    Pause,
} from "lucide-react"
import SettingsPanel, { SettingsPreview } from "./setting-panel"
import { mockSpaces } from "@/lib/mock-spaces"

// fonts (next/font)
import { Inter, Orbitron, VT323 } from "next/font/google"
const inter = Inter({ subsets: ["latin"] })
const orbitron = Orbitron({ subsets: ["latin"] })
const vt323 = VT323({ subsets: ["latin"], weight: "400" })

const fontMap: Record<string, string> = {
    Inter: inter.className,
    Orbitron: orbitron.className,
    VT323: vt323.className,
}

interface ViewSpacePageProps {
    spaceId: string
}

export default function ViewSpacePage({ spaceId }: ViewSpacePageProps) {
    const [space, setSpace] = useState<(typeof mockSpaces)[0] | null>(null)
    const [showSettings, setShowSettings] = useState(false)
    const [headerOpacity, setHeaderOpacity] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    // editable preview state
    const [preview, setPreview] = useState<SettingsPreview | null>(null)

    useEffect(() => {
        const found = mockSpaces.find((s) => s.id === Number(spaceId))
        if (found) {
            setSpace(found)
            setPreview({
                clockStyle: found.clockStyle,
                clockFont: found.clockFont || "Inter",
                background: found.background || found.img || "/img/calming-ambient-environment.png",
                layout: "centered-blur",
            })
        }
    }, [spaceId])

    useEffect(() => {
        const handleScroll = () => setHeaderOpacity(Math.max(0, 1 - window.scrollY / 100))
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const detectFullscreen = () => {
        const domFs = Boolean(document.fullscreenElement)
        const browserFs = window.innerHeight === screen.height
        setIsFullscreen(domFs || browserFs)
    }

    useEffect(() => {
        document.addEventListener("fullscreenchange", detectFullscreen)
        window.addEventListener("resize", detectFullscreen)
        detectFullscreen()
        return () => {
            document.removeEventListener("fullscreenchange", detectFullscreen)
            window.removeEventListener("resize", detectFullscreen)
        }
    }, [])

    const enterFullscreen = () => document.documentElement.requestFullscreen?.()

    if (!space || !preview) {
        return (
            <div className="w-full h-screen bg-[#1E1E1E] flex items-center justify-center">
                <p className="text-[#B3B3B3]">Space not found</p>
            </div>
        )
    }

    // layout classes based on selected preset
    const layoutStyle = useMemo(() => {
        if (preview.layout === "centered-blur") {
            return {
                clockClass: "absolute top-[20%] left-1/2 -translate-x-1/2",
                playerClass: "absolute top-[48%] left-1/2 -translate-x-1/2",
                backdropClass: "bg-black/20 backdrop-blur-sm",
            }
        }
        // corner
        return {
            clockClass: "absolute bottom-70 left-18",
            playerClass: "absolute bottom-12 left-12",
            backdropClass: "",
        }
    }, [preview.layout])

    // live preview -> update preview via SettingsPanel
    const handlePreviewChange = (p: Partial<SettingsPreview>) => {
        setPreview((prev) => ({ ...(prev as SettingsPreview), ...p }))
    }

    // Save settings: apply to space (in-memory). You can extend to save server-side.
    const handleSave = (p: SettingsPreview) => {
        setSpace((s) => (s ? { ...s, clockStyle: p.clockStyle, clockFont: p.clockFont, background: p.background } : s))
        // Update preview already handled
    }

    const getClockIcon = (style: string) => {
        switch (style) {
            case "minimal":
                return "🕐"
            case "modern":
                return "⏰"
            case "retro":
                return "⌚"
            default:
                return "🕐"
        }
    }

    return (
        <motion.div
            className="relative w-full min-h-screen overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src={preview.background}
                    alt={space.name}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* overlay */}
            <div
                className={`
        absolute inset-0 pointer-events-none
        transition-all duration-300
        ${layoutStyle.backdropClass}
    `}
            ></div>

            {/* Header */}
            {!isFullscreen && (
                <>
                    <motion.div
                        className="absolute top-8 left-8 z-20"
                        style={{ opacity: headerOpacity }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/10 transition border border-white/20"
                        >
                            <ChevronLeft size={20} />
                            Dashboard
                        </Link>
                    </motion.div>

                    <motion.div
                        className="absolute top-8 right-8 z-20 flex flex-col gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-3 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition border border-white/20"
                        >
                            <Settings size={20} />
                        </button>

                        <button
                            onClick={enterFullscreen}
                            className="p-3 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition border border-white/20"
                        >
                            <Maximize size={20} />
                        </button>

                        <button className="p-3 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition border border-white/20">
                            <MessageCircle size={20} />
                        </button>
                    </motion.div>
                </>
            )}

            {/* Title */}
            <motion.h1
                className={`font-bold text-white ${isFullscreen ? "absolute top-8 left-8 text-xl md:text-xl" : "text-2xl md:text-2xl text-center mb-8 absolute top-20 left-10 z-30"}`}
            >
                {space.name}
            </motion.h1>

            {/* CLOCK (draggable) */}
            <motion.div
                drag
                dragElastic={0.2}
                dragMomentum={false}
                className={`cursor-grab active:cursor-grabbing ${layoutStyle.clockClass} z-30`}
            >
                <div className={`select-none text-center ${fontMap[preview.clockFont]}`}>
                    <div className="text-6xl mb-2">{getClockIcon(preview.clockStyle)}</div>
                    <p className="text-white/80 text-lg font-light tracking-wide capitalize">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-white text-6xl md:text-7xl font-semibold mt-1 leading-none">
                        {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
            </motion.div>

            {/* PLAYER (draggable) */}
            <motion.div
                drag
                dragElastic={0.2}
                dragMomentum={false}
                className={`z-30 ${layoutStyle.playerClass} w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-xl ${preview.layout === "centered-blur" ? "bg-black/30 backdrop-blur-2xl" : "bg-black/10"}`}
            >
                {/* Track info */}
                <div className="mb-3">
                    <p className="text-white text-lg font-semibold">{space.currentTrack}</p>
                    <p className="text-white/60 text-sm mt-1">{space.artist}</p>
                </div>

                {/* Progress */}
                <div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={40}
                        onChange={() => { }}
                        className="w-full accent-white cursor-pointer"
                        aria-label="progress"
                    />
                    <div className="flex justify-between text-white/50 text-xs mt-1">
                        <span>2:49</span>
                        <span>5:56</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-10 mt-6 text-white">
                    <button className="opacity-80 hover:opacity-100 transition">
                        <SkipBack size={28} />
                    </button>

                    <button
                        onClick={() => setIsPlaying((v) => !v)}
                        className="opacity-90 hover:opacity-100 transition"
                    >
                        {isPlaying ? <Pause size={40} /> : <Play size={40} />}
                    </button>

                    <button className="opacity-80 hover:opacity-100 transition">
                        <SkipForward size={28} />
                    </button>
                </div>
            </motion.div>

            {/* Settings panel */}
            <SettingsPanel
                open={showSettings}
                onClose={() => setShowSettings(false)}
                initial={preview}
                onPreviewChange={handlePreviewChange}
                onSave={handleSave}
            />
        </motion.div>
    )
}
