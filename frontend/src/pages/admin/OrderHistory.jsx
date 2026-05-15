import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

// Mock data with ISO dates for easy filtering
const ORDERS = [
  { id: '#ORD-94021', date: '2024-05-24', time: '10:45 AM', customer: 'John Doe', initials: 'JD', color: '#dbeafe', items: 'Grilled Chicken Salad, Fresh Orange Juice...', total: 24.50, status: 'Paid' },
  { id: '#ORD-94020', date: '2024-05-24', time: '10:42 AM', customer: 'Alice Smith', initials: 'AS', color: '#f3e8ff', items: 'Espresso, Avocado Toast', total: 18.20, status: 'Unpaid' },
  { id: '#ORD-94019', date: '2024-05-23', time: '10:30 AM', customer: 'Guest #102', initials: '👤', color: '#f1f5f9', items: 'Double Cheeseburger Combo, Large Soda', total: 15.75, status: 'Paid' },
  { id: '#ORD-94018', date: '2024-04-15', time: '10:15 AM', customer: 'Robert King', initials: 'RK', color: '#dcfce7', items: 'Margherita Pizza, Sparkling Water x2', total: 32.00, status: 'Paid' },
  { id: '#ORD-94017', date: '2024-04-02', time: '09:00 AM', customer: 'Emma Watson', initials: 'EW', color: '#fef3c7', items: 'Pancakes, Maple Syrup, Black Coffee', total: 21.00, status: 'Paid' },
  { id: '#ORD-94016', date: '2024-03-28', time: '01:20 PM', customer: 'Marketing Dept', initials: 'MD', color: '#e0e7ff', items: 'Team Lunch Buffet (x8)', total: 125.00, status: 'Pending' },
];

const statusStyle = {
  Paid: { bg: '#dcfce7', color: '#16a34a' },
  Unpaid: { bg: '#fee2e2', color: '#dc2626' },
  Pending: { bg: '#fef9c3', color: '#ca8a04' },
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Memoized Filter Logic
  const filteredOrders = useMemo(() => {
    return ORDERS.filter(o => {
      const matchSearch = (o.id + o.customer + o.items).toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchDate = true;
      if (startDate) matchDate = matchDate && o.date >= startDate;
      if (endDate) matchDate = matchDate && o.date <= endDate;

      return matchSearch && matchDate;
    });
  }, [searchQuery, startDate, endDate]);

  // CSV Export
  const exportToCSV = () => {
    if (filteredOrders.length === 0) return alert('No data to export!');
    let csv = 'Transaction ID,Date,Time,Customer,Items,Total Amount,Status\n';
    filteredOrders.forEach(o => {
      const items = `"${o.items}"`; // escape commas
      csv += `${o.id},="${o.date}",${o.time},"${o.customer}",${items},${o.total},${o.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Order_History_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Word/DOC Export
  const exportToDOC = () => {
    if (filteredOrders.length === 0) return alert('No data to export!');
    
    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Order History Report</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h1 style="color: #0f2444; border-bottom: 2px solid #0f2444; padding-bottom: 10px;">Order History Report</h1>
        <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${(startDate || endDate) ? `<p><strong>Period:</strong> ${startDate || 'Start'} to ${endDate || 'End'}</p>` : ''}
        <hr/>
    `;
    
    filteredOrders.forEach(o => {
      docContent += `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; background: #f8fafc;">
          <p><strong>ID:</strong> ${o.id}</p>
          <p><strong>Date/Time:</strong> ${o.date} at ${o.time}</p>
          <p><strong>Customer:</strong> ${o.customer}</p>
          <p><strong>Items:</strong> ${o.items}</p>
          <p><strong>Total:</strong> $${o.total.toFixed(2)}</p>
          <p><strong>Status:</strong> ${o.status}</p>
        </div>
      `;
    });
    
    docContent += `</body></html>`;
    
    const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Order_History_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totalFilteredSales = filteredOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminLayout>
      <header style={s.topBar}>
        <h1 style={s.pageTitle}>Order History</h1>
        <div style={s.topRight}>
          <div style={s.searchBox}>
            <span>ðŸ”</span>
            <input 
              style={s.searchInput} 
              placeholder="Search Transaction ID, User..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button style={s.iconBtn}>ðŸ””</button>
          <button style={s.newOrderBtn} onClick={() => navigate('/admin/billing')}>+ New Order</button>
        </div>
      </header>

      <div style={s.page}>
        <div style={s.card}>
          <div style={s.filterRow}>
            
            <div style={s.dateFilterContainer}>
              <div style={s.dateGroup}>
                <label style={s.dateLabel}>Start Date</label>
                <input type="date" style={s.dateInput} value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div style={s.dateGroup}>
                <label style={s.dateLabel}>End Date</label>
                <input type="date" style={s.dateInput} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <button 
                style={s.clearBtn} 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                disabled={!startDate && !endDate}
              >
                Clear Dates
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={s.exportContainer}>
                <span style={s.exportLabel}>Export:</span>
                <button style={s.exportBtn} onClick={exportToCSV}>📊 Excel (CSV)</button>
                <span style={{ color: '#e2e8f0' }}>|</span>
                <button style={s.exportBtn} onClick={exportToDOC}>📄 Word (DOC)</button>
              </div>

              <div style={s.totalSalesCard}>
                <div style={s.totalLabel}>FILTERED PAID SALES</div>
                <div style={s.totalVal}>${totalFilteredSales.toFixed(2)}</div>
              </div>
            </div>

          </div>

          <table style={s.table}>
            <thead>
              <tr>
                {['TRANSACTION ID', 'DATE & TIME', 'CUSTOMER', 'ITEMS', 'TOTAL', 'STATUS'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No orders found for this date range.
                  </td>
                </tr>
              ) : filteredOrders.map(o => (
                <tr key={o.id} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: '700', color: '#0f172a' }}>{o.id}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>{o.date}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{o.time}</div>
                  </td>
                  <td style={s.td}>
                    <div style={s.customerCell}>
                      <div style={{ ...s.avatar, backgroundColor: o.color }}>{o.initials}</div>
                      <span style={{ fontWeight: '600' }}>{o.customer}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: '#475569', maxWidth: '200px' }}>{o.items}</td>
                  <td style={{ ...s.td, fontWeight: '700' }}>${o.total.toFixed(2)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, backgroundColor: statusStyle[o.status].bg, color: statusStyle[o.status].color }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={s.paginationRow}>
            <span style={s.showingText}>Showing {filteredOrders.length} transactions</span>
            <div style={s.pagination}>
              <button style={s.pageBtn}>â€¹</button>
              <button style={s.pageActive}>1</button>
              <button style={s.pageBtn}>â€º</button>
            </div>
          </div>
        </div>

        {/* Bottom Summary Cards */}
        <div style={s.summaryRow}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>📈</div>
            <div style={s.summaryTitle}>Peak Hour Volume</div>
            <div style={s.summaryText}>Most orders processed between</div>
            <div style={{ color: '#0f2444', fontWeight: '700', marginBottom: '12px' }}>12:00 PM - 1:30 PM.</div>
            <div style={s.progressBar}><div style={{ ...s.progressFill, width: '75%' }}></div></div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>⭐</div>
            <div style={s.summaryTitle}>Top Selling Item</div>
            <div style={{ color: '#0f2444', fontWeight: '700', fontSize: '1.1rem', margin: '8px 0' }}>Grilled Chicken Salad</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>142 units sold</div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>💳</div>
            <div style={s.summaryTitle}>Payment Mix</div>
            <div style={s.paymentMixRow}>
              {[{ label: 'Card', val: '72%' }, { label: 'Cash', val: '18%' }, { label: 'Mobile', val: '10%' }].map(p => (
                <div key={p.label}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.label}</div>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{p.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' },
  pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' },
  topRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', backgroundColor: '#f8fafc' },
  searchInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#64748b', width: '220px', fontFamily: "'Outfit', sans-serif" },
  iconBtn: { width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' },
  newOrderBtn: { backgroundColor: '#0f2444', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" },
  page: { flex: 1, padding: '24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Outfit', sans-serif" },
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' },
  
  dateFilterContainer: { display: 'flex', alignItems: 'flex-end', gap: '12px' },
  dateGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  dateLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  dateInput: { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#0f172a' },
  clearBtn: { padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", height: '38px' },

  exportContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  exportLabel: { color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
  exportBtn: { background: 'none', border: 'none', color: '#0f2444', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif", padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' },

  totalSalesCard: { backgroundColor: '#0f2444', color: 'white', borderRadius: '12px', padding: '12px 20px', textAlign: 'right' },
  totalLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '2px' },
  totalVal: { fontSize: '1.5rem', fontWeight: '800' },
  
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #f1f5f9', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '18px 14px', color: '#374151', fontSize: '0.9rem', verticalAlign: 'middle' },
  customerCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#374151', flexShrink: 0 },
  badge: { fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' },
  
  paginationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  showingText: { color: '#94a3b8', fontSize: '0.85rem' },
  pagination: { display: 'flex', gap: '6px' },
  pageBtn: { width: '34px', height: '34px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" },
  pageActive: { width: '34px', height: '34px', border: '1px solid #0f2444', borderRadius: '8px', backgroundColor: '#0f2444', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif", fontWeight: '700' },
  
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  summaryCard: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0' },
  summaryIcon: { fontSize: '1.3rem', marginBottom: '12px' },
  summaryTitle: { fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
  summaryText: { color: '#64748b', fontSize: '0.85rem' },
  progressBar: { height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px' },
  progressFill: { height: '100%', backgroundColor: '#0f2444', borderRadius: '10px' },
  paymentMixRow: { display: 'flex', gap: '24px', marginTop: '12px' },
};

export default OrderHistory;
