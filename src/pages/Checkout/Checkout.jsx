import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // if user somehow lands here without items or not logged in, redirect
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cakes');
    }
  }, [isAuthenticated, cartItems, navigate]);

  const handlePlaceOrder = () => {
    // in a real app you'd call an API to create the order
    alert('Order placed successfully!');
    clearCart();
    navigate('/');
  };

  return (
    <div className="checkout_page">
      <div className="checkout_container">
        <h1>Checkout</h1>
        <p>You have {cartItems.length} item(s) in your cart.</p>
        <p>Total: Rs{getTotalPrice().toFixed(2)}</p>
        <button className="place_order_btn" onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
