import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API = 'https://balaji-perfect-caters.onrender.com/api/discounts';

const emptyOffer = {
  name: '',
  description: '',
  category: 'Student Offer',
  originalPrice: '',
  discountedPrice: '',
  badge: 'Special',
  isActive: true,
};

const fallbackPage = {
  title: 'Student Discount Offers',
  subtitle: 'Scan, check today offers, and order at the counter.',
  validUntil: '',
  isPublished: true,
  items: [
    {
      name: 'Student Breakfast Combo',
      description: 'Idli, vada and tea at a friendly student price.',
      category: 'Breakfast',
      originalPrice: 75,
      discountedPrice: 55,
      badge: 'Save Rs. 20',
      isActive: true,
    },
  ],
};

const toast = (message, type = 'success') => {
  const el = document.createElement('div');
  el.innerText = message;
  Object.assign(el.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    zIndex: 9999,
    backgroundColor: type === 'success' ? '#7A0008' : '#B42318',
    color: '#FAF7F2',
    padding: '12px 18px',
    borderRadius: '10px',
    boxShadow: '0 12px 28px rgba(90,0,6,0.2)',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
};

const normaliseOffer = (offer) => ({
  ...offer,
  originalPrice: Number(offer.originalPrice) || 0,
  discountedPrice: Number(offer.discountedPrice) || 0,
});

const DiscountEditor = () => {
  const [discountId, setDiscountId] = useState(null);
  const [page, setPage] = useState(fallbackPage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDiscountPage();
  }, []);

  const fetchDiscountPage = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { timeout: 5000 });
      const first = res.data.data?.[0];
      if (first) {
        setDiscountId(first._id);
        setPage({
          title: first.title || fallbackPage.title,
          subtitle: first.subtitle || fallbackPage.subtitle,
          validUntil: first.validUntil || '',
          isPublished: first.isPublished,
          items: first.items?.length ? first.items : fallbackPage.items,
        });
      }
    } catch (err) {
      console.error('Failed to load discounts:', err.message);
      toast('Using draft offers until backend is deployed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setPage((prev) => ({ ...prev, [field]: value }));
  };

  const updateOffer = (index, field, value) => {
    setPage((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addOffer = () => {
    setPage((prev) => ({ ...prev, items: [...prev.items, emptyOffer] }));
  };

  const removeOffer = (index) => {
    setPage((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const savePage = async () => {
    const cleaned = {
      ...page,
      items: page.items
        .filter((item) => item.name.trim())
        .map((item) => normaliseOffer(item)),
    };

    if (!cleaned.items.length) {
      toast('Add at least one discount offer.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = discountId
        ? await axios.put(`${API}/${discountId}`, cleaned)
        : await axios.post(API, cleaned);
      setDiscountId(res.data.data._id);
      setPage({
        title: res.data.data.title,
        subtitle: res.data.data.subtitle,
        validUntil: res.data.data.validUntil || '',
        isPublished: res.data.data.isPublished,
        items: res.data.data.items,
      });
      toast('Discount page saved.');
    } catch (err) {
      console.error('Save discount error:', err.response?.data || err.message);
      toast('Could not save discount page.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `${window.location.origin}/public/discounts/${discountId || 'main'}`;

  return (
    <AdminLayout>
      <div style={s.page}>
        <header style={s.header}>
          <div>
            <div style={s.kicker}>Student QR Page</div>
            <h1 style={s.title}>Discount Offers</h1>
            <p style={s.subtitle}>Create simple student offers that can be opened from the public QR menu.</p>
          </div>
          <div style={s.headerActions}>
            <button style={s.previewBtn} onClick={() => window.open(publicUrl, '_blank')}>
              Public Preview
            </button>
            <button style={s.saveBtn} onClick={savePage} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save Discounts'}
            </button>
          </div>
        </header>

        <section style={s.settingsGrid}>
          <div style={s.field}>
            <label style={s.label}>Page Title</label>
            <input style={s.input} value={page.title} onChange={(e) => updateField('title', e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Valid Until</label>
            <input
              style={s.input}
              value={page.validUntil}
              placeholder="Example: Today only"
              onChange={(e) => updateField('validUntil', e.target.value)}
            />
          </div>
          <div style={{ ...s.field, gridColumn: '1 / -1' }}>
            <label style={s.label}>Short Message</label>
            <textarea
              style={{ ...s.input, minHeight: '82px', resize: 'vertical' }}
              value={page.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
            />
          </div>
          <label style={s.publishRow}>
            <input
              type="checkbox"
              checked={page.isPublished}
              onChange={(e) => updateField('isPublished', e.target.checked)}
            />
            Show this page to students
          </label>
        </section>

        <section style={s.offersPanel}>
          <div style={s.panelTop}>
            <div>
              <div style={s.kicker}>Offer List</div>
              <h2 style={s.panelTitle}>Student friendly deals</h2>
            </div>
            <button style={s.addBtn} onClick={addOffer}>Add Offer</button>
          </div>

          <div style={s.offerList}>
            {page.items.map((item, index) => (
              <div key={item._id || index} style={s.offerCard}>
                <div style={s.offerHeader}>
                  <strong style={s.offerNumber}>Offer {index + 1}</strong>
                  <button style={s.removeBtn} onClick={() => removeOffer(index)}>Remove</button>
                </div>

                <div style={s.offerGrid}>
                  <div style={s.field}>
                    <label style={s.label}>Offer Name</label>
                    <input style={s.input} value={item.name} onChange={(e) => updateOffer(index, 'name', e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Category</label>
                    <input style={s.input} value={item.category} onChange={(e) => updateOffer(index, 'category', e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Original Price</label>
                    <input
                      style={s.input}
                      type="number"
                      value={item.originalPrice}
                      onChange={(e) => updateOffer(index, 'originalPrice', e.target.value)}
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Discount Price</label>
                    <input
                      style={s.input}
                      type="number"
                      value={item.discountedPrice}
                      onChange={(e) => updateOffer(index, 'discountedPrice', e.target.value)}
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Badge Text</label>
                    <input style={s.input} value={item.badge} onChange={(e) => updateOffer(index, 'badge', e.target.value)} />
                  </div>
                  <label style={s.activeRow}>
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => updateOffer(index, 'isActive', e.target.checked)}
                    />
                    Active
                  </label>
                  <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Description</label>
                    <textarea
                      style={{ ...s.input, minHeight: '72px', resize: 'vertical' }}
                      value={item.description}
                      onChange={(e) => updateOffer(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

const s = {
  page: { padding: '28px', backgroundColor: '#FAF7F2', minHeight: '100%', color: '#5A0006' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
    marginBottom: '22px',
    flexWrap: 'wrap',
  },
  kicker: { color: '#A97A32', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' },
  title: { margin: '6px 0', fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#7A0008' },
  subtitle: { margin: 0, color: '#6F6259', fontWeight: '600' },
  headerActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  previewBtn: {
    border: '1px solid #E3A23B',
    backgroundColor: '#FFF8E8',
    color: '#7A0008',
    borderRadius: '10px',
    padding: '12px 16px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  saveBtn: {
    border: 'none',
    background: 'linear-gradient(135deg, #7A0008, #5A0006)',
    color: '#FAF7F2',
    borderRadius: '10px',
    padding: '12px 18px',
    fontWeight: '900',
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(122,0,8,0.18)',
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8DED1',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 14px 28px rgba(90,0,6,0.06)',
    marginBottom: '22px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { color: '#6F6259', fontWeight: '800', fontSize: '0.82rem' },
  input: {
    border: '1px solid #E3D6C7',
    borderRadius: '10px',
    padding: '12px 13px',
    fontFamily: "'Outfit', sans-serif",
    color: '#5A0006',
    outline: 'none',
    backgroundColor: '#FFFDFB',
  },
  publishRow: { display: 'flex', alignItems: 'center', gap: '10px', color: '#5A0006', fontWeight: '800' },
  offersPanel: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8DED1',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 14px 28px rgba(90,0,6,0.06)',
  },
  panelTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' },
  panelTitle: { margin: '4px 0 0', fontFamily: "'Playfair Display', serif", color: '#7A0008' },
  addBtn: {
    border: 'none',
    backgroundColor: '#E3A23B',
    color: '#5A0006',
    borderRadius: '10px',
    padding: '11px 14px',
    fontWeight: '900',
    cursor: 'pointer',
  },
  offerList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  offerCard: { border: '1px solid #EFE4D7', borderRadius: '10px', padding: '16px', backgroundColor: '#FFFDFB' },
  offerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  offerNumber: { color: '#7A0008' },
  removeBtn: { border: 'none', backgroundColor: '#FFF3F0', color: '#B42318', borderRadius: '8px', padding: '8px 10px', fontWeight: '800', cursor: 'pointer' },
  offerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' },
  activeRow: { display: 'flex', alignItems: 'center', gap: '9px', color: '#5A0006', fontWeight: '800', paddingTop: '26px' },
};

export default DiscountEditor;
