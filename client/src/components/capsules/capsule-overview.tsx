// src/components/capsules/capsule-overview.tsx
"use client"

import { motion } from "framer-motion"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Capsule } from "@/lib/store"
import CapsuleCard from "./capsule-card"
import { useRouter } from 'next/navigation'
import { MOOD_SCORES } from '@/lib/constants' // Import MOOD_SCORES

interface CapsuleOverviewProps {
    capsules: Capsule[]
}

// HÀM MỚI: Chỉ sử dụng MOOD_SCORES
function getMoodScore(mood: string): number {
    return MOOD_SCORES[mood] || 5
}

export default function CapsuleOverview({ capsules }: CapsuleOverviewProps) {
    const router = useRouter()

    // --- 1. Xử lý trường hợp mảng rỗng ngay lập tức ---
    if (!capsules || capsules.length === 0) {
        return (
            <div className="text-center py-12 text-[#B3B3B3]">
                No capsules yet. Start your first session to create one.
            </div>
        )
    }

    const totalSessions = capsules.length

    // Generate mood trend data
    const moodTrendData = capsules
        .slice()
        .reverse()
        .slice(0, 7)
        .map((capsule, index) => {
            const moodScore = getMoodScore(capsule.mood)
            return {
                date: new Date(capsule.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                mood: moodScore,
                label: capsule.mood,
            }
        })

    // Calculate stats
    const thisWeek = capsules.filter((c) => {
        const diff = Date.now() - new Date(c.created_at).getTime()
        return diff < 7 * 24 * 60 * 60 * 1000
    }).length

    // Đã an toàn vì totalSessions > 0
    const avgDuration = Math.round(capsules.reduce((acc, c) => acc + c.duration, 0) / totalSessions)

    // An toàn với c.notes?.length (đã được mapping trong CapsulesPage)
    const activeSessions = capsules.filter((c) => c.notes.length > 0).length
    const activePct = Math.round((activeSessions / totalSessions) * 100)

    const moodCounts = Object.entries(
        capsules.reduce((acc: Record<string, number>, c) => {
            acc[c.mood] = (acc[c.mood] || 0) + 1
            return acc
        }, {})
    ).sort((a, b) => b[1] - a[1])

    const commonMood = moodCounts[0]?.[0] || "Unknown"

    // An toàn với c.vibe_config.theme (đã được mapping trong CapsulesPage)
    const commonTheme = capsules
        .reduce((acc: Record<string, number>, c) => {
            // Dùng Optional Chaining cho trường hợp mapping không thành công
            const theme = c.vibe_config?.theme;
            if (theme) {
                acc[theme] = (acc[theme] || 0) + 1
            }
            return acc
        }, {})

    const mostCommonTheme = Object.entries(commonTheme).sort((a, b) => b[1] - a[1])[0]?.[0] || "Default"

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-2">Your Capsules</h1>
                <p className="text-[#B3B3B3]">A collection of moments that shaped your emotional journey</p>
            </div>

            {/* Mood Trend Chart */}
            <motion.div
                className="p-8 bg-[#2A2A2A] rounded-2xl border border-[#C7A36B]/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <h2 className="text-xl font-bold text-[#F5F5F5] mb-6">Mood Trend (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={moodTrendData}>
                        <defs>
                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C7A36B" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#C7A36B" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#B3B3B3" style={{ fontSize: "12px" }} />
                        <YAxis stroke="#B3B3B3" style={{ fontSize: "12px" }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#1E1E1E", border: "1px solid #C7A36B" }}
                            labelStyle={{ color: "#F5F5F5" }}
                            formatter={(value) => `Mood Level: ${value}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="mood"
                            stroke="#C7A36B"
                            fillOpacity={1}
                            fill="url(#colorMood)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {[
                    { label: "Sessions This Week", value: thisWeek, color: "from-[#C7A36B]" },
                    { label: "Average Duration", value: `${avgDuration}m`, color: "from-[#7C9A92]" },
                    { label: "Active Sessions", value: `${activePct}%`, color: "from-[#C7A36B]" },
                    { label: "Most Common Mood", value: commonMood, color: "from-[#7C9A92]" },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className={`p-6 bg-gradient-to-br ${stat.color} to-transparent rounded-xl border border-white/10`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <p className="text-[#B3B3B3] text-sm mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-[#F5F5F5]">{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Capsule List */}
            <div>
                <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">Recent Capsules</h2>
                {capsules.length > 0 && (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {capsules.map((capsule, index) => (
                            <motion.div
                                key={capsule.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <CapsuleCard capsule={capsule} onContinue={() => { }} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}