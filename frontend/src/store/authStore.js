import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/auth/register', userData);
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      // Logout
      logout: async () => {
        try {
          if (get().token) {
            await axios.post('/auth/logout');
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });

          // Remove axios default header
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await axios.put('/auth/profile', profileData);
          const { user } = response.data;
          
          set({ user });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Profile update failed' 
          };
        }
      },

      // Refresh user data
      refreshUser: async () => {
        try {
          const response = await axios.get('/auth/me');
          const { user } = response.data;
          set({ user });
          return { success: true };
        } catch (error) {
          // If token is invalid, logout
          if (error.response?.status === 401) {
            get().logout();
          }
          return { success: false };
        }
      },

      // Initialize auth from persisted data
      initializeAuth: () => {
        const { token } = get();
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          get().refreshUser();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
