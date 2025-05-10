
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`sticky top-0 w-full transition-all duration-300 z-40 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md shadow-soft' : 'bg-background'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Home">
          <h1 className="text-2xl font-bold font-serif heading-gradient">Vibrant<span className="text-secondary">Vista</span></h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'text-primary after:w-full' : ''}`}>Home</Link>
          <Link to="/categories" className={`nav-link ${location.pathname.includes('/categories') ? 'text-primary after:w-full' : ''}`}>Categories</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'text-primary after:w-full' : ''}`}>About</Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'text-primary after:w-full' : ''}`}>Contact</Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <>
              <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors duration-200" aria-label="Search">
                <Search size={20} />
              </Link>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
              <Link to="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors duration-200" aria-label="Search">
                <Search size={20} />
              </Link>
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Log In
              </Link>
              <Link to="/signup">
                <Button variant="default" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          
          <button 
            className="text-foreground p-2 rounded-md hover:bg-accent transition-colors" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden px-4 py-2 pb-4 bg-background border-t border-border"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <nav className="flex flex-col space-y-4">
            <Link to="/" className={`py-2 ${location.pathname === '/' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>Home</Link>
            <Link to="/categories" className={`py-2 ${location.pathname.includes('/categories') ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>Categories</Link>
            <Link to="/about" className={`py-2 ${location.pathname === '/about' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>About</Link>
            <Link to="/contact" className={`py-2 ${location.pathname === '/contact' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>Contact</Link>
            <Link to="/search" className={`py-2 ${location.pathname === '/search' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>Search</Link>
            {user ? (
              <>
                <div className="border-t border-border my-2"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="secondary" size="sm" className="ml-2">Author</Badge>
                </div>
                <Link to="/dashboard" className={`py-2 ${location.pathname === '/dashboard' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>Dashboard</Link>
                <Link to="/profile" className={`py-2 ${location.pathname === '/profile' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}>Profile</Link>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <div className="border-t border-border my-2"></div>
                <Link to="/login" className="py-2 text-foreground hover:text-primary transition-colors">Log In</Link>
                <Link to="/signup" className="w-full mt-2">
                  <Button variant="default" size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
