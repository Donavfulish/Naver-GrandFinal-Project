// components/SettingsPanel.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Sliders, X, Loader, ChevronLeft, ChevronRight } from "lucide-react"
import { useSpaceFonts } from "@/hooks/useSpaceFonts"
import { SpaceData } from "@/types/space"
import { getFontFamily } from '@/utils/fonts'
import { useSessionStore, SettingsPreview as SettingsPreviewType } from "@/lib/store" 
import useBackgroundsData from "@/hooks/useBackground"
import { Background } from "@/types/background"

export type SettingsPreview = SettingsPreviewType;

interface SettingsPanelProps {
    open: boolean
    onClose: () => void
    initial: SettingsPreview
    onPreviewChange: (p: Partial<SettingsPreview>) => void
    onSave: (p: SettingsPreview) => void
    space: SpaceData
    spaceId: number | string
}

export default function SettingsPanel({
    open,
    onClose,
    initial,
    onPreviewChange,
    onSave,
    space,
    spaceId
}: SettingsPanelProps) {
    const { setFinalSettings } = useSessionStore() 

    const { clockStyles, textStyles, isLoading: isFontsLoading, error: fontsError } = useSpaceFonts()
    const [selectedClockStyleId, setSelectedClockStyleId] = useState(space.clock_font.id)
    const [selectedTextFontId, setSelectedTextFontId] = useState(space.text_font.id)
    const [backgroundUrl, setBackgroundUrl] = useState(space.background.url)
    const { data: bgdata, isLoading, error } = useBackgroundsData()
  
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 6

    const initialTextFontName = space.text_font.font_name || "Inter"

    const currentClockStyleName = useMemo(() => {
        return clockStyles.find(cs => cs.id === selectedClockStyleId)?.style || initial.clockStyle
    }, [clockStyles, selectedClockStyleId, initial.clockStyle])

    const currentTextFontName = useMemo(() => {
        return textStyles.find(ts => ts.id === selectedTextFontId)?.font_name || initialTextFontName
    }, [textStyles, selectedTextFontId, initialTextFontName])

    useEffect(() => {
        onPreviewChange({
            clockStyle: currentClockStyleName,
            clockFont: currentTextFontName,
            background: backgroundUrl,
        })
    }, [currentClockStyleName, currentTextFontName, backgroundUrl, onPreviewChange])

    const backgroundLibrary = bgdata.map((b) => b.background_url);

    // Tính toán pagination
    const totalPages = Math.ceil(backgroundLibrary.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentBackgrounds = backgroundLibrary.slice(startIndex, endIndex)

    const handleSave = () => {
        const finalPreview: SettingsPreview = {
            clockStyle: currentClockStyleName,
            clockFont: currentTextFontName,
            background: backgroundUrl,
        };
        
        setFinalSettings(finalPreview);
        onSave(finalPreview); 
        onClose();
    }

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
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
            <div className="relative ml-auto w-full sm:w-96 h-full bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] p-6 overflow-y-auto text-white">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded hover:bg-[#2A2A2A]"
                >
                    <X size={20} className="text-white" />
                </button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 mt-10">
                    <Sliders size={20} className="text-[#C7A36B]" />
                    Customize Space
                </h2>

                {isFontsLoading && (
                    <div className="flex items-center justify-center py-8 text-white/70">
                        <Loader size={20} className="animate-spin mr-2" /> Loading Fonts...
                    </div>
                )}

                {fontsError && (
                    <div className="py-4 text-red-400 text-sm border border-red-400/50 p-3 rounded-lg mb-4">
                        Error: {fontsError}
                    </div>
                )}

                {!isFontsLoading && !fontsError && (
                    <>
                        {/* ---------------- CLOCK STYLE ---------------- */}
                        <section className="mb-6">
                            <h3 className="font-semibold mb-2">Clock Style</h3>
                            <div className="relative">
                                <select
                                    value={selectedClockStyleId}
                                    onChange={(e) => setSelectedClockStyleId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-[#2A2A2A] border border-[#444] text-white focus:border-[#C7A36B] focus:outline-none"
                                >
                                    {clockStyles.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.style}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* ---------------- TEXT FONT ---------------- */}
                        <section className="mb-6">
                            <h3 className="font-semibold mb-2">Text Font (for Clock)</h3>
                            <div className="relative">
                                <select
                                    value={selectedTextFontId}
                                    onChange={(e) => setSelectedTextFontId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-[#2A2A2A] border border-[#444] text-white focus:border-[#C7A36B] focus:outline-none"
                                >
                                    {textStyles.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.font_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-white/60 text-xs mt-1">Current Font:
                                <span
                                    className="font-medium text-[#C7A36B]"
                                    style={{ fontFamily: getFontFamily(currentTextFontName) }}
                                >
                                    {currentTextFontName}
                                </span>
                            </p>
                        </section>
                    </>
                )}


                {/* ---------------- BACKGROUND ---------------- */}
                <section className="mb-6">
                    <h3 className="font-semibold mb-3">Background</h3>
                    <p className="text-white/60 text-sm mb-2">Choose from library</p>
                    
                    {/* Grid ảnh */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {currentBackgrounds.map((src) => (
                            <button
                                key={src}
                                onClick={() => setBackgroundUrl(src)}
                                className={`relative h-20 rounded overflow-hidden border transition ${
                                    backgroundUrl === src
                                        ? "ring-2 ring-[#C7A36B]"
                                        : "border-[#2A2A2A]"
                                }`}
                            >
                                <Image src={src} alt="" fill className="object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded hover:bg-[#2A2A2A] disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <span className="text-sm text-white/70">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded hover:bg-[#2A2A2A] disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </section>

                <button
                    onClick={handleSave}
                    disabled={isFontsLoading}
                    className="w-full mt-4 px-4 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-lg font-semibold hover:bg-[#D4B896] disabled:opacity-50"
                >
                    Apply & Save
                </button>
            </div>
        </div>
    )
}