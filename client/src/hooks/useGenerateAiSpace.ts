// src/hooks/useGenerateAISpace.ts

import { useState } from "react"

interface FontConfig {
    id: string;
    style?: string; // clock_font
    font_name?: string; // text_font
}

interface BackgroundConfig {
    id: string;
    url: string;
    emotion: string[];
    tags: string[];
}

interface Track {
    id: string;
    name: string;
    thumbnail: string;
    track_url: string;
    emotion: string[];
    tags: string[];
    order: number;
}

interface PlaylistConfig {
    name: string;
    tracks: Track[];
}

// Định nghĩa cấu trúc chính (Space object)
export interface SpaceData { 
    name: string;
    description: string;
    mood: string;
    introPage1: string;
    introPage2: string;
    introPage3: string;
    clock_font: FontConfig;
    text_font: FontConfig;
    background: BackgroundConfig;
    playlist: PlaylistConfig;
    prompt: string;
    tags: string[];
}

// Cấu trúc response từ API
interface APIResponse {
    success: boolean;
    message: string;
    data: SpaceData;
}


const AI_ENDPOINT = "http://localhost:5000/ai/generate"

interface UseGenerateAISpace {
    generateSpace: (prompt: string) => Promise<SpaceData>;
    isGenerating: boolean;
}

export function useGenerateAISpace(): UseGenerateAISpace {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateSpace = async (prompt: string): Promise<SpaceData> => {
        if (!prompt || isGenerating) {
            return Promise.reject(new Error("Invalid prompt or generation already in progress."))
        }

        setIsGenerating(true)
        console.log(`📡 Calling AI API with prompt: "${prompt}"`)

        try {
            const response = await fetch(AI_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            })

            if (!response.ok) {
                // Đọc thông báo lỗi từ server nếu có
                const errorText = await response.text() 
                throw new Error(`API call failed with status ${response.status}: ${errorText}`)
            }

            const jsonResponse: APIResponse = await response.json()
            const spaceData = jsonResponse.data

            const finalSpaceData: SpaceData = {
                ...spaceData,
            }
            
            console.log("✅ AI Space Generated:", finalSpaceData.name, "Mood:", finalSpaceData.mood)
            return finalSpaceData

        } catch (error) {
            console.error("❌ Failed to generate AI Space:", error)
            throw error
        } finally {
            setIsGenerating(false)
        }
    }

    return { generateSpace, isGenerating }
}