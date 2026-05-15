import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/adminResponsive.css';

const navItems = [
  { icon: '📊', label: 'Executive Overview', path: '/admin/overview' },
  { icon: '🍽️', label: 'Menu Management',    path: '/admin/menu-items' },
  { icon: '📈', label: 'Transaction Audit',  path: '/admin/audit' },
  { icon: '👥', label: 'Staff Management',   path: '/admin/staff' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: '💳', title: 'New Transaction', message: 'BB5119 — ₹305.00 marked as PAID', time: '2 min ago', read: false },
  { id: 2, icon: '⚠️', title: 'Unpaid Order Alert', message: 'BB4627 — ₹305.00 is still UNPAID', time: '18 min ago', read: false },
  { id: 3, icon: '👤', title: 'New Staff Added', message: 'Rahul Sharma (EMP-9421) added to roster', time: '1 hr ago', read: false },
  { id: 4, icon: '🍽️', title: 'Menu Updated', message: 'Veg Biryani price changed to ₹80', time: '3 hrs ago', read: true },
  { id: 5, icon: '✅', title: 'Order Cleared', message: 'BB2295 — ₹320.00 cleared successfully', time: 'Yesterday', read: true },
];

const AdminLayout = ({ children }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotif, setShowNotif]   = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleLogout = () => {
    localStorage.removeItem('canteen_auth');
    navigate('/login');
  };

  const adminUser = localStorage.getItem('canteen_user') || 'Admin';

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
          <button className="admin-switch-btn" onClick={() => navigate('/user/billing')}>
            ⚡ Switch to Operator
          </button>
          <button className="admin-nav-item" style={{color: '#64748b'}} onClick={() => navigate('/admin/settings')}>
            <span className="admin-nav-icon">⚙️</span> Settings
          </button>
          <button className="admin-nav-item" style={{color: '#ef4444'}} onClick={handleLogout}>
            <span className="admin-nav-icon">↪️</span> Logout
          </button>
        </div>
      </aside>

      {/* ──── Main Area ──── */}
      <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top Header Bar ── */}
        <header style={s.topBar}>
          <div style={s.topLeft}>
            {/* Current page title derived from navItems */}
            <span style={s.pageLabel}>
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>
          <div style={s.topRight}>

            {/* 🔔 Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                style={s.bellBtn}
                onClick={() => setShowNotif(v => !v)}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={s.badge}>{unreadCount}</span>
                )}
              </button>

              {/* Dropdown Panel */}
              {showNotif && (
                <div style={s.dropdown}>
                  <div style={s.dropHeader}>
                    <span style={s.dropTitle}>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <button style={s.markAllBtn} onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={s.notifList}>
                    {notifications.length === 0 ? (
                      <div style={s.emptyState}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          style={{ ...s.notifItem, backgroundColor: n.read ? 'white' : '#eff6ff' }}
                          onClick={() => markOneRead(n.id)}
                        >
                          <div style={s.notifIconWrap}>{n.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={s.notifTitle}>
                              {n.title}
                              {!n.read && <span style={s.unreadDot} />}
                            </div>
                            <div style={s.notifMsg}>{n.message}</div>
                            <div style={s.notifTime}>{n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={s.dropFooter}>
                    <button style={s.clearBtn} onClick={() => setNotifications([])}>
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar */}
            <div style={s.adminBadge}>
              <div style={s.adminAvatar}>
                {adminUser.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={s.adminName}>{adminUser.charAt(0).toUpperCase() + adminUser.slice(1)}</div>
                <div style={s.adminRole}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
};

const s = {
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px', backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0', flexShrink: 0, zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  pageLabel: { fontSize: '1rem', fontWeight: '700', color: '#0f172a', fontFamily: "'Outfit', sans-serif" },
  topRight: { display: 'flex', alignItems: 'center', gap: '16px' },

  // Bell
  bellBtn: {
    position: 'relative', width: '40px', height: '40px', borderRadius: '10px',
    border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer',
    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  badge: {
    position: 'absolute', top: '-6px', right: '-6px',
    backgroundColor: '#ef4444', color: 'white',
    fontSize: '0.65rem', fontWeight: '800', minWidth: '18px', height: '18px',
    borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 4px', border: '2px solid white',
  },

  // Dropdown
  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    width: '340px', backgroundColor: 'white', borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
    zIndex: 9999, overflow: 'hidden',
  },
  dropHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 18px 12px', borderBottom: '1px solid #f1f5f9',
  },
  dropTitle: { fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif" },
  markAllBtn: {
    fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none',
    cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif",
  },
  notifList: { maxHeight: '320px', overflowY: 'auto' },
  notifItem: {
    display: 'flex', gap: '12px', padding: '12px 18px',
    cursor: 'pointer', borderBottom: '1px solid #f8fafc',
    transition: 'background 0.15s', alignItems: 'flex-start',
  },
  notifIconWrap: {
    fontSize: '1.2rem', width: '36px', height: '36px', borderRadius: '8px',
    backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  notifTitle: {
    fontSize: '0.85rem', fontWeight: '700', color: '#0f172a',
    fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
  },
  unreadDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    backgroundColor: '#3b82f6', display: 'inline-block', flexShrink: 0,
  },
  notifMsg: { fontSize: '0.78rem', color: '#64748b', marginTop: '2px', fontFamily: "'Outfit', sans-serif" },
  notifTime: { fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontFamily: "'Outfit', sans-serif" },
  emptyState: { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' },
  dropFooter: { padding: '12px 18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' },
  clearBtn: {
    fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none',
    cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif",
  },

  // Admin Avatar
  adminBadge: { display: 'flex', alignItems: 'center', gap: '10px' },
  adminAvatar: {
    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0f2444',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '0.9rem', flexShrink: 0,
  },
  adminName: { fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', fontFamily: "'Outfit', sans-serif" },
  adminRole: { fontSize: '0.68rem', color: '#94a3b8', fontFamily: "'Outfit', sans-serif" },
};

export default AdminLayout;
