import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const register = (userData) => {
    // Store user data in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.find(u => u.email === userData.email);
    
    if (userExists) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true, message: 'Registration successful' };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, message: 'Invalid email or password' };
    }

    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // simulate a Google sign-in flow
  const loginWithGoogle = (preferredRole = 'buyer') => {
    // in a real app you would call Google's OAuth APIs here.
    // for this demo we'll just prompt for an email address
    const email = window.prompt('Enter your Google email');
    if (!email) {
      return { success: false, message: 'Google sign-in cancelled' };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      // create a basic user record from Google info
      foundUser = {
        id: Date.now(),
        firstName: 'Google',
        lastName: 'User',
        email,
        role: preferredRole || 'buyer',
        createdAt: new Date().toISOString(),
      };
      users.push(foundUser);
      localStorage.setItem('users', JSON.stringify(users));
    }

    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return { success: true, message: 'Google login successful' };
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
