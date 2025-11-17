"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Settings, MessageCircle, Sliders, X, Maximize } from 'lucide-react'
import { mockSpaces } from "@/lib/mock-spaces"

interface ViewSpacePageProps {
    spaceId: string
}

export default function ViewSpacePage({ spaceId }: ViewSpacePageProps) {
    const [space, setSpace] = useState<(typeof mockSpaces)[0] | null>(null)
    const [showSettings, setShowSettings] = useState(false)
    const [headerOpacity, setHeaderOpacity] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // ------------------------------
    // LOAD SPACE DATA
    // ------------------------------
    useEffect(() => {
        const found = mockSpaces.find((s) => s.id === Number(spaceId))
        if (found) setSpace(found)
    }, [spaceId])

    // ------------------------------
    // SCROLL FADE HEADER
    // ------------------------------
    useEffect(() => {
        const handleScroll = () => {
            setHeaderOpacity(Math.max(0, 1 - window.scrollY / 100))
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // ------------------------------
    // FULLSCREEN DETECT (F11 + API)
    // ------------------------------
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

    // ------------------------------
    // FULLSCREEN TOGGLE BUTTON
    // ------------------------------
    const enterFullscreen = () => {
        if (isFullscreen) return
        document.documentElement.requestFullscreen?.()
    }

    if (!space) {
        return (
            <div className="w-full h-screen bg-[#1E1E1E] flex items-center justify-center">
                <p className="text-[#B3B3B3]">Space not found</p>
            </div>
        )
    }

    const getClockIcon = () => {
        switch (space.clockStyle) {
            case "minimal": return "🕐"
            case "modern": return "⏰"
            case "retro": return "⌚"
            default: return "🕐"
        }
    }

    return (
        <motion.div
            className="relative w-full min-h-screen overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >

            {/* BACKGROUND IMAGE */}
            <div className="absolute inset-0">
                <Image
                    src={space.img}
                    alt={space.name}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* overlays */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

            {/* ------------------------------ */}
            {/* HEADER BUTTONS (hide in FS) */}
            {/* ------------------------------ */}
            {!isFullscreen && (
                <>
                    {/* back button */}
                    <motion.div
                        className="absolute top-8 left-8 z-20"
                        style={{ opacity: headerOpacity }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/10 transition border border-white/20"
                        >
                            <ChevronLeft size={20} />
                            Dashboard
                        </Link>
                    </motion.div>

                    {/* right buttons */}
                    <motion.div
                        className="absolute top-8 right-8 z-20 flex flex-col gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-3 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition border border-white/20 group"
                        >
                            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <button
                            onClick={enterFullscreen}
                            className="p-3 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition border border-white/20"
                        >
                            <Maximize size={20} />
                        </button>

                        <button
                            className="p-3 bg-black/40 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition border border-white/20"
                        >
                            <MessageCircle size={20} />
                        </button>
                    </motion.div>
                </>
            )}

            {/* ------------------------------ */}
            {/* MAIN CONTENT */}
            {/* ------------------------------ */}
            <div className="relative w-full h-screen flex flex-col items-center justify-center px-6">

                {/* Clock Widget */}
                <motion.div
                    className="mb-12 p-8 bg-black/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl"
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    drag
                    dragElastic={0.2}
                    dragMomentum={false}
                >
                    <div className="text-center">
                        <div className="text-6xl mb-4">{getClockIcon()}</div>
                        <p className="text-gray-300 text-sm capitalize mb-2">{space.clockStyle} Clock</p>
                        <div className="text-3xl font-bold text-[#C7A36B] font-mono">
                            {new Date().toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Title — adapted for fullscreen */}
                <motion.h1
                    className={`font-bold text-white 
              ${isFullscreen
                            ? "absolute top-8 left-8 text-xl md:text-2xl text-left"
                            : "text-4xl md:text-5xl text-center mb-8"
                        }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {space.name}
                </motion.h1>

                {/* Playlist Widget */}
                <motion.div
                    className="p-8 bg-black/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl max-w-md"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    drag
                    dragElastic={0.2}
                    dragMomentum={false}
                >
                    <div>
                        <p className="text-gray-300 text-sm mb-4 font-semibold">Now Playing</p>
                        <div className="space-y-3">
                            {space.playlist.map((track, index) => (
                                <motion.div
                                    key={index}
                                    className="p-3 bg-black/40 rounded-lg border border-white/20 hover:border-white/50 transition"
                                    whileHover={{ x: 4 }}
                                >
                                    <p className="text-white text-sm font-medium">{track}</p>
                                    <p className="text-gray-300 text-xs mt-1">
                                        ♫ {Math.floor(Math.random() * 4) + 3}:
                                        {String(Math.floor(Math.random() * 60)).padStart(2, "0")}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* SETTINGS PANEL */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                        />

                        <motion.div
                            className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] border-l border-[#C7A36B]/20 z-40 overflow-y-auto"
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <button
                                onClick={() => setShowSettings(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-[#2A2A2A] rounded-lg transition"
                            >
                                <X size={24} className="text-white" />
                            </button>

                            {/* ... giữ nội dung setting nguyên ... */}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
