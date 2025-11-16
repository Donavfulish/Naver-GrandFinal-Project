"use client"

import { useCallback, useEffect, useState } from "react"

export interface FontStyle {
  id: string         // ví dụ: "sans" | "serif" | "mono"
  label: string      // "Sans", "Serif", "Mono"
  cssClass?: string  // optional: "font-sans", "font-serif", ...
  [key: string]: any
}

interface UseFontStyleOptions {
  watchId?: string | number
  pageSize?: number
}

export interface UseFontStyleResult {
  fontStyles: FontStyle[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null

  page: number
  hasMore: boolean

  loadMore: () => void
  refresh: () => void
}

// Sau này BE có thể trả list font ở đây
const FONT_STYLE_API_URL = "/api/fontStyle"

export function useFontStyle(options?: UseFontStyleOptions): UseFontStyleResult {
  const { watchId, pageSize = 24 } = options ?? {}

  const [fontStyles, setFontStyles] = useState<FontStyle[]>([])
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
          `${FONT_STYLE_API_URL}?page=${pageToFetch}&limit=${pageSize}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )

        if (!res.ok) {
          throw new Error(`Failed to fetch font styles (status: ${res.status})`)
        }

        const data = (await res.json()) as FontStyle[]

        if (data.length < pageSize) setHasMore(false)
        else setHasMore(true)

        setFontStyles((prev) => {
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
    fontStyles,
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
  }
}
