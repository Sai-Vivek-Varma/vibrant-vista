
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold font-serif text-primary">Vibrant<span className="text-secondary">Vista</span></h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/categories" className="nav-link">Categories</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Search size={20} />
              </Link>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
              <Link to="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors duration-200">
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
        <button className="md:hidden text-foreground" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-white">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Home</Link>
            <Link to="/categories" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Categories</Link>
            <Link to="/about" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>About</Link>
            <Link to="/contact" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Contact</Link>
            <Link to="/search" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Search</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Dashboard</Link>
                <Link to="/profile" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Profile</Link>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 text-foreground hover:text-primary" onClick={toggleMenu}>Log In</Link>
                <Link to="/signup" className="w-full mt-2" onClick={toggleMenu}>
                  <Button variant="default" size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
