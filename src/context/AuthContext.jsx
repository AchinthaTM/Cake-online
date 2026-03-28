import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      setUser(data.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return { success: false, message: 'Server error. Please try again later.' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      if (data.verificationRequired) {
        return { 
          success: true, 
          verificationRequired: true, 
          email: data.email,
          message: data.message 
        };
      }

      setUser(data.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: 'Server error. Please try again later.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Verification failed' };
      }

      setUser(data.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
      return { success: true, message: 'Verification successful' };
    } catch (error) {
      return { success: false, message: 'Server error. Please try again later.' };
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to resend code' };
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: 'Server error. Please try again later.' };
    }
  };

  const verifyEmailChange = async (otp) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/verify-email-change', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Verification failed' };
      }

      setUser(data.data);
      localStorage.setItem('currentUser', JSON.stringify(data.data));
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      return { success: false, message: 'Server error during email verification' };
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // simulate a Google sign-in flow
  const loginWithGoogle = async (preferredRole = 'buyer') => {
    const email = window.prompt('Enter your Google email');
    if (!email) {
      return { success: false, message: 'Google sign-in cancelled' };
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: 'Google',
          lastName: 'User',
          role: preferredRole || 'buyer'
        })
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
        return { success: true, message: 'Google login successful' };
      } else {
        return { success: false, message: data.message || 'Google login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server error during Google login' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        register,
        login,
        logout,
        updateUser,
        loginWithGoogle,
        verifyOTP,
        resendOTP,
        verifyEmailChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
