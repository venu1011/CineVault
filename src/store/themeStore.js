import { create } from 'zustand'

// Get initial theme from localStorage or default to 'dark'
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
      try {
        return JSON.parse(stored).state.theme
      } catch (e) {
        return 'dark'
      }
    }
  }
  return 'dark'
}

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark'
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: newTheme } }))
    }
    return { theme: newTheme }
  }),
}))
