import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from './store/themeStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import Watchlist from './pages/Watchlist'
import SearchResults from './pages/SearchResults'

function App() {
  const { theme } = useThemeStore()
  const location = useLocation()

  return (
    <div className={theme === 'light' ? 'light' : ''}>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/watchlist" element={<Watchlist />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: theme === 'light' ? '#ffffff' : '#1e293b',
              color: theme === 'light' ? '#0f172a' : '#ffffff',
              border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Footer />
      </div>
    </div>
  )
}

export default App
