// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the AuthContext
export const AuthContext = createContext();

// Custom hook to consume AuthContext
export const useAuthContext = () => {
  return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // On first load, see if there's a saved token in localStorage
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      decodeAndSetUser(storedToken);
    }
    setIsAuthLoading(false);
  }, []);

  const decodeAndSetUser = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser({
        user_id: decoded.user_id,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        username: decoded.username,
      });
    } catch (error) {
      console.error('JWT decode error:', error);
      clearAuth();
    }
  };

  const saveAuth = (token) => {
    localStorage.setItem('access_token', token);
    setAccessToken(token);
    decodeAndSetUser(token);
  };

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, saveAuth, clearAuth, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
