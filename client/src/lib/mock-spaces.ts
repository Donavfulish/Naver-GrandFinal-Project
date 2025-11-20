// src/lib/mock-spaces.ts

interface VibeConfig {
    theme: string;
    music: string;
    font: string;
    mood: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

interface SettingPanel {
    theme: string;
    font: string;
    music: string;
    colors: VibeConfig['colors'];
}

// Interface chi tiết cho Base Space
export interface MockSpace {
    id: string;
    title: string;
    description: string;
    image: string;
    // Thêm các trường cơ bản khác nếu cần
}

// Interface chi tiết cho Full Space (kết quả trả về)
export interface FullSpace extends MockSpace {
    vibeConfig: VibeConfig;
    notes: any[]; // Giả sử là một mảng các đối tượng note
    sessionStartTime: number;
    settingPanel: SettingPanel;
}

// Dữ liệu Mock đơn giản
export const mockSpaces: MockSpace[] = [
    {
        id: "space_1",
        title: "Calm Forest Nook",
        description: "A serene, quiet space for reflection.",
        image: "/images/forest_nook.jpg",
    },
    {
        id: "space_2",
        title: "Vibrant City Loft",
        description: "A bright, energetic space for focus.",
        image: "/images/city_loft.jpg",
    },
    {
        id: "space_3",
        title: "Cozy Fireside Den",
        description: "A warm, comforting space to rest and relax.",
        image: "/images/fireside_den.jpg",
    },
];

// Dữ liệu Vibe Config Mocked
export const mockVibeConfigs: VibeConfig[] = [
    { theme: "forest_calm", music: "ambient_chill", font: "minimal", mood: "Grounded", colors: { primary: "#7C9A92", secondary: "#C7A36B", accent: "#2A2A2A" } },
    { theme: "sunny_day", music: "indie_wave", font: "modern", mood: "Energetic", colors: { primary: "#C7A36B", secondary: "#7C9A92", accent: "#1A1A1A" } },
    { theme: "creative_energy", music: "indie_electronic", font: "artistic", mood: "Creative", colors: { primary: "#9A7C92", secondary: "#C7A36B", accent: "#3A3A3A" } },
];