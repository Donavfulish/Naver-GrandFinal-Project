// src/hooks/useSpaceFonts.ts

import { useState, useEffect } from "react"

const SPACE_BASE_URL = "http://localhost:5000/spaces"
const CLOCK_FONT_ENDPOINT = `${SPACE_BASE_URL}/fonts/clock`
const TEXT_FONT_ENDPOINT = `${SPACE_BASE_URL}/fonts/text`

interface FontItem {
    id: string;
    font_name?: string; // cho font text
    style?: string; // cho font clock
}

interface FontApiResponse {
    success: boolean;
    data: FontItem[];
}

interface UseSpaceFonts {
    clockStyles: FontItem[];
    textStyles: FontItem[];
    isLoading: boolean;
    error: string | null;
}

export function useSpaceFonts(): UseSpaceFonts {
    const [clockStyles, setClockStyles] = useState<FontItem[]>([])
    const [textStyles, setTextStyles] = useState<FontItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFonts = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Fetch Clock Fonts
                const clockRes = await fetch(CLOCK_FONT_ENDPOINT)
                const clockJson: FontApiResponse = await clockRes.json()

                if (!clockRes.ok || !clockJson.success) {
                    throw new Error(`Failed to fetch clock fonts: ${clockRes.status}`)
                }
                setClockStyles(clockJson.data)
                
                // Fetch Text Fonts
                const textRes = await fetch(TEXT_FONT_ENDPOINT)
                const textJson: FontApiResponse = await textRes.json()

                if (!textRes.ok || !textJson.success) {
                    throw new Error(`Failed to fetch text fonts: ${textRes.status}`)
                }
                setTextStyles(textJson.data)

            } catch (err) {
                console.error("Error fetching space fonts:", err)
                setError("Failed to load font options.")
                setClockStyles([])
                setTextStyles([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchFonts()
    }, [])

    return { clockStyles, textStyles, isLoading, error }
}