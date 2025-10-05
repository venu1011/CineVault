import { motion } from 'framer-motion'
import { FiSearch, FiFilm, FiAlertCircle } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { useNavigate } from 'react-router-dom'

const EmptyState = ({ type = 'search', message, suggestions = [] }) => {
  const { theme } = useThemeStore()
  const navigate = useNavigate()

  const configs = {
    search: {
      icon: FiSearch,
      title: 'No Results Found',
      description: message || 'We couldn\'t find any movies matching your search.',
      iconColor: 'text-blue-500',
      bgGradient: 'from-blue-500/10 to-purple-500/10'
    },
    watchlist: {
      icon: FiFilm,
      title: 'Your Watchlist is Empty',
      description: message || 'Start adding movies you want to watch!',
      iconColor: 'text-purple-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      action: {
        label: 'Explore Movies',
        onClick: () => navigate('/')
      }
    },
    error: {
      icon: FiAlertCircle,
      title: 'Something Went Wrong',
      description: message || 'We encountered an error. Please try again.',
      iconColor: 'text-red-500',
      bgGradient: 'from-red-500/10 to-orange-500/10'
    }
  }

  const config = configs[type] || configs.search
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Icon with Gradient Background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className={`relative mb-6`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-full blur-2xl opacity-50`} />
        <div className={`relative p-6 rounded-full ${
          theme === 'light' 
            ? 'bg-white border-2 border-gray-200' 
            : 'bg-dark-800 border-2 border-dark-600'
        }`}>
          <Icon className={`w-16 h-16 ${config.iconColor}`} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-2xl font-bold mb-3 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}
      >
        {config.title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`text-center max-w-md mb-6 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}
      >
        {config.description}
      </motion.p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`w-full max-w-md p-6 rounded-2xl ${
            theme === 'light' 
              ? 'bg-gray-50 border border-gray-200' 
              : 'bg-dark-800/50 border border-dark-600'
          }`}
        >
          <h3 className={`text-sm font-semibold mb-3 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Try these suggestions:
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`flex items-center text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 mr-3" />
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action Button */}
      {config.action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={config.action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
        >
          {config.action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

export default EmptyState
