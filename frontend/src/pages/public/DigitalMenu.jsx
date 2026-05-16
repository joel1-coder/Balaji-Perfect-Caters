import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = 'https://balaji-perfect-caters.onrender.com/api/menus';

const DigitalMenu = () => {
 const { id } = useParams();
 const [menu, setMenu] = useState(null);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');

 const MOCK_MENU = {
 restaurantName: "Balaji Perfect Caters",
 items: [
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
 ]
 };

 useEffect(() => {
 const fetchMenu = async () => {
 try {
 if (id && id !== 'main') {
 const res = await axios.get(`${API}/${id}`, { timeout: 3000 });
 setMenu(res.data.data || MOCK_MENU);
 } else {
 const res = await axios.get(API, { timeout: 3000 });
 if (res.data.data && res.data.data.length > 0 && res.data.data[0].items.length > 0) {
 setMenu(res.data.data[0]);
 } else {
 setMenu(MOCK_MENU);
 }
 }
 } catch (err) {
 setMenu(MOCK_MENU);
 } finally {
 setLoading(false);
 }
 };
 fetchMenu();
 }, [id]);

 if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>Loading...</div>;
 if (!menu) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>Menu Not Found</div>;

 const categories = [...new Set(menu.items.map(item => item.category))];
 const filteredItems = menu.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

 return (
 <div style={s.layout}>
 {/* ---- Main Content ---- */}
 <main style={s.main}>
 <header style={s.header}>
 <div>
 <h1 style={s.pageTitle}>{menu.restaurantName}</h1>
 <p style={s.pageSubtitle}>View our fresh offerings for today's service.</p>
 <div style={s.publicActions}>
 <a href={`/public/menu/${id || 'main'}`} style={{...s.publicLink, ...s.publicLinkActive}}>Menu</a>
 <a href="/public/discounts/main" style={s.publicLink}>Discounts</a>
 </div>
 </div>
 <div style={s.searchBox}>
 <input 
 style={s.searchInput} 
 placeholder="Search menu items..." 
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 />
 </div>
 </header>

 <div style={s.contentScroll}>
 {categories.map(cat => {
 const catItems = filteredItems.filter(i => i.category === cat);
 if (catItems.length === 0) return null;

 return (
 <section key={cat} style={s.section}>
 <h2 style={s.sectionTitle}>{cat.toUpperCase()}</h2>
 
 <div style={s.grid}>
 {catItems.map(item => (
 <div key={item._id} style={s.card}>
 {/* Image */}
 <div style={s.cardImageWrap}>
 {item.image? (
 <img src={item.image} alt={item.name} style={s.cardImage} />
 ): (
 <div style={s.cardImagePlaceholder}>No Image</div>
 )}
 </div>
 
 {/* Details */}
 <div style={s.cardBody}>
 <div style={s.cardRow}>
 <h3 style={s.itemName}>{item.name}</h3>
 <div style={s.itemPrice}>
 <span style={s.priceBox}>Rs. {item.price}</span>
 </div>
 </div>
 
 <div style={{...s.cardRow, marginTop: '14px' }}>
 <div style={s.statusWrap}>
 {item.isAvailable? (
 <>
 <div style={{...s.statusDot, backgroundColor: '#16a34a' }} />
 <span style={{...s.statusText, color: '#16a34a' }}>Available</span>
 </>
 ): (
 <>
 <div style={{...s.statusDot, backgroundColor: '#dc2626' }} />
 <span style={{...s.statusText, color: '#dc2626' }}>Unavailable</span>
 </>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>
 );
 })}
 </div>
 </main>
 </div>
 );
};

const s = {
 layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#FAF7F2', fontFamily: "'Outfit', sans-serif" },
 main: { flex: 1, display: 'flex', flexDirection: 'column', margin: '0 auto', maxWidth: '1200px', width: '100%', backgroundColor: '#FAF7F2' },
 
 header: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', padding: '30px 20px', borderBottom: '1px solid #E8DED1', background: 'linear-gradient(135deg, #ffffff 0%, #FAF7F2 66%, #FFF3D5 100%)', borderRadius: '0 0 14px 14px', boxShadow: '0 10px 28px rgba(90,0,6,0.08)' },
 pageTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#7A0008', marginBottom: '4px' },
 pageSubtitle: { fontSize: '0.9rem', color: '#6F6259' },
 publicActions: { display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' },
 publicLink: { textDecoration: 'none', border: '1px solid #E3A23B', color: '#7A0008', backgroundColor: '#FFF8E8', padding: '9px 13px', borderRadius: '10px', fontWeight: '800', fontSize: '0.86rem' },
 publicLinkActive: { backgroundColor: '#7A0008', color: '#FAF7F2', borderColor: '#7A0008' },
 
 searchBox: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E8DED1', borderRadius: '8px', padding: '10px 14px', width: '300px', maxWidth: '100%', backgroundColor: '#F4EFE7' },
 searchInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', width: '100%', fontFamily: "'Outfit', sans-serif" },
 
 contentScroll: { flex: 1, padding: '20px' },
 section: { marginTop: '30px', marginBottom: '40px' },
 sectionTitle: { fontSize: '1rem', fontWeight: '800', color: '#7A0008', letterSpacing: '1px', marginBottom: '20px', borderBottom: '2px solid #E3A23B', paddingBottom: '10px' },
 
 // Grid layout matching the Figma design (responsive)
 grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
 
 // Card
 card: { backgroundColor: 'white', border: '1px solid #E8DED1', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 24px rgba(90,0,6,0.07)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
 cardImageWrap: { height: '200px', width: '100%', backgroundColor: '#F4EFE7' },
 cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
 cardImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8D7E73', fontSize: '1rem' },
 
 cardBody: { padding: '20px' },
 cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
 itemName: { fontSize: '1.1rem', fontWeight: '700', color: '#5A0006' },
 itemPrice: { display: 'flex', alignItems: 'center' },
 priceBox: { fontSize: '1.05rem', fontWeight: '800', color: '#7A0008' },
 
 statusWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
 statusDot: { width: '10px', height: '10px', borderRadius: '50%' },
 statusText: { fontSize: '0.85rem', fontWeight: '700' },
};

export default DigitalMenu;
