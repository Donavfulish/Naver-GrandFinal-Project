// Viết hook lấy community space
// Define hàm (theo sample có trước) call tới endpoint tương ứng bên backend
// Liên hệ backend -> backend code api 
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export interface CommunitySpace {
  id: number
  name: string
  author: string
  tags: string[]
  background: string
  likes: number
}

export type CommunitySortBy = "likes" | "name"

interface UseCommunityOptions {
  initialSortBy?: CommunitySortBy
  initialSearch?: string
  /** 
   * Optional: nếu bạn muốn tự động refetch khi 1 id nào đó thay đổi (ví dụ id từ URL),
   * truyền nó vào đây. Khi giá trị này đổi -> hook fetch lại.
   */
  watchId?: string | number
}

interface UseCommunityResult {
  communities: CommunitySpace[]
  isLoading: boolean
  error: string | null

  sortBy: CommunitySortBy
  setSortBy: (sortBy: CommunitySortBy) => void

  search: string
  setSearch: (value: string) => void

  refresh: () => Promise<void>
}

export function useCommunity(options?: UseCommunityOptions): UseCommunityResult {
  const { initialSortBy = "likes", initialSearch = "", watchId } = options ?? {}

  const [rawCommunities, setRawCommunities] = useState<CommunitySpace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sortBy, setSortBy] = useState<CommunitySortBy>(initialSortBy)
  const [search, setSearch] = useState(initialSearch)

  // Debounce search để tránh filter liên tục khi user đang gõ
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(id)
  }, [search])

  const fetchCommunities = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch("/api/community", {
        method: "GET",
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch communities (status: ${res.status})`)
      }

      const data: CommunitySpace[] = await res.json()
      setRawCommunities(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Gọi API khi component mount + khi watchId thay đổi (nếu có)
  useEffect(() => {
    fetchCommunities()
  }, [fetchCommunities, watchId])

  // Filter + sort dựa trên search & sortBy
  const communities = useMemo(() => {
    let result = [...rawCommunities]

    // Search theo name / author / tag
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      result = result.filter((space) => {
        const inName = space.name.toLowerCase().includes(q)
        const inAuthor = space.author.toLowerCase().includes(q)
        const inTags = space.tags.some((tag) => tag.toLowerCase().includes(q))
        return inName || inAuthor || inTags
      })
    }

    // Sort theo số lượt like hoặc theo bảng chữ cái (name)
    if (sortBy === "likes") {
      result.sort((a, b) => b.likes - a.likes) // nhiều like trước
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name)) // A-Z
    }

    return result
  }, [rawCommunities, debouncedSearch, sortBy])

  // Dùng cho nút "Refresh"
  const refresh = useCallback(async () => {
    await fetchCommunities()
  }, [fetchCommunities])

  return {
    communities,
    isLoading,
    error,
    sortBy,
    setSortBy,
    search,
    setSearch,
    refresh,
  }
}

