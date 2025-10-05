import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiFilm, FiClock, FiStar, FiCalendar, FiAward, FiHeart, FiZap } from 'react-icons/fi'
import MovieCard from '../components/MovieCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import HeroSection from '../components/HeroSection'
import { getTrendingMovies, getPopularMovies, getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies, discoverMovies } from '../utils/api-tmdb-proxy'
import { useThemeStore } from '../store/themeStore'
import { useWatchlistStore } from '../store/watchlistStore'
import { getPersonalizedRecommendations, getUserTasteProfile, getRecommendationExplanation } from '../utils/recommendations'
import toast from 'react-hot-toast'

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [topRatedMovies, setTopRatedMovies] = useState([])
  const [recommendedMovies, setRecommendedMovies] = useState([])
  const [recommendationReason, setRecommendationReason] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trendingType, setTrendingType] = useState('week') // 'day' or 'week'
  const { theme } = useThemeStore()
  const { watchlist, favorites } = useWatchlistStore()

  const categories = [
    { id: 28, name: 'Action', icon: '💥' },
    { id: 35, name: 'Comedy', icon: '😂' },
    { id: 18, name: 'Drama', icon: '🎭' },
    { id: 27, name: 'Horror', icon: '😱' },
    { id: 878, name: 'Sci-Fi', icon: '🚀' },
    { id: 10749, name: 'Romance', icon: '💕' },
  ]

  useEffect(() => {
    fetchHomeData()
  }, [])

  // Fetch personalized recommendations when watchlist changes
  useEffect(() => {
    fetchRecommendations()
  }, [watchlist, favorites])

  const fetchRecommendations = async () => {
    if (watchlist.length < 3) {
      setRecommendedMovies([])
      setRecommendationReason(null)
      return
    }

    try {
      const { recommendations, reason, basedOn } = await getPersonalizedRecommendations(
        watchlist,
        favorites,
        discoverMovies
      )

      if (reason === 'success' && recommendations.length > 0) {
        setRecommendedMovies(recommendations)
        setRecommendationReason(basedOn)
      } else {
        setRecommendedMovies([])
        setRecommendationReason(null)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      
      // Fetch REAL trending movies from TMDb!
      const trending = await getTrendingMovies(trendingType)
      setTrendingMovies(trending?.slice(0, 8) || []) // Reduced to 8

      // Fetch popular movies
      const popular = await getPopularMovies()
      setPopularMovies(popular?.slice(0, 8) || []) // Reduced to 8

      // Fetch now playing (movies in theaters!)
      const nowPlaying = await getNowPlayingMovies()
      setNowPlayingMovies(nowPlaying?.slice(0, 8) || []) // Reduced to 8

      // Fetch upcoming releases
      const upcoming = await getUpcomingMovies()
      setUpcomingMovies(upcoming?.slice(0, 8) || []) // Reduced to 8

      // Fetch top rated of all time
      const topRated = await getTopRatedMovies()
      setTopRatedMovies(topRated?.slice(0, 8) || []) // Reduced to 8

    } catch (error) {
      console.error('Error fetching home data:', error)
      toast.error('Failed to load movies. Please check your API connection.')
    } finally {
      setLoading(false)
    }
  }

  // Refetch when trending type changes
  useEffect(() => {
    if (!loading) {
      fetchTrending()
    }
  }, [trendingType])

  const fetchTrending = async () => {
    try {
      const trending = await getTrendingMovies(trendingType)
      setTrendingMovies(trending.slice(0, 10))
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Section - Featured Movies */}
      {!loading && trendingMovies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection movies={trendingMovies.slice(0, 5)} />
        </motion.div>
      )}

      {/* Trending Movies with Switcher */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <FiTrendingUp className="text-3xl text-primary-500" />
            <h2 className={`text-3xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Trending Now
            </h2>
          </div>

          {/* Trending Type Switcher */}
          <div className={`flex space-x-2 p-1 rounded-lg ${
            theme === 'light' ? 'bg-gray-100' : 'bg-dark-800'
          }`}>
            <button
              onClick={() => setTrendingType('day')}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                trendingType === 'day'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : theme === 'light'
                  ? 'text-gray-700 hover:bg-gray-200'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              🔥 Today
            </button>
            <button
              onClick={() => setTrendingType('week')}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                trendingType === 'week'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : theme === 'light'
                  ? 'text-gray-700 hover:bg-gray-200'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              📅 This Week
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingMovies.map((movie, index) => (
              <MovieCard key={movie.id || index} movie={movie} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* AI-Powered Recommendations - "For You" Section */}
      {!loading && recommendedMovies.length > 0 && recommendationReason && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Header with Genre Badge */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FiZap className="text-3xl text-yellow-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
                </div>
                <h2 className={`text-3xl font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  For You
                </h2>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchRecommendations}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-primary-900/30 text-primary-400 hover:bg-primary-900/50'
                }`}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Genre Affinity Badges */}
            <div className="mt-4 flex flex-wrap gap-3">
              {recommendationReason.topGenres?.slice(0, 3).map((genre, index) => (
                <motion.div
                  key={genre.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`px-4 py-2 rounded-full font-semibold ${
                    index === 0
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : index === 1
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  } shadow-lg`}
                >
                  {genre.name === 'Science Fiction' ? 'Sci-Fi' : genre.name} {genre.percentage}% 🎬
                </motion.div>
              ))}
            </div>

            {/* Explanation Text */}
            <p className={`mt-3 text-lg ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {getRecommendationExplanation(recommendationReason)}
            </p>
          </div>

          {/* Movie Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendedMovies.map((movie, index) => (
              <motion.div
                key={movie.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard movie={movie} index={index} />
              </motion.div>
            ))}
          </div>

          {/* Minimum Movies Message */}
          {watchlist.length < 3 && (
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'light' ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-900/20 border border-yellow-800'
            }`}>
              <p className={`text-sm ${
                theme === 'light' ? 'text-yellow-800' : 'text-yellow-400'
              }`}>
                💡 Add at least 3 movies to your watchlist to get personalized recommendations!
              </p>
            </div>
          )}
        </motion.section>
      )}

      {/* Now Playing (In Theaters!) */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <FiClock className="text-3xl text-green-500" />
          <h2 className={`text-3xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Now Playing in Theaters
          </h2>
        </div>

        {loading ? (
          <LoadingSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {nowPlayingMovies.map((movie, index) => (
              <MovieCard key={movie.id || index} movie={movie} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Movies */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <FiStar className="text-3xl text-yellow-500" />
          <h2 className={`text-3xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Popular Movies
          </h2>
        </div>

        {loading ? (
          <LoadingSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularMovies.map((movie, index) => (
              <MovieCard key={movie.id || index} movie={movie} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Releases */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <FiCalendar className="text-3xl text-blue-500" />
          <h2 className={`text-3xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Coming Soon
          </h2>
        </div>

        {loading ? (
          <LoadingSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {upcomingMovies.map((movie, index) => (
              <MovieCard key={movie.id || index} movie={movie} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated of All Time */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <FiAward className="text-3xl text-yellow-500" />
          <h2 className={`text-3xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Top Rated of All Time
          </h2>
        </div>

        {loading ? (
          <LoadingSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {topRatedMovies.map((movie, index) => (
              <MovieCard key={movie.id || index} movie={movie} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`text-center py-16 px-4 rounded-2xl ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-primary-100 to-pink-100' 
            : 'bg-gradient-to-r from-primary-900/20 to-pink-900/20'
        }`}
      >
        <FiFilm className="text-6xl text-primary-500 mx-auto mb-4" />
        <h2 className={`text-4xl font-bold mb-4 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          Start Building Your Collection
        </h2>
        <p className={`text-lg mb-8 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          Search for movies, add them to your watchlist, and rate your favorites
        </p>
      </motion.section>
    </div>
  )
}

export default Home
