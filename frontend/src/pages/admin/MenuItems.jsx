import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API = 'https://balaji-perfect-caters.onrender.com/api/menus';
const TYPES = ['Snacks', 'Tea', 'Juice', 'Breakfast', 'Lunch'];
const TABS = ['All',...TYPES];

const BLANK_FORM = { name: '', category: 'Snacks', price: '', description: '', image: '' };

// Helpers 
const toast = (msg, type = 'success') => {
 const el = document.createElement('div');
 el.innerText = msg;
 Object.assign(el.style, {
 position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
 background: type === 'success'? '#7A0008': '#dc2626',
 color: 'white', padding: '12px 20px', borderRadius: '10px',
 fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '0.9rem',
 boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
 });
 document.body.appendChild(el);
 setTimeout(() => el.remove(), 2800);
};

// Component 
const MenuItems = () => {
 const [menuId, setMenuId] = useState(null);
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState('All');
 const [showModal, setShowModal] = useState(false);
 const [editItem, setEditItem] = useState(null); // null = new, obj = editing
 const [form, setForm] = useState(BLANK_FORM);
 const [saving, setSaving] = useState(false);
 const [preview, setPreview] = useState('');
 const fileRef = useRef();

 // Load menus on mount 
 useEffect(() => { fetchItems(); }, []);

 const fetchItems = async () => {
 setLoading(true);
 try {
 const res = await axios.get(API);
 const menus = res.data.data;
 if (menus.length === 0) {
 setLoading(false); return;
 }
 const first = menus[0];
 setMenuId(first._id);
 setItems(first.items);
 } catch {
 toast('Could not connect to backend. Is the server running?', 'error');
 }
 setLoading(false);
 };

 // Seed data if no menu exists 
 const handleSeed = async () => {
 try {
 await axios.post(`${API}/seed`);
 toast('Demo data seeded!');
 fetchItems();
 } catch { toast('Seed failed', 'error'); }
 };

 // Open modal 
 const openAdd = () => {
 setEditItem(null);
 setForm(BLANK_FORM);
 setPreview('');
 setShowModal(true);
 };

 const openEdit = (item) => {
 setEditItem(item);
 setForm({ name: item.name, category: item.category, price: item.price, description: item.description || '', image: item.image || '' });
 setPreview(item.image || '');
 setShowModal(true);
 };

 const closeModal = () => { setShowModal(false); setEditItem(null); };

 // Image pick (converts to base64 preview, stores URL) 
 const handleImageFile = (e) => {
 const file = e.target.files[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = (ev) => {
 setPreview(ev.target.result);
 setForm(f => ({...f, image: ev.target.result }));
 };
 reader.readAsDataURL(file);
 };

 // Save (create or update) 
 const handleSave = async () => {
 if (!form.name.trim()) { toast('Name is required', 'error'); return; }
 if (!form.price || isNaN(form.price) || +form.price <= 0) { toast('Enter a valid price', 'error'); return; }

 if (!menuId) { toast('No menu found. Please seed demo data first.', 'error'); return; }
 setSaving(true);
 const priceVal = parseFloat(form.price);
 const payload = {...form, price: priceVal };
 console.log('Saving Item Payload:', payload);

 try {
 if (editItem) {
 await axios.put(`${API}/${menuId}/items/${editItem._id}`, payload);
 toast('Item updated!');
 } else {
 await axios.post(`${API}/${menuId}/items`, payload);
 toast('Item added!');
 }
 closeModal();
 fetchItems();
 } catch (err) {
 toast(err.response?.data?.error || 'Save failed', 'error');
 }
 setSaving(false);
 };

 // Delete 
 const handleDelete = async (item) => {
 if (!window.confirm(`Delete "${item.name}"?`)) return;
 try {
 await axios.delete(`${API}/${menuId}/items/${item._id}`);
 toast('Item deleted!');
 fetchItems();
 } catch { toast('Delete failed', 'error'); }
 };

 // Filtered items 
 const filtered = activeTab === 'All'? items: items.filter(i => i.category === activeTab);

 // Category badge colours 
 const catColor = {
 Snacks: { bg: '#FFF3D5', color: '#7A0008' },
 Tea: { bg: '#FFF3D5', color: '#7A0008' },
 Juice: { bg: '#dcfce7', color: '#166534' },
 Breakfast: { bg: '#FFF1D0', color: '#7A0008' },
 Lunch: { bg: '#FFF3D5', color: '#7A0008' },
 };

 // Render 
 return (
 <AdminLayout>
 {/* Top Bar */}
 <header className="admin-section-header menu-items-header" style={s.topBar}>
 <h1 style={s.pageTitle}>Menu Management</h1>
 <div className="admin-section-actions" style={s.topRight}>
 <button style={s.qrBtn} onClick={() => window.open('/public/menu/main', '_blank')}>
 View Digital Menu
 </button>
 <button style={s.seedBtn} onClick={handleSeed}>Seed Demo</button>
 <button style={s.addBtn} onClick={openAdd}>Add New Item</button>
 </div>
 </header>

 <div className="admin-page-body menu-items-page" style={s.page}>
 {/* Category Tabs */}
 <div className="admin-scroll-tabs" style={s.tabBar}>
 {TABS.map(t => (
 <button key={t} onClick={() => setActiveTab(t)}
 style={{...s.tab,...(activeTab === t? s.tabActive: {}) }}>
 {t}
 <span style={{...s.tabCount,...(activeTab === t? s.tabCountActive: {}) }}>
 {t === 'All'? items.length: items.filter(i => i.category === t).length}
 </span>
 </button>
 ))}
 </div>

 {/* Content */}
 {loading? (
 <div style={s.emptyState}>Loading...</div>
 ): items.length === 0? (
 <div style={s.emptyState}>
 <p style={{ marginBottom: '16px', color: '#6F6259' }}>No items yet. Seed demo data or add your first item.</p>
 <button style={s.addBtn} onClick={handleSeed}>Seed Demo Data</button>
 </div>
 ): (
 <div className="menu-items-table-card" style={s.tableCard}>
 {/* Table Header */}
 <div className="menu-items-table-head" style={s.tableHead}>
 <span style={{ flex: '0 0 60px' }}>Image</span>
 <span style={{ flex: 2 }}>Name</span>
 <span style={{ flex: 1 }}>Type</span>
 <span style={{ flex: 1 }}>Price</span>
 <span style={{ flex: 2 }}>Description</span>
 <span style={{ flex: '0 0 100px', textAlign: 'right' }}>Actions</span>
 </div>

 {/* Table Rows */}
 {filtered.length === 0? (
 <div style={{ padding: '40px', textAlign: 'center', color: '#8D7E73' }}>
 No items in this category.
 </div>
 ): filtered.map(item => (
 <div key={item._id} className="menu-items-table-row" style={s.tableRow}>
 <div className="menu-item-image-cell" style={{ flex: '0 0 60px' }}>
 {item.image? (
 <img src={item.image} alt={item.name} style={s.thumb} onError={e => { e.target.style.display = 'none'; }}/>
 ): (
 <div style={s.thumbPlaceholder}></div>
 )}
 </div>
 <span className="menu-item-name-cell" style={{ flex: 2, fontWeight: '700', color: '#5A0006' }}>{item.name}</span>
 <span className="menu-item-type-cell" style={{ flex: 1 }}>
 <span style={{...s.catBadge,...(catColor[item.category] || { bg: '#F4EFE7', color: '#5E514A' }) }}>
 {item.category}
 </span>
 </span>
 <span className="menu-item-price-cell" style={{ flex: 1, fontWeight: '700', color: '#7A0008' }}>Rs. {parseFloat(item.price).toFixed(2)}</span>
 <span className="menu-item-desc-cell" style={{ flex: 2, color: '#6F6259', fontSize: '0.85rem' }}>{item.description || ''}</span>
 <div className="menu-item-actions-cell" style={{ flex: '0 0 100px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
 <button style={s.editBtn} onClick={() => openEdit(item)}>Edit</button>
 <button style={s.deleteBtn} onClick={() => handleDelete(item)}>Delete</button>
 </div>
 </div>
 ))}

 {/* Footer */}
 <div style={s.tableFooter}>
 Showing {filtered.length} of {items.length} items
 <span style={{ color: '#16a34a', marginLeft: '12px' }}> Menu Live</span>
 </div>
 </div>
 )}
 </div>

 {/* Modal */}
 {showModal && (
 <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
 <div style={s.modal}>
 <div style={s.modalHeader}>
 <h2 style={s.modalTitle}>{editItem? 'Edit Item': 'Add New Item'}</h2>
 <button style={s.closeBtn} onClick={closeModal}>Close</button>
 </div>

 {/* Image Upload */}
 <div style={s.imageSection}>
 <div style={s.imagePreview} onClick={() => fileRef.current.click()}>
 {preview? (
 <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}/>
 ): (
 <div style={s.imagePlaceholder}>
 <span style={{ fontSize: '0.85rem', color: '#8D7E73', marginTop: '8px' }}>Click to upload image</span>
 </div>
 )}
 </div>
 <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile}/>
 <div style={s.imageOr}>
 <div style={s.orLine}/><span style={s.orText}>or paste URL</span><div style={s.orLine}/>
 </div>
 <input style={s.input} placeholder="https://example.com/image.jpg"
 value={form.image.startsWith('data:')? '': form.image}
 onChange={e => { setForm(f => ({...f, image: e.target.value})); setPreview(e.target.value); }}/>
 </div>

 {/* Form Fields */}
 <div style={s.formGrid}>
 {/* Name */}
 <div style={s.fieldGroup}>
 <label style={s.label}>Name <span style={{ color: '#ef4444' }}>*</span></label>
 <input style={s.input} placeholder="e.g. Masala Chai"
 value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/>
 </div>

 {/* Type */}
 <div style={s.fieldGroup}>
 <label style={s.label}>Type <span style={{ color: '#ef4444' }}>*</span></label>
 <select style={s.input} value={form.category}
 onChange={e => setForm(f => ({...f, category: e.target.value}))}>
 {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>

 {/* Price */}
 <div style={s.fieldGroup}>
 <label style={s.label}>Price (Rs.) <span style={{ color: '#ef4444' }}>*</span></label>
 <div style={s.priceWrapper}>
 <span style={s.rupeeSign}>Rs.</span>
 <input style={{...s.input, paddingLeft: '32px' }} type="number" min="0" step="any" placeholder="0.00"
 value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}/>
 </div>
 </div>

 {/* Description */}
 <div style={{...s.fieldGroup, gridColumn: '1 / -1' }}>
 <label style={s.label}>Description <span style={{ color: '#8D7E73' }}>(Optional)</span></label>
 <textarea style={{...s.input, height: '80px', resize: 'vertical' }}
 placeholder="Briefly describe the dish..."
 value={form.description}
 onChange={e => setForm(f => ({...f, description: e.target.value}))}/>
 </div>
 </div>

 {/* Actions */}
 <div style={s.modalFooter}>
 <button style={s.cancelBtn} onClick={closeModal}>Cancel</button>
 <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
 {saving? 'Saving...': editItem? 'Update Item': 'Add Item'}
 </button>
 </div>
 </div>
 </div>
 )}
 </AdminLayout>
 );
};

// Styles 
const s = {
 topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', backgroundColor: 'white', borderBottom: '1px solid #E8DED1' },
 pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#5A0006' },
 topRight: { display: 'flex', gap: '12px' },
 qrBtn: { padding: '10px 16px', border: '1px solid #E3A23B', borderRadius: '10px', backgroundColor: '#FFF8E8', color: '#7A0008', cursor: 'pointer', fontWeight: '700', fontFamily: "'Outfit', sans-serif" },
 seedBtn: { padding: '10px 16px', border: '1px solid #E8DED1', borderRadius: '10px', backgroundColor: 'white', color: '#4A3D38', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },
 addBtn: { padding: '10px 20px', backgroundColor: '#7A0008', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },

 page: { flex: 1, padding: '24px', overflow: 'auto', fontFamily: "'Outfit', sans-serif" },

 tabBar: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #E8DED1' },
 tab: { padding: '10px 18px', border: 'none', backgroundColor: 'transparent', color: '#6F6259', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif", borderBottom: '2px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.15s' },
 tabActive: { color: '#7A0008', borderBottom: '2px solid #7A0008', fontWeight: '800' },
 tabCount: { fontSize: '0.72rem', backgroundColor: '#F4EFE7', color: '#6F6259', padding: '1px 7px', borderRadius: '20px', fontWeight: '700' },
 tabCountActive:{ backgroundColor: '#7A0008', color: 'white' },

 tableCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E8DED1', overflow: 'hidden', boxShadow: '0 10px 26px rgba(90,0,6,0.07)' },
 tableHead: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', backgroundColor: '#FFF8E8', borderBottom: '1px solid #E8DED1', fontSize: '0.75rem', fontWeight: '700', color: '#7A0008', textTransform: 'uppercase', letterSpacing: '0.5px' },
 tableRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid #FAF7F2', transition: '0.15s' },
 thumb: { width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' },
 thumbPlaceholder: { width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#F4EFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
 catBadge: { fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
 editBtn: { padding: '6px 12px', backgroundColor: '#FFF8E8', border: '1px solid #F2C36B', borderRadius: '8px', color: '#7A0008', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: "'Outfit', sans-serif" },
 deleteBtn: { padding: '6px 10px', backgroundColor: '#fff1f2', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' },
 tableFooter:{ padding: '14px 20px', fontSize: '0.85rem', color: '#8D7E73', borderTop: '1px solid #F4EFE7' },
 emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px', color: '#6F6259' },

 // Modal
 overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
 modal: { backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 24px 64px rgba(90,0,6,0.24)', border: '1px solid #E8DED1' },
 modalHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
 modalTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#5A0006' },
 closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8D7E73', lineHeight: 1 },

 imageSection: { marginBottom: '20px' },
 imagePreview: { width: '100%', height: '160px', border: '2px dashed #E8DED1', borderRadius: '12px', cursor: 'pointer', overflow: 'hidden', marginBottom: '12px' },
 imagePlaceholder: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
 imageOr: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
 orLine: { flex: 1, height: '1px', backgroundColor: '#E8DED1' },
 orText: { fontSize: '0.78rem', color: '#8D7E73', whiteSpace: 'nowrap' },

 formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
 fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
 label: { fontSize: '0.8rem', fontWeight: '700', color: '#4A3D38', textTransform: 'uppercase', letterSpacing: '0.5px' },
 input: { padding: '11px 14px', border: '1.5px solid #E8DED1', borderRadius: '10px', fontSize: '0.95rem', color: '#5A0006', outline: 'none', fontFamily: "'Outfit', sans-serif", width: '100%', boxSizing: 'border-box' },
 priceWrapper:{ position: 'relative' },
 rupeeSign: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6F6259', fontWeight: '700', zIndex: 1 },

 modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
 cancelBtn: { padding: '12px 24px', border: '1px solid #E8DED1', borderRadius: '10px', backgroundColor: 'white', color: '#4A3D38', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },
 saveBtn: { padding: '12px 28px', backgroundColor: '#7A0008', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
};

export default MenuItems;
