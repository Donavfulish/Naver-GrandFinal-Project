"use client"

import { useCallback, useEffect, useState } from "react"

// ====== Types ======

/**
 * Kiểu 1 emotional tag.
 * File create-space-modal.tsx hiện đang dùng plain string (vd: "Focus", "Calm", ...),
 * nên ở đây mình chuẩn hoá thành { id, label } cho dễ mở rộng sau này
 * (ví dụ thêm màu, emoji, icon...).
 */
export interface EmotionalTag {
  id: string          // ví dụ: "focus", "calm"
  label: string       // "Focus", "Calm"
  color?: string      // optional, nếu sau này muốn gán màu riêng từng tag
  emoji?: string      // optional, nếu sau này muốn hiển thị icon cảm xúc
  [key: string]: any
}

interface UseEmotionalTagOptions {
  /**
   * Nếu muốn refetch khi 1 id (vd: từ URL) thay đổi thì truyền vào đây.
   * Nếu không dùng thì có thể bỏ qua.
   */
  watchId?: string | number

  /** Số tag mỗi page khi load more */
  pageSize?: number
}

export interface UseEmotionalTagResult {
  emotionalTags: EmotionalTag[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null

  page: number
  hasMore: boolean

  // Khi user bấm "Load more": tăng page, fetch thêm data, append vào list hiện tại
  loadMore: () => void

  // Nút Refresh: load lại từ đầu
  refresh: () => void
}

// ====== Hook chính: useEmotionalTag ======

// NOTE: Nếu sau này bạn đổi endpoint (vd: "/api/emotions" hay "/api/emotional-tags"),
// chỉ cần sửa hằng này.
const EMOTIONAL_TAG_API_URL = "/api/emotionalTag"

export function useEmotionalTag(
  options?: UseEmotionalTagOptions
): UseEmotionalTagResult {
  const { watchId, pageSize = 20 } = options ?? {}

  const [emotionalTags, setEmotionalTags] = useState<EmotionalTag[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Gọi API cho 1 page
  const fetchPage = useCallback(
    async (pageToFetch: number, append: boolean) => {
      try {
        append ? setIsLoadingMore(true) : setIsLoading(true)
        setError(null)

        const res = await fetch(
          `${EMOTIONAL_TAG_API_URL}?page=${pageToFetch}&limit=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        if (!res.ok) {
          throw new Error(`Failed to fetch emotional tags (status: ${res.status})`)
        }

        const data = (await res.json()) as EmotionalTag[]

        // Nếu ít hơn pageSize thì coi như đã hết data
        if (data.length < pageSize) setHasMore(false)
        else setHasMore(true)

        setEmotionalTags((prev) => {
          const merged = append ? [...prev, ...data] : data

          // Sort theo bảng chữ cái dựa trên label (vd: "Calm", "Cozy", "Focus"...)
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

  // Auto fetch lần đầu + khi watchId đổi
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false)
  }, [fetchPage, watchId])

  // Khi user bấm "Load more": tăng page, fetch page tiếp theo và append vào list hiện tại
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return

    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, true) // append = true
  }, [fetchPage, hasMore, isLoadingMore, page])

  // Nút Refresh: load lại từ đầu
  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, false) // append = false -> replace list
  }, [fetchPage])

  return {
    emotionalTags,
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
  }
}
