// src/lib/constants.ts
export const MOOD_SCORES: Record<string, number> = {
    Exhausted: 1,
    Frustrated: 2,
    Anxious: 3,
    Neutral: 4,
    Content: 5,
    Happy: 6,
    Inspired: 7,
    Joyful: 8
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;