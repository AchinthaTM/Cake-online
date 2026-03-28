import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CakeDetails.css';

const CakeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const [cake, setCake] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCakeDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
          const p = data.data;
          setCake({
            id: p._id,
            name: p.name,
            description: p.description,
            fullDescription: p.description, // Reused description as fullDescription
            price: p.price,
            category: p.category,
            stock: p.stock || 0,
            image: p.images && p.images.length > 0 
              ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`) 
              : '',
            ingredients: p.ingredients || ['Premium Ingredients', 'Freshly Baked'],
            servings: p.servings ? `${p.servings} people` : '8-10 people',
            weight: p.weight ? `${p.weight}g` : '1 kg',
            seller: p.seller
          });
        } else {
          navigate('/cakes');
        }
      } catch (error) {
        console.error("Error fetching cake details:", error);
        navigate('/cakes');
      } finally {
        setLoading(false);
      }
    };

    fetchCakeDetails();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading_container">Loading cake details...</div>;
  }

  if (!cake) {
    return null;
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(cake);
    }
  };

  const totalPrice = (cake.price * quantity).toFixed(2);

  return (
    <div className="cake_details_page">
      <button className="back_button" onClick={() => navigate('/cakes')}>
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Cakes
      </button>

      <div className="cake_details_container">
        <div className="cake_details_image">
          <img src={cake.image} alt={cake.name} />
          <div className="cake_details_badge">{cake.category}</div>
        </div>

        <div className="cake_details_info">
          <h1 className="cake_details_name">{cake.name}</h1>
          <p className="cake_details_description">{cake.fullDescription}</p>

          <div className="cake_details_specs">
            <div className="spec_item">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Serves: {cake.servings}</span>
            </div>
            <div className="spec_item">
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
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Weight: {cake.weight}</span>
            </div>
          </div>

          <div className="cake_ingredients">
            <h3>Ingredients</h3>
            <ul>
              {cake.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="cake_purchase">
            <div className="cake_price_section">
              <span className="price_label">Price:</span>
              <div className="cake_price_large">
                <span className="currency">Rs</span>
                <span className="amount">{totalPrice}</span>
              </div>
            </div>

            <div className="quantity_selector">
              <span className="quantity_label">Quantity:</span>
              <div className="quantity_controls">
                <button 
                  className="quantity_btn" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity_value">{quantity}</span>
                <button 
                  className="quantity_btn" 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <button className="add_to_cart_large" onClick={handleAddToCart}>
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
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeDetails;
