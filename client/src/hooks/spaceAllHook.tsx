"use client"

import { useCallback, useEffect, useState } from "react"

// ====== Types ======
interface SpaceProps {
  id: number
  name: string
  tags: string[]
  background: string
  accent: string
}

interface UseSpaceAllOptions {
  // Dùng nếu muốn refetch khi id trong URL thay đổi (optional)
  watchId?: string | number
  pageSize?: number
}

export interface UseSpaceAllResult {
  spaces: SpaceProps[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null

  page: number
  hasMore: boolean

  loadMore: () => void      // User bấm "Load more" -> tăng page, append data mới
  refresh: () => void       // User bấm "Refresh" -> load lại từ đầu
}

// ====== Hook chính: useSpaceAll ======
const SPACE_API_URL = "/api/spaceAll" 

export function useSpaceAll(options?: UseSpaceAllOptions): UseSpaceAllResult {
  const { watchId, pageSize = 12 } = options ?? {}

  const [spaces, setSpaces] = useState<SpaceProps[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hàm gọi API cho 1 page
  const fetchPage = useCallback(
    async (pageToFetch: number, append: boolean) => {
      try {
        append ? setIsLoadingMore(true) : setIsLoading(true)
        setError(null)

        const url = new URL(
          SPACE_API_URL,
          typeof window !== "undefined" ? window.location.origin : "http://localhost"
        )
        url.searchParams.set("page", pageToFetch.toString())
        url.searchParams.set("limit", pageSize.toString())

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch spaces (status: ${res.status})`)
        }

        const data = (await res.json()) as SpaceProps[]

        if (data.length < pageSize) setHasMore(false)
        else setHasMore(true)

        setSpaces((prev) => {
          const merged = append ? [...prev, ...data] : data
          // Filter theo bảng chữ cái: sort A → Z theo name
          return merged.slice().sort((a, b) => a.name.localeCompare(b.name))
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        append ? setIsLoadingMore(false) : setIsLoading(false)
      }
    },
    [pageSize]
  )

  // Gọi lần đầu khi mount + khi watchId thay đổi
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false)
  }, [fetchPage, watchId])

  // Khi user bấm "Load more": tăng page, fetch page mới và append vào list hiện tại
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, true) // append = true
  }, [fetchPage, hasMore, isLoadingMore, page])

  // Dùng cho nút Refresh
  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false) // append = false -> load lại từ đầu
  }, [fetchPage])

  return {
    spaces,
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
  }
}
