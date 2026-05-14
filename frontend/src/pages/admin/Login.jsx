import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Hardcoded Credentials ─────────────────────────────────────
const CREDENTIALS = {
  admin:    { password: 'admin@123',    role: 'admin',    redirect: '/admin/overview' },
  operator: { password: 'operator@123', role: 'operator', redirect: '/user/billing'   },
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = CREDENTIALS[username.toLowerCase().trim()];
    if (!user || user.password !== password) {
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
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="white" opacity="0.2"/>
                <path d="M8 23L16 9L24 23H8Z" fill="white"/>
                <circle cx="16" cy="16" r="4" fill="#38bdf8"/>
              </svg>
            </div>
            <span style={styles.logoText}>Balaji Perfect Caters</span>
          </div>

          <h1 style={styles.heroTitle}>Streamline your canteen operations.</h1>
          <p style={styles.heroSub}>
            Manage billing, menu, staff and analytics from a single powerful operator terminal.
          </p>

          <div style={styles.featureList}>
            {['Real-time Order Tracking', 'Transaction Audit Logs', 'Executive Performance Reports', 'Multi-terminal Support'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div style={styles.statusRow}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusText}>All Systems Operational — v4.2.1-stable</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Operator Login</h2>
          <p style={styles.formSub}>Sign in to access the Balaji Perfect Caters Portal</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. admin"
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
            <div style={styles.rememberRow}>
              <label style={styles.rememberLabel}><input type="checkbox" style={{marginRight: 6}}/>Remember me</label>
              <a href="#" style={styles.forgotLink}>Forgot password?</a>
            </div>
            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}
            <button type="submit" style={styles.loginBtn}>Sign In to Dashboard</button>
          </form>

          <div style={styles.hintBox}>
            <p style={styles.hintTitle}>Demo Credentials</p>
            <p style={styles.hintRow}><span style={styles.hintLabel}>Admin</span> admin / admin@123</p>
            <p style={styles.hintRow}><span style={styles.hintLabel}>Operator</span> operator / operator@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" },
  left: { width: '45%', background: 'linear-gradient(150deg, #0a1628 0%, #0f2444 50%, #1a3a6b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  leftInner: { maxWidth: '400px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
  logoBox: {},
  logoText: { fontSize: '1.4rem', fontWeight: '800', color: 'white' },
  heroTitle: { fontSize: '2.2rem', fontWeight: '800', color: 'white', lineHeight: '1.2', marginBottom: '16px' },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '40px' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' },
  featureCheck: { width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(56,189,248,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', flexShrink: 0 },
  statusRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' },
  statusText: { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' },
  right: { flex: 1, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  formCard: { backgroundColor: 'white', borderRadius: '20px', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(15,36,68,0.10)' },
  formTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  formSub: { color: '#64748b', marginBottom: '36px', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '13px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', color: '#0f172a', outline: 'none', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" },
  rememberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rememberLabel: { color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', cursor: 'pointer' },
  forgotLink: { color: '#1a3a6b', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' },
  loginBtn: { padding: '15px', backgroundColor: '#0f2444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626', fontSize: '0.875rem', fontWeight: '500' },
  hintBox: { marginTop: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' },
  hintTitle: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: '700', marginBottom: '10px' },
  hintRow: { fontSize: '0.875rem', color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' },
  hintLabel: { backgroundColor: '#0f2444', color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', minWidth: '60px', textAlign: 'center' },
};

export default Login;
