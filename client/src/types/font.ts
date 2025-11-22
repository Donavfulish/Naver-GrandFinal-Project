export interface FontItem {
    id: string;
    font_name?: string; // cho font text
    style?: string; // cho font clock
}

export interface FontApiResponse {
    success: boolean;
    data: FontItem[];
}

export interface UseSpaceFonts {
    clockStyles: FontItem[];
    textStyles: FontItem[];
    isLoading: boolean;
    error: string | null;
}