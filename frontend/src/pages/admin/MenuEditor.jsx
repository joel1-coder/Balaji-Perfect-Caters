import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MenuEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [menu, setMenu] = useState({ 
    title: '', 
    restaurantName: '', 
    items: [] 
  });
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      axios.get(`https://balaji-perfect-caters.onrender.com/api/menus/${id}`).then(res => {
        setMenu(res.data.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!menu.restaurantName || !menu.title) {
      alert('Please fill in the Restaurant Name and Menu Title.');
      return;
    }
    try {
      if (isNew) await axios.post('https://balaji-perfect-caters.onrender.com/api/menus', menu);
      else await axios.put(`https://balaji-perfect-caters.onrender.com/api/menus/${id}`, menu);
      navigate('/admin/menus');
    } catch (err) { 
      alert('Failed to save menu changes.');
    }
  };

  const addItem = () => {
    setMenu({ 
      ...menu, 
      items: [...menu.items, { name: '', price: 0, category: 'Main Course', description: '', image: '' }] 
    });
  };

  const removeItem = (index) => {
    const newItems = menu.items.filter((_, i) => i !== index);
    setMenu({ ...menu, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...menu.items];
    newItems[index][field] = value;
    setMenu({ ...menu, items: newItems });
  };

  if (loading) return <div style={styles.loader}>Loading Editor...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate('/admin/menus')}>† Back to Menus</button>
          <h1 style={styles.title}>{isNew ? 'Create New Menu' : 'Configure Menu'}</h1>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnBlue} onClick={handleSave}>Save Menu Changes</button>
        </div>
      </header>

      <div style={styles.contentGrid}>
        {/* Sidebar: General Info */}
        <aside style={styles.sidebar}>
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>General Information</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Restaurant Name</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Balaji Perfect Caters" 
                value={menu.restaurantName} 
                onChange={e => setMenu({...menu, restaurantName: e.target.value})} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Menu Title</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Summer Specials 2024" 
                value={menu.title} 
                onChange={e => setMenu({...menu, title: e.target.value})} 
              />
            </div>
          </div>

          <div style={styles.infoBox}>
            <p style={{fontSize: '0.85rem', color: '#94a3b8'}}>This information will be displayed at the top of the digital menu scanned by users.</p>
          </div>
        </aside>

        {/* Main: Menu Items */}
        <main style={styles.mainContent}>
          <div style={styles.flexBetween}>
            <h2 style={styles.sectionHeader}>Menu Items ({menu.items.length})</h2>
            <button style={styles.btnOutline} onClick={addItem}>+ Add Food Item</button>
          </div>

          {menu.items.length === 0 ? (
            <div style={styles.emptyItems}>
              <p>No food items added yet. Click the button above to start adding products.</p>
            </div>
          ) : (
            <div style={styles.itemsList}>
              {menu.items.map((item, i) => (
                <div key={i} style={styles.itemCard}>
                  <div style={styles.itemCardHeader}>
                    <span style={styles.itemNumber}>#{i + 1}</span>
                    <button style={styles.deleteBtn} onClick={() => removeItem(i)}>œ•</button>
                  </div>
                  
                  <div style={styles.itemGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Dish Name</label>
                      <input 
                        style={styles.input} 
                        placeholder="Item Name" 
                        value={item.name} 
                        onChange={e => handleItemChange(i, 'name', e.target.value)} 
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Price ($)</label>
                      <input 
                        style={styles.input} 
                        type="number" 
                        placeholder="0.00" 
                        value={item.price} 
                        onChange={e => handleItemChange(i, 'price', e.target.value)} 
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Category</label>
                      <select 
                        style={styles.input} 
                        value={item.category} 
                        onChange={e => handleItemChange(i, 'category', e.target.value)}
                      >
                        <option>Starters</option>
                        <option>Main Course</option>
                        <option>Desserts</option>
                        <option>Drinks</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea 
                      style={{...styles.input, height: '80px', resize: 'none'}} 
                      placeholder="Briefly describe the dish..." 
                      value={item.description} 
                      onChange={e => handleItemChange(i, 'description', e.target.value)} 
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Image URL (Optional)</label>
                    <input 
                      style={styles.input} 
                      placeholder="https://images.unsplash.com/..." 
                      value={item.image} 
                      onChange={e => handleItemChange(i, 'image', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif", color: 'white', backgroundColor: '#0f172a', minHeight: '100vh' },
  loader: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '1.2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #1e293b' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', display: 'block', fontWeight: '600' },
  title: { fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' },
  headerActions: { display: 'flex', gap: '12px' },
  contentGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px' },
  sectionCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#38bdf8' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' },
  input: { width: '100%', padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontSize: '1rem', transition: '0.2s' },
  infoBox: { marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' },
  mainContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeader: { fontSize: '1.5rem', fontWeight: '700' },
  emptyItems: { padding: '60px', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '20px', border: '2px dashed #334155', color: '#64748b' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  itemCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', position: 'relative' },
  itemCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  itemNumber: { backgroundColor: '#0f172a', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8' },
  deleteBtn: { backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' },
  itemGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' },
  btnBlue: { backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' },
  btnOutline: { backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }
};

export default MenuEditor;
