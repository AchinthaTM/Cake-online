import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/ProfileSettings/ProfileSettings';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  return (
    <div className="buyer_dashboard">
      <div className="dashboard_container">
        {/* Verification Warning */}
        {!user?.emailVerified && (
          <div className="verification_banner">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Your email address is not verified. Please verify it from the <strong>Profile</strong> tab to enable all features.</span>
          </div>
        )}

        {/* Header */}
        <div className="dashboard_header">
          <div className="header_content">
            <h1>My Dashboard</h1>
            <p>Track your orders and manage your account</p>
          </div>
          <div className="header_actions">
            <span>Welcome, {user?.firstName}!</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard_tabs">
          <button 
            className={`tab_btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={`tab_btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab_content">
          {activeTab === 'orders' && (
            <div className="orders_section">
              {loading ? (
                <div className="loading">Loading your orders...</div>
              ) : orders.length > 0 ? (
                <div className="orders_table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Seller</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNumber || '...'+order._id.substring(order._id.length-6)}</td>
                          <td>
                            <strong>{order.seller?.sellerInfo?.businessName || 
                              (order.seller?.firstName + ' ' + order.seller?.lastName)}</strong>
                          </td>
                          <td>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order_item_snap">
                                {item.quantity}x {item.product?.name || 'Item'}
                              </div>
                            ))}
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>Rs{order.total.toFixed(2)}</td>
                          <td>
                            <span className={`status_badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty_state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <h3>No orders yet</h3>
                  <p>You haven't placed any orders. Start browsing our delicious cakes!</p>
                  <button className="browse_btn" onClick={() => navigate('/cakes')}>Browse Cakes</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
