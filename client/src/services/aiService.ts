import axios from "axios";

// Define types based on backend validation schemas
export interface GenerateRequest {
    prompt: string;
}

export interface ConfirmGenerateRequest {
    userId: string;
    name: string;
    description?: string;
    backgroundId: string;
    clockFontId: string;
    textFontId: string;
    tracks?: string[];
    prompt?: string;
    tags?: string[];
    mood: string;
}

export interface CheckoutRequest {
    spaceId: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Base URL configuration
const BASE_URL = "http://localhost:5000"; // Adjust port if needed, usually 5000 for backend

export class AIService {

    /**
     * Generate AI space based on user prompt
     * POST /api/ai/generate
     */
    static async generateSpace(prompt: string): Promise<ApiResponse<any>> {
        try {
            const res = await axios.post(`${BASE_URL}/ai/generate`, { prompt });
            return res.data;
        } catch (err) {
            console.error("Error generating space:", err);
            throw err;
        }
    }

    /**
     * Confirm and save AI generated space
     * POST /api/ai/generate/confirm
     */
    static async confirmSpace(data: ConfirmGenerateRequest): Promise<ApiResponse<any>> {
        try {
            const res = await axios.post(`${BASE_URL}/ai/generate/confirm`, data);
            return res.data;
        } catch (err) {
            console.error("Error confirming space:", err);
            throw err;
        }
    }

    /**
     * Context-aware reflection for emotional checkout
     * POST /api/ai/checkout
     */
    static async checkout(data: CheckoutRequest): Promise<ApiResponse<any>> {
        try {
            const res = await axios.post(`${BASE_URL}/ai/checkout`, data);
            return res.data;
        } catch (err) {
            console.error("Error checking out:", err);
            throw err;
        }
    }
}

export default new AIService();
