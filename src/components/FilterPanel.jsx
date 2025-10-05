import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiX } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { getYearRange } from '../utils/helpers'

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useThemeStore()
  const years = getYearRange()

  // TMDb Genre IDs
  const genres = [
    { id: '', name: 'All Genres' },
    { id: '28', name: 'Action' },
    { id: '12', name: 'Adventure' },
    { id: '16', name: 'Animation' },
    { id: '35', name: 'Comedy' },
    { id: '80', name: 'Crime' },
    { id: '18', name: 'Drama' },
    { id: '14', name: 'Fantasy' },
    { id: '27', name: 'Horror' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Sci-Fi' },
    { id: '53', name: 'Thriller' },
  ]

  // Sort options for TMDb
  const sortOptions = [
    { value: '', label: 'Relevance' },
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
  ]

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            theme === 'light'
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              : 'bg-dark-800 hover:bg-dark-700 text-white'
          } transition-colors`}
        >
          <FiFilter />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`lg:sticky lg:top-24 ${
              isOpen ? 'fixed inset-0 z-50 lg:relative' : 'hidden lg:block'
            }`}
          >
            <div
              className={`${
                isOpen ? 'fixed inset-0 bg-black/50 lg:hidden' : ''
              }`}
              onClick={() => setIsOpen(false)}
            />

            <div
              className={`${
                isOpen
                  ? 'fixed left-0 top-0 bottom-0 w-80 lg:relative lg:w-full'
                  : ''
              } ${
                theme === 'light'
                  ? 'bg-white lg:bg-transparent'
                  : 'bg-dark-900 lg:bg-transparent'
              } p-6 overflow-y-auto custom-scrollbar`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Filters
                </h3>
                {isOpen && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2"
                    aria-label="Close filters"
                  >
                    <FiX className="text-xl" />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Year Filter */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Release Year
                  </label>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-dark-800 border-dark-700 text-white'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    <option value="">All Years</option>
                    {years.slice(0, 50).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genre Filters - Updated for TMDb */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Genre
                  </label>
                  <select
                    value={filters.genre || ''}
                    onChange={(e) => onFilterChange({ ...filters, genre: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-dark-800 border-dark-700 text-white'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy || ''}
                    onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-dark-800 border-dark-700 text-white'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    onReset()
                    setIsOpen(false)
                  }}
                  className={`w-full py-2 rounded-lg border-2 font-semibold transition-colors ${
                    theme === 'light'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      : 'border-dark-700 text-gray-300 hover:bg-dark-800'
                  }`}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FilterPanel
