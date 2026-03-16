import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'products', label: 'Products', icon: '🍰' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

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
              className={`sidebar_item Rs{activeTab === item.id ? 'active' : ''}`}
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
        </div>
        <div className="content_body">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = () => (
  <div className="overview_tab">
    <div className="stats_grid">
      <div className="stat_card">
        <h3>Total Sales</h3>
        <p className="stat_value">Rs45,230</p>
        <span className="stat_change positive">+12%</span>
      </div>
      <div className="stat_card">
        <h3>Total Orders</h3>
        <p className="stat_value">1,234</p>
        <span className="stat_change positive">+8%</span>
      </div>
      <div className="stat_card">
        <h3>Total Users</h3>
        <p className="stat_value">5,678</p>
        <span className="stat_change positive">+15%</span>
      </div>
      <div className="stat_card">
        <h3>Active Products</h3>
        <p className="stat_value">89</p>
        <span className="stat_change neutral">0%</span>
      </div>
    </div>
    <div className="charts_section">
      <div className="chart_placeholder">
        <h4>Sales Chart</h4>
        <p>Chart would go here (e.g., using Recharts)</p>
      </div>
      <div className="chart_placeholder">
        <h4>Order Trends</h4>
        <p>Chart would go here</p>
      </div>
    </div>
  </div>
);

const UsersTab = () => {
  const [filter, setFilter] = useState('all');

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Buyer',
      status: 'Active',
      phone: '+1 234 567 8900',
      address: '123 Main St, City, State',
      joinedDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Seller',
      status: 'Active',
      phone: '+1 234 567 8901',
      address: '456 Oak Ave, City, State',
      joinedDate: '2023-02-20',
      products: 5
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Buyer',
      status: 'Inactive',
      phone: '+1 234 567 8902',
      address: '789 Pine Rd, City, State',
      joinedDate: '2023-03-10'
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'Seller',
      status: 'Active',
      phone: '+1 234 567 8903',
      address: '321 Elm St, City, State',
      joinedDate: '2023-04-05',
      products: 3
    }
  ];

  const filteredUsers = filter === 'all' ? users : users.filter(user => user.role.toLowerCase() === filter);

  return (
    <div className="users_tab">
      <div className="filter_buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All Users</button>
        <button onClick={() => setFilter('buyer')} className={filter === 'buyer' ? 'active' : ''}>Buyers</button>
        <button onClick={() => setFilter('seller')} className={filter === 'seller' ? 'active' : ''}>Sellers</button>
      </div>
      <table className="data_table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Joined Date</th>
            <th>Status</th>
            {filter === 'seller' && <th>Products</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>{user.joinedDate}</td>
              <td>{user.status}</td>
              {filter === 'seller' && <td>{user.products || 0}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductsTab = () => {
  const products = [
    {
      id: 1,
      name: 'Chocolate Cake',
      category: 'Cake',
      price: 600,
      stock: 50,
      seller: 'Jane Smith',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Flower Bouquet',
      category: 'Bouquet',
      price: 1200,
      stock: 20,
      seller: 'Alice Brown',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Vanilla Cake',
      category: 'Cake',
      price: 550,
      stock: 30,
      seller: 'Jane Smith',
      status: 'Active'
    }
  ];

  return (
    <div className="products_tab">
      <table className="data_table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Seller</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>Rs{product.price}</td>
              <td>{product.stock}</td>
              <td>{product.seller}</td>
              <td>{product.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const OrdersTab = () => {
  const orders = [
    {
      id: '#12345',
      customer: 'John Doe',
      seller: 'Jane Smith',
      items: '2 items',
      total: 1800,
      status: 'Pending',
      date: '2023-10-01'
    },
    {
      id: '#12346',
      customer: 'Bob Johnson',
      seller: 'Alice Brown',
      items: '1 item',
      total: 600,
      status: 'Completed',
      date: '2023-10-02'
    }
  ];

  return (
    <div className="orders_tab">
      <table className="data_table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Seller</th>
            <th>Items</th>
            <th>Total</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.seller}</td>
              <td>{order.items}</td>
              <td>Rs{order.total}</td>
              <td>{order.date}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnalyticsTab = () => (
  <div className="analytics_tab">
    <div className="chart_placeholder">
      <h4>User Growth</h4>
      <p>Chart would go here</p>
    </div>
    <div className="chart_placeholder">
      <h4>Revenue Breakdown</h4>
      <p>Chart would go here</p>
    </div>
  </div>
);

export default AdminDashboard;