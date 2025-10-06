/**
 * AI-Powered Recommendation Engine
 * Analyzes user preferences and generates personalized movie recommendations
 */

// TMDb Genre ID Mapping
export const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
}

/**
 * Analyze user's genre preferences from watchlist
 * @param {Array} watchlist - User's watchlist movies
 * @returns {Object} Genre affinity data
 */
export const analyzeGenreAffinity = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    return { topGenres: [], genreDistribution: {}, totalMovies: 0 }
  }

  const genreCounts = {}
  let totalGenres = 0

  // Count genre occurrences
  watchlist.forEach(movie => {
    const genres = movie.genre_ids || movie.genres?.map(g => g.id) || []
    genres.forEach(genreId => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1
      totalGenres++
    })
  })

  // Calculate percentages and sort
  const genreDistribution = Object.entries(genreCounts)
    .map(([id, count]) => ({
      id: parseInt(id),
      name: GENRE_MAP[id] || 'Unknown',
      count,
      percentage: Math.round((count / totalGenres) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  return {
    topGenres: genreDistribution.slice(0, 3), // Top 3 genres
    genreDistribution,
    totalMovies: watchlist.length
  }
}

/**
 * Analyze rating patterns
 * @param {Array} watchlist - User's watchlist
 * @returns {Object} Rating analysis
 */
export const analyzeRatingPreference = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    return { averageRating: 0, preferHighRated: false }
  }

  const ratings = watchlist
    .map(m => m.vote_average || parseFloat(m.imdbRating) || 0)
    .filter(r => r > 0)

  if (ratings.length === 0) {
    return { averageRating: 0, preferHighRated: false }
  }

  const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length

  return {
    averageRating: averageRating.toFixed(1),
    preferHighRated: averageRating >= 7.0,
    minRating: Math.min(...ratings),
    maxRating: Math.max(...ratings)
  }
}

/**
 * Analyze release year preferences
 * @param {Array} watchlist - User's watchlist
 * @returns {Object} Year preference data
 */
export const analyzeYearPreference = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    return { averageYear: new Date().getFullYear(), preferRecent: true }
  }

  const years = watchlist
    .map(m => {
      if (m.release_date) return new Date(m.release_date).getFullYear()
      if (m.Year) return parseInt(m.Year)
      return null
    })
    .filter(y => y && !isNaN(y))

  if (years.length === 0) {
    return { averageYear: new Date().getFullYear(), preferRecent: true }
  }

  const averageYear = Math.round(years.reduce((sum, y) => sum + y, 0) / years.length)
  const currentYear = new Date().getFullYear()

  return {
    averageYear,
    preferRecent: averageYear >= currentYear - 5,
    oldestYear: Math.min(...years),
    newestYear: Math.max(...years)
  }
}

/**
 * Get personalized movie recommendations
 * @param {Array} watchlist - User's watchlist
 * @param {Array} favorites - User's favorites
 * @param {Function} discoverMovies - TMDb discover function
 * @param {Boolean} forceRefresh - Force new random recommendations
 * @returns {Promise<Array>} Recommended movies
 */
export const getPersonalizedRecommendations = async (watchlist, favorites, discoverMovies, forceRefresh = false) => {
  // Need at least 3 movies to generate good recommendations
  if (!watchlist || watchlist.length < 3) {
    return { recommendations: [], reason: 'not-enough-data' }
  }

  try {
    // Analyze user preferences
    const { topGenres } = analyzeGenreAffinity(watchlist)
    const { averageRating, preferHighRated } = analyzeRatingPreference(watchlist)
    const { preferRecent, averageYear } = analyzeYearPreference(watchlist)

    if (topGenres.length === 0) {
      return { recommendations: [], reason: 'no-genre-data' }
    }

    // Build recommendation parameters
    const primaryGenre = topGenres[0].id
    const secondaryGenre = topGenres[1]?.id

    // Add randomization for force refresh
    const randomPage = forceRefresh ? Math.floor(Math.random() * 5) + 1 : 1
    const sortOptions = ['vote_average.desc', 'popularity.desc', 'release_date.desc']
    const randomSort = forceRefresh ? sortOptions[Math.floor(Math.random() * sortOptions.length)] : 'vote_average.desc'

    // Discover movies based on preferences
    const params = {
      with_genres: secondaryGenre ? `${primaryGenre},${secondaryGenre}` : primaryGenre,
      sort_by: randomSort,
      page: randomPage,
      'vote_count.gte': 100, // Ensure quality movies
      'vote_average.gte': preferHighRated ? 7.0 : 6.0,
    }

    console.log('🎲 Refresh params:', { randomPage, randomSort, forceRefresh })

    // Add year preference
    if (preferRecent) {
      params.primary_release_year = new Date().getFullYear()
    } else if (averageYear) {
      params['primary_release_date.gte'] = `${averageYear - 5}-01-01`
    }

    console.log('🔍 Fetching recommendations with params:', params)
    const response = await discoverMovies(params)
    
    // Extract results array from response
    const recommendations = response.results || response || []
    console.log('📊 Got recommendations:', recommendations.length)

    // Filter out already watched movies
    const watchedIds = new Set([
      ...watchlist.map(m => m.id || m.imdbID),
      ...favorites.map(m => m.id || m.imdbID)
    ])

    const filtered = recommendations.filter(movie => !watchedIds.has(movie.id))
    console.log('✨ Filtered recommendations:', filtered.length)

    return {
      recommendations: filtered.slice(0, 8),
      reason: 'success',
      basedOn: {
        topGenre: topGenres[0].name,
        secondaryGenre: topGenres[1]?.name,
        preferredRating: averageRating,
        preferRecent
      }
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return { recommendations: [], reason: 'error', error: error.message }
  }
}

/**
 * Get user taste profile summary
 * @param {Array} watchlist - User's watchlist
 * @param {Array} favorites - User's favorites
 * @returns {Object} User profile
 */
export const getUserTasteProfile = (watchlist, favorites) => {
  const genreAffinity = analyzeGenreAffinity(watchlist)
  const ratingPreference = analyzeRatingPreference(watchlist)
  const yearPreference = analyzeYearPreference(watchlist)

  return {
    totalMovies: watchlist.length,
    totalFavorites: favorites.length,
    genreAffinity,
    ratingPreference,
    yearPreference,
    hasEnoughData: watchlist.length >= 3
  }
}

/**
 * Generate explanation for recommendations
 * @param {Object} basedOn - Recommendation basis
 * @returns {String} Human-readable explanation
 */
export const getRecommendationExplanation = (basedOn) => {
  if (!basedOn) return "Recommended for you"

  const parts = []
  
  if (basedOn.topGenre) {
    parts.push(`you love ${basedOn.topGenre}`)
  }
  
  if (basedOn.secondaryGenre) {
    parts.push(`${basedOn.secondaryGenre} movies`)
  }

  if (basedOn.preferRecent) {
    parts.push("recent releases")
  }

  if (parts.length === 0) return "Based on your watchlist"

  return `Because ${parts.join(' and ')}`
}
