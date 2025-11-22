import { Track } from '@/types/space';

export interface UseAudioStreamer {
    currentTrack: Track | null;
    isPlaying: boolean;
    streamUrl: string | null;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    setCurrentIndex: (index: number) => void;
    isLoading: boolean;
    error: string | null;
    duration: number;
    currentTime: number;
    seekTo: (time: number) => void;
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}
