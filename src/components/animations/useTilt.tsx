import { useRef, useCallback } from 'react'

export function useTilt(active = true) {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el || !active) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--px', String(px))
    el.style.setProperty('--py', String(py))
  }, [active])

  const refCallback = useCallback((node: HTMLDivElement | null) => {
    if (ref.current) {
      ref.current.removeEventListener('mousemove', handleMove as any)
    }
    ref.current = node
    if (ref.current) {
      ref.current.addEventListener('mousemove', handleMove as any)
    }
  }, [handleMove])

  return refCallback
}

export default useTilt
