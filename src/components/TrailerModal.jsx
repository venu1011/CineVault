import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'

const TrailerModal = ({ isOpen, onClose, videoKey, title }) => {
  const { theme } = useThemeStore()

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!videoKey) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-5xl ${
                theme === 'light' 
                  ? 'bg-white' 
                  : 'bg-dark-900'
              } rounded-2xl shadow-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                theme === 'light' 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-dark-700 bg-dark-800'
              }`}>
                <h3 className={`text-lg font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {title || 'Movie Trailer'}
                </h3>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-all ${
                    theme === 'light'
                      ? 'hover:bg-gray-200 text-gray-600'
                      : 'hover:bg-dark-700 text-gray-400'
                  }`}
                  aria-label="Close trailer"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* YouTube Video */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
                  title={title || 'Movie Trailer'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Footer Hint */}
              <div className={`p-3 text-center text-sm ${
                theme === 'light' ? 'text-gray-500 bg-gray-50' : 'text-gray-400 bg-dark-800'
              }`}>
                Press <kbd className="px-2 py-1 rounded bg-gradient-to-br from-primary-500 to-purple-500 text-white text-xs font-semibold">ESC</kbd> to close
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TrailerModal
