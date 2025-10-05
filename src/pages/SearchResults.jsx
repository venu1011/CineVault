import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch } from 'react-icons/fi'
import MovieCard from '../components/MovieCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import FilterPanel from '../components/FilterPanel'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { searchMovies } from '../utils/api-tmdb-proxy'
import { useThemeStore } from '../store/themeStore'
import { debounce } from '../utils/helpers'
import toast from 'react-hot-toast'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    query: initialQuery,
    year: '',
    genre: '',
    sortBy: ''
  })
  
  const { theme } = useThemeStore()

  useEffect(() => {
    if (initialQuery) {
      setFilters(prev => ({ ...prev, query: initialQuery }))
      performSearch({ ...filters, query: initialQuery }, 1)
    }
  }, [initialQuery])

  const performSearch = async (currentFilters, currentPage = 1) => {
    if (!currentFilters.query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await searchMovies(
        currentFilters.query, 
        currentPage,
        {
          year: currentFilters.year,
          genre: currentFilters.genre,
          sortBy: currentFilters.sortBy
        }
      )

      setMovies(result.results || [])
      setTotalResults(result.total_results || 0)
      setTotalPages(result.total_pages || 0)
      setPage(currentPage)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Search failed. Please try again.')
      toast.error(err.message || 'Search failed. Please try again.')
      if (currentPage === 1) {
        setMovies([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((newFilters) => {
      performSearch(newFilters, 1)
    }, 500),
    []
  )

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    debouncedSearch(newFilters)
  }

  const handleLoadMore = () => {
    performSearch(filters, page + 1)
  }

  const handlePageChange = (newPage) => {
    performSearch(filters, newPage)
  }

  const handleReset = () => {
    const resetFilters = { query: filters.query, year: '', genre: '', sortBy: '' }
    setFilters(resetFilters)
    performSearch(resetFilters, 1)
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-4xl font-bold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          Search Results
        </h1>
        {totalResults > 0 && (
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Found {totalResults.toLocaleString()} results for "{filters.query}"
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading && page === 1 ? (
            <LoadingSkeleton count={12} />
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {movies.map((movie, index) => (
                  <MovieCard key={movie.id || `movie-${index}`} movie={movie} index={index} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={Math.min(totalPages, 500)} // TMDb limits to 500 pages
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          ) : error ? (
            <EmptyState
              type="error"
              message={error}
              suggestions={[
                'Check your internet connection',
                'Try a different search term',
                'Clear your filters and try again'
              ]}
            />
          ) : filters.query ? (
            <EmptyState
              type="search"
              message={`No movies found for "${filters.query}"`}
              suggestions={[
                'Try different keywords or spelling',
                'Remove some filters to broaden your search',
                'Search for a different movie title',
                'Try searching for actors or directors'
              ]}
            />
          ) : (
            <EmptyState
              type="search"
              message="Enter a search term to find movies"
              suggestions={[
                'Try popular movies like "Inception" or "Avatar"',
                'Search by genre, actor, or director',
                'Use filters to refine your results'
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResults
