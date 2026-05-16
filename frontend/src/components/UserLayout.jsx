import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/userResponsive.css';

const navItems = [
  { icon: 'ðŸ’¼', label: 'Billing',       path: '/user/billing' },
  { icon: 'ðŸ½ï¸', label: 'Menu Items',    path: '/user/menu' },
];

const UserLayout = ({ children }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('canteen_auth');
    localStorage.removeItem('canteen_role');
    localStorage.removeItem('canteen_user');
    navigate('/login');
  };

  const user = localStorage.getItem('canteen_user') || 'Operator';

  return (
    <div style={styles.page}>
      {/* Mobile Floating Hamburger */}
      <button 
        className="user-hamburger" 
        style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 200, background: 'white', padding: '8px 8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', height: '36px', width: '38px', alignItems: 'center' }}
        onClick={() => setSidebarOpen(true)}
      >
        <div />
        <div />
        <div />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,36,68,0.5)', zIndex: 350, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`user-sidebar ${sidebarOpen ? 'open' : ''}`} style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <img src="/bpc-logo.jpeg" alt="BPC Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
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
          <button style={styles.switchBtn} onClick={() => {
            localStorage.setItem('canteen_role', 'admin');
            localStorage.setItem('canteen_user', 'admin');
            navigate('/admin/overview');
          }}>
            âš¡ Switch to Admin
          </button>
          <button style={{ ...styles.navItem, color: 'rgba(255,255,255,0.5)' }}
            onClick={() => navigate('/user/settings')}>
            <span>âš™ï¸</span> Settings
          </button>
          <button style={{ ...styles.navItem, color: '#f87171' }} onClick={handleLogout}>
            <span>ðŸšª</span> Logout
          </button>
        </div>
      </aside>

      {/* â€â‚¬â€â‚¬ Page Content â€â‚¬â€â‚¬ */}
      <div style={styles.content}>{children}</div>
    </div>
  );
};

const styles = {
  page:    { display: 'flex', height: '100vh', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' },
  sidebar: { width: '240px', flexShrink: 0, background: 'linear-gradient(180deg, #5A0006 0%, #7A0008 72%, #5A0006 100%)', display: 'flex', flexDirection: 'column' },
  brand:   { display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid rgba(242,195,107,0.22)' },
  brandName: { fontSize: '0.95rem', fontWeight: '800', color: 'white' },
  brandSub:  { fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', margin: '12px', backgroundColor: 'rgba(227,162,59,0.12)', borderRadius: '10px', border: '1px solid rgba(242,195,107,0.24)' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(227,162,59,0.2)', color: '#F2C36B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', flexShrink: 0 },
  userName:   { fontSize: '0.9rem', fontWeight: '700', color: 'white' },
  userRole:   { fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' },
  nav:     { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontWeight: '500', transition: '0.15s' },
  navActive: { backgroundColor: 'rgba(227,162,59,0.18)', color: '#F2C36B', fontWeight: '700', borderLeft: '3px solid #E3A23B' },
  navIcon:   { fontSize: '1rem', width: '20px', textAlign: 'center' },
  sidebarBottom: { padding: '14px 12px', borderTop: '1px solid rgba(242,195,107,0.18)', display: 'flex', flexDirection: 'column', gap: '2px' },
  switchBtn: { padding: '10px 16px', backgroundColor: 'rgba(227,162,59,0.14)', color: '#F2C36B', border: '1px solid rgba(242,195,107,0.36)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" },
  content: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#F4EFE7' },
};

export default UserLayout;
