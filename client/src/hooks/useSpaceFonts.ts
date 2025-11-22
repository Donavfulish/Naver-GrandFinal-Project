// src/hooks/useSpaceFonts.ts

import { useState, useEffect } from "react"
import { FontItem, FontApiResponse, UseSpaceFonts } from "@/types/font"
import { BASE_URL } from "@/lib/constants"

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
                const clockRes = await fetch(`${BASE_URL}/spaces/fonts/clock`)
                const clockJson: FontApiResponse = await clockRes.json()

                if (!clockRes.ok || !clockJson.success) {
                    throw new Error(`Failed to fetch clock fonts: ${clockRes.status}`)
                }
                setClockStyles(clockJson.data)
                
                const textRes = await fetch(`${BASE_URL}/spaces/fonts/text`)
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