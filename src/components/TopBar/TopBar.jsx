import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

const TopBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  // All available cakes data
  const allCakes = [
    {
      id: 1,
      name: 'Chocolate Delight',
      shortDescription: 'Rich chocolate cake with creamy frosting',
      price: 6000,
      category: 'Chocolate',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Vanilla Dream',
      shortDescription: 'Classic vanilla cake with buttercream',
      price: 5500,
      category: 'Vanilla',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Strawberry Bliss',
      shortDescription: 'Fresh strawberry cake with cream',
      price: 3000,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop'
    },
    {
      id: 4,
      name: 'Red Velvet Romance',
      shortDescription: 'Luxurious red velvet with cream cheese',
      price: 7000,
      category: 'Special',
      image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=400&fit=crop'
    },
    {
      id: 5,
      name: 'Lemon Zest',
      shortDescription: 'Tangy lemon cake with citrus glaze',
      price: 6500,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=600&h=400&fit=crop'
    },
    {
      id: 6,
      name: 'Carrot Cake',
      shortDescription: 'Moist carrot cake with cream cheese frosting',
      price: 5800,
      category: 'Special',
      image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=400&fit=crop'
    },
    {
      id: 7,
      name: 'Cheesecake Paradise',
      shortDescription: 'Rich and creamy New York cheesecake',
      price: 6800,
      category: 'Special',
      image: 'https://images.unsplash.com/photo-1530805066000-de6a9fb42908?w=600&h=400&fit=crop'
    },
    {
      id: 8,
      name: 'Blueberry Bliss',
      shortDescription: 'Fresh blueberry cake with whipped cream',
      price: 5900,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1551632440-4ebbf5b0f0d4?w=600&h=400&fit=crop'
    }
  ];

  // Helper function to highlight search term
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<mark key=${index}>${part}</mark>` 
        : part
    ).join('');
  };

  // Highlight text component
  const HighlightedText = ({ text, query }) => {
    if (!query.trim()) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={index} className="search_highlight">{part}</mark>
            : <span key={index}>{part}</span>
        )}
      </span>
    );
  };

  // Filter cakes based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
    } else {
      const query = searchQuery.toLowerCase();
      const results = allCakes.filter(cake =>
        cake.name.toLowerCase().includes(query) ||
        cake.shortDescription.toLowerCase().includes(query) ||
        cake.category.toLowerCase().includes(query)
      );
      setSearchResults(results);
      setShowResults(true);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCakeClick = (cakeId) => {
    navigate(`/cakes/${cakeId}`);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() !== '') {
      setShowResults(true);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar_container">
        <form className="search_form" onSubmit={handleSearch}>
          <div className="search_wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search_icon"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search_input"
              placeholder="Search for cakes, flavors, occasions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {searchQuery && (
              <button
                type="button"
                className="search_clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {showResults && (
            <div className="search_results_dropdown">
              {searchResults.length > 0 ? (
                <div className="search_results_list">
                  {searchResults.map((cake) => (
                    <div
                      key={cake.id}
                      className="search_result_item"
                      onClick={() => handleCakeClick(cake.id)}
                    >
                      <img src={cake.image} alt={cake.name} className="result_image" />
                      <div className="result_info">
                        <h4>
                          <HighlightedText text={cake.name} query={searchQuery} />
                        </h4>
                        <p>
                          <HighlightedText text={cake.shortDescription} query={searchQuery} />
                        </p>
                        <span className="result_price">Rs{cake.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search_no_results">
                  <p>No cakes found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </form>

        <div className="topbar_actions">
          <button className="topbar_cart_btn" onClick={() => navigate('/cart')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span className="topbar_cart_count">{getTotalItems()}</span>
          </button>

          {isAuthenticated ? (
            <div className="user_menu_topbar">
              <span className="user_greeting">Hi, {user?.firstName}</span>
              <button className="logout_btn_topbar" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth_buttons_topbar">
              <Link to="/login" className="login_btn_topbar">
                Login
              </Link>
              <Link to="/register" className="register_btn_topbar">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
