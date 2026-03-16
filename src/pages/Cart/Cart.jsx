import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (cartItems.length === 0) {
    return (
      <div className="cart_page">
        <div className="cart_container">
          <div className="empty_cart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="empty_icon"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any cakes yet. Start shopping!</p>
            <Link to="/cakes" className="continue_shopping_btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart_page">
      <div className="cart_container">
        <h1 className="cart_title">Shopping Cart</h1>

        <div className="cart_content">
          <div className="cart_items_section">
            <div className="cart_items_header">
              <span className="header_product">Product</span>
              <span className="header_price">Price</span>
              <span className="header_quantity">Quantity</span>
              <span className="header_total">Total</span>
              <span className="header_action">Action</span>
            </div>

            <div className="cart_items_list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart_item">
                  <div className="item_product">
                    <img src={item.image} alt={item.name} className="item_image" />
                    <div className="item_details">
                      <h3>{item.name}</h3>
                      <p className="item_category">{item.category}</p>
                    </div>
                  </div>

                  <div className="item_price">
                    <span className="price_currency">Rs</span>
                    <span className="price_value">{item.price}</span>
                  </div>

                  <div className="item_quantity">
                    <button
                      className="qty_btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        if (newQty > 0 && newQty <= 10) {
                          updateQuantity(item.id, newQty);
                        }
                      }}
                      className="qty_input"
                    />
                    <button
                      className="qty_btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="item_total">
                    <span className="total_currency">Rs</span>
                    <span className="total_value">{(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  <button
                    className="remove_btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart_summary_section">
            <div className="cart_summary">
              <h2>Order Summary</h2>

              <div className="summary_row">
                <span className="summary_label">Subtotal:</span>
                <span className="summary_value">Rs{getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="summary_row">
                <span className="summary_label">Shipping:</span>
                <span className="summary_value shipping_cost">Free</span>
              </div>

              {/* <div className="summary_row">
                <span className="summary_label">Tax:</span>
                <span className="summary_value tax_cost">RS{(getTotalPrice() * 0.1).toFixed(2)}</span>
              </div> */}

              <div className="summary_divider"></div>

              <div className="summary_row total">
                <span className="summary_label">Total:</span>
                <span className="summary_value">Rs{(getTotalPrice() * 1.1).toFixed(2)}</span>
              </div>

              <button
                className="checkout_btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/checkout');
                  }
                }}
              >
                Proceed to Checkout
              </button>

              <Link to="/cakes" className="continue_btn">
                Continue Shopping
              </Link>

              <button className="clear_cart_btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
