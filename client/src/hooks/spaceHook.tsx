// Viết hook lấy community space
// Define hàm (theo sample có trước) call tới endpoint tương ứng bên backend
// Liên hệ backend -> backend code api 


// useAllSpace
// useSpaceById (id: string)
"use client"

import { useCallback, useEffect, useState } from "react"

//prop
interface Space {
  id: number
  name: string
  tags: string[]
  background: string
  accent: string
}

export interface UseSpaceByIdResult {
  space: Space | null
  isLoading: boolean
  error: string | null

  refresh: () => void // user bấm nút Refresh
}

// NOTE: Sau này nếu BE đổi route (vd: /api/spaces, /api/space-by-id),
// chỉ cần sửa hằng này.
const SPACE_API_BASE = "/api/space"

/**
 * Xây URL gọi API cho 1 space theo id.
 * Ví dụ: /api/space/123
 */
function buildSpaceUrl(id: string | number) {
  return `${SPACE_API_BASE}/${String(id)}`
}

export function useSpaceById(id?: string | number): UseSpaceByIdResult {
  const [space, setSpace] = useState<Space | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOne = useCallback(async (currentId: string | number) => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(buildSpaceUrl(currentId), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        if (res.status === 404) {
          // Không tìm thấy -> clear data, report error để UI hiển thị
          setSpace(null)
          throw new Error(`Space id=${currentId} not found`)
        }
        throw new Error(`Failed to fetch space id=${currentId} (status: ${res.status})`)
      }

      const data = (await res.json()) as Space
      setSpace(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch khi mount + khi id thay đổi
  useEffect(() => {
    if (id === undefined || id === null || id === "") {
      // Không có id hợp lệ -> không fetch, clear state
      setSpace(null)
      setError(null)
      setIsLoading(false)
      return
    }

    fetchOne(id)
  }, [id, fetchOne])

  const refresh = useCallback(() => {
    if (id === undefined || id === null || id === "") return
    fetchOne(id)
  }, [id, fetchOne])

  return {
    space,
    isLoading,
    error,
    refresh,
  }
}
