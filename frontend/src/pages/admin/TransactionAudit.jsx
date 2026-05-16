import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const TRANSACTIONS = [
  { id: '#TXN-98421', date: '2024-10-27', time: '10:42 AM', customer: 'David Chen', account: 'Emp ID: 450912', items: 'Continental Breakfast, Cappuccino', total: 18.50, status: 'Pending', station: 'Station 1' },
  { id: '#TXN-98420', date: '2024-10-27', time: '10:38 AM', customer: 'Sarah Miller', account: 'Guest Visit', items: 'Gourmet Salad, Mineral Water', total: 14.20, status: 'Paid', station: 'Station 2' },
  { id: '#TXN-98419', date: '2024-10-27', time: '10:35 AM', customer: 'Marcus Thorne', account: 'Emp ID: 450332', items: 'Daily Special Thali', total: 12.00, status: 'Paid', station: 'Station 1' },
  { id: '#TXN-98418', date: '2024-10-26', time: '10:30 AM', customer: 'Elena Rodriguez', account: 'Staff Subsidized', items: 'Espresso, Croissant (x2)', total: 8.75, status: 'Pending', station: 'Station 1' },
  { id: '#TXN-98417', date: '2024-10-26', time: '10:22 AM', customer: 'Logistics Team', account: 'Corporate Account', items: 'Bulk Lunch Pack (x12)', total: 144.00, status: 'Disputed', station: 'Station 2' },
  { id: '#TXN-98416', date: '2024-10-26', time: '09:45 AM', customer: 'HR Department', account: 'Corporate Account', items: 'Meeting Snacks', total: 45.00, status: 'Paid', station: 'Station 1' },
  { id: '#TXN-98415', date: '2024-10-25', time: '09:10 AM', customer: 'John Smith', account: 'Emp ID: 450111', items: 'Americano', total: 3.50, status: 'Paid', station: 'Station 2' },
];

const statusStyle = {
  pending: { bg: '#FFF3D5', color: '#A86612' },
  paid: { bg: '#dcfce7', color: '#16a34a' },
  unpaid: { bg: '#fee2e2', color: '#dc2626' },
};

const TransactionAudit = () => {
  const [selected, setSelected] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Transactions');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const uniqueDepartments = useMemo(() => {
    return [...new Set(transactions.map(t => t.department).filter(d => d && d.trim() !== ''))];
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('https://balaji-perfect-caters.onrender.com/api/transactions');
      setTransactions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`https://balaji-perfect-caters.onrender.com/api/transactions/${id}/status`, { paymentStatus: newStatus });
      setTransactions(prev => prev.map(t => t._id === id ? { ...t, paymentStatus: newStatus } : t));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Memoized Filtered List
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const itemNames = (t.items || []).map(i => i.name).join(', ');
      const searchStr = ((t.orderId || '') + (t.customerName || '') + itemNames).toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());
      
      const tStatus = (t.paymentStatus || 'pending').toLowerCase();
      const matchStatus = statusFilter === 'All Transactions' || tStatus === statusFilter.toLowerCase();
      
      let matchDate = true;
      if (t.createdAt) {
        try {
          const tDate = new Date(t.createdAt).toISOString().split('T')[0];
          if (startDate) matchDate = matchDate && tDate >= startDate;
          if (endDate) matchDate = matchDate && tDate <= endDate;
        } catch (e) {
          // ignore invalid dates
        }
      }

      const matchDept = departmentFilter === 'All Departments' || (t.department || 'N/A') === departmentFilter;

      return matchSearch && matchStatus && matchDate && matchDept;
    });
  }, [transactions, searchQuery, statusFilter, startDate, endDate, departmentFilter]);

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () => {
    if (selected.length === filteredData.length) setSelected([]);
    else setSelected(filteredData.map(t => t._id));
  };

  // CSV Export for Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) return alert('No data to export!');
    
    let csvContent = 'Order ID,Date,Customer,Department,Items,Total Amount,Status\n';
    
    filteredData.forEach(t => {
      const date = new Date(t.createdAt).toLocaleDateString();
      const itemStr = t.items.map(i => `${i.name} (x${i.qty})`).join('; ');
      csvContent += `${t.orderId},${date},"${t.customerName}","${t.department || 'N/A'}","${itemStr}",${t.totalAmount},${t.paymentStatus}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Balaji_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // DOC Export for Word
  const exportToWord = () => {
    if (filteredData.length === 0) return alert('No data to export!');
    
    let docContent = `<html><body style="font-family: Arial;"><h1>Transaction Audit Report</h1>`;
    filteredData.forEach(t => {
      docContent += `
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
          <p><strong>Order ID:</strong> ${t.orderId}</p>
          <p><strong>Customer:</strong> ${t.customerName} (${t.department || 'N/A'})</p>
          <p><strong>Total:</strong> Rs. ${t.totalAmount.toFixed(2)}</p>
          <p><strong>Status:</strong> ${t.paymentStatus.toUpperCase()}</p>
          <p><strong>Date:</strong> ${new Date(t.createdAt).toLocaleString()}</p>
        </div>`;
    });
    docContent += `</body></html>`;
    
    const blob = new Blob([docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Balaji_Report_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
  };

  const totalFilteredValue = filteredData.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const generateBill = () => {
    if (filteredData.length === 0) return alert('No data to generate bill!');
    
    let billContent = `
      <html>
        <head>
          <title>Generated Bill</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <style>
            body { font-family: 'Outfit', sans-serif; padding: 40px; color: #333; }
            #content-to-pdf { padding: 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #7A0008; }
            .header p { margin: 5px 0; color: #666; }
            .info { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #FAF7F2; color: #7A0008; }
            tr { page-break-inside: avoid; }
            .total { text-align: right; font-size: 1.5em; font-weight: bold; color: #7A0008; margin-top: 20px; }
            .no-print { text-align: center; margin-top: 50px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div id="content-to-pdf">
            <div class="header">
              <h1>Balaji Perfect Caters</h1>
              <p>Department Billing Statement</p>
            </div>
            
            <div class="info">
              <p><strong>Department:</strong> ${departmentFilter === 'All Departments' ? 'All Departments' : departmentFilter}</p>
              <p><strong>Period:</strong> ${startDate || 'Start'} to ${endDate || 'End'}</p>
              <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Transactions:</strong> ${filteredData.length}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData.map(t => `
                  <tr>
                    <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>${t.orderId}</td>
                    <td>${t.customerName}</td>
                    <td>${(t.items || []).map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
                    <td style="text-align: right;">Rs. ${(t.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total">
              Grand Total: Rs. ${totalFilteredValue.toFixed(2)}
            </div>
          </div>

          <div class="no-print" style="display: flex; gap: 15px; justify-content: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #7A0008; color: white; border: none; border-radius: 5px;">ðŸ–¨ï¸ Print Bill</button>
            <button onclick="downloadPDF()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #dc2626; color: white; border: none; border-radius: 5px;">ðŸ“¥ Download PDF</button>
          </div>

          <script>
            function downloadPDF() {
              var element = document.getElementById('content-to-pdf');
              
              var pxHeight = element.scrollHeight;
              var inHeight = (pxHeight / 96) + 1.5; 
              var pdfFormat = inHeight > 11 ? [8.5, inHeight] : 'letter';

              var opt = {
                margin:       0.5,
                filename:     'Balaji_Billing_Statement.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: pdfFormat, orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(billContent);
    printWindow.document.close();
  };

  return (
    <AdminLayout>
      <header style={s.topBar}>
        <h1 style={s.pageTitle}>Transaction Audit</h1>
        <div style={s.topRight}>
          <div style={s.searchBox}>
            <span>[SEARCH]</span>
            <input 
              style={s.searchInput} 
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div style={s.page}>
        {/* Filters */}
        <div style={s.filterCard}>
          <div style={s.filterLeft}>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Start Date</label>
              <input type="date" style={s.filterInput} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>End Date</label>
              <input type="date" style={s.filterInput} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Department</label>
              <select style={s.filterInput} value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                <option>All Departments</option>
                {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Audit Category</label>
              <select style={s.filterInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>All Transactions</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Disputed</option>
              </select>
            </div>
            <button 
                style={s.clearBtn} 
                onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('All Transactions'); setDepartmentFilter('All Departments'); }}
              >
                Clear Filters
            </button>
          </div>
          <div style={s.exportBox}>
            <div style={s.exportLabel}>EXPORT FILTERED LOGS</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={s.exportBtn} onClick={exportToExcel}>ðŸ“Š Excel (CSV)</button>
              <button style={s.exportBtn} onClick={exportToWord}>ðŸ“ Word (TXT)</button>
              <button style={{ ...s.exportBtn, backgroundColor: '#7A0008', color: 'white' }} onClick={generateBill}>ðŸ§¾ Generate Bill</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={s.card}>
          <div style={s.bulkBar}>
            <span style={{ color: '#6F6259', fontSize: '0.85rem' }}>{selected.length} items selected</span>
            {selected.length > 0 && (
              <>
                <button style={s.bulkBtn}>Å“â€œ Mark as Paid</button>
                <button style={{ ...s.bulkBtn, color: '#ef4444' }}>ðŸš© Flag for Review</button>
              </>
            )}
            <span style={{ marginLeft: 'auto', color: '#8D7E73', fontSize: '0.8rem' }}>
              Showing {filteredData.length} Transactions
            </span>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>
                  <input type="checkbox" 
                    checked={filteredData.length > 0 && selected.length === filteredData.length} 
                    onChange={toggleAll}
                  />
                </th>
                {['Transaction ID', 'Date & Time', 'Customer / Account', 'Items', 'Total Amount', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8D7E73' }}>
                    {loading ? 'Loading transactions...' : 'No transactions match your filters.'}
                  </td>
                </tr>
              ) : filteredData.map((t) => (
                <tr key={t._id} style={{ ...s.tr, backgroundColor: selected.includes(t._id) ? '#FAF7F2' : 'white' }}>
                  <td style={s.td}><input type="checkbox" checked={selected.includes(t._id)} onChange={() => toggle(t._id)}/></td>
                  <td style={{ ...s.td, fontWeight: '700', color: '#5A0006' }}>{t.orderId}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: '600', color: '#4A3D38', fontSize: '0.9rem' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                    <div style={{ color: '#8D7E73', fontSize: '0.75rem' }}>{new Date(t.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: '700', color: '#5A0006', fontSize: '0.9rem' }}>{t.customerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8D7E73' }}>{t.customerId || t.department || 'N/A'}</div>
                  </td>
                  <td style={{ ...s.td, color: '#5E514A' }}>{(t.items || []).map(i => i.name).join(', ')}</td>
                  <td style={{ ...s.td, fontWeight: '700' }}>â‚¹{(t.totalAmount || 0).toFixed(2)}</td>
                  <td style={s.td}>
                    <select
                      value={t.paymentStatus || 'pending'}
                      onChange={e => updateStatus(t._id, e.target.value)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '20px',
                        border: '1.5px solid',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none',
                        fontFamily: "'Outfit', sans-serif",
                        backgroundColor: (statusStyle[t.paymentStatus] || statusStyle.pending).bg,
                        color: (statusStyle[t.paymentStatus] || statusStyle.pending).color,
                        borderColor: (statusStyle[t.paymentStatus] || statusStyle.pending).color,
                      }}
                    >
                      <option value="paid">paid</option>
                      <option value="unpaid">unpaid</option>
                      <option value="pending">pending</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

             <div style={s.bottomRow}>
          <div style={{ ...s.summaryCard, backgroundColor: '#7A0008', color: 'white' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>FILTERED TOTAL</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', margin: '8px 0' }}>â‚¹{totalFilteredValue.toFixed(2)}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Total sum of currently visible items</div>
          </div>
          <div style={s.summaryCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>âš ï¸ </span>
              <span style={{ fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '1px' }}>UNPAID TRANSACTIONS</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#5A0006' }}>
              {filteredData.filter(x => x.paymentStatus === 'unpaid').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Requires immediate payment</div>
          </div>
          <div style={s.summaryCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#16a34a', fontSize: '1.2rem' }}>âœ…</span>
              <span style={{ fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '1px' }}>PAID TRANSACTIONS</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#5A0006' }}>
              {filteredData.filter(x => x.paymentStatus === 'paid').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6F6259' }}>Cleared successfully</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', backgroundColor: 'white', borderBottom: '1px solid #E8DED1' },
  pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#5A0006' },
  topRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E8DED1', borderRadius: '10px', padding: '8px 14px', backgroundColor: '#FAF7F2' },
  searchInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#6F6259', width: '200px', fontFamily: "'Outfit', sans-serif" },
  page: { flex: 1, padding: '24px', overflow: 'auto', fontFamily: "'Outfit', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px' },
  filterCard: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #E8DED1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
  filterLeft: { display: 'flex', alignItems: 'flex-end', gap: '16px', flex: 1, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  filterLabel: { fontSize: '0.78rem', color: '#8D7E73', fontWeight: '600' },
  filterInput: { padding: '9px 14px', border: '1px solid #E8DED1', borderRadius: '8px', fontSize: '0.9rem', color: '#5A0006', backgroundColor: 'white', fontFamily: "'Outfit', sans-serif", minWidth: '160px', outline: 'none', cursor: 'pointer' },
  exportBox: { display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid #E8DED1', paddingLeft: '24px' },
  exportLabel: { fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
  exportBtn: { padding: '8px 16px', border: '1px solid #E8DED1', borderRadius: '8px', backgroundColor: '#FAF7F2', color: '#7A0008', cursor: 'pointer', fontWeight: '700', fontFamily: "'Outfit', sans-serif" },
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #E8DED1' },
  bulkBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F4EFE7' },
  bulkBtn: { background: 'none', border: 'none', color: '#7A0008', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '0.75rem', color: '#8D7E73', textTransform: 'uppercase', fontWeight: '700', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #F4EFE7', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #FAF7F2' },
  td: { padding: '16px 14px', color: '#4A3D38', fontSize: '0.9rem', verticalAlign: 'middle' },
  badge: { fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' },
  bottomRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  summaryCard: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #E8DED1' },
};

export default TransactionAudit;
