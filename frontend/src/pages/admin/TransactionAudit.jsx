import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const TransactionAudit = () => {
 const [selected, setSelected] = useState([]);
 const [transactions, setTransactions] = useState([]);
 const [loading, setLoading] = useState(true);
 
 // Filters
 const [searchQuery, setSearchQuery] = useState('');
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

 // Memoized Filtered List
 const filteredData = useMemo(() => {
 return transactions.filter(t => {
 const itemNames = (t.items || []).map(i => i.name).join(', ');
 const searchStr = ((t.orderId || '') + (t.customerName || '') + itemNames).toLowerCase();
 const matchSearch = searchStr.includes(searchQuery.toLowerCase());
 
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

 return matchSearch && matchDate && matchDept;
 });
 }, [transactions, searchQuery, startDate, endDate, departmentFilter]);

 const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

 const toggleAll = () => {
 if (selected.length === filteredData.length) setSelected([]);
 else setSelected(filteredData.map(t => t._id));
 };

 // CSV Export for Excel
 const exportToExcel = () => {
 if (filteredData.length === 0) return alert('No data to export!');
 
 let csvContent = 'Order ID,Date,Customer,Department,Items,Total Amount\n';
 
 filteredData.forEach(t => {
 const date = new Date(t.createdAt).toLocaleDateString();
 const itemStr = t.items.map(i => `${i.name} (x${i.qty})`).join('; ');
 csvContent += `${t.orderId},${date},"${t.customerName}","${t.department || 'N/A'}","${itemStr}",${t.totalAmount}\n`;
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
 
 const formatDate = (d) => {
 if (!d) return 'Start';
 const [y, m, day] = d.split('-');
 return `${day}/${m}/${y}`;
 };

 let billContent = `
 <html>
 <head>
 <title>Generated Bill</title>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
 <style>
 body { font-family: 'Outfit', sans-serif; padding: 40px; color: #333; }
 #content-to-pdf { padding: 20px; } .header { text-align: center; margin-bottom: 40px; } .header h1 { margin: 0; color: #7A0008; } .header p { margin: 5px 0; color: #666; } .info { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; } .info p { margin: 5px 0; }
 table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
 th, td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
 th { background-color: #FAF7F2; color: #7A0008; }
 tr { page-break-inside: avoid; } .total { text-align: right; font-size: 1.5em; font-weight: bold; color: #7A0008; margin-top: 20px; } .no-print { text-align: center; margin-top: 50px; }
 @media print { .no-print { display: none; } }
 </style>
 </head>
 <body>
 <div id="content-to-pdf" style="position: relative; z-index: 1;">
 <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('/bpc-logo.jpeg'); background-size: contain; background-position: center; background-repeat: no-repeat; opacity: 0.08; z-index: -1;"></div>
 <div class="header">
 <h1>Balaji Perfect Caters</h1>
 <p>Department Billing Statement</p>
 </div>
 
 <div class="info">
 <p><strong>Department:</strong> ${departmentFilter === 'All Departments' ? 'All Departments' : departmentFilter}</p>
 <p><strong>Period:</strong> ${startDate ? formatDate(startDate) : 'Start'} to ${endDate ? formatDate(endDate) : 'End'}</p>
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
 <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #7A0008; color: white; border: none; border-radius: 5px;"> Print Bill</button>
 <button onclick="downloadPDF()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #dc2626; color: white; border: none; border-radius: 5px;"> Download PDF</button>
 </div>

 <script>
 function downloadPDF() {
 var element = document.getElementById('content-to-pdf');
 
 var pxHeight = element.scrollHeight;
 var inHeight = (pxHeight / 96) + 1.5; 
 var pdfFormat = inHeight > 11 ? [8.5, inHeight] : 'letter';

 var opt = {
 margin: 0.5,
 filename: 'Balaji_Billing_Statement.pdf',
 image: { type: 'jpeg', quality: 0.98 },
 html2canvas: { scale: 2 },
 jsPDF: { unit: 'in', format: pdfFormat, orientation: 'portrait' }
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
 <header className="admin-section-header audit-header" style={s.topBar}>
 <h1 style={s.pageTitle}>Transaction Audit</h1>
 <div className="admin-section-actions audit-search-actions" style={s.topRight}>
 <div style={s.searchBox}>
 <input 
 style={s.searchInput} 
 placeholder="Search transactions..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 </header>

 <div className="admin-page-body audit-page" style={s.page}>
 {/* Filters */}
 <div className="audit-filter-card" style={s.filterCard}>
 <div className="audit-filter-left" style={s.filterLeft}>
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
 <button 
 style={s.clearBtn} 
 onClick={() => { setStartDate(''); setEndDate(''); setDepartmentFilter('All Departments'); }}
 >
 Clear Filters
 </button>
 </div>
 <div className="audit-export-box" style={s.exportBox}>
 <div style={s.exportLabel}>EXPORT FILTERED LOGS</div>
 <div className="audit-export-actions" style={{ display: 'flex', gap: '10px' }}>
 <button style={s.exportBtn} onClick={exportToExcel}>Excel (CSV)</button>
 <button style={s.exportBtn} onClick={exportToWord}>Word (TXT)</button>
 <button style={{ ...s.exportBtn, backgroundColor: '#7A0008', color: 'white' }} onClick={generateBill}>Generate Bill</button>
 </div>
 </div>
 </div>

 {/* Table */}
 <div className="audit-table-card" style={s.card}>
 <div className="audit-bulk-bar" style={s.bulkBar}>
 <span style={{ color: '#6F6259', fontSize: '0.85rem' }}>{selected.length} items selected</span>
 
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
 {['Transaction ID', 'Date & Time', 'Customer / Account', 'Items', 'Total Amount'].map(h => <th key={h} style={s.th}>{h}</th>)}
 </tr>
 </thead>
 <tbody>
 {filteredData.length === 0 ? (
 <tr>
 <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#8D7E73' }}>
 {loading ? 'Loading transactions...' : 'No transactions match your filters.'}
 </td>
 </tr>
 ) : filteredData.map((t) => (
 <tr key={t._id} style={{ ...s.tr, backgroundColor: selected.includes(t._id) ? '#FAF7F2' : 'white' }}>
 <td data-label="Select" style={s.td}><input type="checkbox" checked={selected.includes(t._id)} onChange={() => toggle(t._id)}/></td>
 <td data-label="Transaction ID" style={{ ...s.td, fontWeight: '700', color: '#5A0006' }}>{t.orderId}</td>
 <td data-label="Date & Time" style={s.td}>
 <div style={{ fontWeight: '600', color: '#4A3D38', fontSize: '0.9rem' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
 <div style={{ color: '#8D7E73', fontSize: '0.75rem' }}>{new Date(t.createdAt).toLocaleTimeString()}</div>
 </td>
 <td data-label="Customer / Account" style={s.td}>
 <div style={{ fontWeight: '700', color: '#5A0006', fontSize: '0.9rem' }}>{t.customerName}</div>
 <div style={{ fontSize: '0.78rem', color: '#8D7E73' }}>{t.customerId || t.department || 'N/A'}</div>
 </td>
 <td data-label="Items" style={{ ...s.td, color: '#5E514A' }}>{(t.items || []).map(i => i.name).join(', ')}</td>
 <td data-label="Total Amount" style={{ ...s.td, fontWeight: '700' }}>Rs. {(t.totalAmount || 0).toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="audit-summary-row" style={s.bottomRow}>
 <div style={{ ...s.summaryCard, backgroundColor: '#7A0008', color: 'white' }}>
 <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>FILTERED TOTAL</div>
 <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', margin: '8px 0' }}>Rs. {totalFilteredValue.toFixed(2)}</div>
 <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Total sum of currently visible items</div>
 </div>
 <div style={s.summaryCard}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
 <span style={{ fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL TRANSACTIONS</span>
 </div>
 <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#5A0006' }}>
 {filteredData.length}
 </div>
 <div style={{ fontSize: '0.8rem', color: '#6F6259' }}>Currently visible transactions</div>
 </div>
 <div style={{ ...s.summaryCard, visibility: 'hidden' }}></div>
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
