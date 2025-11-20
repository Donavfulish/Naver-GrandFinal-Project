    "use client"

    import { useEffect, useState } from "react"
    import { motion } from "framer-motion"
    import { X } from 'lucide-react'
    import { useRouter } from 'next/navigation'
    import { useSessionStore } from "@/lib/store"
    import StickyNoteCanvas from "./sticky-note-canvas"
    import CheckoutModal from "./checkout-modal"

    export default function SpaceView() {
    const router = useRouter()
    const { sessionStartTime, activeMode, vibeConfig } = useSessionStore()
    const [showCheckout, setShowCheckout] = useState(false)
    const [sessionDuration, setSessionDuration] = useState(0)

    useEffect(() => {
        if (!sessionStartTime) {
        router.push("/capsules")
        return
        }

        const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000)
        setSessionDuration(duration)
        }, 1000)

        return () => clearInterval(interval)
    }, [sessionStartTime, router])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
        return `${hours}h ${minutes}m`
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="relative w-full h-screen overflow-hidden">
        {/* Background */}
        <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
            backgroundImage: "url('/focus-rain.jpg')",
            }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E]/60 via-transparent to-[#1E1E1E]/80" />

        {/* Content */}
        <div className="relative z-10 h-screen flex flex-col">
            {/* Top Bar */}
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-6 text-white"
            >
            <div className="text-sm font-medium">
                Session: <span className="text-[#C7A36B]">{formatTime(sessionDuration)}</span>
            </div>
            <h2 className="text-lg font-semibold text-center flex-1 capitalize">
                {vibeConfig.theme.replace(/_/g, " ")}
            </h2>
            <button
                onClick={() => setShowCheckout(true)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition border border-white/20"
            >
                End Session
            </button>
            </motion.div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden">
            {activeMode ? <StickyNoteCanvas /> : <PassiveMode />}
            </div>
        </div>

        {/* Checkout Modal */}
        {showCheckout && (
            <CheckoutModal onClose={() => setShowCheckout(false)} duration={sessionDuration} />
        )}
        </div>
    )
    }

    function PassiveMode() {
    return (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex flex-col items-center justify-center text-center p-6"
        >
        <motion.div
            animate={{
            y: [0, -20, 0],
            }}
            transition={{
            duration: 4,
            repeat: Infinity,
            }}
            className="space-y-4"
        >
            <div className="text-white/80 text-lg font-medium">
            Just breathe and enjoy the moment
            </div>
            <div className="text-white/50 text-sm max-w-md">
            You're in passive mode. Let the ambience guide you. There's no need to do anything.
            </div>
        </motion.div>
        </motion.div>
    )
    }
