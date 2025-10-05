import { useThemeStore } from '../store/themeStore'

const SkeletonCard = () => {
  const { theme } = useThemeStore()
  
  return (
    <div className={`rounded-xl overflow-hidden ${
      theme === 'light' ? 'bg-gray-100' : 'bg-dark-800'
    }`}>
      <div className={`aspect-[2/3] ${
        theme === 'light' ? 'skeleton-light' : 'skeleton'
      }`} />
      <div className="p-4 space-y-3">
        <div className={`h-4 rounded ${
          theme === 'light' ? 'skeleton-light' : 'skeleton'
        } w-3/4`} />
        <div className={`h-3 rounded ${
          theme === 'light' ? 'skeleton-light' : 'skeleton'
        } w-1/2`} />
      </div>
    </div>
  )
}

const LoadingSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

export default LoadingSkeleton
