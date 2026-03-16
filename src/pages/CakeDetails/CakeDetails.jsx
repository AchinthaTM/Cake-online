import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CakeDetails.css';

const CakeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Sample cake data - in a real app, this would come from an API or context
  const cakes = [
    {
      id: 1,
      name: 'Chocolate Delight',
      description: 'Indulge in our decadent chocolate cake, made with premium cocoa and layered with silky chocolate ganache. Perfect for chocolate lovers!',
      fullDescription: 'Our Chocolate Delight is a masterpiece of rich, moist chocolate layers infused with the finest Belgian cocoa. Each layer is generously filled with smooth chocolate ganache and topped with chocolate shavings. This cake is perfect for birthdays, celebrations, or simply treating yourself to something special.',
      price: 45.99,
      category: 'Chocolate',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop',
      ingredients: ['Premium Belgian Cocoa', 'Fresh Eggs', 'Butter', 'Sugar', 'Flour', 'Chocolate Ganache'],
      servings: '8-10 people',
      weight: '2 lbs'
    },
    {
      id: 2,
      name: 'Vanilla Dream',
      description: 'A timeless classic featuring moist vanilla sponge layers with smooth vanilla buttercream. Light, fluffy, and absolutely delicious!',
      fullDescription: 'Our Vanilla Dream cake is a celebration of simplicity and elegance. Made with pure vanilla extract and the finest ingredients, this cake features light, airy sponge layers complemented by silky vanilla buttercream. Perfect for any occasion!',
      price: 39.99,
      category: 'Vanilla',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop',
      ingredients: ['Pure Vanilla Extract', 'Fresh Eggs', 'Butter', 'Sugar', 'Flour', 'Vanilla Buttercream'],
      servings: '8-10 people',
      weight: '2 lbs'
    },
    {
      id: 3,
      name: 'Strawberry Bliss',
      description: 'Delightful strawberry cake made with fresh strawberries and topped with whipped cream. A fruity paradise in every bite!',
      fullDescription: 'Experience pure bliss with our Strawberry cake, featuring fresh strawberries in every layer. The light sponge is complemented by fresh strawberry filling and topped with fluffy whipped cream. A refreshing treat for any season!',
      price: 42.99,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
      ingredients: ['Fresh Strawberries', 'Fresh Eggs', 'Butter', 'Sugar', 'Flour', 'Whipped Cream'],
      servings: '8-10 people',
      weight: '2 lbs'
    },
    {
      id: 4,
      name: 'Red Velvet Romance',
      description: 'Our signature red velvet cake with velvety texture and tangy cream cheese frosting. A romantic treat for special occasions!',
      fullDescription: 'Fall in love with our Red Velvet Romance - a stunning cake with its signature red color and velvety texture. Paired with tangy cream cheese frosting, this cake is perfect for weddings, anniversaries, and romantic celebrations.',
      price: 48.99,
      category: 'Special',
      image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&h=600&fit=crop',
      ingredients: ['Cocoa Powder', 'Red Food Coloring', 'Buttermilk', 'Eggs', 'Butter', 'Cream Cheese Frosting'],
      servings: '10-12 people',
      weight: '2.5 lbs'
    },
    {
      id: 5,
      name: 'Lemon Zest',
      description: 'Refreshing lemon cake with a perfect balance of sweet and tangy flavors, topped with a zesty lemon glaze.',
      fullDescription: 'Our Lemon Zest cake is a burst of sunshine in every bite. Made with fresh lemon juice and zest, this cake offers the perfect balance of sweet and tangy. The lemon glaze adds an extra layer of citrusy goodness!',
      price: 41.99,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=800&h=600&fit=crop',
      ingredients: ['Fresh Lemons', 'Lemon Zest', 'Eggs', 'Butter', 'Sugar', 'Flour', 'Lemon Glaze'],
      servings: '8-10 people',
      weight: '2 lbs'
    },
    {
      id: 6,
      name: 'Caramel Heaven',
      description: 'Indulgent caramel cake layered with salted caramel sauce and topped with crunchy toffee bits. Pure heaven!',
      fullDescription: 'Experience pure indulgence with our Caramel Heaven cake. Rich caramel layers are enhanced with homemade salted caramel sauce and topped with crunchy toffee bits. This cake is a caramel lover\'s dream come true!',
      price: 46.99,
      category: 'Caramel',
      image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&h=600&fit=crop',
      ingredients: ['Caramel', 'Salted Caramel Sauce', 'Eggs', 'Butter', 'Sugar', 'Flour', 'Toffee Bits'],
      servings: '8-10 people',
      weight: '2 lbs'
    }
  ];

  const cake = cakes.find(c => c.id === parseInt(id));

  useEffect(() => {
    if (!cake) {
      navigate('/cakes');
    }
  }, [cake, navigate]);

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
