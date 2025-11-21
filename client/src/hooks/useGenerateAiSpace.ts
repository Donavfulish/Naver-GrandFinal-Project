// src/hooks/useGenerateAISpace.ts
"use client"

import { useState } from "react"

// --- INTERFACES ---

interface FontConfig {
    id: string;
    style?: string; // clock_font style name
    font_name?: string; // text_font font name
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

// Cấu trúc chính (Space object từ AI)
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

// Cấu trúc response từ API Generate
interface APIResponse {
    success: boolean;
    message: string;
    data: SpaceData;
}

// Cấu trúc Body gửi đến API POST /spaces (Dựa trên schema)
interface CreateSpaceBody {
    user_id: string;
    name: string;
    tags: string[];
    description: string | null;
    mood: string; 
    duration: number; 
    background_url: string;
    clock_font_id: string | null; 
    text_font_id: string | null; 
    tracks: string[]; 
    prompt: string | null;
    notes: string[]; // Chỉ gửi nội dung string
}

// --- ENDPOINTS ---
const AI_BASE_URL = "http://localhost:5000/ai"
const SPACES_BASE_URL = "http://localhost:5000/spaces"
const AI_GENERATE_ENDPOINT = `${AI_BASE_URL}/generate`
const CREATE_SPACE_ENDPOINT = `${SPACES_BASE_URL}/` 

// --- HOOK INTERFACE ---
interface UseGenerateAISpace {
    generateSpace: (prompt: string) => Promise<SpaceData>;
    confirmSpaceGeneration: (payload: CreateSpaceBody) => Promise<any>;
    isGenerating: boolean;
}

export function useGenerateAISpace(): UseGenerateAISpace {
    const [isGenerating, setIsGenerating] = useState(false)

    // Hàm gọi API tạo space (giữ nguyên)
    const generateSpace = async (prompt: string): Promise<SpaceData> => {
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

    // HÀM TẠO SPACE CHÍNH THỨC (Dùng trong CheckoutModal)
    const confirmSpaceGeneration = async (payload: CreateSpaceBody): Promise<any> => {
        
        console.log("➡️ Calling CREATE SPACE API (POST /spaces) with payload:", payload)

        const response = await fetch(CREATE_SPACE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`CREATE SPACE API call failed with status ${response.status}: ${errorText}`)
        }
        
        return response.json() 
    }

    return { generateSpace, confirmSpaceGeneration, isGenerating }
}