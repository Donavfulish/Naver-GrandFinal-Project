"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, Settings, MessageCircle, Sliders, X } from 'lucide-react'
import { mockSpaces } from "@/lib/mock-spaces"

interface ViewSpacePageProps {
  spaceId: string
}

export default function ViewSpacePage({ spaceId }: ViewSpacePageProps) {
  const [space, setSpace] = useState<(typeof mockSpaces)[0] | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [headerOpacity, setHeaderOpacity] = useState(1)

  useEffect(() => {
    const foundSpace = mockSpaces.find((s) => s.id === Number.parseInt(spaceId))
    if (foundSpace) {
      setSpace(foundSpace)
    }
  }, [spaceId])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setHeaderOpacity(Math.max(0, 1 - scrollY / 100))
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!space) {
    return (
      <div className="w-full h-screen bg-[#1E1E1E] flex items-center justify-center">
        <p className="text-[#B3B3B3]">Space not found</p>
      </div>
    )
  }

  const getClockIcon = () => {
    switch (space.clockStyle) {
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
      className="w-full min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundImage: `url('${space.background}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

      <motion.div
        className="absolute top-8 left-8 z-20"
        style={{ opacity: headerOpacity }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E]/40 backdrop-blur-lg rounded-xl text-[#F5F5F5] hover:bg-[#C7A36B]/20 transition border border-[#C7A36B]/20"
        >
          <ChevronLeft size={20} />
          Dashboard
        </Link>
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 z-20 flex flex-col gap-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-[#1E1E1E]/40 backdrop-blur-lg rounded-xl text-[#F5F5F5] hover:bg-[#C7A36B]/30 transition border border-[#C7A36B]/20 group"
          title="Settings"
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <button
          className="p-3 bg-[#1E1E1E]/40 backdrop-blur-lg rounded-xl text-[#F5F5F5] hover:bg-[#7C9A92]/30 transition border border-[#7C9A92]/20"
          title="Chatbot"
        >
          <MessageCircle size={20} />
        </button>
      </motion.div>

      {/* Main Content - Centered floating widgets */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center px-6">
        {/* Clock Widget */}
        <motion.div
          className="mb-12 p-8 bg-[#1E1E1E]/80 backdrop-blur-lg rounded-2xl border border-[#C7A36B]/40 shadow-2xl"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          drag
          dragElastic={0.2}
          dragMomentum={false}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">{getClockIcon()}</div>
            <p className="text-[#B3B3B3] text-sm capitalize mb-2">{space.clockStyle} Clock</p>
            <div className="text-3xl font-bold text-[#C7A36B] font-mono">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        </motion.div>

        {/* Space Name */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-[#F5F5F5] text-center mb-8 text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {space.name}
        </motion.h1>

        {/* Playlist Widget */}
        <motion.div
          className="p-8 bg-[#1E1E1E]/80 backdrop-blur-lg rounded-2xl border border-[#7C9A92]/40 shadow-2xl max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          drag
          dragElastic={0.2}
          dragMomentum={false}
        >
          <div>
            <p className="text-[#B3B3B3] text-sm mb-4 font-semibold">Now Playing</p>
            <div className="space-y-3">
              {space.playlist.map((track, index) => (
                <motion.div
                  key={index}
                  className="p-3 bg-[#2A2A2A] rounded-lg border border-[#7C9A92]/20 hover:border-[#7C9A92]/50 transition"
                  whileHover={{ x: 4 }}
                >
                  <p className="text-[#F5F5F5] text-sm font-medium">{track}</p>
                  <p className="text-[#B3B3B3] text-xs mt-1">
                    ♫ {Math.floor(Math.random() * 4) + 3}:{String(Math.floor(Math.random() * 60)).padStart(2, "0")}
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-4 h-1 bg-gradient-to-r from-[#7C9A92]/0 via-[#7C9A92] to-[#7C9A92]/0 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </motion.div>

        {/* Mood Tags */}
        <motion.div
          className="mt-12 flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {space.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-[#C7A36B]/15 text-[#C7A36B] rounded-full text-sm border border-[#C7A36B]/40"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />

            {/* Settings Panel */}
            <motion.div
              className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] border-l border-[#C7A36B]/20 z-40 overflow-y-auto"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#2A2A2A] rounded-lg transition"
              >
                <X size={24} className="text-[#F5F5F5]" />
              </button>

              {/* Settings Content */}
              <div className="p-8 pt-16">
                <h2 className="text-2xl font-bold text-[#F5F5F5] mb-8 flex items-center gap-2">
                  <Sliders size={24} className="text-[#C7A36B]" />
                  Customize Space
                </h2>

                {/* Clock Customization */}
                <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Clock Style</h3>
                  <div className="space-y-3">
                    {["minimal", "modern", "retro"].map((style) => (
                      <button
                        key={style}
                        className={`w-full px-4 py-3 rounded-lg border transition capitalize ${
                          space.clockStyle === style
                            ? "bg-[#C7A36B]/20 border-[#C7A36B] text-[#F5F5F5]"
                            : "bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50"
                        }`}
                      >
                        {style} Clock
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Font Style</h3>
                  <div className="space-y-3">
                    {["sans", "serif", "mono"].map((font) => (
                      <button
                        key={font}
                        className="w-full px-4 py-3 rounded-lg border bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50 transition capitalize"
                      >
                        {font} Font
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Display Style</h3>
                  <div className="space-y-3">
                    {["minimal", "modern", "retro"].map((style) => (
                      <button
                        key={style}
                        className="w-full px-4 py-3 rounded-lg border bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50 transition capitalize"
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Customization */}
                <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Background</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 rounded-lg border bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50 transition">
                      Choose from Library
                    </button>
                    <button className="w-full px-4 py-3 rounded-lg border bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50 transition">
                      Upload Custom
                    </button>
                  </div>
                </div>

                {/* Playlist Customization */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Playlist</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 rounded-lg border bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50 transition">
                      Built-in Playlists
                    </button>
                    <button className="w-full px-4 py-3 rounded-lg border bg-[#2A2A2A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#C7A36B]/50 transition">
                      Import from Spotify
                    </button>
                  </div>
                </div>

                {/* Edit in Full Editor */}
                <Link
                  href={`/editor/${space.id}`}
                  className="w-full px-4 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-lg font-semibold hover:bg-[#D4B896] transition text-center block"
                >
                  Full Editor
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
