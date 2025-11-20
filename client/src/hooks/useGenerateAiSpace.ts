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

interface ConfirmBody {
    userId: string;
    name: string;
    description: string | null;
    backgroundId: string;
    clockFontId: string;
    textFontId: string;
    tracks: string[]; // Chỉ cần ID
    prompt: string | null;
    tags: string[];
    // mood không có trong schema nhưng có trong body, nên thêm vào
    mood: string; 
}

const AI_BASE_URL = "http://localhost:5000/ai"
const AI_GENERATE_ENDPOINT = `${AI_BASE_URL}/generate`
const AI_CONFIRM_ENDPOINT = `${AI_BASE_URL}/generate/confirm`

const AI_ENDPOINT = "http://localhost:5000/ai/generate"

interface UseGenerateAISpace {
    generateSpace: (prompt: string) => Promise<SpaceData>;
    confirmSpaceGeneration: (data: SpaceData, userId: string) => Promise<any>;
    isGenerating: boolean;
}

export function useGenerateAISpace(): UseGenerateAISpace {
    const [isGenerating, setIsGenerating] = useState(false)

    // Hàm gọi API tạo space (giữ nguyên)
    const generateSpace = async (prompt: string): Promise<SpaceData> => {
        // ... (Logic gọi API generateSpace giữ nguyên) ...
        if (!prompt || isGenerating) {
            return Promise.reject(new Error("Invalid prompt or generation already in progress."))
        }
        
        setIsGenerating(true)
        console.log(`📡 Calling AI API with prompt: "${prompt}"`)

        try {
            const response = await fetch(AI_GENERATE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            if (!response.ok) {
                const errorText = await response.text() 
                throw new Error(`API call failed with status ${response.status}: ${errorText}`)
            }

            const jsonResponse: APIResponse = await response.json()
            const spaceData = jsonResponse.data
            
            console.log("✅ AI Space Generated:", spaceData.name)
            return spaceData

        } catch (error) {
            console.error("❌ Failed to generate AI Space:", error)
            throw error
        } finally {
            setIsGenerating(false)
        }
    }

    // HÀM GỌI API XÁC NHẬN MỚI
    const confirmSpaceGeneration = async (data: SpaceData, userId: string): Promise<any> => {
        const trackIds = data.playlist.tracks.map(t => t.id);
        const confirmBody: ConfirmBody = {
            userId: userId,
            name: data.name,
            description: data.description || null,
            backgroundId: data.background.id,
            clockFontId: data.clock_font.id,
            textFontId: data.text_font.id,
            tracks: trackIds,
            prompt: data.prompt || null,
            tags: data.tags,
            mood: data.mood // Thêm mood vào body
        }
        console.log("➡️ Calling Confirm API with body:", confirmBody)

        const response = await fetch(AI_CONFIRM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(confirmBody),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Confirm API call failed with status ${response.status}: ${errorText}`)
        }

        return response.json() // Trả về response từ server
    }

    return { generateSpace, confirmSpaceGeneration, isGenerating }
}