import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import { Users as UsersIcon } from 'lucide-react';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import Products from './pages/Admin/Products';
import Users from './pages/Admin/Users';
import Reports from './pages/Admin/Reports';
// Admin Dashboard Home / Summary (Placeholder for now)
const AdminHome = () => (
  <Reports />
);

import Cashier from './pages/Cashier';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  const { role } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminHome />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Cashier Routes */}
        <Route path="/pos/*" element={
          <ProtectedRoute allowedRole="cashier">
            <Cashier />
          </ProtectedRoute>
        } />

        {/* Redirect based on role if authenticated, else to login */}
        <Route path="/" element={
          role === 'admin' ? <Navigate to="/admin" replace /> :
          role === 'cashier' ? <Navigate to="/pos" replace /> :
          <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
