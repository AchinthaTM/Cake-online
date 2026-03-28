import { Link } from 'react-router-dom';
import './CakeCard.css';

const CakeCard = ({ cake, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(cake);
  };

  return (
    <Link to={`/cakes/${cake.id}`} className="cake_card">
      <div className="cake_image_container">
        <img src={cake.image} alt={cake.name} className="cake_image" />
        <div className="cake_badge">{cake.category}</div>
      </div>
      
      <div className="cake_info">
        <h3 className="cake_name">{cake.name}</h3>
        <p className="cake_description">{cake.shortDescription}</p>
        
        <div className="cake_footer">
          <div className="cake_price">
            <span className="price_currency">RS.</span>
            <span className="price_amount">{cake.price}</span>
          </div>
          
          <button 
            className="add_to_cart_btn" 
            onClick={handleAddToCart}
            aria-label={`Add ${cake.name} to cart`}
          >
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
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CakeCard;
