import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './BouquetDetails.css';

const BouquetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const bouquets = [
    {
      id: 101,
      name: 'Spring Flower Bouquet',
      description: 'A beautiful arrangement of roses, lilies and daisies—perfect for any celebration.',
      fullDescription: 'Bright seasonal bouquet with a mix of fresh flowers including roses, lilies, and daisies. Ideal for birthdays, anniversaries, or just to brighten someone’s day.',
      price: 1200,
      category: 'Bouquet',
      image: 'https://example.com/bouquet1.jpg',
      ingredients: ['Roses', 'Lilies', 'Daisies'],
      servings: 'N/A',
      weight: 'Varies'
    }
    // more bouquets could be added here
  ];

  const bouquet = bouquets.find(b => b.id === parseInt(id));

  useEffect(() => {
    if (!bouquet) {
      navigate('/bouquets');
    }
  }, [bouquet, navigate]);

  if (!bouquet) return null;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(bouquet);
    }
  };

  const totalPrice = (bouquet.price * quantity).toFixed(2);

  return (
    <div className="bouquet_details_page">
      <button className="back_button" onClick={() => navigate('/bouquets')}>
        Back to Bouquets
      </button>

      <div className="bouquet_details_container">
        <div className="bouquet_details_image">
          <img src={bouquet.image} alt={bouquet.name} />
          <div className="bouquet_details_badge">{bouquet.category}</div>
        </div>

        <div className="bouquet_details_info">
          <h1 className="bouquet_details_name">{bouquet.name}</h1>
          <p className="bouquet_details_description">{bouquet.fullDescription}</p>

          <div className="bouquet_purchase">
            <div className="bouquet_price_section">
              <span className="price_label">Price:</span>
              <div className="bouquet_price_large">
                <span className="currency">Rs</span>
                <span className="amount">{totalPrice}</span>
              </div>
            </div>

            <div className="quantity_selector">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>

            <button className="add_to_cart_btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BouquetDetails;
