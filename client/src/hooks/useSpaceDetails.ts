import { useState, useEffect } from 'react';
import { BASE_URL } from '@/lib/constants';

export interface SpaceDetailData {
    id: string;
    name: string;
    description: string;
    mood: string;
    duration: number;
    background: {
        id: string;
        background_url: string;
    };
    clock: {
        id: string;
        style: string;
    };
    text: {
        id: string;
        font_name: string;
    };
    playlists: {
        id: string;
        name: string;
        playlist_tracks: {
            track_order: number;
            track: {
                id: string;
                name: string;
                thumbnail: string;
                track_url: string;
                emotion: string[];
                tags: string[];
            };
        }[];
    }[];
    space_tags: {
        tag: {
            name: string;
        };
    }[];
}

export function useSpaceDetail(spaceId: string | null) {
    const [data, setData] = useState<SpaceDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!spaceId) {
            setData(null);
            return;
        }

        const fetchSpace = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BASE_URL}/spaces/${spaceId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch space details');
                }
                const result = await response.json();
                setData(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpace();
    }, [spaceId]);

    return { data, isLoading, error };
}