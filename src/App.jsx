import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskFeed from './pages/TaskFeed';
import Submissions from './pages/Submissions';
import Leaderboard from './pages/Leaderboard';
import AIInsights from './pages/AIInsights';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminVerify from './pages/admin/AdminVerify';
import AdminAmbassadors from './pages/admin/AdminAmbassadors';
import Community from './pages/Community';
import Chatbot from './pages/Chatbot';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Ambassador routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute><Layout><TaskFeed /></Layout></ProtectedRoute>
      } />
      <Route path="/submissions" element={
        <ProtectedRoute><Layout><Submissions /></Layout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>
      } />
      <Route path="/ai-insights" element={
        <ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>
      } />
      <Route path="/chatbot" element={
        <ProtectedRoute><Layout><Chatbot /></Layout></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/tasks" element={
        <ProtectedRoute adminOnly><Layout><AdminTasks /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/verify" element={
        <ProtectedRoute adminOnly><Layout><AdminVerify /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/ambassadors" element={
        <ProtectedRoute adminOnly><Layout><AdminAmbassadors /></Layout></ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
