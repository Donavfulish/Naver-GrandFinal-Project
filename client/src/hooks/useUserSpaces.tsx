// src/hooks/useUserSpaces.ts
import { useState, useEffect, useCallback } from 'react';

// Định nghĩa cấu trúc dữ liệu cho Space (Capsule)
export interface CapsuleData {
    id: string;
    name: string;
    duration: number;
    mood: string;
    background: { background_url: string };
    space_tags: { tag: { name: string } }[];
    AiGeneratedContent: { content: string } | null;
    // ... thêm các trường khác nếu cần
}

const USER_SPACES_API_URL = 'http://localhost:5000/users';
const REAL_USER_ID = "c6d60308-40b9-4706-95c4-f1cdd06726e2"; 

export const useUserSpaces = () => {
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