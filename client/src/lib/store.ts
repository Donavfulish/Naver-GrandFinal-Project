// src/lib/store.ts
import { create } from 'zustand';

// Định nghĩa types từ SettingPanel
export type LayoutKey = "centered-blur" | "corner"

export type SettingsPreview = {
    clockStyle: string
    clockFont: string
    background: string // URL
    layout: LayoutKey
}

export interface StickyNote {
    id: string;
    x: number;
    y: number;
    text: string; // Nội dung note (string)
    color: string; // Tailwind color class string
}

// Giả định Type Capsule để CapsuleOverview không bị lỗi
// CHÚ Ý: Đây là cấu trúc dữ liệu LƯU TRỮ, không phải cấu trúc trả về từ API.
// Tuy nhiên, do CapsuleOverview đang dùng nó, chúng ta phải định nghĩa nó
export interface Capsule {
    id: string;
    mood: string;
    created_at: string;
    duration: number;
    notes: StickyNote[]; // Cần có để tính activeSessions
    vibe_config: { theme: string }; // Cần có để tính commonTheme
    // Thêm các thuộc tính khác theo API response để tránh lỗi type
    name: string;
    description: string;
    background: { background_url: string };
    space_tags: { tag: { name: string } }[];
    AiGeneratedContent: { content: string } | null;
}

interface SessionState {
    notes: StickyNote[];
    finalSettings: SettingsPreview | null; // Cấu hình cuối cùng được lưu từ SettingPanel

    addNote: (note: StickyNote) => void;
    removeNote: (id: string) => void;
    updateNote: (id: string, updates: Partial<StickyNote>) => void;
    setFinalSettings: (settings: SettingsPreview) => void; // Hàm lưu Settings
    resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    notes: [],
    finalSettings: null,

    addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
    removeNote: (id) => set((state) => ({ notes: state.notes.filter(note => note.id !== id) })),
    updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(note =>
            note.id === id ? { ...note, ...updates } : note
        )
    })),
    setFinalSettings: (settings) => set({ finalSettings: settings }),

    resetSession: () => set({ notes: [], finalSettings: null }),
}));