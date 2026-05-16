import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = 'https://balaji-perfect-caters.onrender.com/api/discounts';

const fallbackDiscount = {
  title: 'Student Discount Offers',
  subtitle: 'Fresh student offers available today at Balaji Perfect Caters.',
  validUntil: 'Today only',
  isPublished: true,
  items: [
    {
      _id: '1',
      name: 'Student Breakfast Combo',
      description: 'Idli, vada and tea at a friendly student price.',
      category: 'Breakfast',
      originalPrice: 75,
      discountedPrice: 55,
      badge: 'Save Rs. 20',
      isActive: true,
    },
    {
      _id: '2',
      name: 'Tea and Samosa Pack',
      description: 'A quick snack combo for break time.',
      category: 'Snacks',
      originalPrice: 40,
      discountedPrice: 30,
      badge: 'Popular',
      isActive: true,
    },
    {
      _id: '3',
      name: 'Lunch Thali Offer',
      description: 'Simple lunch thali offer for students.',
      category: 'Lunch',
      originalPrice: 110,
      discountedPrice: 90,
      badge: 'Student Deal',
      isActive: true,
    },
  ],
};

const PublicDiscounts = () => {
  const { id } = useParams();
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const endpoint = id && id !== 'main' ? `${API}/${id}` : `${API}/active`;
        const res = await axios.get(endpoint, { timeout: 4000 });
        setDiscount(res.data.data || fallbackDiscount);
      } catch (err) {
        setDiscount(fallbackDiscount);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id]);

  if (loading) {
    return <div style={s.message}>Loading discounts...</div>;
  }

  const activeItems = (discount?.items || []).filter((item) => item.isActive);

  return (
    <main style={s.page}>
      <header style={s.hero}>
        <div>
          <div style={s.kicker}>Balaji Perfect Caters</div>
          <h1 style={s.title}>{discount?.title || fallbackDiscount.title}</h1>
          <p style={s.subtitle}>{discount?.subtitle || fallbackDiscount.subtitle}</p>
          {discount?.validUntil && <div style={s.valid}>Valid: {discount.validUntil}</div>}
        </div>
        <a href="/public/menu/main" style={s.menuLink}>View Menu</a>
      </header>

      <section style={s.offerGrid}>
        {activeItems.length === 0 ? (
          <div style={s.empty}>No discounts are active right now. Please check again later.</div>
        ) : (
          activeItems.map((item) => {
            const saveAmount = Math.max(0, Number(item.originalPrice || 0) - Number(item.discountedPrice || 0));
            return (
              <article key={item._id || item.name} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.badge}>{item.badge || `Save Rs. ${saveAmount}`}</span>
                  <span style={s.category}>{item.category}</span>
                </div>
                <h2 style={s.offerName}>{item.name}</h2>
                <p style={s.offerText}>{item.description}</p>
                <div style={s.priceRow}>
                  <span style={s.oldPrice}>Rs. {item.originalPrice}</span>
                  <span style={s.newPrice}>Rs. {item.discountedPrice}</span>
                </div>
                <div style={s.saveText}>You save Rs. {saveAmount}</div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
};

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FAF7F2 0%, #FFF4DE 100%)',
    padding: '26px 20px 42px',
    fontFamily: "'Outfit', sans-serif",
    color: '#5A0006',
  },
  hero: {
    maxWidth: '1120px',
    margin: '0 auto 26px',
    background: 'linear-gradient(135deg, #7A0008 0%, #5A0006 62%, #8D520F 100%)',
    color: '#FAF7F2',
    borderRadius: '14px',
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    boxShadow: '0 18px 40px rgba(90,0,6,0.18)',
    flexWrap: 'wrap',
  },
  kicker: { color: '#F2C36B', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.78rem' },
  title: { margin: '8px 0', fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', lineHeight: 1.05, color: '#FAF7F2' },
  subtitle: { margin: 0, color: 'rgba(250,247,242,0.84)', fontWeight: '600', maxWidth: '620px' },
  valid: { marginTop: '14px', color: '#F2C36B', fontWeight: '900' },
  menuLink: {
    color: '#5A0006',
    backgroundColor: '#F2C36B',
    textDecoration: 'none',
    borderRadius: '10px',
    padding: '13px 16px',
    fontWeight: '900',
  },
  offerGrid: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8DED1',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 14px 30px rgba(90,0,6,0.08)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '18px' },
  badge: { backgroundColor: '#FFF0CA', color: '#7A0008', border: '1px solid #E3A23B', borderRadius: '999px', padding: '6px 10px', fontWeight: '900', fontSize: '0.78rem' },
  category: { color: '#A97A32', fontWeight: '900', fontSize: '0.78rem', textTransform: 'uppercase' },
  offerName: { margin: 0, fontFamily: "'Playfair Display', serif", color: '#7A0008', fontSize: '1.45rem', lineHeight: 1.12 },
  offerText: { color: '#6F6259', lineHeight: 1.5, fontWeight: '600' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '18px' },
  oldPrice: { color: '#8D7E73', textDecoration: 'line-through', fontWeight: '800' },
  newPrice: { color: '#7A0008', fontSize: '1.65rem', fontWeight: '900' },
  saveText: { marginTop: '12px', color: '#A86612', fontWeight: '900' },
  empty: { gridColumn: '1 / -1', backgroundColor: '#FFFFFF', border: '1px dashed #DFCDB8', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#6F6259', fontWeight: '700' },
  message: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: '#7A0008', backgroundColor: '#FAF7F2' },
};

export default PublicDiscounts;
