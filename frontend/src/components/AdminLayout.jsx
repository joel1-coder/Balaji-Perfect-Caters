import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/adminResponsive.css';

const navItems = [
  { icon: '📊', label: 'Executive Overview', path: '/admin/overview' },
  { icon: '🍽️', label: 'Menu Management',    path: '/admin/menu-items' },
  { icon: '📈', label: 'Transaction Audit',  path: '/admin/audit' },
  { icon: '👥', label: 'Staff Management',   path: '/admin/staff' },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('canteen_auth');
    navigate('/login');
  };

  return (
    <div className="admin-page">
      {/* ──── Sidebar ──── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#0f2444"/>
              <path d="M7 20L14 8L21 20H7Z" fill="white" opacity="0.9"/>
              <circle cx="14" cy="14" r="3" fill="#38bdf8"/>
            </svg>
          </div>
          <div>
            <div className="admin-brand-name">Balaji Perfect Caters</div>
            <div className="admin-brand-sub">Admin Terminal</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-switch-btn" onClick={() => navigate('/quickbill')}>
            ⚡ Switch to Admin
          </button>
          <button className="admin-nav-item" style={{color: '#64748b'}} onClick={() => navigate('/admin/settings')}>
            <span className="admin-nav-icon">⚙️</span> Settings
          </button>
          <button className="admin-nav-item" style={{color: '#ef4444'}} onClick={handleLogout}>
            <span className="admin-nav-icon">↪️</span> Logout
          </button>
        </div>
      </aside>

      {/* ──── Page Content ──── */}
      <div className="admin-content">{children}</div>
    </div>
  );
};



export default AdminLayout;
