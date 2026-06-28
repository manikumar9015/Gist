import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, BookOpen, User, Sun, Moon, Coffee, Search, Compass, Shield, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, cycleTheme: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use try/catch or conditional for useSearchParams since Navbar might be outside Routes if not careful, 
  // but in our App.jsx Navbar is inside Router so it's safe.
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ query: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon size={20} />;
      case 'sepia': return <Coffee size={20} />;
      default: return <Sun size={20} />;
    }
  };

  const isExplore = location.pathname === '/explore';

  return (
    <nav className="glass sticky top-0 z-50 w-full">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Left Side: Logo & Search Bar */}
          <div className="flex items-center gap-6 flex-1 justify-start">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-outfit font-bold text-xl text-primary-600 dark:text-primary-400">
                Gist
              </span>
            </Link>

            {/* Animated Search Bar for Explore Page */}
            <AnimatePresence>
              {isExplore && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onSubmit={handleSearchSubmit}
                  className="hidden md:flex relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-surface-400" size={16} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-1.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full outline-none text-sm transition-all"
                    placeholder="Search library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Middle: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 justify-center flex-1">
            <Link to="/" className="flex items-center gap-1.5 font-medium hover:text-primary-600 transition-colors">
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link to="/explore" className="flex items-center gap-1.5 font-medium hover:text-primary-600 transition-colors">
              <Compass size={18} />
              <span>Explore</span>
            </Link>

            {user && (
              <>
                <Link to="/library" className="flex items-center gap-1.5 font-medium hover:text-primary-600 transition-colors">
                  <BookOpen size={18} />
                  <span>My Library</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity">
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side: Theme Toggle & User Auth/Profile */}
          <div className="hidden md:flex items-center gap-5 flex-1 justify-end">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {getThemeIcon()}
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 font-medium hover:text-primary-600 transition-colors">
                  <User size={20} />
                  <span className="font-semibold">{user.username ? (user.username.includes('@') ? user.username.split('@')[0] : user.username) : 'Reader'}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-danger"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="font-medium hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
