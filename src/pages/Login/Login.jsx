import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const { login, loginWithGoogle, verifyOTP, resendOTP } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      if (result.verificationRequired) {
        setVerificationRequired(true);
        return;
      }
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    const result = await verifyOTP(formData.email, otp);
    setLoading(false);

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccessMessage('');
    setResendLoading(true);
    const result = await resendOTP(formData.email);
    setResendLoading(false);

    if (result.success) {
      setSuccessMessage('A new code has been sent to your email.');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth_page login_page">
      <div className="auth_container">
        <div className="auth_form_wrapper">
          <div className="auth_header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          <div className="google_signup">
            <button
              type="button"
              className="google_btn"
              onClick={async () => {
                setError('');
                setLoading(true);
                const result = await loginWithGoogle();
                setLoading(false);
                if (result.success) {
                  const user = JSON.parse(localStorage.getItem('currentUser'));
                  if (user.role === 'admin') navigate('/admin/dashboard');
                  else if (user.role === 'seller') navigate('/seller/dashboard');
                  else navigate('/');
                } else {
                  setError(result.message);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {error && <div className="error_message">{error}</div>}
          {successMessage && <div className="success_message" style={{ color: '#4CAF50', marginBottom: '15px', textAlign: 'center' }}>{successMessage}</div>}

          {!verificationRequired ? (
            <form className="auth_form" onSubmit={handleSubmit}>
              <div className="form_group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form_group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form_options">
                <label className="remember_me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="auth_submit_btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="auth_form" onSubmit={handleVerifyOTP}>
              <div className="auth_header" style={{ marginBottom: '20px' }}>
                <p>We've sent a 6-digit verification code to <br /><strong>{formData.email}</strong></p>
              </div>
              <div className="form_group">
                <label>Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                />
              </div>

              <button type="submit" className="auth_submit_btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="form_options" style={{ justifyContent: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  className="resend_btn" 
                  onClick={handleResendOTP} 
                  disabled={resendLoading}
                  style={{ background: 'none', border: 'none', color: '#ff69b4', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                >
                  {resendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
                </button>
              </div>
              <button 
                type="button" 
                onClick={() => setVerificationRequired(false)}
                style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: '14px', display: 'block', margin: '15px auto 0' }}
              >
                Back to Login
              </button>
            </form>
          )}

          <div className="auth_footer">
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>

        <div className="auth_image">
          <div className="auth_image_content">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
              <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
              <path d="M2 21h20" />
              <path d="M7 8v3" />
              <path d="M12 8v3" />
              <path d="M17 8v3" />
              <path d="M7 4h.01" />
              <path d="M12 4h.01" />
              <path d="M17 4h.01" />
            </svg>
            <h2>Sweet Delights</h2>
            <p>Your favorite cake marketplace</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
