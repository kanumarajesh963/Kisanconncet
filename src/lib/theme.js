const THEME_KEY = 'kc_theme'

export function getTheme() {
  try {
    return sessionStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    sessionStorage.setItem(THEME_KEY, theme)
  } catch {
    // storage unavailable — theme still applies for this page load
  }
}

export function initTheme() {
  applyTheme(getTheme())
}
