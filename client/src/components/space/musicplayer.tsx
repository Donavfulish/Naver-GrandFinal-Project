"use client"

import { motion } from "framer-motion"
import { SkipBack, SkipForward, Play, Pause, Loader } from 'lucide-react'
import { PlaylistConfig } from "@/types/space"
import { useAudioStreamer } from "@/hooks/useAudioStreamer"
import React from "react"

interface MusicPlayerProps {
    playlist: PlaylistConfig
    artistName: string 
    playerClass?: string
    isSessionEnded?: boolean
}

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MusicPlayer({ playlist, artistName, playerClass = "", isSessionEnded = false }: MusicPlayerProps) {
    // Thêm `seekTo` và `audioRef` vào destructuring
    const { 
        currentTrack, 
        isPlaying, 
        togglePlay, 
        nextTrack, 
        prevTrack, 
        isLoading, 
        error, 
        duration, 
        currentTime,
        seekTo, 
        audioRef // Giữ lại để tham khảo, không bắt buộc cho seek
    } = useAudioStreamer(playlist.tracks);

    const trackName = currentTrack?.name || "No Track Selected";

    // --- LOGIC SEEK MỚI ---
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentTrack || duration === 0) return;

        // Giá trị thanh trượt là % (0 đến 100)
        const percent = parseInt(e.target.value, 10);
        // Tính toán thời gian seek (giây)
        const seekTime = (duration / 100) * percent;
        
        // Gọi hàm seekTo từ hook
        seekTo(seekTime);
        // Lưu ý: Ta không cần cập nhật currentTime ở đây, hook sẽ lo việc đó
        // thông qua event 'timeupdate' của Audio element.
    };
    
    // Tính toán giá trị thanh trượt (0 đến 100)
    const seekValue = duration > 0 ? (currentTime / duration) * 100 : 0;
    // --- KẾT THÚC LOGIC SEEK MỚI ---
    
    // Nếu có lỗi, hiển thị thông báo
    if (error) {
        return (
            <motion.div className={`bg-red-900/40 border border-red-500/50 rounded-3xl p-5 shadow-xl text-red-300 ${playerClass}`}>
                <p className="font-semibold">Playback Error:</p>
                <p className="text-sm">{error}</p>
            </motion.div>
        );
    }

    return (
        <motion.div 
            drag dragElastic={0.2} dragMomentum={false} 
            className={`${playerClass} rounded-3xl p-5 border border-white/10 shadow-xl bg-black/30 backdrop-blur-2xl`}
        >
            <p className="text-white text-lg font-semibold line-clamp-1">{trackName}</p>
            <p className="text-white/60 text-sm">{artistName}</p>
            
            {/* Seek Bar / Progress */}
            <input 
                type="range" 
                min={0} 
                max={100} 
                value={seekValue} 
                onChange={handleSeek} // KẾT NỐI VỚI HÀM THỰC TẾ
                disabled={!currentTrack || isLoading || duration === 0 || isSessionEnded}
                className="w-full accent-white mt-2 appearance-none h-1 bg-white/20 rounded-lg" 
            />
            <div className="flex justify-between text-white/50 text-xs mt-1">
                {/* HIỂN THỊ THỜI GIAN HIỆN TẠI VÀ TỔNG THỜI GIAN */}
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span> 
            </div>
            
             {/* Session Ended Message */}
            {isSessionEnded && (
                <p className="text-center text-white/60 text-xs mt-2 italic">
                    Session ended - Music unavailable
                </p>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-10 mt-4 text-white">
                <button onClick={prevTrack} disabled={isLoading || playlist.tracks.length < 2 || isSessionEnded} className="disabled:opacity-40">
                    <SkipBack size={28} />
                </button>
                
                <button onClick={togglePlay} disabled={!currentTrack || isLoading || isSessionEnded} className="disabled:opacity-40">
                    {isLoading ? (
                        <Loader size={40} className="animate-spin text-[#C7A36B]" />
                    ) : (
                        isPlaying ? <Pause size={40} /> : <Play size={40} />
                    )}
                </button>
                
                <button onClick={nextTrack} disabled={isLoading || playlist.tracks.length < 2 || isSessionEnded} className="disabled:opacity-40">
                    <SkipForward size={28} />
                </button>
            </div>
        </motion.div>
    );
}