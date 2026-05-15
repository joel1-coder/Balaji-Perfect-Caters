import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const ExecutiveOverview = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [staffData, setStaffData] = useState({ onDuty: 14, total: 20 }); // Fallback values while loading

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get('https://balaji-perfect-caters.onrender.com/api/staff');
        const staffList = res.data.data || [];
        const onDuty = staffList.filter(s => s.status === 'ON-DUTY').length;
        setStaffData({ onDuty, total: staffList.length });
      } catch (err) {
        console.error('Failed to fetch staff data', err);
      }
    };
    fetchStaff();
  }, []);

  return (
    <AdminLayout>

      <div style={s.page}>
        
        {/* Welcome Hero */}
        <div style={s.heroCard}>
          <div style={s.heroLeft}>
            <h2 style={s.heroTitle}>Good morning, Admin!</h2>
            <p style={s.heroText}>Here is what's happening with your canteen today. Revenue is up <strong style={{ color: '#10b981' }}>12%</strong> compared to yesterday.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button style={s.primaryBtn} onClick={() => window.open('/public/menu/main', '_blank')}>View Live Menu</button>
              <button style={s.secondaryBtn}>Generate Daily Report</button>
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
        <div style={s.kpiRow}>
          <div style={{ ...s.kpiCard, borderTop: '4px solid #38bdf8' }}>
            <div style={s.kpiHeader}>
              <span style={s.kpiLabel}>TODAY'S REVENUE</span>
              <span style={s.kpiIconBox}>₹</span>
            </div>
            <div style={s.kpiValue}>₹3,248.50</div>
            <div style={s.kpiTrend}><span style={{ color: '#10b981' }}>↑ +8.4%</span> vs last week</div>
          </div>
          <div style={{ ...s.kpiCard, borderTop: '4px solid #818cf8' }}>
            <div style={s.kpiHeader}>
              <span style={s.kpiLabel}>TOTAL ORDERS</span>
              <span style={s.kpiIconBox}>[CART]</span>
            </div>
            <div style={s.kpiValue}>412</div>
            <div style={s.kpiTrend}><span style={{ color: '#10b981' }}>↑ +12.1%</span> vs last week</div>
          </div>
          <div style={{ ...s.kpiCard, borderTop: '4px solid #f472b6' }}>
            <div style={s.kpiHeader}>
              <span style={s.kpiLabel}>AVERAGE ORDER VALUE</span>
              <span style={s.kpiIconBox}>[CHART]</span>
            </div>
            <div style={s.kpiValue}>₹7.88</div>
            <div style={s.kpiTrend}><span style={{ color: '#ef4444' }}>↓ -1.2%</span> vs last week</div>
          </div>
          <div style={{ ...s.kpiCard, borderTop: '4px solid #34d399' }}>
            <div style={s.kpiHeader}>
              <span style={s.kpiLabel}>ACTIVE STAFF</span>
              <span style={s.kpiIconBox}>[PEOPLE]</span>
            </div>
            <div style={s.kpiValue}>{staffData.onDuty} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {staffData.total}</span></div>
            <div style={s.kpiTrend}>Current Shift</div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={s.bottomGrid}>
          
          {/* Chart Section */}
          <div style={s.chartCard}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Revenue Analytics</h3>
              <select style={s.timeSelect}><option>This Week</option><option>Last Week</option></select>
            </div>
            <div style={s.chartArea}>
              {/* Mock CSS Bar Chart */}
              <div style={s.chartGrid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const height = [40, 65, 55, 80, 95, 45, 30][i];
                  return (
                    <div key={day} style={s.chartCol}>
                      <div style={s.chartBarContainer}>
                        <div style={{ ...s.chartBar, height: `${height}%` }}></div>
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
              <button style={{ background: 'none', border: 'none', color: '#0f2444', fontWeight: '700', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={s.listCont}>
              {[
                { name: 'Grilled Chicken Salad', units: 142, revenue: '₹1,136.00', trend: '+12%', color: '#fef3c7' },
                { name: 'Fresh Orange Juice', units: 98, revenue: '₹490.00', trend: '+5%', color: '#dbeafe' },
                { name: 'Espresso Double', units: 85, revenue: '₹340.00', trend: '+2%', color: '#f3e8ff' },
                { name: 'Avocado Toast', units: 76, revenue: '₹646.00', trend: '-3%', color: '#dcfce7' },
              ].map((item, i) => (
                <div key={i} style={s.listItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#0f172a' }}>
                      #{i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.units} units sold</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{item.revenue}</div>
                    <div style={{ fontSize: '0.75rem', color: item.trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: '700' }}>
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
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = pulseAnim;
  document.head.appendChild(style);
}

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' },
  pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: '0.85rem', color: '#64748b', marginTop: '2px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  iconBtn: { width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc', cursor: 'pointer', position: 'relative' },
  badge: { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adminProfile: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 10px', borderRadius: '10px', transition: '0.2s', ':hover': { backgroundColor: '#f1f5f9' } },
  adminAvatar: { width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0f2444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' },
  
  page: { flex: 1, padding: '24px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" },
  
  heroCard: { background: 'linear-gradient(135deg, #0f2444 0%, #1e3a8a 100%)', borderRadius: '16px', padding: '30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(15, 36, 68, 0.4)' },
  heroLeft: { maxWidth: '600px' },
  heroTitle: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' },
  heroText: { fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.5' },
  primaryBtn: { padding: '10px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', transition: '0.2s' },
  secondaryBtn: { padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', backdropFilter: 'blur(10px)' },
  
  heroRight: { display: 'flex', alignItems: 'center' },
  systemHealth: { backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '16px 20px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
  healthStatus: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#10b981', marginBottom: '10px' },
  pulseDot: { width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' },
  healthMetric: { fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' },
  
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  kpiCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  kpiLabel: { fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  kpiIconBox: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  kpiValue: { fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px', letterSpacing: '-1px' },
  kpiTrend: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' },
  
  bottomGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' },
  chartCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  listCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' },
  timeSelect: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: '600', outline: 'none' },
  
  chartArea: { height: '300px', display: 'flex', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #f1f5f9' },
  chartGrid: { display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' },
  chartCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', height: '100%' },
  chartBarContainer: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' },
  chartBar: { width: '100%', backgroundColor: '#0f2444', borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease-out' },
  chartDay: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600', height: '20px' },
  
  listCont: { display: 'flex', flexDirection: 'column', gap: '16px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: 'white', transition: '0.2s', cursor: 'pointer' },
};

export default ExecutiveOverview;
