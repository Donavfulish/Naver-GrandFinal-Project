// src/components/space/CapsulesPage.tsx (hoặc pages/capsules.tsx)
"use client"

import { useState, useEffect, useCallback } from 'react' // Import các hook cần thiết
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { Loader, AlertTriangle } from 'lucide-react'
// import { useSessionStore } from "@/lib/store" // Đã loại bỏ
import CapsuleOverview from "@/components/capsules/capsule-overview"
import { useSessionStore } from '@/lib/store'

// Định nghĩa cấu trúc dữ liệu cho Space (Capsule)
// (Nên đặt trong một file riêng như src/types/space.ts)
interface CapsuleData {
    id: string;
    name: string;
    duration: number;
    mood: string;
    description?: string;
    background: { background_url: string };
    space_tags: { tag: { name: string } }[];
    AiGeneratedContent: { content: string } | null;
}

// Cấu hình API
const USER_SPACES_API_URL = 'http://localhost:5000/users';
// SỬ DỤNG ID HỢP LỆ (Giống như trong CheckoutModal)
const REAL_USER_ID = "c6d60308-40b9-4706-95c4-f1cdd06726e2";

// --- Custom Hook để Fetch Spaces ---
const useUserSpaces = () => {
    const [spaces, setSpaces] = useState<CapsuleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSpaces = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${USER_SPACES_API_URL}/${REAL_USER_ID}/spaces`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch spaces: ${errorText}`);
            }

            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setSpaces(result.data);
            } else {
                throw new Error("Invalid response format from server.");
            }
        } catch (err: any) {
            console.error("Error fetching user spaces:", err);
            setError(err.message || "An unknown error occurred.");
            setSpaces([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSpaces();
    }, [fetchSpaces]);

    return { spaces, loading, error, refetch: fetchSpaces };
};
// --- Kết thúc Custom Hook ---


export default function CapsulesPage() {
    const router = useRouter()
    // 1. Sử dụng hook mới để fetch dữ liệu
    const { spaces: capsules, loading, error, refetch } = useUserSpaces();

    // 2. Thay thế resetSession bằng một hàm trống (nếu nó không được dùng trong trang này)
    // Nếu bạn vẫn cần reset session store cũ (ví dụ: notes), bạn cần import nó:
    const { resetSession } = useSessionStore();


    return (
        <div className="min-h-screen bg-[#1E1E1E] flex flex-col">
            <div className="flex-1 py-12 px-6">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-8">Your Space Capsules</h1>

                    {/* --- Hiển thị trạng thái Loading --- */}
                    {loading && (
                        <div className="flex justify-center items-center h-64 text-white/70">
                            <Loader className="animate-spin mr-3" size={24} />
                            Loading capsules...
                        </div>
                    )}

                    {/* --- Hiển thị trạng thái Error --- */}
                    {error && !loading && (
                        <div className="flex flex-col justify-center items-center h-64 text-red-400 p-4 border border-red-500/30 rounded-lg">
                            <AlertTriangle className="mb-3" size={32} />
                            <p className="font-semibold mb-2">Error loading capsules:</p>
                            <p className="text-sm text-red-400/80">{error}</p>
                            <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-600/50 rounded-lg text-white hover:bg-red-600 transition">
                                Try Reloading
                            </button>
                        </div>
                    )}

                    {/* --- Hiển thị dữ liệu hoặc trạng thái rỗng --- */}
                    {!loading && !error && (
                        <>
                            {capsules.length > 0 ? (
                                <CapsuleOverview capsules={capsules} />
                            ) : (
                                <div className="text-center py-20 bg-[#2A2A2A] rounded-xl border border-white/10">
                                    <p className="text-white/70 text-lg font-medium">You haven't saved any capsules yet. Start one now!</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Action */}
                    <div className="flex justify-center pt-12">
                        <button
                            onClick={() => {
                                resetSession()
                                router.push("/emotional-capsules")
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] text-[#1E1E1E] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#C7A36B]/30 transition"
                        >
                            Start New Session
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}