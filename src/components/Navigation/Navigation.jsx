import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [isCakesActive, setIsCakesActive] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const cakesSection = document.getElementById('cakes');

      if (cakesSection) {
        const sectionPosition = cakesSection.offsetTop;
        const scrollPosition = window.pageYOffset;

        setIsCakesActive(scrollPosition >= sectionPosition - 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className="nav">
      <div className="nav_left">
        <Link to="/" className="logo_link">
          <div className="logo_container">
            <svg
              type="image/svg+xml"
              href="/SweetDelight.png"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo"
            >
              <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
              <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
              <path d="M2 21h20" />
              <path d="M7 8v3" />
              <path d="M12 8v3" />
              <path d="M17 8v3" />
              <path d="M7 4h.01" />
              <path d="M12 4h.01" />
              <path d="M17 4h.01" />
            </svg>
          </div>
          <span>Sweet Delights</span>
        </Link>
      </div>

      <div className={`nav_center ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="nav_link">Home</Link>
        <Link to="/cakes" className={`nav_link ${isCakesActive ? 'active' : ''}`}>
          Cakes
        </Link>
        <Link to="/bouquets" className="nav_link">Bouquets</Link>
        <Link to="/gallery" className="nav_link">Gallery</Link>
        <a href="#about" className="nav_link">About Us</a>
        <a href="#contact" className="nav_link">Contact</a>
      </div>

      <div className="nav_right">
        <button className="menu_toggle" onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        
        {isAuthenticated ? (
          <div className="user_menu">
            <span className="user_name">{user?.firstName}</span>
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Navigation;