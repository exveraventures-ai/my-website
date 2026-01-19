/**
 * Simple navigation utility for Capacitor apps
 */

let capacitorDetected = null

function detectCapacitor() {
  if (capacitorDetected !== null) return capacitorDetected
  
  if (typeof window === 'undefined') {
    capacitorDetected = false
    return false
  }

  // Check for Capacitor global
  if (window.Capacitor && window.Capacitor.isNativePlatform) {
    capacitorDetected = window.Capacitor.isNativePlatform()
    return capacitorDetected
  }

  // Check user agent for Capacitor
  const ua = navigator.userAgent || ''
  if (ua.includes('Capacitor') || ua.includes('capacitor')) {
    capacitorDetected = true
    return true
  }

  capacitorDetected = false
  return false
}

export const isCapacitor = () => {
  return detectCapacitor()
}

export const navigateTo = (path, router = null) => {
  if (isCapacitor()) {
    window.location.href = path
  } else if (router && typeof router.push === 'function') {
    router.push(path)
  } else {
    window.location.href = path
  }
}

export const replaceTo = (path, router = null) => {
  if (isCapacitor()) {
    window.location.replace(path)
  } else if (router && typeof router.replace === 'function') {
    router.replace(path)
  } else {
    window.location.replace(path)
  }
}
