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

  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = login(formData.email, formData.password);

      if (result.success) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        navigate(user.role === 'seller' ? '/seller/dashboard' : '/');
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
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
                  navigate(user.role === 'seller' ? '/seller/dashboard' : '/');
                } else {
                  setError(result.message);
                }
              }}
            >
              Continue with Google
            </button>
          </div>

          {error && <div className="error_message">{error}</div>}

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
              <a href="#forgot">Forgot password?</a>
            </div>

            <button type="submit" className="auth_submit_btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth_footer">
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="demo_credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Buyer:</strong> buyer@test.com / password123</p>
            <p><strong>Seller:</strong> seller@test.com / password123</p>
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
