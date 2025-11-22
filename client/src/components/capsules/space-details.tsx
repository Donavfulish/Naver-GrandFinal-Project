"use client"

import React, { useState } from 'react';
import { X, Clock, Music, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SpaceDetailData } from '@/hooks/useSpaceDetails';

interface SpaceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    space: SpaceDetailData | null;
    isLoading: boolean;
}

export default function SpaceDetailModal({ isOpen, onClose, space, isLoading }: SpaceDetailModalProps) {
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

    if (!isOpen) return null;

    const getMoodGradient = (mood: string) => {
        const gradients: Record<string, string> = {
            exhausted: "from-gray-600 to-slate-700",
            frustrated: "from-red-600 to-orange-600",
            anxious: "from-yellow-600 to-amber-600",
            neutral: "from-gray-400 to-slate-400",
            content: "from-blue-400 to-cyan-400",
            happy: "from-green-400 to-emerald-400",
            inspired: "from-purple-500 to-pink-500",
            joyful: "from-yellow-400 to-orange-400"
        };
        return gradients[mood.toLowerCase()] || "from-[#C7A36B] to-[#7C9A92]";
    };

    const MAX_VISIBLE_TAGS = 3;
    const trackCount = space?.playlists[0]?.playlist_tracks?.length || 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="bg-gradient-to-br from-zinc-900 to-black border border-slate-800 border-2 rounded-3xl shadow-2xl max-w-5xl w-full text-white overflow-hidden flex flex-col md:flex-row h-auto md:h-[580px]"
                >
                    {isLoading ? (
                        <div className="w-full p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C7A36B] border-t-transparent mx-auto" />
                            <p className="text-white/70 mt-4">Loading space...</p>
                        </div>
                    ) : space ? (
                        <>
                            {/* Left Side - Image Preview */}
                            <div className="relative w-full md:w-[45%] h-64 md:h-full bg-gray-900 overflow-hidden group">
                                <Image
                                    src={space.background.background_url}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt="Space Background"
                                    priority
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                {/* Mood Badge */}
                                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20">
                                    <Zap size={20} className="text-[#C7A36B]" />
                                    <span className="text-lg font-semibold">{space.mood}</span>
                                </div>
                            </div>

                            {/* Right Side - Details Panel */}
                            <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-between bg-gradient-to-br from-zinc-900/50 to-transparent overflow-y-auto">
                                <div className="space-y-5 flex-1">
                                    {/* Header */}
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#C7A36B] via-[#D4B886] to-[#7C9A92] bg-clip-text text-transparent leading-tight flex-1">
                                                {space.name}
                                            </h2>
                                            <button
                                                onClick={onClose}
                                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition border border-white/20 ml-4"
                                            >
                                                <X size={20} className="text-white" />
                                            </button>
                                        </div>

                                        {/* Description Section */}
                                        <div className="bg-gradient-to-r from-white/5 to-transparent border-l-2 border-[#C7A36B] pl-4 py-2.5 rounded-r-lg pr-6">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-1.5 h-1.5 bg-[#C7A36B] rounded-full" />
                                                <span className="text-xs text-[#C7A36B] uppercase tracking-wider font-bold">
                                                    Description
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70 italic leading-relaxed line-clamp-2">
                                                "{space.description}"
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        {space.space_tags.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {space.space_tags.slice(0, MAX_VISIBLE_TAGS).map((st, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20"
                                                    >
                                                        #{st.tag.name}
                                                    </span>
                                                ))}
                                                {space.space_tags.length > MAX_VISIBLE_TAGS && (
                                                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20">
                                                        +{space.space_tags.length - MAX_VISIBLE_TAGS}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Space Details Grid */}
                                    <div className="grid grid-cols-1 gap-3 pt-1">
                                        {/* Duration */}
                                        <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors">
                                            <div className="mt-0.5">
                                                <Clock size={18} className="text-[#C7A36B]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white/50 mb-0.5">Duration</p>
                                                <p className="text-sm text-white/90 font-medium">
                                                    {space.duration} minutes
                                                </p>
                                            </div>
                                        </div>

                                        {/* Playlist Dropdown */}
                                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-colors hover:bg-white/[0.07]">
                                            <button
                                                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                                                className="w-full flex items-start gap-3 p-3"
                                            >
                                                <div className="mt-0.5">
                                                    <Music size={18} className="text-[#7C9A92]" />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="text-xs text-white/50 mb-0.5">Playlist</p>
                                                    <p className="text-sm text-white/90 font-medium truncate">
                                                        {space.playlists[0]?.name || 'Playlist'}
                                                    </p>
                                                    <p className="text-xs text-white/60 mt-0.5">
                                                        {trackCount} tracks curated
                                                    </p>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isPlaylistOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="mt-0.5"
                                                >
                                                    <ChevronDown size={18} className="text-white/60" />
                                                </motion.div>
                                            </button>

                                            <AnimatePresence>
                                                {isPlaylistOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="border-t border-white/10"
                                                    >
                                                        <div className="max-h-[200px] overflow-y-auto px-3 py-2 space-y-1.5">
                                                            {space.playlists[0]?.playlist_tracks
                                                                .sort((a, b) => a.track_order - b.track_order)
                                                                .map((pt, idx) => (
                                                                    <div
                                                                        key={pt.track.id}
                                                                        className="flex items-center gap-2.5 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition group"
                                                                    >
                                                                        <span className="text-white/40 text-xs w-4 font-medium">
                                                                            {idx + 1}
                                                                        </span>
                                                                        <div className="relative w-9 h-9 rounded-md overflow-hidden flex-shrink-0">
                                                                            <Image
                                                                                src={pt.track.thumbnail}
                                                                                alt={pt.track.name}
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs text-white/90 font-medium truncate">
                                                                                {pt.track.name}
                                                                            </p>
                                                                            <div className="flex gap-1 mt-0.5">
                                                                                {pt.track.emotion.slice(0, 2).map((em, i) => (
                                                                                    <span
                                                                                        key={i}
                                                                                        className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded"
                                                                                    >
                                                                                        {em}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <button
                                        onClick={onClose}
                                        className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-xl hover:shadow-[#C7A36B]/30 hover:scale-[1.02] rounded-xl transition-all duration-200 font-semibold"
                                    >
                                        <X size={18} className="mr-2" />
                                        Back to Capsules
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full p-12 text-center">
                            <p className="text-white/70">No space data available</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}