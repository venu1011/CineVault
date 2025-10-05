import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'

const Footer = () => {
  const { theme } = useThemeStore()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`border-t ${
      theme === 'light' ? 'border-gray-200 bg-white/80' : 'border-dark-700 bg-dark-900/80'
    } backdrop-blur-lg mt-16`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🎬</span>
              </div>
              <h3 className={`text-xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                CineVault
              </h3>
            </div>
            <p className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Your personal vault of cinematic treasures. Discover and track your favorite movies.
            </p>
            <p className={`text-xs ${
              theme === 'light' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              © {currentYear} CineVault. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  Search Movies
                </Link>
              </li>
              <li>
                <Link 
                  to="/watchlist" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  My Collection
                </Link>
              </li>
              <li>
                <Link 
                  to="/watchlist?tab=watched" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  Already Watched
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`text-sm hover:scale-105 inline-block transition-all ${
                    theme === 'light' ? 'text-gray-600 hover:text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social & TMDb */}
          <div className="space-y-4">
            <h4 className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Connect
            </h4>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  theme === 'light' 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                }`}
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  theme === 'light' 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                }`}
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  theme === 'light' 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                }`}
                aria-label="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
            </div>

            {/* TMDb Attribution */}
            <div className="pt-4 border-t border-gray-200 dark:border-dark-700">
              <a 
                href="https://www.themoviedb.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img 
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
                  alt="TMDb Logo" 
                  className="h-8"
                />
              </a>
              <p className={`text-xs mt-2 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                This product uses the TMDb API but is not endorsed or certified by TMDb.
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
