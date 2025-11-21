"use client"
import { useState } from "react"
import OnboardingChat from "@/components/onboarding/onboarding-chat"
import ViewSpacePage from "@/components/onboarding/view-space-page"

export default function DashboardPage() {
    const [space, setSpace] = useState<any>(null)

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] via-[#2A1E2A] to-[#1E1E1E] flex items-center justify-center p-4">
            {!space ? (
                <OnboardingChat onComplete={(spaceData) => setSpace(spaceData)} />
            ) : (
                <ViewSpacePage space={space} activeMode={true} />
            )}
        </div>
    )
}
