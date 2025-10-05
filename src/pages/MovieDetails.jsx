import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiHeart, FiBookmark, FiStar, FiClock, FiCalendar, 
  FiFilm, FiAward, FiDollarSign, FiShare2, FiArrowLeft, FiPlay, FiUser, FiUsers, FiMonitor, FiCheckCircle, FiExternalLink
} from 'react-icons/fi'
import { 
  getMovieDetails, 
  getMovieVideos,
  getProfileUrl,
  getPosterUrl,
  getBackdropUrl
} from '../utils/api-tmdb-proxy'
import { useWatchlistStore } from '../store/watchlistStore'
import { useThemeStore } from '../store/themeStore'
import { formatRuntime, formatNumber, getRatingColor, shareContent } from '../utils/helpers'
import MovieCard from '../components/MovieCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import TrailerModal from '../components/TrailerModal'
import toast from 'react-hot-toast'

// OTT Platform URLs (Deep links to search for the movie)
const getStreamingUrl = (providerName, movieTitle, movieYear) => {
  const encodedTitle = encodeURIComponent(movieTitle)
  const searchQuery = `${movieTitle} ${movieYear || ''}`
  const encodedSearch = encodeURIComponent(searchQuery)
  
  const urls = {
    'Netflix': `https://www.netflix.com/search?q=${encodedSearch}`,
    'Amazon Prime Video': `https://www.primevideo.com/search/ref=atv_nb_sf?phrase=${encodedSearch}`,
    'Disney Plus': `https://www.disneyplus.com/search?q=${encodedSearch}`,
    'Disney+': `https://www.disneyplus.com/search?q=${encodedSearch}`,
    'Hotstar': `https://www.hotstar.com/in/search?q=${encodedSearch}`,
    'Apple TV': `https://tv.apple.com/search?q=${encodedSearch}`,
    'Apple TV Plus': `https://tv.apple.com/search?q=${encodedSearch}`,
    'Hulu': `https://www.hulu.com/search?q=${encodedSearch}`,
    'HBO Max': `https://www.hbomax.com/search?q=${encodedSearch}`,
    'Paramount Plus': `https://www.paramountplus.com/search/?query=${encodedSearch}`,
    'Peacock': `https://www.peacocktv.com/search?q=${encodedSearch}`,
    'YouTube': `https://www.youtube.com/results?search_query=${encodedSearch}`,
    'Google Play Movies': `https://play.google.com/store/search?q=${encodedSearch}&c=movies`,
    'Apple iTunes': `https://www.apple.com/search/${encodedSearch}`,
    'Zee5': `https://www.zee5.com/search?q=${encodedSearch}`,
    'SonyLIV': `https://www.sonyliv.com/search?searchQuery=${encodedSearch}`,
    'Voot': `https://www.voot.com/search?q=${encodedSearch}`,
    'Jio Cinema': `https://www.jiocinema.com/search?q=${encodedSearch}`,
    'MX Player': `https://www.mxplayer.in/search?q=${encodedSearch}`,
  }
  
  return urls[providerName] || `https://www.google.com/search?q=watch+${encodedSearch}+online`
}

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [trailer, setTrailer] = useState(null)
  const [cast, setCast] = useState([])
  const [crew, setCrew] = useState([])
  const [similarMovies, setSimilarMovies] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [watchProviders, setWatchProviders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [userRating, setUserRating] = useState(0)

  const { theme } = useThemeStore()
  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToAlreadyWatched,
    removeFromAlreadyWatched,
    isInAlreadyWatched,
    setRating,
    getRating,
    addToRecentlyViewed,
  } = useWatchlistStore()

  useEffect(() => {
    fetchMovieData()
  }, [id])

  const fetchMovieData = async () => {
    try {
      setLoading(true)
      
      // Fetch ALL data in ONE API call (faster!)
      const movieData = await getMovieDetails(id)
      setMovie(movieData)
      setUserRating(getRating(id))

      // Track this movie as recently viewed
      addToRecentlyViewed(movieData)

      // Extract trailer from videos
      if (movieData.videos && movieData.videos.results) {
        const youtubeTrailer = movieData.videos.results.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        )
        setTrailer(youtubeTrailer || movieData.videos.results[0])
      }

      // Extract cast and crew from credits
      if (movieData.credits) {
        setCast(movieData.credits.cast?.slice(0, 4) || []) // Reduced to 4 for speed!
        const keyCrewRoles = ['Director', 'Producer', 'Writer', 'Screenplay']
        const keyCrew = movieData.credits.crew?.filter(person => 
          keyCrewRoles.includes(person.job)
        ) || []
        // Remove duplicates and limit to 4
        const uniqueCrew = keyCrew.filter((person, index, self) =>
          index === self.findIndex(p => p.id === person.id)
        ).slice(0, 4)
        setCrew(uniqueCrew)
      }

      // Extract similar movies
      if (movieData.similar && movieData.similar.results) {
        setSimilarMovies(movieData.similar.results.slice(0, 4))
      }

      // Extract recommendations
      if (movieData.recommendations && movieData.recommendations.results) {
        setRecommendations(movieData.recommendations.results.slice(0, 4))
      }

      // Extract watch providers
      if (movieData['watch/providers'] && movieData['watch/providers'].results) {
        setWatchProviders(movieData['watch/providers'].results)
      }
      
    } catch (error) {
      console.error('Error fetching movie details:', error)
      toast.error('Failed to load movie details.')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlistToggle = () => {
    const movieId = movie.id || movie.imdbID
    const inList = isInWatchlist(movieId)
    if (inList) {
      removeFromWatchlist(movieId)
      toast.success('Removed from watchlist')
    } else {
      addToWatchlist({ ...movie, id: movieId })
      toast.success('Added to watchlist')
    }
  }

  const handleAlreadyWatchedToggle = () => {
    const movieId = movie.id || movie.imdbID
    const isWatched = isInAlreadyWatched(movieId)
    if (isWatched) {
      removeFromAlreadyWatched(movieId)
      toast.success('Removed from already watched')
    } else {
      addToAlreadyWatched({ ...movie, id: movieId })
      toast.success('Marked as already watched ✓')
    }
  }

  const handleRating = (rating) => {
    const movieId = movie.id || movie.imdbID
    setUserRating(rating)
    setRating(movieId, rating)
    toast.success(`Rated ${rating} stars`)
  }

  const handleShare = async () => {
    const shared = await shareContent({
      title: movie.Title,
      text: `Check out ${movie.Title} (${movie.Year})`,
      url: window.location.href
    })
    
    if (shared) {
      toast.success('Shared successfully')
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className={`h-96 rounded-2xl ${theme === 'light' ? 'skeleton-light' : 'skeleton'}`} />
        <LoadingSkeleton count={4} />
      </div>
    )
  }

  if (!movie) return null

  // Use TMDb image URLs (fast, direct from CDN!)
  const posterUrl = getPosterUrl(movie.poster_path, 'w342') // Smaller for faster loading
  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'w780') // Smaller backdrop
  const title = movie.title || movie.original_title
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'

  return (
    <div className="space-y-12 pb-12">
      {/* Back Button - Improved */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          theme === 'light' 
            ? 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm' 
            : 'bg-dark-800 hover:bg-dark-700 text-gray-300'
        }`}
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </motion.button>

      {/* Hero Section - Enhanced with Gradient Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Backdrop with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className={`absolute inset-0 ${
            theme === 'light'
              ? 'bg-gradient-to-t from-white via-white/95 to-white/80'
              : 'bg-gradient-to-t from-dark-900 via-dark-900/95 to-dark-900/80'
          }`} />
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 p-6 md:p-10">
          {/* Poster - Enhanced with Shadow & Border */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <img
                src={posterUrl}
                alt={title}
                className="w-full rounded-2xl shadow-2xl ring-4 ring-white/10"
                loading="lazy"
              />
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-4xl md:text-5xl font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                {title}
              </motion.h1>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <span className={`flex items-center space-x-1 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <FiCalendar />
                  <span>{releaseYear}</span>
                </span>
                
                {movie.runtime && (
                  <span className={`flex items-center space-x-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <FiClock />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </span>
                )}

                {movie.adult !== undefined && (
                  <span className={`flex items-center space-x-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <FiFilm />
                    <span>{movie.adult ? '18+' : 'PG'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {movie.vote_average && (
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 text-2xl font-bold ${getRatingColor(movie.vote_average)}`}>
                  <FiStar className="fill-current" />
                  <span>{movie.vote_average?.toFixed(1)}</span>
                </div>
                <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                  / 10 ({formatNumber(movie.vote_count)} votes)
                </span>
              </div>
            )}

            {/* User Rating */}
            <div>
              <p className={`text-sm mb-2 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Your Rating:
              </p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <FiStar
                      className={`text-2xl ${
                        star <= userRating
                          ? 'text-yellow-500 fill-current'
                          : theme === 'light'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Genres - Enhanced Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {movie.genres.map((genre) => (
                  <motion.span
                    key={genre.id}
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm border transition-all ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200 text-gray-700 hover:border-primary-400 hover:shadow-md'
                        : 'bg-gradient-to-r from-dark-700 to-dark-800 border-dark-600 text-gray-300 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/20'
                    }`}
                  >
                    {genre.name}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Action Buttons - Premium Design */}
            <div className="flex flex-wrap gap-3">
              {trailer && trailer.key && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTrailer(true)}
                  className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center space-x-2">
                    <FiPlay />
                    <span>Watch Trailer</span>
                  </span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWatchlistToggle}
                className={`group relative px-6 py-3 rounded-xl font-semibold shadow-lg transition-all overflow-hidden ${
                  isInWatchlist(movie.id || movie.imdbID)
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-primary-500/50'
                    : theme === 'light'
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-400'
                    : 'bg-dark-800 border-2 border-dark-600 text-gray-300 hover:border-primary-500'
                }`}
              >
                <span className="relative flex items-center space-x-2">
                  <FiBookmark className={isInWatchlist(movie.id || movie.imdbID) ? 'fill-current' : ''} />
                  <span>{isInWatchlist(movie.id || movie.imdbID) ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAlreadyWatchedToggle}
                className={`group relative px-6 py-3 rounded-xl font-semibold shadow-lg transition-all overflow-hidden ${
                  isInAlreadyWatched(movie.id || movie.imdbID)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/50'
                    : theme === 'light'
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-400'
                    : 'bg-dark-800 border-2 border-dark-600 text-gray-300 hover:border-green-500'
                }`}
              >
                <span className="relative flex items-center space-x-2">
                  <FiCheckCircle className={isInAlreadyWatched(movie.id || movie.imdbID) ? 'fill-current' : ''} />
                  <span>{isInAlreadyWatched(movie.id || movie.imdbID) ? 'Already Watched ✓' : 'Mark as Watched'}</span>
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className={`group relative px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
                  theme === 'light'
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                    : 'bg-dark-800 border-2 border-dark-600 text-gray-300 hover:border-blue-500'
                }`}
              >
                <span className="relative flex items-center space-x-2">
                  <FiShare2 />
                  <span>Share</span>
                </span>
              </motion.button>
            </div>

            {/* Plot */}
            {movie.overview && (
              <div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Overview
                </h3>
                <p className={`leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                  {movie.overview}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - NEW Premium Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movie.vote_average && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'light'
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                : 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-800/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <FiStar className="text-yellow-500" />
              <span className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Rating
              </span>
            </div>
            <p className={`text-3xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {movie.vote_average?.toFixed(1)}
            </p>
            <p className={`text-xs ${
              theme === 'light' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {formatNumber(movie.vote_count)} votes
            </p>
          </motion.div>
        )}

        {movie.budget && movie.budget > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'light'
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <FiDollarSign className="text-green-500" />
              <span className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Budget
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              ${formatNumber(movie.budget)}
            </p>
          </motion.div>
        )}

        {movie.revenue && movie.revenue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'light'
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                : 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-800/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <FiAward className="text-blue-500" />
              <span className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Revenue
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              ${formatNumber(movie.revenue)}
            </p>
          </motion.div>
        )}

        {movie.runtime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'light'
                ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                : 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-800/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <FiClock className="text-purple-500" />
              <span className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Runtime
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {formatRuntime(movie.runtime)}
            </p>
          </motion.div>
        )}
      </div>


      {/* Watch Providers */}
      {watchProviders && (watchProviders.US || watchProviders.IN) && (
        <section className={`p-6 rounded-xl ${
          theme === 'light' ? 'bg-gray-50' : 'bg-dark-800'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <FiMonitor className="text-2xl text-primary-500" />
            <h2 className={`text-2xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Where to Watch
            </h2>
          </div>
          
          <p className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Click on a platform to search for this movie
          </p>
          
          {(watchProviders.IN || watchProviders.US) && (
            <div className="space-y-4">
              {/* India Providers */}
              {watchProviders.IN && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    🇮🇳 India
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {watchProviders.IN.flatrate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Stream</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.IN.flatrate.map(provider => (
                            <motion.a
                              key={provider.provider_id}
                              href={getStreamingUrl(provider.provider_name, movie.title, movie.release_date?.split('-')[0])}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-14 h-14 rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow cursor-pointer ring-2 ring-transparent group-hover:ring-primary-500"
                                title={provider.provider_name}
                              />
                              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg">
                                  <FiExternalLink className="w-3 h-3" />
                                </div>
                              </div>
                              <div className="text-xs text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-primary-500">
                                Watch Now
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}
                    {watchProviders.IN.rent && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Rent</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.IN.rent.map(provider => (
                            <motion.a
                              key={provider.provider_id}
                              href={getStreamingUrl(provider.provider_name, movie.title, movie.release_date?.split('-')[0])}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-14 h-14 rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow cursor-pointer ring-2 ring-transparent group-hover:ring-yellow-500"
                                title={provider.provider_name}
                              />
                              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-yellow-500 text-white p-1 rounded-full shadow-lg">
                                  <FiExternalLink className="w-3 h-3" />
                                </div>
                              </div>
                              <div className="text-xs text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-yellow-500">
                                Rent Now
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* US Providers (fallback) */}
              {!watchProviders.IN && watchProviders.US && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    🇺🇸 United States
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {watchProviders.US.flatrate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Stream</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.US.flatrate.map(provider => (
                            <motion.a
                              key={provider.provider_id}
                              href={getStreamingUrl(provider.provider_name, movie.title, movie.release_date?.split('-')[0])}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-14 h-14 rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow cursor-pointer ring-2 ring-transparent group-hover:ring-primary-500"
                                title={provider.provider_name}
                              />
                              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg">
                                  <FiExternalLink className="w-3 h-3" />
                                </div>
                              </div>
                              <div className="text-xs text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-primary-500">
                                Watch Now
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Cast - Premium Cards */}
      {cast.length > 0 && (
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-8"
          >
            <div className={`p-3 rounded-xl ${
              theme === 'light' 
                ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                : 'bg-gradient-to-br from-purple-900/30 to-pink-900/30'
            }`}>
              <FiUsers className="text-2xl text-purple-500" />
            </div>
            <h2 className={`text-3xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Top Cast
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {cast.map((actor, index) => (
              <motion.div
                key={actor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group rounded-2xl overflow-hidden backdrop-blur-sm border transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-2xl' 
                    : 'bg-dark-800 border-dark-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10'
                }`}
              >
                {/* Image with Gradient Overlay */}
                <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                  <img
                    src={getProfileUrl(actor.profile_path, 'w185')}
                    alt={actor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Info */}
                <div className="p-4 space-y-1">
                  <p className={`font-bold text-sm truncate ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {actor.name}
                  </p>
                  <p className={`text-xs truncate ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    as {actor.character}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Crew - Premium Cards */}
      {crew.length > 0 && (
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-8"
          >
            <div className={`p-3 rounded-xl ${
              theme === 'light' 
                ? 'bg-gradient-to-br from-blue-100 to-cyan-100' 
                : 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30'
            }`}>
              <FiUser className="text-2xl text-blue-500" />
            </div>
            <h2 className={`text-3xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Key Crew
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {crew.map((person, index) => (
              <motion.div
                key={`${person.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group rounded-2xl overflow-hidden backdrop-blur-sm border transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-2xl' 
                    : 'bg-dark-800 border-dark-700 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10'
                }`}
              >
                {/* Image with Gradient Overlay */}
                <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                  <img
                    src={getProfileUrl(person.profile_path, 'w185')}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Info */}
                <div className="p-4 space-y-1">
                  <p className={`font-bold text-sm truncate ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {person.name}
                  </p>
                  <p className={`text-xs truncate ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {person.job}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies - Enhanced Section */}
      {similarMovies.length > 0 && (
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-8"
          >
            <div className={`p-3 rounded-xl ${
              theme === 'light' 
                ? 'bg-gradient-to-br from-pink-100 to-rose-100' 
                : 'bg-gradient-to-br from-pink-900/30 to-rose-900/30'
            }`}>
              <FiFilm className="text-2xl text-pink-500" />
            </div>
            <h2 className={`text-3xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Similar Movies
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarMovies.map((similar, index) => (
              <MovieCard key={similar.id || index} movie={similar} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations - Enhanced Section */}
      {recommendations.length > 0 && (
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-8"
          >
            <div className={`p-3 rounded-xl ${
              theme === 'light' 
                ? 'bg-gradient-to-br from-amber-100 to-orange-100' 
                : 'bg-gradient-to-br from-amber-900/30 to-orange-900/30'
            }`}>
              <FiAward className="text-2xl text-amber-500" />
            </div>
            <h2 className={`text-3xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              You May Also Like
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((rec, index) => (
              <MovieCard key={rec.id || index} movie={rec} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailer && trailer.key && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold transition"
            >
              Close ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              className="w-full h-full rounded-lg"
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      
      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        videoKey={trailer?.key}
        title={movie?.title}
      />
    </div>
  )
}

const InfoCard = ({ icon, title, value, theme }) => (
  <div className={`p-6 rounded-xl ${
    theme === 'light' ? 'bg-gray-100' : 'bg-dark-800'
  }`}>
    <div className="flex items-center space-x-2 mb-2 text-primary-500">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
      {value}
    </p>
  </div>
)

export default MovieDetails
