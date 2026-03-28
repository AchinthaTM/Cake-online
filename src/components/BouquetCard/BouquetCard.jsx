import { Link } from 'react-router-dom';
import './BouquetCard.css';

const BouquetCard = ({ bouquet, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(bouquet);
  };

  return (
    <Link to={`/bouquets/${bouquet.id}`} className="bouquet_card">
      <div className="bouquet_image_container">
        <img src={bouquet.image} alt={bouquet.name} className="bouquet_image" />
        <div className="bouquet_badge">{bouquet.category}</div>
      </div>
      
      <div className="bouquet_info">
        <h3 className="bouquet_name">{bouquet.name}</h3>
        <p className="bouquet_description">{bouquet.shortDescription}</p>
        
        <div className="bouquet_footer">
          <div className="bouquet_price">
            <span className="price_currency">RS.</span>
            <span className="price_amount">{bouquet.price}</span>
          </div>
          
          <button 
            className="add_to_cart_btn" 
            onClick={handleAddToCart}
            aria-label={`Add ${bouquet.name} to cart`}
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

export default BouquetCard;
