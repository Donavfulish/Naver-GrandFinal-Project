// src/hooks/useGenerateAISpace.ts
"use client"

import { useState } from "react"
import { 
    SpaceData, 
    APIResponse, 
    CreateSpaceBody
} from "@/types/space";
import { BASE_URL } from "@/lib/constants";


// --- HOOK INTERFACE ---
interface UseGenerateAISpace {
    generateSpace: (prompt: string) => Promise<SpaceData>;
    confirmSpaceGeneration: (payload: CreateSpaceBody) => Promise<any>;
    checkoutSpace: (spaceId: string) => Promise<any>;
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
            const response = await fetch(`${BASE_URL}/ai/generate`, {
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

    const confirmSpaceGeneration = async (payload: CreateSpaceBody): Promise<any> => {
        
        console.log("➡️ Calling CREATE SPACE API (POST /spaces) with payload:", payload)

        const response = await fetch(`${BASE_URL}/spaces`, {
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

    const checkoutSpace = async (spaceId: string) : Promise<any> => {
        console.log("checkout");

        const response = await fetch(`${BASE_URL}/ai/checkout`, {
            method: 'POST',
                        headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({spaceId}),
        })
         if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`checkout fall with ${errorText}`)
        }
        
        return response.json() 
    }

    return { generateSpace, confirmSpaceGeneration, checkoutSpace, isGenerating }
}