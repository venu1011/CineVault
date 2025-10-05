import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

console.log('🔑 TMDb API Key Status:', TMDB_API_KEY ? '✅ Loaded' : '❌ Missing');

// Create axios instance with proper headers
const tmdbClient = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Try direct API first, then fallback to proxies
const fetchFromTMDb = async (endpoint) => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDb API key is missing. Please check your environment variables.');
  }

  const fullUrl = `${TMDB_BASE}${endpoint}`;
  
  // Strategy 1: Try direct TMDb API (works on most mobile browsers now)
  try {
    console.log(`🚀 Trying direct API: ${endpoint}`);
    const response = await tmdbClient.get(fullUrl);
    console.log('✅ Direct API success!');
    return response.data;
  } catch (directError) {
    console.warn('⚠️ Direct API failed, trying proxies...', directError.message);
    
    // Strategy 2: Try CORS proxies as fallback
    const PROXIES = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    for (let i = 0; i < PROXIES.length; i++) {
      try {
        const proxyUrl = `${PROXIES[i]}${encodeURIComponent(fullUrl)}`;
        console.log(`🔄 Trying proxy ${i + 1}/${PROXIES.length}`);
        const response = await tmdbClient.get(proxyUrl);
        console.log(`✅ Proxy ${i + 1} success!`);
        return response.data;
      } catch (proxyError) {
        console.warn(`❌ Proxy ${i + 1} failed:`, proxyError.message);
        if (i === PROXIES.length - 1) {
          throw new Error('Unable to connect to movie database. Please check your internet connection.');
        }
      }
    }
  }
};

/**
 * Get trending movies
 */
export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    if (!['day', 'week'].includes(timeWindow)) {
      throw new Error('Invalid time window. Use "day" or "week".');
    }
    
    console.log(`📈 Fetching trending movies (${timeWindow})`);
    const endpoint = `/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Trending movies loaded:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching trending movies:', error);
    throw error;
  }
};

/**
 * Get popular movies
 */
export const getPopularMovies = async (page = 1) => {
  try {
    console.log(`🌟 Fetching popular movies (page ${page})`);
    const endpoint = `/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Popular movies loaded:', data.results?.length);
    return {
      results: data.results || [],
      total_pages: data.total_pages || 0,
      total_results: data.total_results || 0
    };
  } catch (error) {
    console.error('❌ Error fetching popular movies:', error);
    throw error;
  }
};

/**
 * Get top rated movies
 */
export const getTopRatedMovies = async (page = 1) => {
  try {
    console.log(`⭐ Fetching top rated movies (page ${page})`);
    const endpoint = `/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Top rated movies loaded:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching top rated movies:', error);
    throw error;
  }
};

/**
 * Get now playing movies
 */
export const getNowPlayingMovies = async (page = 1) => {
  try {
    console.log(`🎬 Fetching now playing movies (page ${page})`);
    const endpoint = `/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Now playing movies loaded:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching now playing movies:', error);
    throw error;
  }
};

/**
 * Get upcoming movies
 */
export const getUpcomingMovies = async (page = 1) => {
  try {
    console.log(`🔜 Fetching upcoming movies (page ${page})`);
    const endpoint = `/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Upcoming movies loaded:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching upcoming movies:', error);
    throw error;
  }
};

/**
 * Search for movies
 */
export const searchMovies = async (query, page = 1, filters = {}) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`🔍 Searching movies: "${query}" (page ${page})`, filters);
    
    let endpoint = `/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`;
    
    if (filters.year) {
      endpoint += `&year=${filters.year}`;
    }
    
    if (filters.genre) {
      endpoint += `&with_genres=${filters.genre}`;
    }
    
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Search results:', data.results?.length);
    return {
      results: data.results || [],
      total_pages: data.total_pages || 0,
      total_results: data.total_results || 0
    };
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
};

/**
 * Get movie details by ID
 */
export const getMovieDetails = async (movieId) => {
  try {
    console.log(`🎥 Fetching movie details: ${movieId}`);
    const endpoint = `/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,recommendations,watch/providers`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Movie details loaded:', data.title);
    return data;
  } catch (error) {
    console.error('❌ Error fetching movie details:', error);
    throw error;
  }
};

/**
 * Get movie genres
 */
export const getGenres = async () => {
  try {
    console.log('🎭 Fetching genres');
    const endpoint = `/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Genres loaded:', data.genres?.length);
    return data.genres || [];
  } catch (error) {
    console.error('❌ Error fetching genres:', error);
    throw error;
  }
};

/**
 * Discover movies with filters
 */
export const discoverMovies = async (filters = {}, page = 1) => {
  try {
    console.log('🔎 Discovering movies with filters:', filters);
    
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      sort_by: filters.sort_by || 'popularity.desc',
      page: page,
      include_adult: false,
      include_video: false,
    });
    
    if (filters.with_genres) params.append('with_genres', filters.with_genres);
    if (filters['vote_average.gte']) params.append('vote_average.gte', filters['vote_average.gte']);
    if (filters['vote_count.gte']) params.append('vote_count.gte', filters['vote_count.gte']);
    if (filters.primary_release_year) params.append('primary_release_year', filters.primary_release_year);
    if (filters['primary_release_date.gte']) params.append('primary_release_date.gte', filters['primary_release_date.gte']);
    if (filters.with_cast) params.append('with_cast', filters.with_cast);
    if (filters.with_crew) params.append('with_crew', filters.with_crew);
    
    const endpoint = `/discover/movie?${params.toString()}`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Discovery results:', data.results?.length);
    return {
      results: data.results || [],
      total_pages: data.total_pages || 0,
      total_results: data.total_results || 0
    };
  } catch (error) {
    console.error('❌ Error discovering movies:', error);
    throw error;
  }
};

/**
 * Get movie videos/trailers
 */
export const getMovieVideos = async (movieId) => {
  try {
    console.log(`🎬 Fetching videos for movie: ${movieId}`);
    const endpoint = `/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
    const data = await fetchFromTMDb(endpoint);
    
    console.log('✅ Videos loaded:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    return [];
  }
};

/**
 * Helper functions for image URLs
 */
export const getProfileUrl = (path, size = 'w185') => {
  if (!path) return 'https://via.placeholder.com/185x278/1e293b/f43f5e?text=No+Photo';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getPosterUrl = (path, size = 'w342') => {
  if (!path) return 'https://via.placeholder.com/342x513/1e293b/f43f5e?text=No+Poster';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return 'https://via.placeholder.com/1280x720/1e293b/f43f5e?text=No+Backdrop';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Export all functions
export default {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieDetails,
  getGenres,
  discoverMovies,
  getMovieVideos,
  getProfileUrl,
  getPosterUrl,
  getBackdropUrl,
};
