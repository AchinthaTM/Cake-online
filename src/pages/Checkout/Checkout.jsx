import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ street: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cakes');
    }
  }, [isAuthenticated, cartItems, navigate]);

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city) {
      setError('Please provide your full delivery address.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const items = cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity || 1
      }));

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          deliveryAddress: address,
          paymentMethod: 'cash_on_delivery'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Order placed successfully! The Seller has been notified.');
        clearCart();
        navigate('/');
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      setError('Server error while placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout_page">
      <div className="checkout_container">
        <h1>Checkout</h1>
        <p>You have {cartItems.length} item(s) in your cart.</p>
        <p><strong>Total: Rs{getTotalPrice().toFixed(2)}</strong></p>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <div className="address_form" style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'left' }}>
          <h3>Delivery Address</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Street / Apartment *</label>
            <input 
              type="text" 
              value={address.street} 
              onChange={e => setAddress({...address, street: e.target.value})}
              placeholder="123 Cake Street"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>City *</label>
            <input 
              type="text" 
              value={address.city} 
              onChange={e => setAddress({...address, city: e.target.value})}
              placeholder="Colombo"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <button 
          className="place_order_btn" 
          onClick={handlePlaceOrder}
          disabled={loading}
          style={{ width: '100%', padding: '15px', fontSize: '1.2rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing Order...' : 'Confirm & Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
