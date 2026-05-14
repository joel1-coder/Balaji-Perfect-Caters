import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: 'âŠž', label: 'Executive Overview', path: '/admin/overview' },
  { icon: 'ðŸ½', label: 'Menu Management',    path: '/admin/menu-items' },
  { icon: 'ðŸ”', label: 'Transaction Audit',  path: '/admin/audit' },
  { icon: 'ðŸ‘¥', label: 'Staff Management',   path: '/admin/staff' },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('canteen_auth');
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#0f2444"/>
              <path d="M7 20L14 8L21 20H7Z" fill="white" opacity="0.9"/>
              <circle cx="14" cy="14" r="3" fill="#38bdf8"/>
            </svg>
          </div>
          <div>
            <div style={styles.brandName}>Balaji Perfect Caters</div>
            <div style={styles.brandSub}>Admin Terminal</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                style={{ ...styles.navItem, ...(isActive ? styles.navActive : {}) }}
                onClick={() => navigate(item.path)}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarBottom}>
          <button style={styles.switchBtn} onClick={() => navigate('/quickbill')}>
            âŠ• Switch to Admin
          </button>
          <button style={{ ...styles.navItem, color: '#64748b' }} onClick={() => navigate('/admin/settings')}>
            <span>âš™</span> Settings
          </button>
          <button style={{ ...styles.navItem, color: '#ef4444' }} onClick={handleLogout}>
            <span>â†ª</span> Logout
          </button>
        </div>
      </aside>

      {/* â”€â”€ Page Content â”€â”€ */}
      <div style={styles.content}>{children}</div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', height: '100vh', fontFamily: "'Outfit', sans-serif", backgroundColor: '#f1f5f9', overflow: 'hidden' },
  sidebar: { width: '240px', flexShrink: 0, backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '0' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px', borderBottom: '1px solid #e2e8f0' },
  brandIcon: {},
  brandName: { fontSize: '1rem', fontWeight: '800', color: '#0f172a' },
  brandSub: { fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontWeight: '500', transition: '0.15s' },
  navActive: { backgroundColor: '#0f2444', color: 'white', fontWeight: '700' },
  navIcon: { fontSize: '1rem', width: '20px', textAlign: 'center' },
  sidebarBottom: { padding: '16px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' },
  switchBtn: { padding: '10px 16px', backgroundColor: '#0f2444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" },
  content: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
};

export default AdminLayout;
