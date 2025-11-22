// src/types/space.ts

export interface FontConfig {
    id: string;
    style?: string;
    font_name?: string;
}

export interface BackgroundConfig {
    id: string;
    url: string;
    emotion: string[];
    tags: string[];
}

export interface Track {
    id: string;
    name: string;
    thumbnail: string;
    track_url: string;
    emotion: string[];
    tags: string[];
    order: number;
}

export interface PlaylistConfig {
    name: string;
    tracks: Track[];
}

export interface AiGeneratedContent {
    id: string;
    content: string;
}

// Space object returned from AI
export interface SpaceData {
    name: string;
    description: string;
    mood: string;
    introPage1: string;
    introPage2: string;
    introPage3: string;
    clock_font: FontConfig;
    text_font: FontConfig;
    background: BackgroundConfig;
    playlist: PlaylistConfig;
    prompt: string;
    tags: string[];
    AiGeneratedContent?: AiGeneratedContent | null;
}

// API Generate Response
export interface APIResponse {
    success: boolean;
    message: string;
    data: SpaceData;
}

// Body gửi đến POST /spaces
export interface CreateSpaceBody {
    user_id: string;
    name: string;   
    tags: string[];
    description: string | null;
    mood: string;
    duration: number;
    background_url: string;
    clock_font_id: string | null;
    text_font_id: string | null;
    tracks: string[];
    prompt: string | null;
    notes: string[];
}
