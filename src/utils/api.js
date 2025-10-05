import axios from 'axios'

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const OMDB_BASE_URL = 'https://www.omdbapi.com/'
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search'

// Create axios instance with default config
const api = axios.create({
  timeout: 10000,
})

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    if (!error.response) {
      throw new Error('Network error. Please check your connection.')
    }
    throw error
  }
)

/**
 * Search for movies by title
 * @param {string} query - Search query
 * @param {number} page - Page number for pagination
 * @returns {Promise} - Movie search results
 */
export const searchMovies = async (query, page = 1) => {
  try {
    if (!OMDB_API_KEY) {
      throw new Error('OMDB API key is not configured')
    }

    const response = await api.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: query,
        page,
        type: 'movie'
      }
    })

    if (response.data.Response === 'False') {
      throw new Error(response.data.Error || 'No movies found')
    }

    return {
      movies: response.data.Search || [],
      totalResults: parseInt(response.data.totalResults) || 0
    }
  } catch (error) {
    console.error('Error searching movies:', error)
    throw error
  }
}

/**
 * Get detailed information about a specific movie
 * @param {string} id - IMDB ID
 * @returns {Promise} - Movie details
 */
export const getMovieDetails = async (id) => {
  try {
    if (!OMDB_API_KEY) {
      throw new Error('OMDB API key is not configured')
    }

    const response = await api.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        i: id,
        plot: 'full'
      }
    })

    if (response.data.Response === 'False') {
      throw new Error(response.data.Error || 'Movie not found')
    }

    return response.data
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}

/**
 * Get trending/popular movies
 * @returns {Promise} - Array of trending movies
 */
export const getTrendingMovies = async () => {
  try {
    const trendingQueries = [
      'Avengers',
      'Inception',
      'Interstellar',
      'The Dark Knight',
      'Joker',
      'Spider-Man',
      'Avatar',
      'Titanic'
    ]
    
    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)]
    const { movies } = await searchMovies(randomQuery)
    return movies.slice(0, 8)
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    return []
  }
}

/**
 * Get movies by category
 * @param {string} category - Category name
 * @param {number} page - Page number
 * @returns {Promise} - Category movies
 */
export const getMoviesByCategory = async (category, page = 1) => {
  const categories = {
    action: 'action',
    comedy: 'comedy',
    drama: 'drama',
    horror: 'horror',
    scifi: 'star wars',
    thriller: 'thriller',
    romance: 'love',
    animation: 'disney'
  }

  const query = categories[category.toLowerCase()] || category
  return searchMovies(query, page)
}

/**
 * Get YouTube trailer for a movie
 * @param {string} movieTitle - Movie title
 * @param {string} year - Release year
 * @returns {Promise} - YouTube video ID
 */
export const getMovieTrailer = async (movieTitle, year) => {
  try {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key is not configured')
      return null
    }

    const response = await api.get(YOUTUBE_BASE_URL, {
      params: {
        key: YOUTUBE_API_KEY,
        q: `${movieTitle} ${year} official trailer`,
        part: 'snippet',
        type: 'video',
        maxResults: 1,
        videoEmbeddable: true
      }
    })

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id.videoId
    }

    return null
  } catch (error) {
    console.error('Error fetching trailer:', error)
    return null
  }
}

/**
 * Get movie recommendations based on genre
 * @param {string} genre - Movie genre
 * @returns {Promise} - Recommended movies
 */
export const getRecommendations = async (genre) => {
  try {
    if (!genre || genre === 'N/A') {
      return getTrendingMovies()
    }
    
    const genreQuery = genre.split(',')[0].trim()
    const { movies } = await searchMovies(genreQuery)
    return movies.slice(0, 6)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

/**
 * Advanced search with filters
 * @param {Object} filters - Search filters
 * @returns {Promise} - Filtered movie results
 */
export const advancedSearch = async (filters) => {
  try {
    const { query, year, type = 'movie', page = 1 } = filters
    
    if (!OMDB_API_KEY) {
      throw new Error('OMDB API key is not configured')
    }

    const params = {
      apikey: OMDB_API_KEY,
      s: query,
      page,
      type
    }

    if (year) {
      params.y = year
    }

    const response = await api.get(OMDB_BASE_URL, { params })

    if (response.data.Response === 'False') {
      throw new Error(response.data.Error || 'No movies found')
    }

    return {
      movies: response.data.Search || [],
      totalResults: parseInt(response.data.totalResults) || 0
    }
  } catch (error) {
    console.error('Error in advanced search:', error)
    throw error
  }
}

export default {
  searchMovies,
  getMovieDetails,
  getTrendingMovies,
  getMoviesByCategory,
  getMovieTrailer,
  getRecommendations,
  advancedSearch
}
