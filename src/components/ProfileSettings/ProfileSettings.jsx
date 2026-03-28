import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user, updateUser, verifyEmailChange } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Sri Lanka'
    },
    sellerInfo: {
      businessName: user?.sellerInfo?.businessName || '',
      description: user?.sellerInfo?.description || ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'Sri Lanka'
        },
        sellerInfo: {
          businessName: user.sellerInfo?.businessName || '',
          description: user.sellerInfo?.description || ''
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        updateUser(data.data);
        setMessage({ type: 'success', text: data.message });
        setIsEditing(false);
        if (data.emailChangePending) {
          setShowOtpInput(true);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await verifyEmailChange(otp);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setShowOtpInput(false);
      setOtp('');
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="profile_settings">
      <div className="profile_header">
        <h2>Profile Information</h2>
        {!isEditing && !showOtpInput && (
          <button className="edit_btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {showOtpInput && (
        <div className="otp_verification">
          <h3>Verify Your New Email</h3>
          <p>Please enter the 6-digit code sent to <strong>{formData.email}</strong></p>
          <form onSubmit={handleVerifyOtp}>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength="6" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button type="button" className="cancel_btn" onClick={() => setShowOtpInput(false)}>Verify Later</button>
          </form>
        </div>
      )}

      <form onSubmit={handleSubmit} className={isEditing ? 'editing' : 'viewing'}>
        <div className="form_section">
          <h3>Personal Details</h3>
          <div className="form_row">
            <div className="form_group">
              <label>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form_group">
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                required
              />
            </div>
          </div>
          <div className="form_row">
            <div className="form_group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form_group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="form_section">
          <h3>Delivery Address</h3>
          <div className="form_group">
            <label>Street Address</label>
            <input 
              type="text" 
              name="address.street" 
              value={formData.address.street} 
              onChange={handleInputChange} 
              disabled={!isEditing}
            />
          </div>
          <div className="form_row">
            <div className="form_group">
              <label>City</label>
              <input 
                type="text" 
                name="address.city" 
                value={formData.address.city} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>
            <div className="form_group">
              <label>State/Province</label>
              <input 
                type="text" 
                name="address.state" 
                value={formData.address.state} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="form_row">
            <div className="form_group">
              <label>Zip/Postal Code</label>
              <input 
                type="text" 
                name="address.zipCode" 
                value={formData.address.zipCode} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>
            <div className="form_group">
              <label>Country</label>
              <input 
                type="text" 
                name="address.country" 
                value={formData.address.country} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {user?.role === 'seller' && (
          <div className="form_section">
            <h3>Business Information</h3>
            <div className="form_group">
              <label>Business Name</label>
              <input 
                type="text" 
                name="sellerInfo.businessName" 
                value={formData.sellerInfo.businessName} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>
            <div className="form_group">
              <label>Business Description</label>
              <textarea 
                name="sellerInfo.description" 
                value={formData.sellerInfo.description} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                rows="4"
              />
            </div>
          </div>
        )}

        {isEditing && (
          <div className="form_actions">
            <button type="submit" className="save_btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="cancel_btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileSettings;
