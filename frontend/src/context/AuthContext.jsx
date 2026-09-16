import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api';

const AuthContext = createContext();

export const DEMO_PERSONAS = [
  { label: 'Citizen (Ganesh Borade)', email: 'ganesh@citizen.org', password: 'citizen123', role: 'CITIZEN' },
  { label: 'Administrator (Civic Admin)', email: 'admin@civic.gov', password: 'admin123', role: 'ADMIN' },
  { label: 'Road Dept Officer (Ramesh)', email: 'road.officer@civic.gov', password: 'officer123', role: 'EMPLOYEE' },
  { label: 'Water Dept Officer (Priya)', email: 'water.officer@civic.gov', password: 'officer123', role: 'EMPLOYEE' }
];

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
          // Verify with backend
          const res = await getMeApi();
          setUser(res.data);
          localStorage.setItem('civic_user', JSON.stringify(res.data));
        } catch (e) {
          console.warn('Session expired or backend offline, keeping cached user for demo UI');
        }
      } else {
        // Automatically default to Ganesh Borade for seamless first impression demo!
        quickLogin('ganesh@citizen.org', 'citizen123');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      const data = res.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('civic_token', data.token);
      localStorage.setItem('civic_user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      // Fallback for offline demo mode
      const matched = DEMO_PERSONAS.find(p => p.email === email);
      if (matched) {
        const fallbackUser = {
          id: email.includes('admin') ? 1 : (email.includes('road') ? 2 : 5),
          name: matched.label.split('(')[1]?.replace(')', '') || 'Demo User',
          email: matched.email,
          role: matched.role,
          departmentName: matched.role === 'EMPLOYEE' ? 'Road & Infrastructure Department' : null
        };
        setUser(fallbackUser);
        localStorage.setItem('civic_user', JSON.stringify(fallbackUser));
        return { success: true };
      }
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const quickLogin = async (email, password) => {
    return login(email, password);
  };

  const register = async (userData) => {
    try {
      const res = await registerApi(userData);
      const data = res.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('civic_token', data.token);
      localStorage.setItem('civic_user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civic_token');
    localStorage.removeItem('civic_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
