/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Format runtime from minutes to hours and minutes
 * @param {string} runtime - Runtime string (e.g., "148 min")
 * @returns {string} - Formatted runtime
 */
export const formatRuntime = (runtime) => {
  if (!runtime || runtime === 'N/A') return 'N/A'
  
  const minutes = parseInt(runtime)
  if (isNaN(minutes)) return runtime
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Format large numbers with commas
 * @param {string|number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (!num || num === 'N/A') return 'N/A'
  
  const number = typeof num === 'string' ? parseInt(num.replace(/[^0-9]/g, '')) : num
  if (isNaN(number)) return num
  
  return number.toLocaleString()
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Get year range for filters
 * @returns {Array} - Array of years
 */
export const getYearRange = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year)
  }
  return years
}

/**
 * Validate IMDB rating
 * @param {string} rating - IMDB rating
 * @returns {boolean} - Is valid rating
 */
export const isValidRating = (rating) => {
  if (!rating || rating === 'N/A') return false
  const num = parseFloat(rating)
  return !isNaN(num) && num >= 0 && num <= 10
}

/**
 * Get rating color based on score
 * @param {string|number} rating - Rating score
 * @returns {string} - Tailwind color class
 */
export const getRatingColor = (rating) => {
  const score = typeof rating === 'string' ? parseFloat(rating) : rating
  if (isNaN(score)) return 'text-gray-400'
  
  if (score >= 8) return 'text-green-500'
  if (score >= 6) return 'text-yellow-500'
  if (score >= 4) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * Share using Web Share API
 * @param {Object} data - Share data
 * @returns {Promise<boolean>} - Success status
 */
export const shareContent = async (data) => {
  try {
    if (navigator.share) {
      await navigator.share(data)
      return true
    }
    return false
  } catch (error) {
    console.error('Error sharing:', error)
    return false
  }
}

/**
 * Check if image URL is valid
 * @param {string} url - Image URL
 * @returns {Promise<boolean>} - Is valid
 */
export const isValidImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url || url === 'N/A') {
      resolve(false)
      return
    }
    
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

export default {
  debounce,
  formatRuntime,
  formatNumber,
  truncateText,
  getYearRange,
  isValidRating,
  getRatingColor,
  generateId,
  copyToClipboard,
  shareContent,
  isValidImageUrl
}
