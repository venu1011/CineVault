import axios from 'axios'

// TMDb API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Log API key status (remove in production)
console.log('🔑 TMDb API Key Status:', TMDB_API_KEY ? '✅ Loaded' : '❌ Missing')
if (!TMDB_API_KEY) {
  console.error('⚠️ VITE_TMDB_API_KEY is not set in .env file!')
}

// OMDB API (for IMDb ratings - optional)
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY
const OMDB_BASE_URL = 'https://www.omdbapi.com/'

// YouTube API
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search'

// Create axios instance
const api = axios.create({
  timeout: 30000, // 30 seconds - increased for slower connections
})

// Add request interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry logic for timeout errors (max 2 retries)
    if (!config._retry) {
      config._retry = 0;
    }
    
    if (error.code === 'ECONNABORTED' && config._retry < 2) {
      config._retry += 1;
      console.log(`⏳ Request timeout, retrying (${config._retry}/2)...`);
      return api(config);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout after retries. Please check your connection or try again later.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check your connection.')
    }
    throw error
  }
)

/**
 * Get poster image URL from TMDb
 * @param {string} path - Poster path
 * @param {string} size - Image size (w185, w342, w500, w780, original)
 * @returns {string} - Full image URL
 */
export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750/1e293b/f43f5e?text=No+Poster'
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

/**
 * Get backdrop image URL from TMDb
 * @param {string} path - Backdrop path
 * @param {string} size - Image size (w300, w780, w1280, original)
 * @returns {string} - Full image URL
 */
export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return null
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

/**
 * Convert TMDb movie to OMDB-like format for compatibility
 * @param {Object} movie - TMDb movie object
 * @returns {Object} - Normalized movie object
 */
const normalizeMovie = (movie) => ({
  imdbID: movie.id?.toString() || '',
  Title: movie.title || movie.name || 'Unknown',
  Year: movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A',
  Poster: getPosterUrl(movie.poster_path),
  Type: movie.media_type || 'movie',
  // TMDb specific fields
  tmdbId: movie.id,
  overview: movie.overview,
  rating: movie.vote_average,
  voteCount: movie.vote_count,
  backdrop: getBackdropUrl(movie.backdrop_path),
  popularity: movie.popularity,
  genreIds: movie.genre_ids || [],
})

/**
 * Get trending movies (REAL TRENDING DATA!)
 * @param {string} timeWindow - 'day' or 'week'
 * @returns {Promise} - Array of trending movies
 */
export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    if (!TMDB_API_KEY) {
      console.error('❌ TMDb API key is missing!')
      throw new Error('TMDb API key is not configured. Please add VITE_TMDB_API_KEY to your .env file')
    }

    console.log('🎬 Fetching trending movies:', timeWindow)
    const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}`
    console.log('📡 Request URL:', url)

    const response = await api.get(url, {
      params: {
        api_key: TMDB_API_KEY,
        page: 1
      }
    })

    console.log('✅ Trending movies fetched:', response.data.results.length)
    return response.data.results.map(normalizeMovie)
  } catch (error) {
    console.error('❌ Error fetching trending movies:', error.message)
    if (error.response) {
      console.error('API Response Error:', error.response.data)
      console.error('Status:', error.response.status)
    }
    throw new Error(error.response?.data?.status_message || error.message || 'Failed to fetch trending movies')
  }
}

/**
 * Get popular movies
 * @param {number} page - Page number
 * @returns {Promise} - Popular movies
 */
export const getPopularMovies = async (page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured. Please add VITE_TMDB_API_KEY to your .env file')
    }

    console.log('🎬 Fetching popular movies, page:', page)

    const response = await api.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page
      }
    })

    console.log('✅ Popular movies fetched:', response.data.results.length)
    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    }
  } catch (error) {
    console.error('❌ Error fetching popular movies:', error.message)
    if (error.response) {
      console.error('API Response Error:', error.response.data)
    }
    throw new Error(error.response?.data?.status_message || error.message || 'Failed to fetch popular movies')
  }
}

/**
 * Get top rated movies
 * @param {number} page - Page number
 * @returns {Promise} - Top rated movies
 */
export const getTopRatedMovies = async (page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        page
      }
    })

    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    }
  } catch (error) {
    console.error('Error fetching top rated movies:', error)
    throw error
  }
}

/**
 * Get now playing movies (Currently in theaters!)
 * @param {number} page - Page number
 * @returns {Promise} - Now playing movies
 */
export const getNowPlayingMovies = async (page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      params: {
        api_key: TMDB_API_KEY,
        page
      }
    })

    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    }
  } catch (error) {
    console.error('Error fetching now playing movies:', error)
    throw error
  }
}

/**
 * Get upcoming movies
 * @param {number} page - Page number
 * @returns {Promise} - Upcoming movies
 */
export const getUpcomingMovies = async (page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: {
        api_key: TMDB_API_KEY,
        page
      }
    })

    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    }
  } catch (error) {
    console.error('Error fetching upcoming movies:', error)
    throw error
  }
}

/**
 * Search for movies
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise} - Movie search results
 */
export const searchMovies = async (query, page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    if (!query.trim()) {
      throw new Error('Please enter a search query')
    }

    const response = await api.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query.trim(),
        page,
        include_adult: false
      }
    })

    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    }
  } catch (error) {
    console.error('Error searching movies:', error)
    throw error
  }
}

/**
 * Get detailed information about a specific movie
 * @param {string} id - TMDb movie ID
 * @returns {Promise} - Movie details
 */
export const getMovieDetails = async (id) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,videos,similar,keywords'
      }
    })

    const movie = response.data

    // Format to include both TMDb and OMDB-like fields
    return {
      imdbID: movie.id?.toString(),
      Title: movie.title,
      Year: movie.release_date?.split('-')[0] || 'N/A',
      Rated: movie.adult ? 'R' : 'PG-13',
      Released: movie.release_date || 'N/A',
      Runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
      Genre: movie.genres?.map(g => g.name).join(', ') || 'N/A',
      Director: movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A',
      Writer: movie.credits?.crew?.filter(c => c.job === 'Screenplay' || c.job === 'Writer')
        .slice(0, 3).map(c => c.name).join(', ') || 'N/A',
      Actors: movie.credits?.cast?.slice(0, 5).map(a => a.name).join(', ') || 'N/A',
      Plot: movie.overview || 'N/A',
      Language: movie.original_language?.toUpperCase() || 'N/A',
      Country: movie.production_countries?.[0]?.name || 'N/A',
      Awards: `${movie.vote_count} votes`,
      Poster: getPosterUrl(movie.poster_path),
      Ratings: [
        {
          Source: 'TMDb',
          Value: `${movie.vote_average}/10`
        }
      ],
      imdbRating: movie.vote_average?.toFixed(1) || 'N/A',
      imdbVotes: movie.vote_count?.toLocaleString() || 'N/A',
      BoxOffice: movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A',
      Production: movie.production_companies?.[0]?.name || 'N/A',
      // TMDb specific
      tmdbId: movie.id,
      backdrop: getBackdropUrl(movie.backdrop_path),
      tagline: movie.tagline,
      homepage: movie.homepage,
      budget: movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A',
      videos: movie.videos?.results || [],
      similar: movie.similar?.results?.slice(0, 6).map(normalizeMovie) || [],
      cast: movie.credits?.cast?.slice(0, 10) || [],
      crew: movie.credits?.crew || [],
      keywords: movie.keywords?.keywords || []
    }
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}

/**
 * Get movie videos/trailers from TMDb
 * @param {string} movieId - TMDb movie ID
 * @returns {Promise} - YouTube video ID for trailer
 */
export const getMovieTrailer = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      console.warn('TMDb API key is not configured')
      return null
    }

    const response = await api.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
      params: {
        api_key: TMDB_API_KEY
      }
    })

    // Find official trailer
    const trailer = response.data.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube' && video.official
    ) || response.data.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    )

    return trailer?.key || null
  } catch (error) {
    console.error('Error fetching trailer:', error)
    return null
  }
}

/**
 * Get movies by genre
 * @param {number} genreId - Genre ID
 * @param {number} page - Page number
 * @returns {Promise} - Movies in genre
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    })

    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    }
  } catch (error) {
    console.error('Error fetching movies by genre:', error)
    throw error
  }
}

/**
 * Get movie genres list
 * @returns {Promise} - Array of genres
 */
export const getGenres = async () => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY
      }
    })

    return response.data.genres
  } catch (error) {
    console.error('Error fetching genres:', error)
    return []
  }
}

/**
 * Get movie recommendations
 * @param {string} movieId - TMDb movie ID
 * @returns {Promise} - Recommended movies
 */
export const getRecommendations = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    const response = await api.get(`${TMDB_BASE_URL}/movie/${movieId}/recommendations`, {
      params: {
        api_key: TMDB_API_KEY,
        page: 1
      }
    })

    return response.data.results.slice(0, 6).map(normalizeMovie)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    // Fallback to similar movies
    try {
      const response = await api.get(`${TMDB_BASE_URL}/movie/${movieId}/similar`, {
        params: {
          api_key: TMDB_API_KEY,
          page: 1
        }
      })
      return response.data.results.slice(0, 6).map(normalizeMovie)
    } catch (err) {
      return []
    }
  }
}

/**
 * Advanced search with filters
 * @param {Object} filters - Search filters
 * @returns {Promise} - Filtered movie results
 */
export const advancedSearch = async (filters) => {
  try {
    const { query, year, genre, sortBy = 'popularity.desc', page = 1 } = filters
    
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured')
    }

    // If there's a query, use search endpoint
    if (query && query.trim()) {
      const params = {
        api_key: TMDB_API_KEY,
        query: query.trim(),
        page,
        include_adult: false
      }

      if (year) params.year = year

      const response = await api.get(`${TMDB_BASE_URL}/search/movie`, { params })

      return {
        movies: response.data.results.map(normalizeMovie),
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    }

    // Otherwise use discover endpoint for filtering
    const params = {
      api_key: TMDB_API_KEY,
      page,
      sort_by: sortBy,
      include_adult: false
    }

    if (year) params.year = year
    if (genre) params.with_genres = genre

    const response = await api.get(`${TMDB_BASE_URL}/discover/movie`, { params })

    return {
      movies: response.data.results.map(normalizeMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
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
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getMoviesByGenre,
  getGenres,
  getMovieTrailer,
  getRecommendations,
  advancedSearch,
  getPosterUrl,
  getBackdropUrl
}
