import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface StickyNote {
  id: string
  x: number
  y: number
  text: string
  color: string
}

export interface Capsule {
  id: string
  created_at: string
  mood: string
  duration: number
  notes: StickyNote[]
  reflection_answer: string
  tags: string[]
  vibe_config: {
    theme: string
    music: string
    font: string
    colors: {
      primary: string
      secondary: string
      accent: string
    }
    mood: string
  }
  session_summary: string
}

export interface SessionState {
  // Act 1 - Chatbox
  userFeeling: string
  vibeConfig: {
    theme: string
    music: string
    font: string
    colors: {
      primary: string
      secondary: string
      accent: string
    }
    mood: string
  }

  // Act 2 - Space
  activeMode: boolean
  notes: StickyNote[]
  sessionStartTime: number | null
  moodSummary: string
  noteCount: number

  // Act 3 - Checkout
  reflectionAnswer: string
  selectedTags: string[]

  // Capsule Management
  capsules: Capsule[]

  // Actions
  setUserFeeling: (feeling: string) => void
  setVibeConfig: (config: SessionState["vibeConfig"]) => void
  setActiveMode: (active: boolean) => void
  addNote: (note: StickyNote) => void
  updateNote: (id: string, note: Partial<StickyNote>) => void
  removeNote: (id: string) => void
  setSessionStartTime: (time: number) => void
  setMoodSummary: (summary: string) => void
  setReflectionAnswer: (answer: string) => void
  setSelectedTags: (tags: string[]) => void
  saveCapsule: (capsule: Capsule) => void
  resetSession: () => void
  loadCapsule: (capsule: Capsule) => void
}

const initialVibeConfig = {
  theme: "rainy_night",
  music: "lofi_sad",
  font: "minimal",
  colors: {
    primary: "#C7A36B",
    secondary: "#7C9A92",
    accent: "#2A2A2A",
  },
  mood: "Restful"
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      userFeeling: "",
      vibeConfig: initialVibeConfig,
      activeMode: true,
      notes: [],
      sessionStartTime: null,
      moodSummary: "",
      noteCount: 0,
      reflectionAnswer: "",
      selectedTags: [],
      capsules: [
        {
          id: "1",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          mood: "Stress at Work",
          duration: 25,
          notes: [
            { id: "n1", x: 10, y: 10, text: "Too many meetings", color: "bg-yellow-200" },
            { id: "n2", x: 150, y: 80, text: "Need a break", color: "bg-blue-200" },
          ],
          reflection_answer: "I need to prioritize better",
          tags: ["work", "stress", "productivity"],
          vibe_config: {
            theme: "rainy_night",
            music: "lofi_sad",
            font: "minimal",
            colors: { primary: "#C7A36B", secondary: "#7C9A92", accent: "#2A2A2A" },
            mood: "Reflective"
          },
          session_summary: "You unloaded 2 thoughts during your session",
        },
        {
          id: "2",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          mood: "Peaceful Evening",
          duration: 40,
          notes: [
            { id: "n3", x: 50, y: 120, text: "Enjoyed the sunset", color: "bg-orange-200" },
          ],
          reflection_answer: "A moment of calm in a busy week",
          tags: ["peace", "evening", "reflection"],
          vibe_config: {
            theme: "sunset_calm",
            music: "ambient_chill",
            font: "elegant",
            colors: { primary: "#C7A36B", secondary: "#7C9A92", accent: "#2A2A2A" },
            mood: "Grounded"
          },
          session_summary: "You recharged silently with ambient music",
        },
        {
          id: "3",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          mood: "Creative Spark",
          duration: 35,
          notes: [
            { id: "n4", x: 30, y: 30, text: "New design idea", color: "bg-purple-200" },
            { id: "n5", x: 200, y: 150, text: "Color palette inspiration", color: "bg-pink-200" },
            {
              id: "n6",
              x: 100,
              y: 200,
              text: "Mix vintage + modern",
              color: "bg-indigo-200",
            },
          ],
          reflection_answer: "Creative energy flows when I have space to think",
          tags: ["creative", "design", "inspiration"],
          vibe_config: {
            theme: "creative_energy",
            music: "indie_wave",
            font: "modern",
            colors: { primary: "#C7A36B", secondary: "#7C9A92", accent: "#2A2A2A" },
            mood: "Creative"
          },
          session_summary: "You captured 3 creative ideas",
        },
      ],

      setUserFeeling: (feeling) => set({ userFeeling: feeling }),
      setVibeConfig: (config) => set({ vibeConfig: config }),
      setActiveMode: (active) => set({ activeMode: active }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, updatedNote) =>
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...updatedNote } : n)),
        })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      setSessionStartTime: (time) => set({ sessionStartTime: time }),
      setMoodSummary: (summary) => set({ moodSummary: summary }),
      setReflectionAnswer: (answer) => set({ reflectionAnswer: answer }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      saveCapsule: (capsule) =>
        set((state) => ({
          capsules: [capsule, ...state.capsules],
          userFeeling: "",
          notes: [],
          sessionStartTime: null,
          reflectionAnswer: "",
          selectedTags: [],
        })),
      resetSession: () =>
        set({
          userFeeling: "",
          vibeConfig: initialVibeConfig,
          activeMode: true,
          notes: [],
          sessionStartTime: null,
          moodSummary: "",
          reflectionAnswer: "",
          selectedTags: [],
        }),
      loadCapsule: (capsule) =>
        set({
          userFeeling: capsule.mood,
          vibeConfig: capsule.vibe_config,
          notes: capsule.notes,
          sessionStartTime: Date.now(),
        }),
    }),
    {
      name: "auraspace-session",
    }
  )
)
