import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setMessage('A reset link has been sent to your email.');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth_page forgot_password_page">
      <div className="auth_container">
        <div className="auth_form_wrapper">
          <div className="auth_header">
            <h1>Forgot Password?</h1>
            <p>Enter your email to receive a password reset link</p>
          </div>

          {error && <div className="error_message">{error}</div>}
          {message && <div className="success_message">{message}</div>}

          {!message ? (
            <form className="auth_form" onSubmit={handleSubmit}>
              <div className="form_group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="auth_submit_btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="reset_success_actions">
              <p>Please check your inbox and follow the instructions to reset your password.</p>
              <Link to="/login" className="back_to_login_btn">Back to Login</Link>
            </div>
          )}

          <div className="auth_footer">
            <p>
              Remember your password? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>

        <div className="auth_image">
          <div className="auth_image_content">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2>Secure Reset</h2>
            <p>Protecting your Sweet Delights account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
