import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBookmark, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import EmptyState from '../components/EmptyState'
import { useWatchlistStore } from '../store/watchlistStore'
import { useThemeStore } from '../store/themeStore'
import toast from 'react-hot-toast'

const Watchlist = () => {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'all')
  const { theme } = useThemeStore()
  const { 
    watchlist, 
    removeFromWatchlist,
    addToWatchlist,
    isInWatchlist,
    getRecentlyViewed,
    getAlreadyWatched,
    removeFromAlreadyWatched,
  } = useWatchlistStore()

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Get recently viewed and already watched movies
  const recentlyViewed = getRecentlyViewed()
  const alreadyWatched = getAlreadyWatched()

  // Calculate counts
  const allMovies = watchlist

  const tabs = [
    { id: 'all', label: 'My Watchlist', icon: FiBookmark, count: allMovies.length },
    { id: 'watched', label: 'Already Watched', icon: FiCheckCircle, count: alreadyWatched.length },
    { id: 'recent', label: 'Recently Viewed', icon: FiClock, count: recentlyViewed.length },
  ]

  // Get current list based on active tab
  const getCurrentList = () => {
    switch (activeTab) {
      case 'watched':
        return alreadyWatched
      case 'recent':
        return recentlyViewed
      default:
        return allMovies
    }
  }

  const currentList = getCurrentList()

  const handleRemove = (movie) => {
    const movieId = movie.id || movie.imdbID
    removeFromWatchlist(movieId)
    toast.success(`Removed "${movie.title || movie.Title}" from watchlist`)
  }

  const handleRemoveWatched = (movie) => {
    const movieId = movie.id || movie.imdbID
    removeFromAlreadyWatched(movieId)
    toast.success(`Removed "${movie.title || movie.Title}" from already watched`)
  }

  const handleAddToWatchlist = (movie) => {
    const movieId = movie.id || movie.imdbID
    const isAdded = addToWatchlist({ ...movie, id: movieId })
    if (isAdded) {
      toast.success(`Added "${movie.title || movie.Title}" to watchlist`)
    } else {
      toast.error('Movie already in watchlist')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-4xl font-bold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          My Collection
        </h1>
        <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          {allMovies.length === 0 
            ? 'Start building your movie collection' 
            : `You have ${allMovies.length} ${allMovies.length === 1 ? 'movie' : 'movies'} in your collection`
          }
        </p>

        {/* Quick Stats */}
        {(allMovies.length > 0 || recentlyViewed.length > 0 || alreadyWatched.length > 0) && (
          <div className="flex flex-wrap gap-4 mt-6">
            {allMovies.length > 0 && (
              <div className={`px-4 py-2 rounded-xl ${
                theme === 'light' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-blue-900/20 border border-blue-500/30'
              }`}>
                <span className={`text-sm font-semibold ${
                  theme === 'light' ? 'text-blue-900' : 'text-blue-300'
                }`}>
                  📌 Watchlist: {allMovies.length}
                </span>
              </div>
            )}
            {alreadyWatched.length > 0 && (
              <div className={`px-4 py-2 rounded-xl ${
                theme === 'light' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-green-900/20 border border-green-500/30'
              }`}>
                <span className={`text-sm font-semibold ${
                  theme === 'light' ? 'text-green-900' : 'text-green-300'
                }`}>
                  ✓ Watched: {alreadyWatched.length}
                </span>
              </div>
            )}
            {recentlyViewed.length > 0 && (
              <div className={`px-4 py-2 rounded-xl ${
                theme === 'light' 
                  ? 'bg-purple-50 border border-purple-200' 
                  : 'bg-purple-900/20 border border-purple-500/30'
              }`}>
                <span className={`text-sm font-semibold ${
                  theme === 'light' ? 'text-purple-900' : 'text-purple-300'
                }`}>
                  👁️ Recently Viewed: {recentlyViewed.length}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className={`flex space-x-2 border-b ${
        theme === 'light' ? 'border-gray-200' : 'border-dark-700'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all relative ${
                isActive
                  ? theme === 'light'
                    ? 'text-primary-600'
                    : 'text-primary-400'
                  : theme === 'light'
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className={isActive ? 'fill-current' : ''} />
              <span>{tab.label}</span>
              
              {/* Count Badge */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={tab.count}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white'
                      : theme === 'light'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-dark-700 text-gray-300'
                  }`}
                >
                  {tab.count}
                </motion.span>
              </AnimatePresence>
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentList.map((movie, index) => (
                <motion.div
                  key={movie.id || movie.imdbID}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MovieCard movie={movie} index={index} />
                  
                  {/* Action Buttons - Show on Hover */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                    {/* My Watchlist Tab - Remove Button */}
                    {activeTab === 'all' && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(movie)
                        }}
                        className="p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:shadow-red-500/50"
                        aria-label="Remove from watchlist"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    )}

                    {/* Already Watched Tab - Remove Button */}
                    {activeTab === 'watched' && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveWatched(movie)
                        }}
                        className="p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:shadow-red-500/50"
                        aria-label="Remove from already watched"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    )}

                    {/* Recently Viewed Tab - Show both Add to Watchlist and Remove */}
                    {activeTab === 'recent' && (
                      <>
                        {/* Add to Watchlist Button - Only if not in watchlist */}
                        {!isInWatchlist(movie.id || movie.imdbID) && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToWatchlist(movie)
                            }}
                            className="p-2.5 bg-primary-500 text-white rounded-full shadow-lg hover:shadow-primary-500/50"
                            aria-label="Add to watchlist"
                          >
                            <FiBookmark className="w-4 h-4" />
                          </motion.button>
                        )}

                        {/* Remove from Watchlist Button - Only if in watchlist */}
                        {isInWatchlist(movie.id || movie.imdbID) && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemove(movie)
                            }}
                            className="p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:shadow-red-500/50"
                            aria-label="Remove from watchlist"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              type="watchlist"
              message={
                activeTab === 'watched'
                  ? "You haven't marked any movies as watched yet"
                  : activeTab === 'recent'
                  ? "You haven't viewed any movies yet"
                  : "Your watchlist is empty"
              }
              suggestions={
                activeTab === 'watched'
                  ? [
                      'View movie details and click "Mark as Watched"',
                      'Track all the movies you\'ve already seen',
                      'Build your watched collection'
                    ]
                  : activeTab === 'recent'
                  ? [
                      'Click on any movie to view its details',
                      'Your viewing history will appear here',
                      'Last 20 viewed movies are tracked'
                    ]
                  : [
                      'Search for movies you want to watch',
                      'Click the bookmark button to add to watchlist',
                      'Build your personal movie collection'
                    ]
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Watchlist
