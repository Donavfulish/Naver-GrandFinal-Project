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