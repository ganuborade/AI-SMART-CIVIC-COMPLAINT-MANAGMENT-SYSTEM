import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civic_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('civic_token');
      const savedUser = localStorage.getItem('civic_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Strictly verify token validity with backend
          const res = await getMeApi();
          setUser(res.data);
          localStorage.setItem('civic_user', JSON.stringify(res.data));
        } catch (e) {
          console.warn('Session expired or invalid credentials, clearing session.');
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginApi(email.trim(), password);
      const data = res.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('civic_token', data.token);
      localStorage.setItem('civic_user', JSON.stringify(data));
      return { success: true, user: data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Invalid email or password. Please check your credentials.';
      return { success: false, message: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerApi(userData);
      const data = res.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('civic_token', data.token);
      localStorage.setItem('civic_user', JSON.stringify(data));
      return { success: true, user: data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Registration failed. Please verify your details.';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civic_token');
    localStorage.removeItem('civic_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
