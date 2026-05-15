import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/userResponsive.css';

const API = 'https://balaji-perfect-caters.onrender.com/api/menus';

const OperatorMenu = () => {
  const navigate = useNavigate();
  const [menuId, setMenuId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const MOCK_DATA = [
    { _id: '1', name: 'Samosa (2 pcs)', price: 25, category: 'Snacks', isAvailable: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400' },
    { _id: '2', name: 'Medu Vada', price: 30, category: 'Snacks', isAvailable: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=400' },
    { _id: '3', name: 'Indori Poha', price: 20, category: 'Snacks', isAvailable: false, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=400' },
    { _id: '4', name: 'Masala Tea', price: 12, category: 'Tea', isAvailable: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400' },
    { _id: '5', name: 'Ginger Tea', price: 15, category: 'Tea', isAvailable: true, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=400' },
    { _id: '6', name: 'Lemon Tea', price: 15, category: 'Tea', isAvailable: true, image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&q=80&w=400' },
    { _id: '7', name: 'Masala Dosa', price: 50, category: 'Breakfast', isAvailable: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80&w=400' },
    { _id: '8', name: 'Aloo Paratha', price: 40, category: 'Breakfast', isAvailable: true, image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&q=80&w=400' },
    { _id: '9', name: 'Chicken Biryani', price: 120, category: 'Lunch', isAvailable: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400' },
    { _id: '10', name: 'Veg Thali', price: 90, category: 'Lunch', isAvailable: false, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400' },
  ];

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { timeout: 3000 });
      const menus = res.data.data;
      if (menus && menus.length > 0 && menus[0].items.length > 0) {
        setMenuId(menus[0]._id);
        setItems(menus[0].items);
      } else {
        setItems(MOCK_DATA);
      }
    } catch (err) {
      console.error("Backend failed, using mock data:", err.message);
      setItems(MOCK_DATA);
    }
    setLoading(false);
  };

  const toggleAvailability = async (item) => {
    try {
      const updatedItem = { ...item, isAvailable: !item.isAvailable };
      setItems(prev => prev.map(i => i._id === item._id ? updatedItem : i));
      if (menuId) {
        await axios.put(`${API}/${menuId}/items/${item._id}`, updatedItem);
      }
    } catch (err) {
      fetchItems();
    }
  };

  const categories = ['Snacks', 'Tea', 'Breakfast', 'Lunch'];
  
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={s.layout}>
      {/* Mobile Floating Hamburger */}
      <button 
        className="user-hamburger" 
        style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 300, background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
        onClick={() => setSidebarOpen(true)}
      >
        <div />
        <div />
        <div />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 199 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside className={`user-sidebar ${sidebarOpen ? 'open' : ''}`} style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.brandTitle}>Balaji Perfect Caters</div>
          <div style={s.brandSubtitle}>Operator Terminal</div>
        </div>
        
        <button style={s.newTxnBtn} onClick={() => navigate('/user/billing')}>
          + New Transaction
        </button>

        <nav style={s.nav}>
          {categories.map(cat => (
            <button 
              key={cat}
              style={{ ...s.navItem, ...(activeTab === cat ? s.navItemActive : {}) }}
              onClick={() => {
                setActiveTab(cat);
                document.getElementById(`section-${cat}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {cat}
              {activeTab === cat && <div style={s.navActiveBorder} />}
            </button>
          ))}
        </nav>
      </aside>

      {/* ”€”€ Main Content ”€”€ */}
      <main className="operator-menu-main" style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Menu Items</h1>
            <p style={s.pageSubtitle}>Update availability and pricing for today's service.</p>
          </div>
          <div style={s.searchBox}>
            <span style={{ color: '#94a3b8' }}>[SEARCH]</span>
            <input 
              style={s.searchInput} 
              placeholder="Search menu items..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div style={s.contentScroll}>
          {loading ? (
            <div style={{ padding: '40px', color: '#64748b' }}>Loading menu...</div>
          ) : (
            categories.map(cat => {
              const catItems = filteredItems.filter(i => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <section key={cat} id={`section-${cat}`} style={s.section}>
                  <h2 style={s.sectionTitle}>˜• {cat.toUpperCase()}</h2>
                  
                  <div className="operator-menu-grid" style={s.grid}>
                    {catItems.map(item => (
                      <div key={item._id} style={s.card}>
                        <div style={s.cardImageWrap}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={s.cardImage} />
                          ) : (
                            <div style={s.cardImagePlaceholder}>🍽️ No Image</div>
                          )}
                        </div>
                        
                        <div style={s.cardBody}>
                          <div style={s.cardRow}>
                            <h3 style={s.itemName}>{item.name}</h3>
                            <div style={s.itemPrice}>
                              <span style={s.priceSymbol}>₹</span>{item.price}
                            </div>
                          </div>
                          
                          <div style={{ ...s.cardRow, marginTop: '12px' }}>
                            <div style={s.statusWrap}>
                              {item.isAvailable ? (
                                <>
                                  <div style={{ ...s.statusDot, backgroundColor: '#16a34a' }} />
                                  <span style={{ ...s.statusText, color: '#16a34a' }}>Available</span>
                                </>
                              ) : (
                                <>
                                  <div style={{ ...s.statusDot, backgroundColor: '#dc2626' }} />
                                  <span style={{ ...s.statusText, color: '#dc2626' }}>Unavailable</span>
                                </>
                              )}
                            </div>
                            
                            <button 
                              style={{
                                ...s.toggleBtn,
                                backgroundColor: item.isAvailable ? '#0f2444' : '#e2e8f0'
                              }}
                              onClick={() => toggleAvailability(item)}
                            >
                              <div style={{
                                ...s.toggleCircle,
                                transform: item.isAvailable ? 'translateX(18px)' : 'translateX(0)',
                                backgroundColor: item.isAvailable ? 'white' : '#fff'
                              }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

const s = {
  layout: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" },
  
  sidebar: { width: '260px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' },
  brandTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' },
  brandSubtitle: { fontSize: '0.75rem', color: '#64748b' },
  newTxnBtn: { margin: '20px', backgroundColor: '#0f2444', color: 'white', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' },
  nav: { display: 'flex', flexDirection: 'column', padding: '0 20px' },
  navItem: { padding: '12px 16px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#475569', borderRadius: '4px', position: 'relative', transition: '0.2s' },
  navItemActive: { backgroundColor: '#dbeafe', color: '#0f2444' },
  navActiveBorder: { position: 'absolute', right: '-20px', top: 0, bottom: 0, width: '3px', backgroundColor: '#0f2444' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', zIndex: 10 },
  pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#0f2444', marginBottom: '4px' },
  pageSubtitle: { fontSize: '0.85rem', color: '#64748b' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 12px', width: '260px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%', fontFamily: "'Outfit', sans-serif" },
  
  contentScroll: { flex: 1, overflowY: 'auto', padding: '0 40px 40px 40px' },
  section: { marginTop: '40px' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: '800', color: '#475569', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  
  card: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardImageWrap: { height: '180px', width: '100%', backgroundColor: '#f1f5f9' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' },
  cardBody: { padding: '16px' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  itemPrice: { fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'flex-start' },
  priceSymbol: { fontSize: '0.7rem', color: '#94a3b8', marginRight: '2px', marginTop: '2px' },
  
  statusWrap: { display: 'flex', alignItems: 'center', gap: '6px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%' },
  statusText: { fontSize: '0.75rem', fontWeight: '700' },
  
  toggleBtn: { width: '36px', height: '18px', borderRadius: '10px', border: 'none', cursor: 'pointer', position: 'relative', transition: '0.2s', padding: '0' },
  toggleCircle: { width: '14px', height: '14px', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
};

export default OperatorMenu;
