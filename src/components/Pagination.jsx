import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'

const Pagination = ({ currentPage, totalPages, onPageChange, loading = false }) => {
  const { theme } = useThemeStore()

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if near the beginning
      if (currentPage <= 3) {
        startPage = 2
        endPage = 5
      }

      // Adjust if near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4
        endPage = totalPages - 1
      }

      // Add dots if needed
      if (startPage > 2) {
        pages.push('...')
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Add dots if needed
      if (endPage < totalPages - 1) {
        pages.push('...')
      }

      // Show last page
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageClick = (page) => {
    if (page === '...' || loading || page === currentPage) return
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFirst = () => {
    if (currentPage !== 1 && !loading) {
      onPageChange(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLast = () => {
    if (currentPage !== totalPages && !loading) {
      onPageChange(totalPages)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col items-center space-y-4 mt-12">
      {/* Page Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
      >
        Page <span className="font-semibold text-primary-500">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
      </motion.div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* First Page Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFirst}
          disabled={currentPage === 1 || loading}
          className={`p-2 rounded-lg transition-all ${
            currentPage === 1 || loading
              ? theme === 'light'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dark-800 text-gray-600 cursor-not-allowed'
              : theme === 'light'
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-dark-800 border border-dark-600 text-gray-300 hover:bg-dark-700'
          }`}
          aria-label="First page"
        >
          <FiChevronsLeft />
        </motion.button>

        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            currentPage === 1 || loading
              ? theme === 'light'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dark-800 text-gray-600 cursor-not-allowed'
              : theme === 'light'
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-dark-800 border border-dark-600 text-gray-300 hover:bg-dark-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FiChevronLeft />
            <span className="hidden sm:inline">Previous</span>
          </div>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className={`px-2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  ...
                </span>
              )
            }

            const isActive = page === currentPage

            return (
              <motion.button
                key={page}
                whileHover={!isActive ? { scale: 1.1 } : {}}
                whileTap={!isActive ? { scale: 0.95 } : {}}
                onClick={() => handlePageClick(page)}
                disabled={loading}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                    : theme === 'light'
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-400'
                    : 'bg-dark-800 border border-dark-600 text-gray-300 hover:bg-dark-700 hover:border-primary-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {page}
              </motion.button>
            )
          })}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            currentPage === totalPages || loading
              ? theme === 'light'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dark-800 text-gray-600 cursor-not-allowed'
              : theme === 'light'
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-dark-800 border border-dark-600 text-gray-300 hover:bg-dark-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline">Next</span>
            <FiChevronRight />
          </div>
        </motion.button>

        {/* Last Page Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLast}
          disabled={currentPage === totalPages || loading}
          className={`p-2 rounded-lg transition-all ${
            currentPage === totalPages || loading
              ? theme === 'light'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dark-800 text-gray-600 cursor-not-allowed'
              : theme === 'light'
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-dark-800 border border-dark-600 text-gray-300 hover:bg-dark-700'
          }`}
          aria-label="Last page"
        >
          <FiChevronsRight />
        </motion.button>
      </div>

      {/* Jump to Page (Optional Enhancement) */}
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Jump to page:
        </span>
        <input
          type="number"
          min="1"
          max={totalPages}
          defaultValue={currentPage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages && page !== currentPage) {
                handlePageClick(page)
              }
            }
          }}
          className={`w-20 px-3 py-1.5 rounded-lg border text-center ${
            theme === 'light'
              ? 'bg-white border-gray-300 text-gray-900'
              : 'bg-dark-800 border-dark-600 text-white'
          } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
        />
      </div>
    </div>
  )
}

export default Pagination
