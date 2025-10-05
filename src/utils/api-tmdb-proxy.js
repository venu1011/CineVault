import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Use FAST CORS proxy that works!
const PROXY_URL = 'https://api.codetabs.com/v1/proxy?quest=';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  timeout: 8000 // 8 seconds - faster!
});

console.log('🔑 TMDb API Key Status:', TMDB_API_KEY ? '✅ Loaded' : '❌ Missing');

// Fast fetch through single reliable proxy
const fetchFromTMDb = async (endpoint) => {
  try {
    const fullUrl = `${TMDB_BASE}${endpoint}`;
    const proxyUrl = `${PROXY_URL}${encodeURIComponent(fullUrl)}`;
    
    console.log(`🚀 Fetching: ${endpoint}`);
    const response = await tmdbClient.get(proxyUrl);
    console.log('✅ Data loaded!');
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw new Error('Failed to fetch data. Please check your connection.');
  }
};

/**
 * Get trending movies
 */
export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured. Please add VITE_TMDB_API_KEY to your .env file');
    }
    
    console.log(`🔥 Fetching trending movies: ${timeWindow}`);
    const data = await fetchFromTMDb(`/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`);
    
    console.log('✅ Trending movies fetched:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching trending movies:', error.message);
    throw error;
  }
};

/**
 * Get now playing movies
 */
export const getNowPlayingMovies = async () => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log('🎬 Fetching now playing movies');
    const data = await fetchFromTMDb(`/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    
    console.log('✅ Now playing movies fetched:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching now playing:', error.message);
    throw error;
  }
};

/**
 * Get popular movies
 */
export const getPopularMovies = async () => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log('⭐ Fetching popular movies');
    const data = await fetchFromTMDb(`/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    
    console.log('✅ Popular movies fetched:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching popular movies:', error.message);
    throw error;
  }
};

/**
 * Get upcoming movies
 */
export const getUpcomingMovies = async () => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log('📅 Fetching upcoming movies');
    const data = await fetchFromTMDb(`/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    
    console.log('✅ Upcoming movies fetched:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching upcoming movies:', error.message);
    throw error;
  }
};

/**
 * Get top rated movies of all time
 */
export const getTopRatedMovies = async (page = 1) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log('🏆 Fetching top rated movies');
    const data = await fetchFromTMDb(`/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
    
    console.log('✅ Top rated movies fetched:', data.results?.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching top rated movies:', error.message);
    throw error;
  }
};

/**
 * Search movies with advanced filters
 */
export const searchMovies = async (query, page = 1, filters = {}) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`🔍 Searching movies: "${query}" (page ${page})`, filters);
    
    let endpoint = `/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`;
    
    // Add year filter
    if (filters.year) {
      endpoint += `&year=${filters.year}`;
    }
    
    // Add genre filter (use discover endpoint for better genre filtering)
    if (filters.genre && !filters.year) {
      // If only genre, use discover for better results
      endpoint = `/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=${page}&with_genres=${filters.genre}&query=${encodeURIComponent(query)}`;
    } else if (filters.genre) {
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
    console.error('❌ Error searching movies:', error.message);
    throw error;
  }
};

/**
 * Get movie details
 */
export const getMovieDetails = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`🎬 Fetching movie details: ${movieId}`);
    // Use append_to_response to get everything in ONE API call!
    const data = await fetchFromTMDb(`/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=videos,credits,similar,recommendations,watch/providers`);
    
    console.log('✅ Movie details fetched with all data');
    return data;
  } catch (error) {
    console.error('❌ Error fetching movie details:', error.message);
    throw error;
  }
};

/**
 * Get movie videos (trailers)
 */
export const getMovieVideos = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`🎥 Fetching movie videos: ${movieId}`);
    const data = await fetchFromTMDb(`/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
    
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching videos:', error.message);
    return [];
  }
};

/**
 * Get movie trailer (YouTube key)
 */
export const getMovieTrailer = async (movieId) => {
  try {
    const videos = await getMovieVideos(movieId);
    
    // Find official trailer
    const trailer = videos.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    return trailer || videos[0] || null;
  } catch (error) {
    console.error('❌ Error fetching trailer:', error.message);
    return null;
  }
};

/**
 * Get movie credits (cast and crew)
 */
export const getMovieCredits = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`👥 Fetching movie credits: ${movieId}`);
    const data = await fetchFromTMDb(`/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`);
    
    return {
      cast: data.cast || [],
      crew: data.crew || []
    };
  } catch (error) {
    console.error('❌ Error fetching credits:', error.message);
    return { cast: [], crew: [] };
  }
};

/**
 * Get similar movies
 */
export const getSimilarMovies = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`🎯 Fetching similar movies: ${movieId}`);
    const data = await fetchFromTMDb(`/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching similar movies:', error.message);
    return [];
  }
};

/**
 * Get movie recommendations
 */
export const getRecommendations = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`💡 Fetching recommendations: ${movieId}`);
    const data = await fetchFromTMDb(`/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    
    return data.results || [];
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error.message);
    return [];
  }
};

/**
 * Get watch providers (streaming services)
 */
export const getWatchProviders = async (movieId) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }
    
    console.log(`📺 Fetching watch providers: ${movieId}`);
    const data = await fetchFromTMDb(`/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`);
    
    return data.results || {};
  } catch (error) {
    console.error('❌ Error fetching watch providers:', error.message);
    return {};
  }
};

/**
 * Get profile image URL from TMDb (DIRECT - No proxy needed for images!)
 */
export const getProfileUrl = (path, size = 'w185') => {
  if (!path) return 'https://via.placeholder.com/185x278/1e293b/f43f5e?text=No+Photo';
  // Images are NOT blocked - access directly for speed!
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Get poster image URL from TMDb (DIRECT - No proxy needed!)
 */
export const getPosterUrl = (path, size = 'w342') => {
  if (!path) return 'https://via.placeholder.com/342x513/1e293b/f43f5e?text=No+Poster';
  // Images are NOT blocked - access directly for speed!
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Get backdrop image URL from TMDb (DIRECT - No proxy needed!)
 */
export const getBackdropUrl = (path, size = 'w780') => {
  if (!path) return 'https://via.placeholder.com/780x439/1e293b/f43f5e?text=No+Backdrop';
  // Images are NOT blocked - access directly for speed!
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Discover movies with advanced filtering
 * Used for AI recommendations
 */
export const discoverMovies = async (filters = {}) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDb API key is not configured');
    }

    // Build query parameters
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      sort_by: filters.sort_by || 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
      page: filters.page || '1'
    });

    // Add optional filters
    if (filters.with_genres) params.append('with_genres', filters.with_genres);
    if (filters['vote_average.gte']) params.append('vote_average.gte', filters['vote_average.gte']);
    if (filters['vote_count.gte']) params.append('vote_count.gte', filters['vote_count.gte']);
    if (filters.primary_release_year) params.append('primary_release_year', filters.primary_release_year);
    if (filters['primary_release_date.gte']) params.append('primary_release_date.gte', filters['primary_release_date.gte']);
    if (filters.with_cast) params.append('with_cast', filters.with_cast);
    if (filters.with_crew) params.append('with_crew', filters.with_crew);

    console.log('🔍 Discovering movies with filters:', filters);
    const data = await fetchFromTMDb(`/discover/movie?${params.toString()}`);
    
    console.log('✅ Discovered', data.results?.length, 'movies');
    return data.results || [];
  } catch (error) {
    console.error('❌ Error discovering movies:', error.message);
    return [];
  }
};

