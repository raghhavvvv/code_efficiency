// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import ChallengesPage from './pages/ChallengesPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="" element={<AdminDashboardPage />} />
      </Route>

      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
    </Routes>
  );
}

export default App;