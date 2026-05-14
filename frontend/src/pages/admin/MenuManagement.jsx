import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await axios.get('https://balaji-perfect-caters.onrender.com/api/menus');
      setMenus(res.data.data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      await axios.post('https://balaji-perfect-caters.onrender.com/api/menus/seed');
      fetchMenus();
    } catch (err) {
      alert('Error seeding data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
      try {
        await axios.delete(`https://balaji-perfect-caters.onrender.com/api/menus/${id}`);
        fetchMenus();
      } catch (err) {
        alert('Error deleting menu');
      }
    }
  };

  const showQR = (id) => {
    const url = `${window.location.origin}/public/menu/${id}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    window.open(qr, '_blank', 'width=500,height=500');
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation / Breadcrumbs */}
      <nav style={styles.topNav}>
        <span style={styles.breadcrumb}>Dashboard / <span style={{color: '#38bdf8'}}>Menus</span></span>
        <div style={styles.userProfile}>
          <div style={styles.avatar}>A</div>
          <span>Admin</span>
        </div>
      </nav>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Digital Menu Control</h1>
          <p style={styles.sub}>Manage your canteen menus and generate QR codes for instant access.</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnOutline} onClick={handleSeed}>
             Seed Demo
          </button>
          <button style={styles.btnBlue} onClick={() => navigate('/admin/menu/new')}>
            <span style={{fontSize: '1.2rem'}}>+</span> Create New Menu
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Active Menus</span>
          <span style={styles.statValue}>{menus.length}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Items</span>
          <span style={styles.statValue}>{menus.reduce((acc, m) => acc + m.items.length, 0)}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Categories</span>
          <span style={styles.statValue}>4</span>
        </div>
      </div>

      {/* Menu Grid */}
      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loader}>Loading your menus...</div>
        ) : menus.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No menus found. Create your first menu or seed the demo data.</p>
          </div>
        ) : (
          menus.map(m => (
            <div key={m._id} style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>{m.restaurantName}</h3>
                <span style={styles.badge}>Live</span>
              </div>
              <p style={styles.cardSub}>{m.title}</p>
              <div style={styles.cardMeta}>
                <span>{m.items.length} Items</span>
                <span>â€¢</span>
                <span>Updated recently</span>
              </div>
              <div style={styles.actions}>
                <button style={styles.actionBtn} onClick={() => navigate(`/admin/menu/${m._id}`)}>
                  âœŽ Edit
                </button>
                <button style={styles.actionBtn} onClick={() => showQR(m._id)}>
                  ðŸ“± QR
                </button>
                <button style={{...styles.actionBtn, color: '#f43f5e'}} onClick={() => handleDelete(m._id)}>
                  ðŸ—‘ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif", color: 'white', backgroundColor: '#0f172a', minHeight: '100vh' },
  topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #1e293b' },
  breadcrumb: { color: '#64748b', fontSize: '0.9rem', fontWeight: '500' },
  userProfile: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-1px' },
  sub: { color: '#94a3b8', maxWidth: '600px', marginTop: '5px' },
  headerActions: { display: 'flex', gap: '12px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' },
  statCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' },
  statLabel: { display: 'block', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#38bdf8' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', transition: 'transform 0.2s', cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cardTitle: { fontSize: '1.25rem', fontWeight: '700' },
  badge: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981' },
  cardSub: { color: '#94a3b8', fontSize: '0.95rem', marginBottom: '15px' },
  cardMeta: { display: 'flex', gap: '10px', color: '#475569', fontSize: '0.85rem', marginBottom: '24px' },
  actions: { display: 'flex', gap: '10px', borderTop: '1px solid #334155', paddingTop: '20px' },
  actionBtn: { flex: 1, padding: '8px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontWeight: '600', transition: '0.2s' },
  btnBlue: { backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  btnOutline: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' },
  loader: { textAlign: 'center', padding: '40px', color: '#38bdf8' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: '#1e293b', borderRadius: '20px', border: '2px dashed #334155', color: '#64748b' }
};

export default MenuManagement;
