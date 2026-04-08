import { create } from 'zustand';
import axios from 'axios';

export const API_URL = '/api'; // Netlify redirect handles /api/* -> /.netlify/functions/api/*


const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  role: localStorage.getItem('role') || null,
  token: localStorage.getItem('token') || null,
  error: null,
  loading: false,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);

      set({
        user: userData,
        isAuthenticated: true,
        role: userData.role,
        token: access_token,
        loading: false
      });
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      set({
        error: err.response?.data?.detail || 'Invalid credentials or server error',
        loading: false
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    set({ user: null, isAuthenticated: false, role: null, token: null });
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
