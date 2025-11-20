"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import GeneratorInput from "./generator-input"
import GeneratedSpacePreview from "./generated-space-preview"
import { Sparkles } from "lucide-react"

interface GeneratedSpace {
  name: string
  description: string
  background: string
  clockStyle: string
  playlist: string
  tags: string[]
}

export default function AISpaceGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedSpace, setGeneratedSpace] = useState<GeneratedSpace | null>(null)

  const handleGenerate = async (userPrompt: string) => {
    setPrompt(userPrompt)
    setIsLoading(true)

    // Simulate AI generation with delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock AI response based on prompt
    const mockResponses: Record<string, GeneratedSpace> = {
      rainy: {
        name: "Rainy Study Session",
        description: "A calm space perfect for focused studying with the sound of rain.",
        background: "gradient-forest",
        clockStyle: "minimal",
        playlist: "nature-sounds",
        tags: ["Calm", "Focus", "Cozy"],
      },
      sunset: {
        name: "Golden Sunset Vibes",
        description: "Warm and relaxing environment inspired by sunset colors.",
        background: "gradient-sunset",
        clockStyle: "analog",
        playlist: "lo-fi",
        tags: ["Relax", "Happy", "Creative"],
      },
      midnight: {
        name: "Midnight Code Session",
        description: "Deep focus zone for late-night work and creativity.",
        background: "solid-dark",
        clockStyle: "digital",
        playlist: "focus-beats",
        tags: ["Focus", "Productive", "Night"],
      },
      nature: {
        name: "Forest Sanctuary",
        description: "Immersive natural environment for meditation and calm focus.",
        background: "gradient-forest",
        clockStyle: "minimal",
        playlist: "nature-sounds",
        tags: ["Calm", "Nature", "Zen"],
      },
    }

    // Determine response based on prompt keywords
    let response: GeneratedSpace = mockResponses.nature
    if (userPrompt.toLowerCase().includes("rain") || userPrompt.toLowerCase().includes("study")) {
      response = mockResponses.rainy
    } else if (userPrompt.toLowerCase().includes("sunset") || userPrompt.toLowerCase().includes("relax")) {
      response = mockResponses.sunset
    } else if (userPrompt.toLowerCase().includes("code") || userPrompt.toLowerCase().includes("midnight")) {
      response = mockResponses.midnight
    }

    setGeneratedSpace(response)
    setIsLoading(false)
  }

  const handleRegenerate = () => {
    handleGenerate(prompt)
  }

  return (
    <main className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-[#C7A36B]" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F5]">AI Space Generator</h1>
          </div>
          <p className="text-[#B3B3B3] max-w-2xl mx-auto">
            Describe your ideal mood or environment in natural language, and let AI create a personalized space for you.
          </p>
        </motion.div>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GeneratorInput onGenerate={handleGenerate} isLoading={isLoading} />
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-16 h-16 mb-4">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C7A36B] border-r-[#C7A36B]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#7C9A92]"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
            <p className="text-[#B3B3B3] text-center">Creating your perfect space...</p>
          </motion.div>
        )}

        {/* Generated Space Preview */}
        {!isLoading && generatedSpace && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <GeneratedSpacePreview space={generatedSpace} onRegenerate={handleRegenerate} />
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !generatedSpace && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#2A2A2A] rounded-3xl p-12 border border-[#C7A36B]/20">
              <p className="text-[#B3B3B3] text-lg">Enter a prompt above to generate your AI-powered space</p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
