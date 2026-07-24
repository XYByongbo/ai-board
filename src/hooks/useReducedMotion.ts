import { useEffect, useState } from 'react'

/**
 * 遵循系统「减少动态效果」偏好（prefers-reduced-motion）。
 * 用于关闭图表入场动画，提升前庭功能障碍用户的体验（WCAG 2.3.3 动画阈值）。
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
