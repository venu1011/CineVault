import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiHeart, FiBookmark, FiStar, FiInfo } from 'react-icons/fi'
import { MdMovie } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import { useWatchlistStore } from '../store/watchlistStore'
import { useThemeStore } from '../store/themeStore'
import toast from 'react-hot-toast'

const MovieCard = ({ movie, index = 0 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { theme } = useThemeStore()
  const navigate = useNavigate()
  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
  } = useWatchlistStore()

  // Support both TMDb and OMDB formats
  const movieId = movie.id || movie.imdbID
  const movieTitle = movie.title || movie.Title
  const moviePoster = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.Poster !== 'N/A' 
    ? movie.Poster 
    : 'https://via.placeholder.com/300x450/1e293b/f43f5e?text=No+Poster'
  const movieRating = movie.vote_average || parseFloat(movie.imdbRating) || 0
  const movieYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : movie.Year

  const inWatchlist = isInWatchlist(movieId)
  const inFavorites = isInFavorites(movieId)

  const handleWatchlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (inWatchlist) {
      removeFromWatchlist(movieId)
      toast.success('Removed from watchlist')
    } else {
      addToWatchlist({ ...movie, id: movieId })
      toast.success('Added to watchlist')
    }
  }

  const handleFavoriteToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (inFavorites) {
      removeFromFavorites(movieId)
      toast.success('Removed from favorites')
    } else {
      addToFavorites({ ...movie, id: movieId })
      toast.success('Added to favorites')
    }
  }

  const handleViewDetails = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/movie/${movieId}`)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/movie/${movieId}`}>
        <div className={`relative overflow-hidden rounded-xl shadow-lg ${
          theme === 'light' 
            ? 'bg-white hover:shadow-2xl' 
            : 'bg-dark-800 hover:shadow-2xl hover:shadow-primary-500/20'
        } transition-all duration-300 transform hover:-translate-y-2`}>
          {/* Poster Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={moviePoster}
              alt={movieTitle}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteToggle}
                className={`p-2.5 rounded-full backdrop-blur-md shadow-lg ${
                  inFavorites 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/50' 
                    : 'bg-white/20 text-white hover:bg-red-500 hover:shadow-red-500/50'
                } transition-all`}
                aria-label="Add to favorites"
                title="Add to Favorites"
              >
                <FiHeart className={`w-4 h-4 ${inFavorites ? 'fill-current' : ''}`} />
              </motion.button>

              {/* Watchlist Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWatchlistToggle}
                className={`p-2.5 rounded-full backdrop-blur-md shadow-lg ${
                  inWatchlist 
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-primary-500/50' 
                    : 'bg-white/20 text-white hover:bg-primary-500 hover:shadow-primary-500/50'
                } transition-all`}
                aria-label="Add to watchlist"
                title="Add to Watchlist"
              >
                <FiBookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
              </motion.button>

              {/* View Details Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleViewDetails}
                className="p-2.5 rounded-full backdrop-blur-md bg-white/20 text-white hover:bg-blue-500 hover:shadow-blue-500/50 shadow-lg transition-all"
                aria-label="View details"
                title="View Details"
              >
                <FiInfo className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div
                whileHover={{ scale: 1.2 }}
                className="bg-primary-500 rounded-full p-4 shadow-xl"
              >
                <MdMovie className="text-3xl text-white" />
              </motion.div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-4">
            <h3 className={`font-bold text-lg mb-1 truncate ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {movieTitle}
            </h3>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {movieYear}
              </span>
              
              {movieRating > 0 && (
                <div className="flex items-center space-x-1">
                  <FiStar className="text-yellow-400 fill-current" size={14} />
                  <span className={`text-sm font-semibold ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {movieRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default MovieCard
