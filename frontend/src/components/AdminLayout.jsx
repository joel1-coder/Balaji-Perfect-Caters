import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/adminResponsive.css';

const navItems = [
  { icon: '📊', label: 'Executive Overview', path: '/admin/overview' },
  { icon: '🍽️', label: 'Menu Management',    path: '/admin/menu-items' },
  { icon: '📈', label: 'Transaction Audit',  path: '/admin/audit' },
  { icon: '👥', label: 'Staff Management',   path: '/admin/staff' },
  { icon: '📝', label: 'Catering Quotation', path: '/admin/quotation' },
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
  const [showNotif,  setShowNotif]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef   = useRef(null);
  const sidebarRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markOneRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleLogout = () => { localStorage.removeItem('canteen_auth'); navigate('/login'); };
  const adminUser = localStorage.getItem('canteen_user') || 'Admin';

  return (
    <div style={s.page}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ──── Sidebar ──── */}
      <aside
        ref={sidebarRef}
        className="admin-sidebar"
        style={{
          ...s.sidebar,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
      >
        <div className="admin-brand" style={s.brand}>
          <div style={s.brandIcon}>
            <img src="/bpc-logo.jpeg" alt="BPC Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={s.brandName}>Balaji Perfect Caters</div>
            <div style={s.brandSub}>Admin Terminal</div>
          </div>
        </div>

        <nav style={s.nav}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                style={{ ...s.navItem, ...(isActive ? s.navActive : {}) }}
                onClick={() => navigate(item.path)}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={s.sidebarBottom}>
          <button style={s.switchBtn} onClick={() => {
            localStorage.setItem('canteen_role', 'operator');
            localStorage.setItem('canteen_user', 'operator');
            navigate('/user/billing');
          }}>
            ⚡ Switch to Operator
          </button>
          <button style={{ ...s.navItem, color: '#64748b' }} onClick={() => navigate('/admin/settings')}>
            <span style={s.navIcon}>⚙️</span> Settings
          </button>
          <button style={{ ...s.navItem, color: '#ef4444' }} onClick={handleLogout}>
            <span style={s.navIcon}>↪️</span> Logout
          </button>
        </div>
      </aside>

      {/* ──── Main Area ──── */}
      <div style={s.main}>

        {/* ── Top Header Bar ── */}
        <header style={s.topBar}>
          <div style={s.topLeft}>
            {/* Hamburger — only visible on mobile */}
            <button
              style={s.hamburger}
              className="admin-hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Open menu"
            >
              <span style={s.hamLine} />
              <span style={s.hamLine} />
              <span style={s.hamLine} />
            </button>

            <span style={s.pageLabel}>
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>

          <div style={s.topRight}>
            {/* 🔔 Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button style={s.bellBtn} onClick={() => setShowNotif(v => !v)} title="Notifications">
                🔔
                {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
              </button>

              {showNotif && (
                <div style={s.dropdown}>
                  <div style={s.dropHeader}>
                    <span style={s.dropTitle}>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <button style={s.markAllBtn} onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>
                  <div style={s.notifList}>
                    {notifications.length === 0 ? (
                      <div style={s.emptyState}>No notifications</div>
                    ) : notifications.map(n => (
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
                    ))}
                  </div>
                  <div style={s.dropFooter}>
                    <button style={s.clearBtn} onClick={() => setNotifications([])}>Clear all</button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar */}
            <div style={s.adminBadge}>
              <div style={s.adminAvatar}>{adminUser.charAt(0).toUpperCase()}</div>
              <div style={s.adminInfo}>
                <div style={s.adminName}>{adminUser.charAt(0).toUpperCase() + adminUser.slice(1)}</div>
                <div style={s.adminRole}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
};

const s = {
  page:  { display: 'flex', height: '100vh', fontFamily: "'Outfit', sans-serif", overflow: 'hidden', position: 'relative' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 199 },

  // Sidebar
  sidebar: {
    width: '240px', flexShrink: 0, backgroundColor: '#0f2444',
    display: 'flex', flexDirection: 'column', zIndex: 200,
  },
  brand:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  brandIcon: { flexShrink: 0 },
  brandName: { fontSize: '0.95rem', fontWeight: '800', color: 'white' },
  brandSub:  { fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  nav:       { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navItem:   { display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontWeight: '500' },
  navActive: { backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: '700' },
  navIcon:   { fontSize: '1rem', width: '20px', textAlign: 'center' },
  sidebarBottom: { padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '2px' },
  switchBtn: { padding: '10px 16px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" },

  // Main
  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  content: { flex: 1, overflowY: 'auto' },

  // Top bar
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', zIndex: 100 },
  topLeft:  { display: 'flex', alignItems: 'center', gap: '12px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  pageLabel: { fontSize: '1rem', fontWeight: '700', color: '#0f172a', fontFamily: "'Outfit', sans-serif" },

  // Hamburger (hidden on desktop via CSS class)
  hamburger: { display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' },
  hamLine:   { width: '22px', height: '2.5px', backgroundColor: '#0f172a', borderRadius: '2px', display: 'block' },

  // Notification Bell
  bellBtn: { position: 'relative', width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge:    { position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '800', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid white' },

  dropdown:     { position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '340px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden' },
  dropHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 12px', borderBottom: '1px solid #f1f5f9' },
  dropTitle:    { fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif" },
  markAllBtn:   { fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },
  notifList:    { maxHeight: '320px', overflowY: 'auto' },
  notifItem:    { display: 'flex', gap: '12px', padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #f8fafc', alignItems: 'flex-start' },
  notifIconWrap:{ fontSize: '1.2rem', width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle:   { fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' },
  unreadDot:    { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block', flexShrink: 0 },
  notifMsg:     { fontSize: '0.78rem', color: '#64748b', marginTop: '2px', fontFamily: "'Outfit', sans-serif" },
  notifTime:    { fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontFamily: "'Outfit', sans-serif" },
  emptyState:   { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' },
  dropFooter:   { padding: '12px 18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' },
  clearBtn:     { fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },

  // Admin badge
  adminBadge:  { display: 'flex', alignItems: 'center', gap: '10px' },
  adminAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0f2444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem', flexShrink: 0 },
  adminInfo:   { display: 'flex', flexDirection: 'column' },
  adminName:   { fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', fontFamily: "'Outfit', sans-serif" },
  adminRole:   { fontSize: '0.68rem', color: '#94a3b8', fontFamily: "'Outfit', sans-serif" },
};

export default AdminLayout;
