import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlay, FiInfo, FiStar, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getBackdropUrl, getPosterUrl } from '../utils/api-tmdb-proxy'
import { useThemeStore } from '../store/themeStore'
import { formatRuntime } from '../utils/helpers'

const HeroSection = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const { theme } = useThemeStore()
  const navigate = useNavigate()

  const featuredMovie = movies[currentIndex]

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (movies.length <= 1) return

    const interval = setInterval(() => {
      nextMovie()
    }, 7000)

    return () => clearInterval(interval)
  }, [currentIndex, movies.length])

  const nextMovie = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  const prevMovie = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const goToMovie = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  if (!featuredMovie || movies.length === 0) return null

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden rounded-3xl">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={getBackdropUrl(featuredMovie.backdrop_path, 'original')}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            {theme === 'dark' && (
              <div className="absolute inset-0 bg-black/30" />
            )}
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <div className="max-w-2xl space-y-6">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-500/20 backdrop-blur-sm border border-primary-500/30"
                >
                  <FiStar className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">
                    {featuredMovie.vote_average?.toFixed(1)} / 10
                  </span>
                  <span className="text-gray-300 text-sm">
                    ({featuredMovie.vote_count?.toLocaleString()} votes)
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
                >
                  {featuredMovie.title}
                </motion.h1>

                {/* Meta Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-4 text-gray-300"
                >
                  {featuredMovie.release_date && (
                    <div className="flex items-center space-x-2">
                      <FiClock />
                      <span>{new Date(featuredMovie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  {featuredMovie.runtime && (
                    <div className="flex items-center space-x-2">
                      <FiClock />
                      <span>{formatRuntime(featuredMovie.runtime)}</span>
                    </div>
                  )}
                  {featuredMovie.genres && featuredMovie.genres.length > 0 && (
                    <div className="flex items-center space-x-2">
                      {featuredMovie.genres.slice(0, 3).map((genre, index) => (
                        <span key={genre.id}>
                          {genre.name}{index < Math.min(2, featuredMovie.genres.length - 1) && ','}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Overview */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-200 leading-relaxed line-clamp-3"
                >
                  {featuredMovie.overview}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all"
                  >
                    <FiPlay />
                    <span>Watch Now</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                    className="flex items-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white/20 hover:bg-white/20 transition-all"
                  >
                    <FiInfo />
                    <span>More Info</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {movies.length > 1 && (
        <>
          <button
            onClick={prevMovie}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all z-10"
            aria-label="Previous movie"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextMovie}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all z-10"
            aria-label="Next movie"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMovie(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary-500'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeroSection
