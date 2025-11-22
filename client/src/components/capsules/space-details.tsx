"use client"

import React, { useState } from 'react';
import { X, Clock, Music, ChevronDown, ChevronUp } from 'lucide-react';
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

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
                >
                    {isLoading ? (
                        <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C7A36B] border-t-transparent mx-auto" />
                            <p className="text-white/70 mt-4">Loading space...</p>
                        </div>
                    ) : space ? (
                        <div className="relative h-full">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={space.background.background_url}
                                    alt={space.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                            </div>

                            {/* Content */}
                            <div className="relative h-full overflow-y-auto p-8">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{space.name}</h2>
                                        <p className="text-white/70 text-sm max-w-2xl">{space.description}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                                    >
                                        <X size={24} className="text-white" />
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {/* Mood */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMoodGradient(space.mood)} flex items-center justify-center`}>
                                                <span className="text-2xl">😊</span>
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-xs">Mood</p>
                                                <p className="text-white font-semibold">{space.mood}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] flex items-center justify-center">
                                                <Clock size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-xs">Duration</p>
                                                <p className="text-white font-semibold">{space.duration} min</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {space.space_tags.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-white/60 text-sm mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {space.space_tags.map((st, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-sm border border-white/20"
                                                >
                                                    #{st.tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Playlist Section */}
                                {space.playlists.length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 pt-4 border border-white/20">
                                        <button
                                            onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                    <Music size={20} className="text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-white font-semibold">{space.playlists[0].name}</p>
                                                    <p className="text-white/60 text-xs">
                                                        {space.playlists[0].playlist_tracks.length} tracks
                                                    </p>
                                                </div>
                                            </div>
                                            {isPlaylistOpen ? (
                                                <ChevronUp size={20} className="text-white/70" />
                                            ) : (
                                                <ChevronDown size={20} className="text-white/70" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {isPlaylistOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="space-y-2 overflow-hidden"
                                                >
                                                    {space.playlists[0].playlist_tracks
                                                        .sort((a, b) => a.track_order - b.track_order)
                                                        .map((pt, idx) => (
                                                            <div
                                                                key={pt.track.id}
                                                                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition group"
                                                            >
                                                                <span className="text-white/40 text-sm w-6">{idx + 1}</span>
                                                                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                                                    <Image
                                                                        src={pt.track.thumbnail}
                                                                        alt={pt.track.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-sm font-medium truncate">
                                                                        {pt.track.name}
                                                                    </p>
                                                                    <div className="flex gap-1 mt-1">
                                                                        {pt.track.emotion.slice(0, 2).map((em, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded"
                                                                            >
                                                                                {em}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Back Button */}
                                <button
                                    onClick={onClose}
                                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#534666] to-[#4A707A] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold rounded-lg transition"
                                >
                                    Back to Capsules
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] p-12 text-center">
                            <p className="text-white/70">No space data available</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
