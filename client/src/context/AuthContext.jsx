// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check auth status on initial load
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in (e.g., from a cookie)
    const checkLoggedIn = async () => {
      try {
        const { data } = await api.get('/auth/me'); // A new endpoint we need on the backend
        setUser(data);
      } catch (error) {
        console.log('Not logged in');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setUser(data);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      // You can add error handling here, e.g., showing a notification
    }
  };

  const register = async (credentials) => {
    try {
      const { data } = await api.post('/auth/register', credentials);
      setUser(data);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // A new endpoint we need on the backend
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = { user, login, register, logout, isAuthenticated: !!user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};