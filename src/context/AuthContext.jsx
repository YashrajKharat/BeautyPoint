import { createContext, useState, useCallback, useEffect } from 'react';
import { userAPI } from '../services/api.js';
import { supabase } from '../SupabaseClient.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial user check
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('userRole');
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      userAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  // Handle Supabase Auth Changes (Google Login Callback)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { user: authUser } = session;
          const email = authUser.email;
          const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Google User';

          // Verify with Backend
          const response = await userAPI.googleLogin({ email, name });

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userRole', response.data.user.role);
          setToken(response.data.token);
          setUserRole(response.data.user.role);
          setUser(response.data.user);
        } catch (error) {
          console.error('Google Sync Failed:', error);
        }
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google Auth Init Failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole(null);
    setUser(null);
    supabase.auth.signOut(); // Ensure Supabase session is cleared too
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
      login,
      loginWithWhatsApp,
      loginWithGoogle,
      logout,
      getProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
