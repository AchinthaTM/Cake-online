import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cakes, setCakes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branch: '',
    swiftCode: ''
  });
  const [showBankForm, setShowBankForm] = useState(false);
  const [newCake, setNewCake] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Chocolate',
    image: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    // Load seller's cakes from localStorage
    const sellerCakes = JSON.parse(localStorage.getItem(`cakes_Rs{user.id}`) || '[]');
    setCakes(sellerCakes);

    // Load bank details
    const savedBankDetails = JSON.parse(localStorage.getItem(`bank_Rs{user.id}`) || 'null');
    if (savedBankDetails) {
      setBankDetails(savedBankDetails);
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setNewCake({
      ...newCake,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCake = (e) => {
    e.preventDefault();
    
    if (!newCake.name || !newCake.price || !newCake.image) {
      alert('Please fill in all required fields');
      return;
    }

    const cake = {
      id: Date.now(),
      sellerId: user.id,
      ...newCake,
      price: parseFloat(newCake.price),
      createdAt: new Date().toISOString(),
    };

    const updatedCakes = [...cakes, cake];
    setCakes(updatedCakes);
    localStorage.setItem(`cakes_Rs{user.id}`, JSON.stringify(updatedCakes));
    
    setNewCake({
      name: '',
      description: '',
      price: '',
      category: 'Chocolate',
      image: '',
    });
    setShowAddForm(false);
    alert('Cake added successfully!');
  };

  const handleDeleteCake = (cakeId) => {
    const updatedCakes = cakes.filter(c => c.id !== cakeId);
    setCakes(updatedCakes);
    localStorage.setItem(`cakes_Rs{user.id}`, JSON.stringify(updatedCakes));
  };

  const handleBankInputChange = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveBankDetails = (e) => {
    e.preventDefault();
    localStorage.setItem(`bank_Rs{user.id}`, JSON.stringify(bankDetails));
    setShowBankForm(false);
    alert('Bank details saved successfully!');
  };

  const totalRevenue = cakes.reduce((sum, cake) => sum + (cake.price || 0), 0);

  return (
    <div className="seller_dashboard">
      <div className="dashboard_container">
        {/* Header */}
        <div className="dashboard_header">
          <div className="header_content">
            <h1>Seller Dashboard</h1>
            <p>Manage your products, payments and more</p>
          </div>
          <div className="header_actions">
            <div className="seller_info">
              <span>Welcome, {user?.firstName}!</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard_tabs">
          <button 
            className={`tab_btn Rs{activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`tab_btn Rs{activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            Bank Details
          </button>
          <button 
            className={`tab_btn Rs{activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <>
            {/* Stats */}
            <div className="dashboard_stats">
              <div className="stat_card">
                <div className="stat_icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
                    <path d="M2 21h20" />
                  </svg>
                </div>
                <div className="stat_content">
                  <h3>Total Cakes</h3>
                  <p className="stat_value">{cakes.length}</p>
                </div>
              </div>

              <div className="stat_card">
                <div className="stat_icon revenue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="stat_content">
                  <h3>Total Value</h3>
                  <p className="stat_value">Rs{totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="stat_card">
                <div className="stat_icon orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                </div>
                <div className="stat_content">
                  <h3>Orders</h3>
                  <p className="stat_value">0</p>
                </div>
              </div>
            </div>

            {/* Add Cake Section */}
            <div className="add_cake_section">
              <div className="section_header">
                <h2>My Cakes</h2>
                <button 
                  className="add_cake_btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'Cancel' : '+ Add New Cake'}
                </button>
              </div>

              {showAddForm && (
                <form className="add_cake_form" onSubmit={handleAddCake}>
                  <div className="form_row">
                    <div className="form_group">
                      <label>Cake Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={newCake.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Chocolate Delight"
                        required
                      />
                    </div>
                    <div className="form_group">
                      <label>Price *</label>
                      <input
                        type="number"
                        name="price"
                        value={newCake.price}
                        onChange={handleInputChange}
                        placeholder="Rs 0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="form_group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newCake.description}
                      onChange={handleInputChange}
                      placeholder="Describe your cake..."
                      rows="3"
                    />
                  </div>

                  <div className="form_row">
                    <div className="form_group">
                      <label>Category</label>
                      <select 
                        name="category" 
                        value={newCake.category}
                        onChange={handleInputChange}
                      >
                        <option>Chocolate</option>
                        <option>Vanilla</option>
                        <option>Fruit</option>
                        <option>Special</option>
                        <option>Caramel</option>
                      </select>
                    </div>
                    <div className="form_group">
                      <label>Image URL *</label>
                      <input
                        type="url"
                        name="image"
                        value={newCake.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit_btn">Add Cake</button>
                </form>
              )}
            </div>

            {/* Cakes List */}
            <div className="cakes_section">
              {cakes.length > 0 ? (
                <div className="cakes_table">
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cakes.map((cake) => (
                        <tr key={cake.id}>
                          <td>
                            <img src={cake.image} alt={cake.name} className="cake_thumb" />
                          </td>
                          <td>
                            <strong>{cake.name}</strong>
                            <p className="cake_desc">{cake.description}</p>
                          </td>
                          <td>
                            <span className="category_badge">{cake.category}</span>
                          </td>
                          <td>Rs{cake.price.toFixed(2)}</td>
                          <td>
                            <span className="status_active">Active</span>
                          </td>
                          <td>
                            <button className="edit_btn">Edit</button>
                            <button 
                              className="delete_btn"
                              onClick={() => handleDeleteCake(cake.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty_cakes">
                  <p>No cakes yet. Add your first cake to get started!</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'bank' && (
          <div className="bank_section">
            <div className="section_header">
              <h2>Bank Details</h2>
              <button 
                className="edit_bank_btn"
                onClick={() => setShowBankForm(!showBankForm)}
              >
                {showBankForm ? 'Cancel' : (bankDetails.bankName ? 'Edit Details' : 'Add Details')}
              </button>
            </div>

            {bankDetails.bankName && !showBankForm && (
              <div className="bank_info">
                <div className="info_row">
                  <span className="label">Bank Name:</span>
                  <span className="value">{bankDetails.bankName}</span>
                </div>
                <div className="info_row">
                  <span className="label">Account Holder:</span>
                  <span className="value">{bankDetails.accountHolderName}</span>
                </div>
                <div className="info_row">
                  <span className="label">Account Number:</span>
                  <span className="value">{bankDetails.accountNumber}</span>
                </div>
                <div className="info_row">
                  <span className="label">Branch:</span>
                  <span className="value">{bankDetails.branch}</span>
                </div>
                <div className="info_row">
                  <span className="label">SWIFT Code:</span>
                  <span className="value">{bankDetails.swiftCode}</span>
                </div>
              </div>
            )}

            {showBankForm && (
              <form className="bank_form" onSubmit={handleSaveBankDetails}>
                <div className="form_row">
                  <div className="form_group">
                    <label>Bank Name *</label>
                    <input
                      type="text"
                      name="bankName"
                      value={bankDetails.bankName}
                      onChange={handleBankInputChange}
                      placeholder="e.g., Bank of Ceylon"
                      required
                    />
                  </div>
                  <div className="form_group">
                    <label>Account Holder Name *</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={bankDetails.accountHolderName}
                      onChange={handleBankInputChange}
                      placeholder="Full name as per bank"
                      required
                    />
                  </div>
                </div>

                <div className="form_row">
                  <div className="form_group">
                    <label>Account Number *</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={handleBankInputChange}
                      placeholder="Your account number"
                      required
                    />
                  </div>
                  <div className="form_group">
                    <label>Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={bankDetails.branch}
                      onChange={handleBankInputChange}
                      placeholder="Branch name/location"
                    />
                  </div>
                </div>

                <div className="form_group">
                  <label>SWIFT Code</label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={bankDetails.swiftCode}
                    onChange={handleBankInputChange}
                    placeholder="SWIFT/BIC code"
                  />
                </div>

                <button type="submit" className="submit_btn">Save Bank Details</button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments_section">
            <div className="section_header">
              <h2>Weekly Payments</h2>
              <p>Your earnings are paid weekly to your Sri Lankan bank account.</p>
            </div>

            <div className="payment_schedule">
              <div className="schedule_info">
                <h3>Payment Schedule</h3>
                <p>Payments are processed every Friday for the previous week's sales.</p>
                <p>Next payment: Friday, March 21, 2026</p>
              </div>
            </div>

            <div className="payments_table">
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Earnings</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>March 10-16, 2026</td>
                    <td>Rs2,450.00</td>
                    <td><span className="status_pending">Pending</span></td>
                    <td>March 21, 2026</td>
                  </tr>
                  <tr>
                    <td>March 3-9, 2026</td>
                    <td>Rs3,200.00</td>
                    <td><span className="status_completed">Completed</span></td>
                    <td>March 14, 2026</td>
                  </tr>
                  <tr>
                    <td>Feb 24-Mar 2, 2026</td>
                    <td>Rs1,850.00</td>
                    <td><span className="status_completed">Completed</span></td>
                    <td>March 7, 2026</td>
                  </tr>
                  <tr>
                    <td>Feb 17-23, 2026</td>
                    <td>Rs2,950.00</td>
                    <td><span className="status_completed">Completed</span></td>
                    <td>Feb 28, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
