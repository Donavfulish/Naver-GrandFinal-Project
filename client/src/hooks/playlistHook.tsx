"use client"

import { useCallback, useEffect, useState } from "react"

export interface Playlist {
  id: string          // "focus-beats", "lo-fi", ...
  label: string       // "Focus Beats"
  spotifyId?: string  // mở sẵn cho Spotify
  spotifyUrl?: string
  [key: string]: any
}

interface UsePlaylistOptions {
  watchId?: string | number
  pageSize?: number
}

export interface UsePlaylistResult {
  playlists: Playlist[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null

  page: number
  hasMore: boolean

  loadMore: () => void
  refresh: () => void
}

// NOTE: Nếu sau này BE cào trực tiếp từ Spotify, chỉ cần giữ route này,
// bên /api/playlist sẽ call Spotify SDK/API.
const PLAYLIST_API_URL = "/api/playlist"

export function usePlaylist(options?: UsePlaylistOptions): UsePlaylistResult {
  const { watchId, pageSize = 12 } = options ?? {}

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = useCallback(
    async (pageToFetch: number, append: boolean) => {
      try {
        append ? setIsLoadingMore(true) : setIsLoading(true)
        setError(null)

        const res = await fetch(
          `${PLAYLIST_API_URL}?page=${pageToFetch}&limit=${pageSize}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )

        if (!res.ok) {
          throw new Error(`Failed to fetch playlists (status: ${res.status})`)
        }

        const data = (await res.json()) as Playlist[]

        if (data.length < pageSize) setHasMore(false)
        else setHasMore(true)

        setPlaylists((prev) => {
          const merged = append ? [...prev, ...data] : data
          return merged.slice().sort((a, b) => a.label.localeCompare(b.label))
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        append ? setIsLoadingMore(false) : setIsLoading(false)
      }
    },
    [pageSize]
  )

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false)
  }, [fetchPage, watchId])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, true)
  }, [fetchPage, hasMore, isLoadingMore, page])

  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false)
  }, [fetchPage])

  return {
    playlists,
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
  }
}
