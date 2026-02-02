import { createContext, useState, useCallback } from 'react';
import { userAPI } from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(async (name, email, password, role = 'user') => {
    setIsLoading(true);
    try {
      const response = await userAPI.register({ name, email, password, role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      setToken(response.data.token);
      setUserRole(response.data.user.role);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, role = 'user') => {
    setIsLoading(true);
    try {
      const response = await userAPI.login({ email, password, role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      setToken(response.data.token);
      setUserRole(response.data.user.role);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithWhatsApp = useCallback(async (phone, name) => {
    setIsLoading(true);
    try {
      const response = await userAPI.whatsappLogin({ phone, name });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      setToken(response.data.token);
      setUserRole(response.data.user.role);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'WhatsApp login failed';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole(null);
    setUser(null);
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      userRole,
      isLoading,
      isAuthenticated: !!token,
      register,
      register,
      login,
      loginWithWhatsApp,
      logout,
      getProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
