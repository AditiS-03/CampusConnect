import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ambassadorNav = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/tasks', icon: '🎯', label: 'Mission Board' },
  { to: '/submissions', icon: '📋', label: 'My Submissions' },
  { to: '/community', icon: '🏠', label: 'Community' },
  { to: '/chatbot', icon: '💬', label: 'Query Bot' },
];

const adminNav = [
  { to: '/admin', icon: '📊', label: 'Overview' },
  { to: '/admin/ambassadors', icon: '👥', label: 'Ambassadors' },
  { to: '/admin/verify', icon: '✅', label: 'Verify Submissions' },
  { to: '/admin/tasks', icon: '✏️', label: 'Manage Tasks' },
  { to: '/community', icon: '🏠', label: 'Community' },
  { to: '/chatbot', icon: '💬', label: 'Query Bot' },
];

export default function Layout({ children }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';
  const nav = isAdmin ? adminNav : ambassadorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-hero)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🎓</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>CampusConnect</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isAdmin ? 'Admin Panel' : 'Ambassador'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                transition: 'all 0.2s',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: isActive ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent',
              })}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px 12px 0', borderTop: '1px solid var(--border)' }}>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--gradient-hero)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {profile.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{profile.role === 'admin' ? 'Admin' : 'Ambassador'}</span>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-red)' }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
