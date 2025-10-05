import { create } from 'zustand'

// Get initial data from localStorage
const getInitialData = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('watchlist-storage')
    if (stored) {
      try {
        const data = JSON.parse(stored).state
        // Ensure all fields exist (for backward compatibility)
        return {
          watchlist: data.watchlist || [],
          favorites: data.favorites || [],
          ratings: data.ratings || {},
          recentlyViewed: data.recentlyViewed || [],
          alreadyWatched: data.alreadyWatched || []
        }
      } catch (e) {
        return { watchlist: [], favorites: [], ratings: {}, recentlyViewed: [], alreadyWatched: [] }
      }
    }
  }
  return { watchlist: [], favorites: [], ratings: {}, recentlyViewed: [], alreadyWatched: [] }
}

// Save to localStorage helper
const saveToStorage = (state) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('watchlist-storage', JSON.stringify({ state }))
  }
}

export const useWatchlistStore = create((set, get) => ({
  ...getInitialData(),

  addToWatchlist: (movie) => {
    const { watchlist } = get()
    const movieId = movie.id || movie.imdbID
    if (!watchlist.find((m) => (m.id || m.imdbID) === movieId)) {
      const newWatchlist = [...watchlist, movie]
      set({ watchlist: newWatchlist })
      saveToStorage(get())
      return true
    }
    return false
  },

  removeFromWatchlist: (movieId) => {
    set((state) => {
      const newState = {
        ...state,
        watchlist: state.watchlist.filter((m) => (m.id || m.imdbID) !== movieId)
      }
      saveToStorage(newState)
      return newState
    })
  },

  isInWatchlist: (movieId) => {
    return get().watchlist.some((m) => (m.id || m.imdbID) === movieId)
  },

  addToFavorites: (movie) => {
    const { favorites } = get()
    const movieId = movie.id || movie.imdbID
    if (!favorites.find((m) => (m.id || m.imdbID) === movieId)) {
      const newFavorites = [...favorites, movie]
      set({ favorites: newFavorites })
      saveToStorage(get())
      return true
    }
    return false
  },

  removeFromFavorites: (movieId) => {
    set((state) => {
      const newState = {
        ...state,
        favorites: state.favorites.filter((m) => (m.id || m.imdbID) !== movieId)
      }
      saveToStorage(newState)
      return newState
    })
  },

  isInFavorites: (movieId) => {
    return get().favorites.some((m) => (m.id || m.imdbID) === movieId)
  },

  setRating: (movieId, rating) => {
    set((state) => {
      const newState = {
        ...state,
        ratings: { ...state.ratings, [movieId]: rating }
      }
      saveToStorage(newState)
      return newState
    })
  },

  getRating: (movieId) => {
    return get().ratings[movieId] || 0
  },

  // Recently Viewed functionality
  addToRecentlyViewed: (movie) => {
    set((state) => {
      const movieId = movie.id || movie.imdbID
      const currentRecentlyViewed = state.recentlyViewed || []
      // Remove if already exists
      const filtered = currentRecentlyViewed.filter((m) => (m.id || m.imdbID) !== movieId)
      // Add to front with timestamp
      const movieWithTimestamp = { ...movie, viewedAt: Date.now() }
      const newRecentlyViewed = [movieWithTimestamp, ...filtered].slice(0, 20) // Keep only 20 most recent
      
      const newState = {
        ...state,
        recentlyViewed: newRecentlyViewed
      }
      saveToStorage(newState)
      return newState
    })
  },

  getRecentlyViewed: () => {
    return get().recentlyViewed || []
  },

  // Already Watched functionality
  addToAlreadyWatched: (movie) => {
    set((state) => {
      const movieId = movie.id || movie.imdbID
      const currentAlreadyWatched = state.alreadyWatched || []
      
      // Check if already in the list
      if (currentAlreadyWatched.find((m) => (m.id || m.imdbID) === movieId)) {
        return state // Already exists
      }
      
      // Add to front with timestamp
      const movieWithTimestamp = { ...movie, watchedAt: Date.now() }
      const newAlreadyWatched = [movieWithTimestamp, ...currentAlreadyWatched]
      
      const newState = {
        ...state,
        alreadyWatched: newAlreadyWatched
      }
      saveToStorage(newState)
      return newState
    })
  },

  removeFromAlreadyWatched: (movieId) => {
    set((state) => {
      const newState = {
        ...state,
        alreadyWatched: (state.alreadyWatched || []).filter((m) => (m.id || m.imdbID) !== movieId)
      }
      saveToStorage(newState)
      return newState
    })
  },

  isInAlreadyWatched: (movieId) => {
    const alreadyWatched = get().alreadyWatched || []
    return alreadyWatched.some((m) => (m.id || m.imdbID) === movieId)
  },

  getAlreadyWatched: () => {
    return get().alreadyWatched || []
  },
}))
