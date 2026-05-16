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
            <img src="/bpc-logo.jpeg" alt="BPC High Class logo" style={styles.logoImg} />
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
    backgroundColor: '#F4EFE7',
    fontFamily: "'Outfit', sans-serif",
    backgroundImage: 'radial-gradient(circle at top right, rgba(242,195,107,0.28) 0%, rgba(250,247,242,0.92) 42%), linear-gradient(135deg, #FAF7F2 0%, #F4EFE7 100%)'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 22px 56px rgba(90, 0, 6, 0.14)',
    overflow: 'hidden',
    border: '1px solid rgba(227,162,59,0.22)'
  },
  logoBox: {
    width: '54px',
    height: '54px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #F2C36B',
    boxShadow: '0 8px 20px rgba(90,0,6,0.12)',
    flexShrink: 0
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
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
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '1.3rem', 
    fontWeight: '800', 
    color: '#5A0006' 
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #E8DED1',
    backgroundColor: '#FAF7F2'
  },
  tab: {
    flex: 1,
    padding: '16px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#6F6259',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '3px solid transparent'
  },
  activeTab: {
    color: '#7A0008',
    borderBottomColor: '#E3A23B',
    backgroundColor: 'white'
  },
  formContainer: {
    padding: '32px 48px 48px'
  },
  formTitle: { 
    fontSize: '1.5rem', 
    fontWeight: '800', 
    color: '#5A0006', 
    marginBottom: '8px',
    textAlign: 'center'
  },
  formSub: { 
    color: '#6F6259', 
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
    color: '#4A3D38', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px' 
  },
  input: { 
    padding: '14px 16px', 
    border: '1.5px solid #E8DED1', 
    borderRadius: '10px', 
    fontSize: '1rem', 
    color: '#5A0006', 
    outline: 'none', 
    backgroundColor: '#FAF7F2', 
    fontFamily: "'Outfit', sans-serif" 
  },
  loginBtn: { 
    padding: '16px', 
    background: 'linear-gradient(135deg, #5A0006 0%, #7A0008 70%, #E3A23B 135%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '1rem', 
    fontWeight: '700', 
    cursor: 'pointer', 
    fontFamily: "'Outfit', sans-serif",
    marginTop: '12px',
    transition: 'all 0.22s ease',
    boxShadow: '0 10px 24px rgba(90,0,6,0.18)'
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
    backgroundColor: '#FAF7F2',
    borderRadius: '12px',
    border: '1px dashed #EFE3D3'
  },
  hintTitle: { 
    fontSize: '0.75rem', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    color: '#8D7E73', 
    fontWeight: '700', 
    marginBottom: '8px' 
  },
  hintRow: { 
    fontSize: '0.85rem', 
    color: '#5E514A'
  },
  hintLabel: { 
    backgroundColor: '#7A0008', 
    color: 'white', 
    fontWeight: '700', 
    padding: '2px 6px', 
    borderRadius: '4px',
    marginLeft: '6px'
  },
};

export default Login;
