import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/ProfileSettings/ProfileSettings';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cakes, setCakes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [productSubTab, setProductSubTab] = useState('cakes');
  const [showAddBouquetForm, setShowAddBouquetForm] = useState(false);
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', accountHolderName: '', branch: '', swiftCode: '' });
  const [showBankForm, setShowBankForm] = useState(false);
  const [newCake, setNewCake] = useState({ name: '', description: '', price: '', category: 'Chocolate', image: '' });
  const [newBouquet, setNewBouquet] = useState({ name: '', description: '', price: '', category: 'Rose' });
  const [bouquetFile, setBouquetFile] = useState(null);
  const [bouquetPreview, setBouquetPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCake, setEditingCake] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/login'); return; }

    const fetchCakes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/products/seller', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (data.success) {
          setCakes(data.data.map(p => ({
            id: p._id, name: p.name, description: p.description, price: p.price,
            category: p.category, type: p.type || 'cake', stock: p.stock || 0,
            isActive: p.isActive !== undefined ? p.isActive : true,
            image: p.images && p.images.length > 0
              ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`)
              : '',
            createdAt: p.createdAt
          })));
        }
      } catch (err) { console.error('Error fetching products', err); }
    };
    fetchCakes();

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/orders/seller', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (data.success) setOrders(data.data);
      } catch (err) { console.error('Error fetching orders', err); }
    };
    fetchOrders();

    if (user && user.role === 'seller' && !bankDetails.bankName) {
      const fetchBankDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await response.json();
          if (data.success && data.data.bankDetails) setBankDetails(data.data.bankDetails);
        } catch (err) { console.error('Error loading bank details:', err); }
      };
      fetchBankDetails();
    }
  }, [user, navigate]);

  // ── Cake Handlers ──
  const handleInputChange = (e) => setNewCake({ ...newCake, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCake = async (e) => {
    e.preventDefault();
    if (!newCake.name || !newCake.price || !selectedFile) { alert('Please fill in all required fields and upload an image'); return; }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newCake.name);
      formData.append('description', newCake.description);
      formData.append('price', newCake.price);
      formData.append('category', newCake.category);
      formData.append('type', 'cake');
      formData.append('image', selectedFile);
      const response = await fetch('http://localhost:5000/api/products', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      const data = await response.json();
      if (data.success) {
        const p = data.data;
        setCakes([{ id: p._id, name: p.name, description: p.description, price: p.price, category: p.category, type: 'cake',
          image: p.images && p.images.length > 0 ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`) : '',
          createdAt: p.createdAt, isActive: true, stock: p.stock || 10 }, ...cakes]);
        setNewCake({ name: '', description: '', price: '', category: 'Chocolate', image: '' });
        setSelectedFile(null); setImagePreview(null); setShowAddForm(false);
        alert('Cake added successfully!');
      } else { alert(data.message || 'Error adding cake'); }
    } catch (err) { alert('Server error while adding cake'); }
  };

  const handleDeleteCake = async (cakeId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${cakeId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) { setCakes(cakes.filter(c => c.id !== cakeId)); }
      else { alert(data.message || 'Error deleting product'); }
    } catch (err) { alert('Server error deleting product'); }
  };

  const handleEditClick = (cake) => {
    setEditingCake({ ...cake });
    setImagePreview(cake.image);
    setSelectedFile(null);
    setShowEditForm(true);
    setShowAddForm(false);
    setShowAddBouquetForm(false);
    // Switch to the right sub-tab
    setProductSubTab(cake.type === 'bouquet' ? 'bouquets' : 'cakes');
  };

  const handleUpdateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingCake({ ...editingCake, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUpdateCake = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', editingCake.name);
      formData.append('description', editingCake.description);
      formData.append('price', editingCake.price);
      formData.append('category', editingCake.category);
      formData.append('stock', editingCake.stock);
      formData.append('isActive', editingCake.isActive);
      if (selectedFile) formData.append('image', selectedFile);
      const response = await fetch(`http://localhost:5000/api/products/${editingCake.id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      const data = await response.json();
      if (data.success) {
        const p = data.data;
        const updated = { id: p._id, name: p.name, description: p.description, price: p.price, category: p.category,
          type: p.type || editingCake.type, stock: p.stock, isActive: p.isActive,
          image: p.images && p.images.length > 0 ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`) : '', createdAt: p.createdAt };
        setCakes(cakes.map(c => c.id === updated.id ? updated : c));
        setShowEditForm(false); setEditingCake(null); setSelectedFile(null); setImagePreview(null);
        alert('Product updated successfully!');
      } else { alert(data.message || 'Error updating product'); }
    } catch (err) { alert('Server error while updating product'); }
    finally { setLoading(false); }
  };

  // ── Bouquet Handlers ──
  const handleBouquetInputChange = (e) => setNewBouquet({ ...newBouquet, [e.target.name]: e.target.value });

  const handleBouquetFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBouquetFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBouquetPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddBouquet = async (e) => {
    e.preventDefault();
    if (!newBouquet.name || !newBouquet.price || !bouquetFile) { alert('Please fill in all required fields and upload a bouquet image'); return; }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newBouquet.name);
      formData.append('description', newBouquet.description);
      formData.append('price', newBouquet.price);
      formData.append('category', newBouquet.category);
      formData.append('type', 'bouquet');
      formData.append('image', bouquetFile);
      const response = await fetch('http://localhost:5000/api/products', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      const data = await response.json();
      if (data.success) {
        const p = data.data;
        setCakes([{ id: p._id, name: p.name, description: p.description, price: p.price, category: p.category, type: 'bouquet',
          image: p.images && p.images.length > 0 ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`) : '',
          createdAt: p.createdAt, isActive: true, stock: 10 }, ...cakes]);
        setNewBouquet({ name: '', description: '', price: '', category: 'Rose' });
        setBouquetFile(null); setBouquetPreview(null); setShowAddBouquetForm(false);
        alert('Flower Bouquet added successfully!');
      } else { alert(data.message || 'Error adding bouquet'); }
    } catch (err) { alert('Server error while adding bouquet'); }
  };

  // ── Order Handlers ──
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        alert(newStatus === 'confirmed' ? 'Order Accepted! Email sent to buyer.' : 'Order Rejected. Email sent to buyer.');
      } else { alert(data.message || 'Error updating order'); }
    } catch (err) { alert('Server error updating order status'); }
  };

  // ── Bank Handlers ──
  const handleBankInputChange = (e) => setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/bank-details', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bankDetails)
      });
      const data = await response.json();
      if (data.success) { setShowBankForm(false); alert('Bank details saved successfully!'); }
      else { alert(data.message || 'Error saving bank details'); }
    } catch (err) { alert('Server error saving bank details'); }
  };

  return (
    <div className="seller_dashboard">
      <div className="dashboard_container">
        {/* Verification Warning */}
        {!user?.emailVerified && (
          <div style={{ backgroundColor: '#fffaf0', border: '1px solid #fbd38d', padding: '15px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', color: '#c05621' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Your email address is not verified. Please verify it from the <strong>Profile</strong> tab to enable all features.</span>
          </div>
        )}

        {/* Header */}
        <div className="dashboard_header">
          <div className="header_content">
            <h1>Seller Dashboard</h1>
            <p>Manage your products, payments and more</p>
          </div>
          <div className="header_actions">
            <div className="seller_info"><span>Welcome, {user?.firstName}!</span></div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="dashboard_tabs">
          <button className={`tab_btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={`tab_btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
          <button className={`tab_btn ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTab('bank')}>Bank Details</button>
          <button className={`tab_btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payments</button>
          <button className={`tab_btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        </div>

        {/* ══════════════════ ORDERS TAB ══════════════════ */}
        {activeTab === 'orders' && (
          <div className="orders_section" style={{ marginTop: '20px' }}>
            <div className="section_header">
              <h2>My Orders</h2>
              <p>Accept new incoming orders below. This automatically emails the buyer.</p>
            </div>
            <div className="cakes_table">
              {orders.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Order Number</th><th>Customer Details</th><th>Ordered Items</th>
                      <th>Total</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderNumber || '...' + order._id.substring(order._id.length - 6)}</td>
                        <td>
                          <strong>{order.customer.firstName} {order.customer.lastName}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.customer.email}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.delivery?.address?.street}, {order.delivery?.address?.city}</div>
                        </td>
                        <td>
                          <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem' }}>
                            {order.items.map((item, idx) => (
                              <li key={idx}>{item.quantity}x {item.product ? item.product.name : 'Unknown'}</li>
                            ))}
                          </ul>
                        </td>
                        <td>Rs{order.total.toFixed(2)}</td>
                        <td><span className={`status_${order.status.toLowerCase()}`}>{order.status}</span></td>
                        <td>
                          {order.status === 'pending' && (
                            <>
                              <button className="edit_btn" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', marginRight: '8px', cursor: 'pointer' }} onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}>Accept</button>
                              <button className="delete_btn" style={{ cursor: 'pointer' }} onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty_cakes"><p>You have no pending or past orders.</p></div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ PRODUCTS TAB ══════════════════ */}
        {activeTab === 'products' && (
          <>
            {/* Stats */}
            <div className="dashboard_stats">
              <div className="stat_card">
                <div className="stat_icon">🛍️</div>
                <div className="stat_content"><h3>Total Products</h3><p className="stat_value">{cakes.length}</p></div>
              </div>
              <div className="stat_card">
                <div className="stat_icon">🎂</div>
                <div className="stat_content"><h3>Cakes</h3><p className="stat_value">{cakes.filter(p => p.type !== 'bouquet').length}</p></div>
              </div>
              <div className="stat_card">
                <div className="stat_icon">💐</div>
                <div className="stat_content"><h3>Bouquets</h3><p className="stat_value">{cakes.filter(p => p.type === 'bouquet').length}</p></div>
              </div>
              <div className="stat_card">
                <div className="stat_icon orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                </div>
                <div className="stat_content"><h3>Orders</h3><p className="stat_value">{orders.length}</p></div>
              </div>
            </div>

            {/* Product Sub-Tabs */}
            <div className="product_subtabs">
              <button
                className={`subtab_btn ${productSubTab === 'cakes' ? 'active' : ''}`}
                onClick={() => { setProductSubTab('cakes'); setShowAddForm(false); setShowAddBouquetForm(false); setShowEditForm(false); }}
              >
                🎂 Cakes
              </button>
              <button
                className={`subtab_btn ${productSubTab === 'bouquets' ? 'active' : ''}`}
                onClick={() => { setProductSubTab('bouquets'); setShowAddForm(false); setShowAddBouquetForm(false); setShowEditForm(false); }}
              >
                💐 Flower Bouquets
              </button>
            </div>

            {/* ── CAKES SUB-TAB ── */}
            {productSubTab === 'cakes' && (
              <div className="add_cake_section">
                <div className="section_header">
                  <h2>🎂 My Cakes</h2>
                  <button className="add_cake_btn" onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}>
                    {showAddForm ? 'Cancel' : '+ Add New Cake'}
                  </button>
                </div>

                {/* Add Cake Form */}
                {showAddForm && (
                  <form className="add_cake_form" onSubmit={handleAddCake}>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Cake Name *</label>
                        <input type="text" name="name" value={newCake.name} onChange={handleInputChange} placeholder="e.g., Chocolate Delight" required />
                      </div>
                      <div className="form_group">
                        <label>Price (Rs) *</label>
                        <input type="number" name="price" value={newCake.price} onChange={handleInputChange} placeholder="0.00" step="0.01" required />
                      </div>
                    </div>
                    <div className="form_group">
                      <label>Description</label>
                      <textarea name="description" value={newCake.description} onChange={handleInputChange} placeholder="Describe your cake..." rows="3" />
                    </div>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Category</label>
                        <select name="category" value={newCake.category} onChange={handleInputChange}>
                          <option>Chocolate</option><option>Vanilla</option><option>Strawberry</option>
                          <option>Red Velvet</option><option>Butter</option><option>Fruit</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form_group">
                        <label>Cake Image *</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="file_input" required />
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px', marginTop: '10px', border: '1px solid #ddd' }} />}
                      </div>
                    </div>
                    <button type="submit" className="submit_btn">Add Cake</button>
                  </form>
                )}

                {/* Edit Form (shown in cakes sub-tab when editing a cake) */}
                {showEditForm && editingCake && editingCake.type !== 'bouquet' && (
                  <form className="add_cake_form edit_form" onSubmit={handleUpdateCake}>
                    <div className="section_header"><h3>✏️ Edit Cake: {editingCake.name}</h3></div>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Cake Name *</label>
                        <input type="text" name="name" value={editingCake.name} onChange={handleUpdateInputChange} required />
                      </div>
                      <div className="form_group">
                        <label>Price *</label>
                        <input type="number" name="price" value={editingCake.price} onChange={handleUpdateInputChange} step="0.01" required />
                      </div>
                    </div>
                    <div className="form_group">
                      <label>Description</label>
                      <textarea name="description" value={editingCake.description} onChange={handleUpdateInputChange} rows="3" />
                    </div>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Category</label>
                        <select name="category" value={editingCake.category} onChange={handleUpdateInputChange}>
                          <option>Chocolate</option><option>Vanilla</option><option>Strawberry</option>
                          <option>Red Velvet</option><option>Butter</option><option>Fruit</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form_group">
                        <label>Stock</label>
                        <input type="number" name="stock" value={editingCake.stock} onChange={handleUpdateInputChange} min="0" />
                      </div>
                    </div>
                    <div className="form_group">
                      <label>New Image (leave blank to keep current)</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="file_input" />
                      {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px', marginTop: '10px' }} />}
                    </div>
                    <div className="form_group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" name="isActive" checked={editingCake.isActive} onChange={handleUpdateInputChange} style={{ width: '20px', height: '20px' }} />
                        <span>Product is Active (Visible to customers)</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="submit_btn" disabled={loading}>{loading ? 'Updating...' : 'Save Changes'}</button>
                      <button type="button" onClick={() => { setShowEditForm(false); setEditingCake(null); }} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                )}

                {/* Cakes List */}
                <div className="cakes_section">
                  {cakes.filter(p => p.type !== 'bouquet').length > 0 ? (
                    <div className="cakes_table">
                      <table>
                        <thead>
                          <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {cakes.filter(p => p.type !== 'bouquet').map((cake) => (
                            <tr key={cake.id}>
                              <td><img src={cake.image} alt={cake.name} className="cake_thumb" /></td>
                              <td><strong>{cake.name}</strong><p className="cake_desc">{cake.description}</p></td>
                              <td><span className="category_badge">{cake.category}</span></td>
                              <td>Rs{cake.price.toFixed(2)}</td>
                              <td><span className={cake.isActive ? 'status_active' : 'status_inactive'}>{cake.isActive ? 'Active' : 'Hidden'}</span></td>
                              <td>
                                <button className="edit_btn" onClick={() => handleEditClick(cake)}>Edit</button>
                                <button className="delete_btn" onClick={() => handleDeleteCake(cake.id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty_cakes"><p>No cakes yet. Add your first cake to get started!</p></div>
                  )}
                </div>
              </div>
            )}

            {/* ── FLOWER BOUQUETS SUB-TAB ── */}
            {productSubTab === 'bouquets' && (
              <div className="add_cake_section">
                <div className="section_header">
                  <h2>💐 My Flower Bouquets</h2>
                  <button className="add_cake_btn" style={{ background: 'linear-gradient(135deg, #e75480, #ff9a9e)' }} onClick={() => { setShowAddBouquetForm(!showAddBouquetForm); setShowEditForm(false); }}>
                    {showAddBouquetForm ? 'Cancel' : '+ Add New Bouquet'}
                  </button>
                </div>

                {/* Add Bouquet Form */}
                {showAddBouquetForm && (
                  <form className="add_cake_form" onSubmit={handleAddBouquet}>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Bouquet Name *</label>
                        <input type="text" name="name" value={newBouquet.name} onChange={handleBouquetInputChange} placeholder="e.g., Red Rose Special" required />
                      </div>
                      <div className="form_group">
                        <label>Price (Rs) *</label>
                        <input type="number" name="price" value={newBouquet.price} onChange={handleBouquetInputChange} placeholder="0.00" step="0.01" min="0" required />
                      </div>
                    </div>
                    <div className="form_group">
                      <label>Description</label>
                      <textarea name="description" value={newBouquet.description} onChange={handleBouquetInputChange} placeholder="Describe your flower bouquet..." rows="3" />
                    </div>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Category (Flower Type)</label>
                        <select name="category" value={newBouquet.category} onChange={handleBouquetInputChange}>
                          <option value="Rose">Rose Bouquet</option>
                          <option value="Lily">Lily Bouquet</option>
                          <option value="Sunflower">Sunflower Bouquet</option>
                          <option value="Orchid">Orchid Bouquet</option>
                          <option value="Tulip">Tulip Bouquet</option>
                          <option value="Carnation">Carnation Bouquet</option>
                          <option value="Mixed">Mixed Bouquet</option>
                        </select>
                      </div>
                      <div className="form_group">
                        <label>Bouquet Image *</label>
                        <input type="file" accept="image/*" onChange={handleBouquetFileChange} className="file_input" required />
                        {bouquetPreview && <img src={bouquetPreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px', marginTop: '10px', border: '1px solid #ddd' }} />}
                      </div>
                    </div>
                    <button type="submit" className="submit_btn" style={{ background: 'linear-gradient(135deg, #e75480, #ff9a9e)' }}>💐 Add Bouquet</button>
                  </form>
                )}

                {/* Edit form for bouquets */}
                {showEditForm && editingCake && editingCake.type === 'bouquet' && (
                  <form className="add_cake_form edit_form" onSubmit={handleUpdateCake}>
                    <div className="section_header"><h3>✏️ Edit Bouquet: {editingCake.name}</h3></div>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Bouquet Name *</label>
                        <input type="text" name="name" value={editingCake.name} onChange={handleUpdateInputChange} required />
                      </div>
                      <div className="form_group">
                        <label>Price *</label>
                        <input type="number" name="price" value={editingCake.price} onChange={handleUpdateInputChange} step="0.01" required />
                      </div>
                    </div>
                    <div className="form_group">
                      <label>Description</label>
                      <textarea name="description" value={editingCake.description} onChange={handleUpdateInputChange} rows="3" />
                    </div>
                    <div className="form_row">
                      <div className="form_group">
                        <label>Category (Flower Type)</label>
                        <select name="category" value={editingCake.category} onChange={handleUpdateInputChange}>
                          <option value="Rose">Rose Bouquet</option><option value="Lily">Lily Bouquet</option>
                          <option value="Sunflower">Sunflower Bouquet</option><option value="Orchid">Orchid Bouquet</option>
                          <option value="Tulip">Tulip Bouquet</option><option value="Carnation">Carnation Bouquet</option>
                          <option value="Mixed">Mixed Bouquet</option>
                        </select>
                      </div>
                      <div className="form_group">
                        <label>Stock</label>
                        <input type="number" name="stock" value={editingCake.stock} onChange={handleUpdateInputChange} min="0" />
                      </div>
                    </div>
                    <div className="form_group">
                      <label>New Image (leave blank to keep current)</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="file_input" />
                      {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px', marginTop: '10px' }} />}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="submit_btn" style={{ background: 'linear-gradient(135deg, #e75480, #ff9a9e)' }} disabled={loading}>{loading ? 'Updating...' : 'Save Changes'}</button>
                      <button type="button" onClick={() => { setShowEditForm(false); setEditingCake(null); }} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                )}

                {/* Bouquets List */}
                <div className="cakes_section">
                  {cakes.filter(p => p.type === 'bouquet').length > 0 ? (
                    <div className="cakes_table">
                      <table>
                        <thead>
                          <tr><th>Image</th><th>Name</th><th>Flower Type</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {cakes.filter(p => p.type === 'bouquet').map((bouquet) => (
                            <tr key={bouquet.id}>
                              <td><img src={bouquet.image} alt={bouquet.name} className="cake_thumb" /></td>
                              <td><strong>{bouquet.name}</strong><p className="cake_desc">{bouquet.description}</p></td>
                              <td><span className="category_badge" style={{ background: '#fce4ec', color: '#c2185b' }}>🌸 {bouquet.category}</span></td>
                              <td>Rs{bouquet.price.toFixed(2)}</td>
                              <td><span className={bouquet.isActive ? 'status_active' : 'status_inactive'}>{bouquet.isActive ? 'Active' : 'Hidden'}</span></td>
                              <td>
                                <button className="edit_btn" onClick={() => handleEditClick(bouquet)}>Edit</button>
                                <button className="delete_btn" onClick={() => handleDeleteCake(bouquet.id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty_cakes"><p>💐 No flower bouquets yet. Add your first bouquet to start selling!</p></div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════ BANK TAB ══════════════════ */}
        {activeTab === 'bank' && (
          <div className="bank_section">
            <div className="section_header">
              <h2>Bank Details</h2>
              <button className="edit_bank_btn" onClick={() => setShowBankForm(!showBankForm)}>
                {showBankForm ? 'Cancel' : (bankDetails.bankName ? 'Edit Details' : 'Add Details')}
              </button>
            </div>
            {bankDetails.bankName && !showBankForm && (
              <div className="bank_info">
                <div className="info_row"><span className="label">Bank Name:</span><span className="value">{bankDetails.bankName}</span></div>
                <div className="info_row"><span className="label">Account Holder:</span><span className="value">{bankDetails.accountHolderName}</span></div>
                <div className="info_row"><span className="label">Account Number:</span><span className="value">{bankDetails.accountNumber}</span></div>
                <div className="info_row"><span className="label">Branch:</span><span className="value">{bankDetails.branch}</span></div>
                <div className="info_row"><span className="label">SWIFT Code:</span><span className="value">{bankDetails.swiftCode}</span></div>
              </div>
            )}
            {showBankForm && (
              <form className="bank_form" onSubmit={handleSaveBankDetails}>
                <div className="form_row">
                  <div className="form_group">
                    <label>Bank Name *</label>
                    <input type="text" name="bankName" value={bankDetails.bankName} onChange={handleBankInputChange} placeholder="e.g., Bank of Ceylon" required />
                  </div>
                  <div className="form_group">
                    <label>Account Holder Name *</label>
                    <input type="text" name="accountHolderName" value={bankDetails.accountHolderName} onChange={handleBankInputChange} placeholder="Full name as per bank" required />
                  </div>
                </div>
                <div className="form_row">
                  <div className="form_group">
                    <label>Account Number *</label>
                    <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleBankInputChange} placeholder="Your account number" required />
                  </div>
                  <div className="form_group">
                    <label>Branch</label>
                    <input type="text" name="branch" value={bankDetails.branch} onChange={handleBankInputChange} placeholder="Branch name/location" />
                  </div>
                </div>
                <div className="form_group">
                  <label>SWIFT Code</label>
                  <input type="text" name="swiftCode" value={bankDetails.swiftCode} onChange={handleBankInputChange} placeholder="SWIFT/BIC code" />
                </div>
                <button type="submit" className="submit_btn">Save Bank Details</button>
              </form>
            )}
          </div>
        )}

        {/* ══════════════════ PAYMENTS TAB ══════════════════ */}
        {activeTab === 'payments' && (
          <div className="payments_section">
            <div className="section_header">
              <h2>Weekly Payments</h2>
              <p>Your earnings are paid weekly to your Sri Lankan bank account.</p>
            </div>
            <div className="payment_schedule">
              <div className="schedule_info">
                <h3>Payment Schedule</h3>
                <p>Payments are processed every Friday for the previous week&apos;s sales.</p>
              </div>
            </div>
            <div className="payments_table">
              <table>
                <thead><tr><th>Week</th><th>Earnings</th><th>Status</th><th>Payment Date</th></tr></thead>
                <tbody>
                  <tr><td>March 10-16, 2026</td><td>Rs2,450.00</td><td><span className="status_pending">Pending</span></td><td>March 21, 2026</td></tr>
                  <tr><td>March 3-9, 2026</td><td>Rs3,200.00</td><td><span className="status_completed">Completed</span></td><td>March 14, 2026</td></tr>
                  <tr><td>Feb 24-Mar 2, 2026</td><td>Rs1,850.00</td><td><span className="status_completed">Completed</span></td><td>March 7, 2026</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════ PROFILE TAB ══════════════════ */}
        {activeTab === 'profile' && (
          <div className="profile_section">
            <ProfileSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
