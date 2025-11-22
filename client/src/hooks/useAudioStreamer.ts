import { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '@/lib/constants';
import { UseAudioStreamer } from '@/types/audio';
import { Track } from '@/types/space';

export function useAudioStreamer(tracks: Track[] = []): UseAudioStreamer {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentTrack = tracks[currentIndex] || null;
    const streamUrl = currentTrack ? `${BASE_URL}/tracks/${currentTrack.id}/stream` : null;

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.volume = 0.5; 
        }
    }, []);

    useEffect(() => {
        if (streamUrl && audioRef.current) {
            setIsLoading(true);
            setError(null);
            
            audioRef.current.pause();
            audioRef.current.src = streamUrl;
            
            // Xử lý khi metadata được tải xong (để lấy duration)
            const handleLoadedMetadata = () => {
                setDuration(audioRef.current?.duration || 0);
                setIsLoading(false);
                if (isPlaying) {
                    audioRef.current?.play().catch(e => console.error("Play failed:", e));
                }
            };

            // Xử lý lỗi phát
            const handleError = (e: Event) => {
                console.error("Audio error:", audioRef.current?.error);
                setError(`Failed to load track: ${currentTrack?.name}`);
                setIsLoading(false);
                setIsPlaying(false);
            };

            // Xử lý cập nhật thời gian
            const handleTimeUpdate = () => {
                setCurrentTime(audioRef.current?.currentTime || 0);
            };

            // Xử lý khi track kết thúc
            const handleEnded = () => {
                nextTrack();
            };

            audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
            audioRef.current.addEventListener('error', handleError);
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('ended', handleEnded);

            return () => {
                audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audioRef.current?.removeEventListener('error', handleError);
                audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
                audioRef.current?.removeEventListener('ended', handleEnded);
            };
        } else if (audioRef.current) {
            audioRef.current.src = ''; // Clear source
            setIsPlaying(false);
            setIsLoading(false);
        }
    }, [streamUrl, currentIndex]); // Tải lại khi streamUrl thay đổi

    const play = () => {
        if (audioRef.current && !isLoading) {
            audioRef.current.play().catch(e => console.error("Play failed:", e));
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const togglePlay = () => isPlaying ? pause() : play();

    const nextTrack = () => {
        if (tracks.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % tracks.length);
        }
    };

    const prevTrack = () => {
        if (tracks.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        }
    };

    const seekTo = (time: number) => {
        if (audioRef.current && time >= 0 && time <= duration) {
            audioRef.current.currentTime = time;
        }
    };

    return {
        currentTrack,
        isPlaying,
        streamUrl,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        setCurrentIndex,
        isLoading,
        error,
        duration,
        currentTime,
        seekTo, 
        audioRef,
    };
}