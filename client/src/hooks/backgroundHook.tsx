"use client"

import { useCallback, useEffect, useState } from "react"

// Khớp với backgroundOptions trong editor-toolbar.tsx
export interface Background {
  id: string
  label: string
  color: string        // tailwind class hoặc mô tả gradient
  imageUrl?: string    // mở để sau này map sang url thật nếu cần
  [key: string]: any
}

interface UseBackgroundOptions {
  watchId?: string | number
  pageSize?: number
}

export interface UseBackgroundResult {
  backgrounds: Background[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null

  page: number
  hasMore: boolean

  loadMore: () => void
  refresh: () => void
}

// NOTE: đổi endpoint ở đây nếu BE thay đổi route
const BACKGROUND_API_URL = "/api/bg"

export function useBackground(options?: UseBackgroundOptions): UseBackgroundResult {
  const { watchId, pageSize = 20 } = options ?? {}

  const [backgrounds, setBackgrounds] = useState<Background[]>([])
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
          `${BACKGROUND_API_URL}?page=${pageToFetch}&limit=${pageSize}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )

        if (!res.ok) {
          throw new Error(`Failed to fetch backgrounds (status: ${res.status})`)
        }

        const data = (await res.json()) as Background[]

        if (data.length < pageSize) setHasMore(false)
        else setHasMore(true)

        setBackgrounds((prev) => {
          const merged = append ? [...prev, ...data] : data
          // Sort theo bảng chữ cái: dùng label cho đúng với UI
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

  // Load more: tăng page + append
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, true)
  }, [fetchPage, hasMore, isLoadingMore, page])

  // Refresh: load từ đầu
  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false)
  }, [fetchPage])

  return {
    backgrounds,
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
  }
}
