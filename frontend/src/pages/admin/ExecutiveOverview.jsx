import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const ExecutiveOverview = () => {
 const [stats, setStats] = useState({
   todayRevenue: 0,
   totalOrders: 0,
   avgOrderValue: 0,
   chartData: [0, 0, 0, 0, 0, 0, 0],
   topItems: []
 });

 useEffect(() => {
   const fetchStats = async () => {
     try {
       const res = await axios.get('https://balaji-perfect-caters.onrender.com/api/transactions');
       const txs = res.data.data || [];
       
       // Calculate today's stats
       const todayStr = new Date().toISOString().split('T')[0];
       const todayTxs = txs.filter(tx => tx.createdAt && (tx.createdAt.startsWith(todayStr) || tx.createdAt.includes(todayStr)));

       const todayRevenue = todayTxs.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
       const totalOrders = todayTxs.length;
       const avgOrderValue = totalOrders > 0 ? (todayRevenue / totalOrders) : 0;

       // Chart data (last 7 days grouped by day of week)
       const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
       const oneWeekAgo = new Date();
       oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
       
       txs.forEach(tx => {
         if (!tx.createdAt) return;
         const d = new Date(tx.createdAt);
         if (d >= oneWeekAgo) {
           let dayIndex = d.getDay() - 1; // 0=Mon
           if (dayIndex === -1) dayIndex = 6; // Sunday is 6
           dayTotals[dayIndex] += (tx.totalAmount || 0);
         }
       });
       
       const maxDay = Math.max(...dayTotals, 1);
       const chartData = dayTotals.map(v => Math.round((v / maxDay) * 100));

       // Top selling items
       const itemMap = {};
       txs.forEach(tx => {
         if (tx.items) {
            tx.items.forEach(item => {
               if (!itemMap[item.name]) itemMap[item.name] = { units: 0, revenue: 0 };
               itemMap[item.name].units += (item.quantity || 1);
               itemMap[item.name].revenue += ((item.price || 0) * (item.quantity || 1));
            });
         }
       });

       const topItems = Object.entries(itemMap)
         .map(([name, data]) => ({ name, ...data }))
         .sort((a, b) => b.revenue - a.revenue)
         .slice(0, 4)
         .map((item, i) => ({
            ...item,
            trend: '+5%', // placeholder since we don't have historical item tracking easily
            color: i % 2 === 0 ? '#FFF3D5' : '#dcfce7'
         }));

       setStats({ todayRevenue, totalOrders, avgOrderValue, chartData, topItems });
     } catch (err) {
       console.error("Failed to fetch stats", err);
     }
   };
   fetchStats();
 }, []);

 return (
 <AdminLayout>

 <div className="admin-page-body overview-page" style={s.page}>
 
 {/* Welcome Hero */}
 <div className="overview-hero-card" style={s.heroCard}>
 <div style={s.heroLeft}>
 <h2 style={{...s.heroTitle, color: '#ffffff'}}>Good morning, Admin!</h2>
 <p style={s.heroText}>Here is what's happening with your catering operations today. Revenue is up <strong style={{ color: '#F2C36B' }}>12%</strong> compared to yesterday.</p>
 <div className="overview-hero-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
 <button style={s.primaryBtn} onClick={() => window.open('/public/menu/main', '_blank')}>View Live Menu</button>
 </div>
 </div>
 <div style={s.heroRight}>
 <div style={s.systemHealth}>
 <div style={s.healthStatus}>
 <div style={s.pulseDot}></div> System Online
 </div>
 <div style={s.healthMetric}>Ping: 24ms</div>
 <div style={s.healthMetric}>Uptime: 99.9%</div>
 </div>
 </div>
 </div>

 {/* KPI Row */}
 <div className="overview-kpi-row" style={s.kpiRow}>
 <div style={{...s.kpiCard, borderTop: '4px solid #E3A23B' }}>
 <div style={s.kpiHeader}>
 <span style={s.kpiLabel}>TODAY'S REVENUE</span>
 </div>
 <div style={s.kpiValue}>Rs. {stats.todayRevenue.toFixed(2)}</div>
 <div style={s.kpiTrend}><span style={{ color: '#9C6B22' }}> +8.4%</span> vs last week</div>
 </div>
 <div style={{...s.kpiCard, borderTop: '4px solid #F2C36B' }}>
 <div style={s.kpiHeader}>
 <span style={s.kpiLabel}>TODAY'S ORDERS</span>
 </div>
 <div style={s.kpiValue}>{stats.totalOrders}</div>
 <div style={s.kpiTrend}><span style={{ color: '#9C6B22' }}> +12.1%</span> vs last week</div>
 </div>
 <div style={{...s.kpiCard, borderTop: '4px solid #E3A23B' }}>
 <div style={s.kpiHeader}>
 <span style={s.kpiLabel}>AVERAGE ORDER VALUE</span>
 </div>
 <div style={s.kpiValue}>Rs. {stats.avgOrderValue.toFixed(2)}</div>
 <div style={s.kpiTrend}><span style={{ color: '#ef4444' }}> -1.2%</span> vs last week</div>
 </div>
 </div>

 {/* Bottom Grid */}
 <div className="overview-bottom-grid" style={s.bottomGrid}>
 <div style={s.chartCard}>
 <div style={s.cardHeader}>
 <h3 style={s.cardTitle}>Revenue Analytics</h3>
 <select style={s.timeSelect}><option>This Week</option><option>Last Week</option></select>
 </div>
 <div style={s.chartArea}>
 {/* CSS Bar Chart */}
 <div style={s.chartGrid}>
 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
 const height = stats.chartData[i] || 5; // minimum 5% height to always show a stub
 return (
 <div key={day} style={s.chartCol}>
 <div style={s.chartBarContainer}>
 <div style={{...s.chartBar, height: `${height}%` }}></div>
 </div>
 <div style={s.chartDay}>{day}</div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Top Selling Items */}
 <div style={s.listCard}>
 <div style={s.cardHeader}>
 <h3 style={s.cardTitle}>Top Selling Items</h3>
 <button style={{ background: 'none', border: 'none', color: '#7A0008', fontWeight: '700', cursor: 'pointer' }}>View All</button>
 </div>
 <div style={s.listCont}>
 {stats.topItems.length === 0 ? (
  <div style={{ padding: '20px', textAlign: 'center', color: '#6F6259' }}>No items sold yet.</div>
 ) : stats.topItems.map((item, i) => (
 <div key={i} style={s.listItem}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#5A0006' }}>
 #{i + 1}
 </div>
 <div>
 <div style={{ fontWeight: '700', color: '#5A0006', fontSize: '0.9rem' }}>{item.name}</div>
 <div style={{ fontSize: '0.75rem', color: '#6F6259' }}>{item.units} units sold</div>
 </div>
 </div>
 <div style={{ textAlign: 'right' }}>
 <div style={{ fontWeight: '800', color: '#5A0006', fontSize: '0.95rem' }}>Rs. {item.revenue.toFixed(2)}</div>
 <div style={{ fontSize: '0.75rem', color: item.trend.startsWith('+') ? '#9C6B22' : '#ef4444', fontWeight: '700' }}>
 {item.trend}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>
 </AdminLayout>
 );
};

const pulseAnim = `
 @keyframes pulse {
 0% { box-shadow: 0 0 0 0 rgba(227, 162, 59, 0.38); }
 70% { box-shadow: 0 0 0 6px rgba(227, 162, 59, 0); }
 100% { box-shadow: 0 0 0 0 rgba(227, 162, 59, 0); }
 }
`;
if (typeof document !== 'undefined') {
 const style = document.createElement('style');
 style.innerHTML = pulseAnim;
 document.head.appendChild(style);
}

const s = {
 topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', backgroundColor: 'white', borderBottom: '1px solid #E8DED1' },
 pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#5A0006', letterSpacing: '-0.5px' },
 pageSubtitle: { fontSize: '0.85rem', color: '#6F6259', marginTop: '2px' },
 topRight: { display: 'flex', alignItems: 'center', gap: '20px' },
 iconBtn: { width: '36px', height: '36px', border: '1px solid #E8DED1', borderRadius: '10px', backgroundColor: '#FAF7F2', cursor: 'pointer', position: 'relative' },
 badge: { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
 adminProfile: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 10px', borderRadius: '10px', transition: '0.2s', ':hover': { backgroundColor: '#F4EFE7' } },
 adminAvatar: { width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#7A0008', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' },
 
 page: { flex: 1, padding: '24px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" },
 
 heroCard: { background: 'linear-gradient(135deg, #5A0006 0%, #7A0008 62%, #E3A23B 128%)', borderRadius: '14px', padding: '30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 16px 34px -10px rgba(90, 0, 6, 0.48)', border: '1px solid rgba(242,195,107,0.24)' },
 heroLeft: { maxWidth: '600px' },
 heroTitle: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' },
 heroText: { fontSize: '1rem', color: '#EFE3D3', lineHeight: '1.5' },
 primaryBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #E3A23B, #F2C36B)', color: '#5A0006', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', transition: '0.2s', boxShadow: '0 8px 18px rgba(227,162,59,0.28)' },
 secondaryBtn: { padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', backdropFilter: 'blur(10px)' },
 
 heroRight: { display: 'flex', alignItems: 'center' },
 systemHealth: { backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '16px 20px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
 healthStatus: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#F2C36B', marginBottom: '10px' },
 pulseDot: { width: '10px', height: '10px', backgroundColor: '#E3A23B', borderRadius: '50%', animation: 'pulse 2s infinite' },
 healthMetric: { fontSize: '0.8rem', color: '#8D7E73', marginBottom: '4px' },
 
 kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
 kpiCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 26px rgba(90,0,6,0.07)', border: '1px solid #E8DED1', display: 'flex', flexDirection: 'column' },
 kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
 kpiLabel: { fontSize: '0.75rem', fontWeight: '800', color: '#6F6259', textTransform: 'uppercase', letterSpacing: '0.5px' },
 kpiIconBox: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F4EFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
 kpiValue: { fontSize: '2.2rem', fontWeight: '800', color: '#5A0006', marginBottom: '4px', letterSpacing: '-1px' },
 kpiTrend: { fontSize: '0.8rem', color: '#8D7E73', fontWeight: '600' },
 
 bottomGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' },
 chartCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 26px rgba(90,0,6,0.07)', border: '1px solid #E8DED1' },
 listCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 26px rgba(90,0,6,0.07)', border: '1px solid #E8DED1' },
 cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
 cardTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#5A0006' },
 timeSelect: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #E8DED1', fontSize: '0.85rem', color: '#5E514A', fontWeight: '600', outline: 'none' },
 
 chartArea: { height: '300px', display: 'flex', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #F4EFE7' },
 chartGrid: { display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' },
 chartCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', height: '100%' },
 chartBarContainer: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' },
 chartBar: { width: '100%', background: 'linear-gradient(180deg, #F2C36B 0%, #E3A23B 18%, #7A0008 100%)', borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease-out' },
 chartDay: { fontSize: '0.8rem', color: '#6F6259', fontWeight: '600', height: '20px' },
 
 listCont: { display: 'flex', flexDirection: 'column', gap: '16px' },
 listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', border: '1px solid #F4EFE7', backgroundColor: 'white', transition: '0.2s', cursor: 'pointer' },
};

export default ExecutiveOverview;
