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

export interface Track {
    id: string;
    name: string;
    thumbnail: string;
    track_url: string;
    emotion: string[];
    tags: string[];
    order: number;
}

export interface PlaylistConfig {
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

interface CreateSpaceBody {
    user_id: string; // Tên trường chính xác
    name: string;
    tags: string[];
    description: string | null;
    mood: string; // Thêm lại mood (vì bạn cần nó trong payload)
    duration: number; // Mặc định là 0
    background_url: string; // Sử dụng URL
    clock_font_id: string | null; // ID
    text_font_id: string | null; // ID
    tracks: string[]; // Array of IDs
    prompt: string | null;
    notes: string[]; // Mặc định là []
}

// --- ĐỊNH NGHĨA BASE URL VÀ ENDPOINT ---
const AI_BASE_URL = "http://localhost:5000/ai"
const SPACES_BASE_URL = "http://localhost:5000/spaces"
const AI_GENERATE_ENDPOINT = `${AI_BASE_URL}/generate`
const CREATE_SPACE_ENDPOINT = `${SPACES_BASE_URL}/`

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

        // --- TẠO PAYLOAD CHUẨN XÁC DỰA TRÊN SCHEMA VÀ YÊU CẦU ---
        const createBody: CreateSpaceBody = {
            // Trường yêu cầu: user_id
            user_id: userId,

            // Trường yêu cầu: name, tags
            name: data.name,
            tags: data.tags,

            // Trường tùy chọn: description, prompt
            description: data.description || null,
            prompt: data.prompt || null,

            // Trường cấu hình: ID/URL
            background_url: data.background.url,
            clock_font_id: data.clock_font.id || null,
            text_font_id: data.text_font.id || null,
            tracks: trackIds,

            // Trường bổ sung theo yêu cầu (mood, duration, notes)
            mood: data.mood,
            duration: 0, // Mặc định là 0
            notes: [],   // Mặc định là mảng rỗng
        };
        // -----------------------------------------------------------

        console.log("➡️ Calling CREATE SPACE API (POST /spaces) with body:", createBody)

        const response = await fetch(CREATE_SPACE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createBody),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`CREATE SPACE API call failed with status ${response.status}: ${errorText}`)
        }

        return response.json()
    }

    return { generateSpace, confirmSpaceGeneration, isGenerating }
}