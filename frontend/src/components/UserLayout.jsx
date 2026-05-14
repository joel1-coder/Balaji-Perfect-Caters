import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: '🧾', label: 'Billing',       path: '/user/billing' },
  { icon: '🍽', label: 'Menu Items',    path: '/user/menu' },
];

const UserLayout = ({ children }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('canteen_auth');
    localStorage.removeItem('canteen_role');
    localStorage.removeItem('canteen_user');
    navigate('/login');
  };

  const user = localStorage.getItem('canteen_user') || 'Operator';

  return (
    <div style={styles.page}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 20L14 8L21 20H7Z" fill="white" opacity="0.9"/>
              <circle cx="14" cy="14" r="3" fill="#38bdf8"/>
            </svg>
          </div>
          <div>
            <div style={styles.brandName}>Balaji Perfect Caters</div>
            <div style={styles.brandSub}>Operator Terminal</div>
          </div>
        </div>

        {/* User Badge */}
        <div style={styles.userBadge}>
          <div style={styles.userAvatar}>{user.charAt(0).toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user.charAt(0).toUpperCase() + user.slice(1)}</div>
            <div style={styles.userRole}>Operator Terminal</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.label}
                style={{ ...styles.navItem, ...(isActive ? styles.navActive : {}) }}
                onClick={() => navigate(item.path)}>
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={styles.sidebarBottom}>
          <button style={styles.switchBtn} onClick={() => navigate('/admin/overview')}>
            ⊕ Switch to Admin
          </button>
          <button style={{ ...styles.navItem, color: 'rgba(255,255,255,0.5)' }}
            onClick={() => navigate('/user/settings')}>
            <span>⚙</span> Settings
          </button>
          <button style={{ ...styles.navItem, color: '#f87171' }} onClick={handleLogout}>
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Page Content ── */}
      <div style={styles.content}>{children}</div>
    </div>
  );
};

const styles = {
  page:    { display: 'flex', height: '100vh', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' },
  sidebar: { width: '240px', flexShrink: 0, backgroundColor: '#0f2444', display: 'flex', flexDirection: 'column' },
  brand:   { display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  brandName: { fontSize: '0.95rem', fontWeight: '800', color: 'white' },
  brandSub:  { fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', margin: '12px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(56,189,248,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', flexShrink: 0 },
  userName:   { fontSize: '0.9rem', fontWeight: '700', color: 'white' },
  userRole:   { fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' },
  nav:     { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontWeight: '500', transition: '0.15s' },
  navActive: { backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: '700' },
  navIcon:   { fontSize: '1rem', width: '20px', textAlign: 'center' },
  sidebarBottom: { padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '2px' },
  switchBtn: { padding: '10px 16px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" },
  content: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f1f5f9' },
};

export default UserLayout;
