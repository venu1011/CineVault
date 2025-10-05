import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiSun, FiMoon, FiBookmark, FiMenu, FiX, FiUser, FiCheckCircle, FiClock, FiX as FiClose, FiTrendingUp } from 'react-icons/fi'
import { MdMovie } from 'react-icons/md'
import { useThemeStore } from '../store/themeStore'
import { useWatchlistStore } from '../store/watchlistStore'
import { searchMovies, getPosterUrl } from '../utils/api-tmdb-proxy'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const searchRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const { watchlist, getAlreadyWatched, getRecentlyViewed } = useWatchlistStore()

  const alreadyWatched = getAlreadyWatched()
  const recentlyViewed = getRecentlyViewed()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true)
        try {
          const results = await searchMovies(searchQuery.trim())
          setSearchResults(results.slice(0, 5))
          setShowSearchResults(true)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowSearchResults(searchQuery.length > 0)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim())
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearchResults(false)
      setIsMobileMenuOpen(false)
    }
  }

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`)
    setSearchQuery('')
    setShowSearchResults(false)
    setIsMobileMenuOpen(false)
  }

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setShowSearchResults(false)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-searches')
  }

  const popularSearches = ['Inception', 'The Dark Knight', 'Interstellar', 'Avengers']

  return (
    <nav className={`sticky top-0 z-50 ${
      theme === 'light' 
        ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200' 
        : 'bg-dark-900/80 backdrop-blur-lg border-b border-dark-700'
    } transition-all duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <MdMovie className="text-3xl text-primary-500" />
            </motion.div>
            <span className={`text-xl font-bold gradient-text hidden md:inline`}>
              CineVault
            </span>
            <span className={`text-xl font-bold gradient-text md:hidden`}>
              CV
            </span>
          </Link>

          {/* Desktop Search with Autocomplete */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search movies..."
                className={`w-full px-4 py-2 pl-10 pr-10 rounded-lg ${
                  theme === 'light'
                    ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    : 'bg-dark-800 border-dark-600 text-white placeholder-gray-400'
                } border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              
              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-full mt-2 w-full rounded-lg shadow-2xl overflow-hidden z-50 ${
                    theme === 'light' ? 'bg-white border border-gray-200' : 'bg-dark-800 border border-dark-600'
                  }`}
                >
                  {/* Search Results */}
                  {isSearching && (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      <div className={`px-3 py-2 text-xs font-semibold ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        RESULTS
                      </div>
                      {searchResults.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleMovieClick(movie)}
                          className={`w-full flex items-center space-x-3 p-3 hover:bg-primary-500/10 transition-colors ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          <img
                            src={getPosterUrl(movie.poster_path, 'w92')}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded"
                            onError={(e) => e.target.src = '/placeholder-movie.png'}
                          />
                          <div className="flex-1 text-left">
                            <div className="font-semibold line-clamp-1">{movie.title}</div>
                            <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                              {movie.release_date?.split('-')[0] || 'N/A'} • ⭐ {movie.vote_average?.toFixed(1)}
                            </div>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={handleSearch}
                        className={`w-full p-3 text-center font-semibold text-primary-500 hover:bg-primary-500/10 transition-colors border-t ${
                          theme === 'light' ? 'border-gray-200' : 'border-dark-600'
                        }`}
                      >
                        See all results →
                      </button>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {!isSearching && searchQuery.length === 0 && recentSearches.length > 0 && (
                    <div>
                      <div className={`px-3 py-2 text-xs font-semibold flex justify-between items-center ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <span>RECENT SEARCHES</span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-primary-500 hover:text-primary-600 text-xs"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className={`w-full flex items-center space-x-3 p-3 hover:bg-primary-500/10 transition-colors ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          <FiClock className="text-gray-400" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Popular Searches */}
                  {!isSearching && searchQuery.length === 0 && recentSearches.length === 0 && (
                    <div>
                      <div className={`px-3 py-2 text-xs font-semibold ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        POPULAR SEARCHES
                      </div>
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className={`w-full flex items-center space-x-3 p-3 hover:bg-primary-500/10 transition-colors ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          <FiTrendingUp className="text-primary-500" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-primary-500/10 transition-colors ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  <FiUser className="text-lg" />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-64 rounded-lg shadow-2xl overflow-hidden z-50 ${
                      theme === 'light' ? 'bg-white border border-gray-200' : 'bg-dark-800 border border-dark-600'
                    }`}
                  >
                    {/* Profile Header */}
                    <div className="p-4 bg-gradient-to-r from-primary-500 to-purple-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl">
                          <FiUser />
                        </div>
                        <div className="text-white">
                          <div className="font-bold">Movie Lover</div>
                          <div className="text-sm opacity-90">Explore & Enjoy</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className={`grid grid-cols-3 gap-2 p-3 border-b ${
                      theme === 'light' ? 'border-gray-200' : 'border-dark-600'
                    }`}>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {watchlist.length}
                        </div>
                        <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                          Watchlist
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {alreadyWatched.length}
                        </div>
                        <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                          Watched
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {recentlyViewed.length}
                        </div>
                        <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                          Viewed
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/watchlist"
                        onClick={() => setShowProfileMenu(false)}
                        className={`flex items-center space-x-3 px-4 py-3 hover:bg-primary-500/10 transition-colors ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        <FiBookmark className="text-primary-500" />
                        <div>
                          <div className="font-semibold">My Watchlist</div>
                          <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {watchlist.length} movies
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/watchlist?tab=watched"
                        onClick={() => setShowProfileMenu(false)}
                        className={`flex items-center space-x-3 px-4 py-3 hover:bg-primary-500/10 transition-colors ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        <FiCheckCircle className="text-green-500" />
                        <div>
                          <div className="font-semibold">Already Watched</div>
                          <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {alreadyWatched.length} movies
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/watchlist?tab=recent"
                        onClick={() => setShowProfileMenu(false)}
                        className={`flex items-center space-x-3 px-4 py-3 hover:bg-primary-500/10 transition-colors ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        <FiClock className="text-purple-500" />
                        <div>
                          <div className="font-semibold">Recently Viewed</div>
                          <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {recentlyViewed.length} movies
                          </div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg hover:bg-primary-500/10 transition-colors ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-dark-700"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className={`w-full px-4 py-2 pl-10 rounded-lg ${
                    theme === 'light'
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-dark-800 border-dark-600 text-white'
                  } border focus:ring-2 focus:ring-primary-500`}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Mobile Links */}
            <div className="space-y-2">
              <Link
                to="/watchlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-dark-800'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FiBookmark />
                  <span>My Collection</span>
                </span>
              </Link>

              <button
                onClick={() => {
                  toggleTheme()
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-2 p-3 rounded-lg ${
                  theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-dark-800'
                }`}
              >
                {theme === 'light' ? <FiMoon /> : <FiSun />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
