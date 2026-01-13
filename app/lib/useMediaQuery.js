"use client"

import { useState, useEffect } from 'react'

/**
 * Hook to detect if screen is mobile (width < 768px)
 * @returns {boolean} true if mobile screen
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event) => setMatches(event.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Hook to detect if screen is mobile (width < 768px)
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Hook to detect if screen is tablet (768px - 1023px)
 */
export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}
