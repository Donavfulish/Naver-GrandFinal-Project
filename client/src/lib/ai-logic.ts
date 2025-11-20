import { useState } from "react"
import { mockSpaces, mockVibeConfigs, FullSpace, MockSpace } from "@/lib/mock-spaces" 

// --- START: RÚT GỌN AI LOGIC ---

// Hàm ngẫu nhiên hóa Vibe Config
function getRandomVibeConfig() {
    const randomIndex = Math.floor(Math.random() * mockVibeConfigs.length)
    return mockVibeConfigs[randomIndex]
}

// Hàm ngẫu nhiên hóa Base Space
function getRandomBaseSpace(): MockSpace {
    const randomIndex = Math.floor(Math.random() * mockSpaces.length)
    return mockSpaces[randomIndex]
}

// Hàm giả lập toàn bộ quá trình tạo FullSpace
async function generateRandomFullSpace(userFeeling: string): Promise<FullSpace> {
    // Không cần dùng userFeeling nữa, nhưng giữ tham số để mô phỏng API
    console.log(`[AI Mock] Input: "${userFeeling}". Generating random space...`)
    
    // Chọn ngẫu nhiên Base Space và Vibe Config
    const baseSpace = getRandomBaseSpace()
    const vibe = getRandomVibeConfig()

    // Lắp ráp Full Space
    const fullSpace: FullSpace = {
        ...baseSpace,
        vibeConfig: vibe,
        notes: [], 
        sessionStartTime: Date.now(),
        settingPanel: { 
            theme: vibe.theme, 
            font: vibe.font, 
            music: vibe.music, 
            colors: vibe.colors 
        },
    }
    
    return fullSpace
}

// --- CUSTOM HOOK ---

interface UseAISpaceGenerator {
    generateSpace: (userFeeling: string) => Promise<FullSpace>;
    isGenerating: boolean;
}

export function useAISpaceGenerator(): UseAISpaceGenerator {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateSpace = async (userFeeling: string): Promise<FullSpace> => {
        if (isGenerating) {
             // Tránh gửi nhiều lần
             return Promise.reject(new Error("Space generation is already in progress."))
        }
        
        setIsGenerating(true)

        try {
            // Giả lập gọi API (delay)
            await new Promise(r => setTimeout(r, 1500)) 

            // Gọi hàm tạo ngẫu nhiên
            const fullSpace = await generateRandomFullSpace(userFeeling)
            
            console.log("✨ Generated Random Space:", fullSpace.title, "Mood:", fullSpace.vibeConfig.mood)
            return fullSpace
        } catch (error) {
            console.error("Error generating space:", error)
            throw error
        } finally {
            setIsGenerating(false)
        }
    }

    return { generateSpace, isGenerating }
}