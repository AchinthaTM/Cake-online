import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    users: [],
    products: [],
    orders: [],
    analytics: {
      userGrowth: [],
      revenue: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, productsRes, ordersRes, userGrowthRes, revenueRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/users', { headers }),
        fetch('http://localhost:5000/api/products/admin', { headers }),
        fetch('http://localhost:5000/api/orders/admin', { headers }),
        fetch('http://localhost:5000/api/auth/analytics/users', { headers }),
        fetch('http://localhost:5000/api/orders/analytics/revenue', { headers })
      ]);

      const [users, products, orders, userGrowth, revenue] = await Promise.all([
        usersRes.json(),
        productsRes.json(),
        ordersRes.json(),
        userGrowthRes.json(),
        revenueRes.json()
      ]);

      setData({
        users: users.data || [],
        products: products.data || [],
        orders: orders.data || [],
        analytics: {
          userGrowth: userGrowth.data || [],
          revenue: revenue.data || []
        }
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'products', label: 'Products', icon: '🍰' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  if (loading) return <div className="admin_loading">Loading Dashboard...</div>;

  return (
    <div className="admin_dashboard">
      <div className="sidebar">
        <div className="sidebar_header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar_nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar_item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar_footer">
          <Link to="/" className="back_to_site">Back to Site</Link>
        </div>
      </div>
      <div className="main_content">
        <div className="content_header">
          <h1>{menuItems.find(item => item.id === activeTab)?.label}</h1>
          <button className="refresh_btn" onClick={fetchAllData}>🔄 Refresh</button>
        </div>
        <div className="content_body">
          {error && <div className="error_banner">{error}</div>}
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'users' && <UsersTab users={data.users} refresh={fetchAllData} />}
          {activeTab === 'products' && <ProductsTab products={data.products} refresh={fetchAllData} />}
          {activeTab === 'orders' && <OrdersTab orders={data.orders} refresh={fetchAllData} />}
          {activeTab === 'analytics' && <AnalyticsTab analytics={data.analytics} />}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ data }) => {
  const totalSales = data.orders
    .filter(o => o.status === 'confirmed')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="overview_tab">
      <div className="stats_grid">
        <div className="stat_card">
          <h3>Total Revenue</h3>
          <p className="stat_value">Rs {totalSales.toLocaleString()}</p>
        </div>
        <div className="stat_card">
          <h3>Total Orders</h3>
          <p className="stat_value">{data.orders.length}</p>
        </div>
        <div className="stat_card">
          <h3>Total Users</h3>
          <p className="stat_value">{data.users.length}</p>
        </div>
        <div className="stat_card">
          <h3>Active Products</h3>
          <p className="stat_value">{data.products.filter(p => p.isActive).length}</p>
        </div>
      </div>
      <div className="quick_overview_charts">
        <div className="chart_mini">
          <h4>Recent Orders</h4>
          <div className="mini_list">
            {data.orders.slice(0, 5).map(order => (
              <div key={order._id} className="mini_item">
                <span>{order.orderNumber}</span>
                <span className={`status_pill ${order.status}`}>{order.status}</span>
                <span>Rs {order.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ users, refresh }) => {
  const [filter, setFilter] = useState('all');

  const handleToggleStatus = async (id) => {
    if (!window.confirm('Are you sure you want to change this user\'s status?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/auth/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredUsers = filter === 'all' ? users : users.filter(user => user.role === filter);

  return (
    <div className="users_tab">
      <div className="filter_buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All Users</button>
        <button onClick={() => setFilter('buyer')} className={filter === 'buyer' ? 'active' : ''}>Buyers</button>
        <button onClick={() => setFilter('seller')} className={filter === 'seller' ? 'active' : ''}>Sellers</button>
      </div>
      <div className="table_responsive">
        <table className="data_table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email/Phone</th>
              <th>Role</th>
              <th>Address</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user_name_cell">
                    <strong>{user.firstName} {user.lastName}</strong>
                  </div>
                </td>
                <td>
                  <div>{user.email}</div>
                  <div className="sub_text">{user.phone || 'No phone'}</div>
                </td>
                <td><span className={`role_badge ${user.role}`}>{user.role}</span></td>
                <td>{user.address?.city || 'No address'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status_dot ${user.isActive ? 'active' : 'inactive'}`}></span>
                  {user.isActive ? 'Active' : 'Disabled'}
                </td>
                <td>
                  <button 
                    className={`status_btn ${user.isActive ? 'deactivate' : 'activate'}`}
                    onClick={() => handleToggleStatus(user._id)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductsTab = ({ products, refresh }) => {
  const handleDelete = async (id) => {
    if (!window.confirm('PERMANENTLY DELETE this product? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) refresh();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="products_tab">
      <div className="table_responsive">
        <table className="data_table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <strong>{product.name}</strong>
                </td>
                <td>{product.category}</td>
                <td>Rs {product.price.toLocaleString()}</td>
                <td>
                  <span className={`stock_badge ${product.stock > 0 ? 'in_stock' : 'out_of_stock'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>{product.seller?.firstName || 'Unknown'}</td>
                <td>
                  <span className={`status_pill ${product.isActive ? 'confirmed' : 'cancelled'}`}>
                    {product.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button className="delete_btn" onClick={() => handleDelete(product._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrdersTab = ({ orders, refresh }) => {
  const handleDelete = async (id) => {
    if (!window.confirm('PERMANENTLY DELETE this order? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) refresh();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="orders_tab">
      <div className="table_responsive">
        <table className="data_table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Seller</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td><code className="order_number">{order.orderNumber}</code></td>
                <td>
                  <div>{order.customer?.firstName}</div>
                  <div className="sub_text">{order.customer?.email}</div>
                </td>
                <td>{order.seller?.firstName}</td>
                <td><strong>Rs {order.total.toLocaleString()}</strong></td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td><span className={`status_pill ${order.status}`}>{order.status}</span></td>
                <td>
                  <button className="delete_btn" onClick={() => handleDelete(order._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AnalyticsTab = ({ analytics }) => {
  const COLORS = ['#FF69B4', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="analytics_tab">
      <div className="charts_grid">
        <div className="chart_container">
          <h4>User Growth (Last 30 Days)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#FF69B4" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart_container">
          <h4>Revenue Breakdown by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {analytics.revenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;