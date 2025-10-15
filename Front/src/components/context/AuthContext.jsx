// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { setTokenExpirationHandler } from '../../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access_token, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle token expiration
  const handleTokenExpiration = () => {
    console.log('Token expired, logging out user');
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  useEffect(() => {
    // Check for existing user session on app load
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('access_token');
    
    if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
      setAccessToken(storedAccessToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } else if (storedAccessToken && isTokenExpired(storedAccessToken)) {
      // Token is expired, clear it
      console.log('Stored token is expired, clearing session');
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
    
    setLoading(false);
  }, []);

  // Set up token expiration handler for API interceptor
  useEffect(() => {
    setTokenExpirationHandler(handleTokenExpiration);
  }, []);

  // Periodic token expiration check (every 30 seconds)
  useEffect(() => {
    if (!access_token) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(access_token)) {
        handleTokenExpiration();
      }
    };

    const interval = setInterval(checkTokenExpiration, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [access_token]);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    // Note: We removed useNavigate from here - navigation should be handled in components
  };

  const value = {
    user,
    token: access_token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!access_token && !isTokenExpired(access_token),
    isTokenExpired: () => isTokenExpired(access_token),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}