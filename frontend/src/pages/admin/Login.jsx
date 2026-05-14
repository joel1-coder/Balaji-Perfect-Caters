import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CREDENTIALS = {
  admin:    { password: 'admin@123',    role: 'admin',    redirect: '/admin/overview' },
  operator: { password: 'operator@123', role: 'operator', redirect: '/user/billing'   },
};

const Login = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setUsername(tab);
    setPassword('');
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = CREDENTIALS[username.toLowerCase().trim()];
    
    if (!user || user.password !== password || user.role !== activeTab) {
      setError('Invalid username or password. Please try again.');
      return;
    }
    localStorage.setItem('canteen_auth', 'true');
    localStorage.setItem('canteen_role', user.role);
    localStorage.setItem('canteen_user', username);
    navigate(user.redirect);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0f2444"/>
              <path d="M8 23L16 9L24 23H8Z" fill="white"/>
              <circle cx="16" cy="16" r="4" fill="#38bdf8"/>
            </svg>
          </div>
          <span style={styles.logoText}>Balaji Perfect Caters</span>
        </div>

        <div style={styles.tabContainer}>
          <div 
            style={activeTab === 'admin' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => handleTabSwitch('admin')}
          >
            Admin Login
          </div>
          <div 
            style={activeTab === 'operator' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => handleTabSwitch('operator')}
          >
            User Login
          </div>
        </div>

        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {activeTab === 'admin' ? 'Admin Access' : 'User Access'}
          </h2>
          <p style={styles.formSub}>
            Please sign in to your {activeTab} account.
          </p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                type="text"
                placeholder={activeTab === 'admin' ? 'e.g. admin' : 'e.g. operator'}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}
            <button type="submit" style={styles.loginBtn}>
              Sign In as {activeTab === 'admin' ? 'Admin' : 'User'}
            </button>
          </form>

          <div style={styles.hintBox}>
            <p style={styles.hintTitle}>Demo Password</p>
            <p style={styles.hintRow}>
              For {activeTab}: <span style={styles.hintLabel}>{activeTab}@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#f1f5f9',
    fontFamily: "'Outfit', sans-serif",
    backgroundImage: 'radial-gradient(circle at top right, #e2e8f0 0%, #f1f5f9 100%)'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 40px rgba(15, 36, 68, 0.08)',
    overflow: 'hidden'
  },
  logoRow: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '12px', 
    padding: '36px 20px 24px',
    backgroundColor: 'white'
  },
  logoText: { 
    fontSize: '1.25rem', 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  tab: {
    flex: 1,
    padding: '16px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '3px solid transparent'
  },
  activeTab: {
    color: '#0f2444',
    borderBottomColor: '#0f2444',
    backgroundColor: 'white'
  },
  formContainer: {
    padding: '32px 48px 48px'
  },
  formTitle: { 
    fontSize: '1.5rem', 
    fontWeight: '800', 
    color: '#0f172a', 
    marginBottom: '8px',
    textAlign: 'center'
  },
  formSub: { 
    color: '#64748b', 
    marginBottom: '32px', 
    fontSize: '0.95rem',
    textAlign: 'center'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px' 
  },
  label: { 
    fontSize: '0.8rem', 
    fontWeight: '700', 
    color: '#374151', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px' 
  },
  input: { 
    padding: '14px 16px', 
    border: '1.5px solid #e2e8f0', 
    borderRadius: '10px', 
    fontSize: '1rem', 
    color: '#0f172a', 
    outline: 'none', 
    backgroundColor: '#f8fafc', 
    fontFamily: "'Outfit', sans-serif" 
  },
  loginBtn: { 
    padding: '16px', 
    backgroundColor: '#0f2444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '1rem', 
    fontWeight: '700', 
    cursor: 'pointer', 
    fontFamily: "'Outfit', sans-serif",
    marginTop: '12px',
    transition: 'background-color 0.2s'
  },
  errorBox: { 
    backgroundColor: '#fef2f2', 
    border: '1px solid #fecaca', 
    borderRadius: '8px', 
    padding: '12px 16px', 
    color: '#dc2626', 
    fontSize: '0.85rem', 
    fontWeight: '500',
    textAlign: 'center'
  },
  hintBox: { 
    marginTop: '32px', 
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1'
  },
  hintTitle: { 
    fontSize: '0.75rem', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    color: '#94a3b8', 
    fontWeight: '700', 
    marginBottom: '8px' 
  },
  hintRow: { 
    fontSize: '0.85rem', 
    color: '#475569'
  },
  hintLabel: { 
    backgroundColor: '#0f2444', 
    color: 'white', 
    fontWeight: '700', 
    padding: '2px 6px', 
    borderRadius: '4px',
    marginLeft: '6px'
  },
};

export default Login;
