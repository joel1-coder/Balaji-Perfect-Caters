import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserLayout from '../../components/UserLayout';

const MOCK_ITEMS = [
  { id: 1, name: 'Masala Tea (Strong)', qty: 5, rate: 15, total: 75 },
  { id: 2, name: 'Veg. Club Sandwich', qty: 2, rate: 85, total: 170 },
  { id: 3, name: 'Mineral Water (500ml)', qty: 3, rate: 20, total: 60 },
];

const RECENT_TRANSACTIONS = [
  { id: 'BB41', amount: 120, time: 'Today, 11:45 AM', paid: true },
  { id: 'BB40', amount: 45, time: 'Today, 10:30 AM', paid: false },
  { id: 'BB39', amount: 280, time: 'Today, 09:15 AM', paid: true },
  { id: 'BB38', amount: 95, time: 'Yesterday, 08:00 PM', paid: true },
];

const MENU_OPTIONS = [
  { name: 'Masala Tea', price: 15 },
  { name: 'Coffee', price: 20 },
  { name: 'Veg. Club Sandwich', price: 85 },
  { name: 'Mineral Water (500ml)', price: 20 },
  { name: 'Cold Coffee', price: 40 },
  { name: 'Samosa', price: 15 },
];

const QuickBill = () => {
  const [orderItems, setOrderItems] = useState(MOCK_ITEMS);
  const [selectedItem, setSelectedItem] = useState(MENU_OPTIONS[0]);
  const [qty, setQty] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  
  // Member State
  const [member, setMember] = useState({
    name: 'Rahul Sharma',
    id: 'EMP-9421',
    dept: 'Operations',
    limit: 2500
  });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [tempMember, setTempMember] = useState(member);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchRecentTransactions = async () => {
    try {
      const res = await axios.get('https://balaji-perfect-caters.onrender.com/api/transactions');
      if (res.data.success) {
        setRecentTransactions(res.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const addToBill = () => {
    const newItem = {
      id: Date.now(),
      name: selectedItem.name,
      qty,
      rate: selectedItem.price,
      total: selectedItem.price * qty,
    };
    setOrderItems([...orderItems, newItem]);
    setQty(1);
  };

  const grandTotal = orderItems.reduce((sum, i) => sum + i.total, 0);
  const totalUnits = orderItems.reduce((sum, i) => sum + i.qty, 0);

  const saveOrder = async () => {
    if (orderItems.length === 0) return alert('Cannot save empty order');
    
    const orderId = 'BB' + Math.floor(1000 + Math.random() * 9000);
    
    // Remove the temporary 'id' field from items before sending to backend
    const cleanedItems = orderItems.map(({ id, ...rest }) => rest);

    const payload = {
      orderId,
      customerName: member.name,
      customerId: member.id,
      department: member.dept,
      items: cleanedItems,
      totalAmount: grandTotal,
      paymentStatus: paymentStatus
    };

    try {
      await axios.post('https://balaji-perfect-caters.onrender.com/api/transactions', payload);
      alert(`Order ${orderId} saved successfully!`);
      setOrderItems([]);
      fetchRecentTransactions();
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      alert('Save Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateMember = () => {
    setMember(tempMember);
    setShowMemberModal(false);
  };

  return (
    <UserLayout>
      {/* ... existing header ... */}
      <header style={s.topBar}>
        <div style={s.topBarLeft}>
          <h1 style={s.pageTitle}>QuickBill Terminal</h1>
          <span style={s.liveBadge}>â— Live</span>
        </div>
        <div style={s.topBarRight}>
          <div style={s.searchBox}>
            <span>ðŸ”</span>
            <input style={s.searchInput} placeholder="Search orders..." />
          </div>
          <button style={s.iconBtn}>ðŸ””</button>
          <div style={s.userBadge}>
            <div style={s.userAvatar}>{localStorage.getItem('canteen_user')?.charAt(0).toUpperCase() || 'A'}</div>
            <div>
              <div style={s.userName}>{localStorage.getItem('canteen_user') || 'Admin'}</div>
              <div style={s.userRole}>Shift Lead</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div style={s.contentArea} className="quickbill-content">
        {/* Left: Order Panel */}
        <div style={s.orderPanel} className="quickbill-left">
          {/* Item Selection */}
          <div style={s.card}>
            <div style={s.cardTitle}>ðŸ›’ ITEM SELECTION</div>
            <div style={s.selectionRow}>
              <div style={s.selectWrapper}>
                <label style={s.fieldLabel}>Search Item (e.g., Tea, Coffee, Sandwich)</label>
                <select style={s.select} value={selectedItem.name}
                  onChange={e => setSelectedItem(MENU_OPTIONS.find(o => o.name === e.target.value))}>
                  {MENU_OPTIONS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={s.fieldLabel}>Quantity</label>
                <div style={s.qtyControl}>
                  <button style={s.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span style={s.qtyValue}>{qty}</span>
                  <button style={s.qtyBtn} onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>
              <div>
                <label style={s.fieldLabel}>Unit Rate</label>
                <div style={s.rateBox}>Rs. {selectedItem?.price.toFixed(2)}</div>
              </div>
              <button style={s.addBtn} onClick={addToBill}>+ ADD TO BILL</button>
            </div>
          </div>

          {/* Current Order */}
          <div style={{ ...s.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={s.orderHeader}>
              <span style={s.cardTitle}>CURRENT ORDER ITEMS</span>
              <button style={s.clearBtn} onClick={() => setOrderItems([])}>ðŸ—‘ï¸ Clear List</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>{['#', 'ITEM NAME', 'QTY', 'RATE', 'TOTAL', 'ACTION'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orderItems.map((item, i) => (
                    <tr key={item.id} style={s.tr}>
                      <td style={s.td}>{String(i + 1).padStart(2, '0')}</td>
                      <td style={{ ...s.td, fontWeight: '700', color: '#5A0006' }}>{item.name}</td>
                      <td style={s.td}>{item.qty}</td>
                      <td style={s.td}>â‚¹{item.rate.toFixed(2)}</td>
                      <td style={s.td}>â‚¹{item.total.toFixed(2)}</td>
                      <td style={s.td}>
                        <button style={s.removeBtn} onClick={() => removeItem(item.id)}>âœ•</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Bar */}
            <div style={s.bottomBar}>
              <div style={s.totalUnitsBox}>
                <div style={s.unitsLabel}>TOTAL ITEMS</div>
                <div style={s.unitsValue}>{totalUnits} <span style={{fontSize: '0.9rem', fontWeight: '500'}}>Units</span></div>
              </div>
              
              <div style={s.grandTotalBox}>
                <div style={s.unitsLabel}>GRAND TOTAL</div>
                <div style={s.grandTotalValue}>â‚¹{grandTotal.toFixed(2)}</div>
              </div>

              <div style={s.actionGroup}>
                <button style={s.clearActionBtn} onClick={() => setOrderItems([])}>CLEAR</button>
                <button style={s.saveOrderBtn} onClick={saveOrder}>
                  <span style={{marginRight: '8px'}}>ðŸ’¾</span> SAVE ORDER
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Member Details */}
        <aside style={s.rightPanel} className="quickbill-right">
          <div style={s.card}>
            <div style={s.memberHeader}>
              <span style={s.sectionLabel}>MEMBER DETAILS</span>
              <button style={s.editBtn} onClick={() => { setTempMember(member); setShowMemberModal(true); }}>âœï¸</button>
            </div>
            <div style={s.memberCard}>
              <div style={s.memberAvatar}>{member.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <div style={s.memberName}>{member.name}</div>
                <div style={s.memberId}>ID: {member.id}</div>
              </div>
            </div>
            <div style={s.memberMeta}>
              <div>
                <div style={s.metaLabel}>Department</div>
                <div style={s.metaValue}>{member.dept}</div>
              </div>
              <div>
                <div style={s.metaLabel}>Credit Limit</div>
                <div style={{ ...s.metaValue, color: '#7A0008', fontWeight: '800' }}>â‚¹{member.limit.toFixed(2)}</div>
              </div>
            </div>

          </div>

          {/* Recent Transactions */}
          <div style={s.card}>
            <span style={s.sectionLabel}>ÂðŸ• RECENT TRANSACTIONS</span>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                <div key={tx._id} style={s.txCard}>
                  <div>
                    <div style={s.txId}>Order #{tx.orderId}</div>
                    <div style={s.txTime}>{new Date(tx.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={s.txAmount}>â‚¹{tx.totalAmount}.00</div>
                    <span style={{ ...s.txStatus, ...(tx.paymentStatus === 'paid' ? s.txPaid : s.txUnpaid) }}>
                      {tx.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{fontSize: '0.8rem', color: '#6F6259', textAlign: 'center', padding: '10px'}}>No recent transactions</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* â€â‚¬â€â‚¬ Member Edit Modal â€â‚¬â€â‚¬ */}
      {showMemberModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Update Member Info</h3>
              <button style={s.closeBtn} onClick={() => setShowMemberModal(false)}>âœ•</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.field}>
                <label style={s.fieldLabel}>Full Name</label>
                <input style={s.input} value={tempMember.name} 
                  onChange={e => setTempMember({...tempMember, name: e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>Employee ID</label>
                <input style={s.input} value={tempMember.id} 
                  onChange={e => setTempMember({...tempMember, id: e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>Department</label>
                <input style={s.input} value={tempMember.dept} 
                  onChange={e => setTempMember({...tempMember, dept: e.target.value})} />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={handleUpdateMember}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', backgroundColor: 'white', borderBottom: '1px solid #E8DED1' },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#7A0008' },
  liveBadge: { backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FAF7F2', border: '1px solid #E8DED1', borderRadius: '10px', padding: '8px 14px' },
  searchInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#6F6259', fontSize: '0.9rem', width: '160px', fontFamily: "'Outfit', sans-serif" },
  iconBtn: { width: '36px', height: '36px', border: '1px solid #E8DED1', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '1rem' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#7A0008', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' },
  userName: { fontSize: '0.85rem', fontWeight: '700', color: '#5A0006', textTransform: 'capitalize' },
  userRole: { fontSize: '0.7rem', color: '#6F6259' },
  contentArea: { display: 'flex', flex: 1, gap: '20px', padding: '20px', overflow: 'auto', fontFamily: "'Outfit', sans-serif", backgroundColor: '#F4EFE7' },
  orderPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 10px 26px rgba(90,0,6,0.07)', border: '1px solid #E8DED1' },
  cardTitle: { fontSize: '0.85rem', fontWeight: '800', color: '#5E514A', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  selectionRow: { display: 'flex', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap' },
  selectWrapper: { flex: 2, minWidth: '200px' },
  fieldLabel: { display: 'block', fontSize: '0.75rem', color: '#6F6259', marginBottom: '6px' },
  select: { width: '100%', padding: '10px 14px', border: '1.5px solid #E8DED1', borderRadius: '8px', fontSize: '0.95rem', color: '#5A0006', backgroundColor: 'white', outline: 'none', fontFamily: "'Outfit', sans-serif" },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #E8DED1', borderRadius: '8px', padding: '6px 14px' },
  qtyBtn: { width: '28px', height: '28px', backgroundColor: '#F4EFE7', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '700', color: '#4A3D38' },
  qtyValue: { minWidth: '30px', textAlign: 'center', fontSize: '1rem', fontWeight: '700' },
  rateBox: { padding: '10px 18px', border: '1.5px solid #E8DED1', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', color: '#5A0006' },
  addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #5A0006, #7A0008)', color: 'white', border: '1px solid rgba(227,162,59,0.28)', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif" },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  clearBtn: { fontSize: '0.8rem', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: "'Outfit', sans-serif" },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '0.75rem', color: '#8D7E73', textTransform: 'uppercase', fontWeight: '700', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #F4EFE7' },
  tr: { borderBottom: '1px solid #FAF7F2' },
  td: { padding: '12px', color: '#4A3D38', fontSize: '0.9rem', verticalAlign: 'middle' },
  removeBtn: { backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', fontWeight: '700' },
  
  bottomBar: { background: 'linear-gradient(135deg, #5A0006 0%, #7A0008 78%, #E3A23B 145%)', display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', marginTop: 'auto', gap: '30px' },
  totalUnitsBox: { color: 'white', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '30px' },
  unitsLabel: { fontSize: '0.7rem', fontWeight: '700', color: '#8D7E73', marginBottom: '4px' },
  unitsValue: { fontSize: '1.8rem', fontWeight: '800' },
  grandTotalBox: { color: 'white', flex: 1 },
  grandTotalValue: { fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' },
  actionGroup: { display: 'flex', gap: '12px' },
  clearActionBtn: { padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
  statusDisplayBtn: { padding: '12px 24px', backgroundColor: 'white', border: 'none', borderRadius: '8px', color: '#5A0006', fontWeight: '700', cursor: 'default' },
  saveOrderBtn: { padding: '12px 30px', background: 'linear-gradient(135deg, #E3A23B, #F2C36B)', border: 'none', borderRadius: '8px', color: '#5A0006', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 8px 18px rgba(227,162,59,0.28)' },
  
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #F4EFE7' },
  totalLabel: { fontWeight: '700', color: '#6F6259' },
  totalValue: { fontWeight: '800', color: '#7A0008', fontSize: '1.1rem' },
  rightPanel: { width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
  memberHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '800', color: '#6F6259', textTransform: 'uppercase', letterSpacing: '0.5px' },
  editBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6F6259', fontSize: '1rem' },
  memberCard: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', padding: '10px', backgroundColor: '#FAF7F2', borderRadius: '10px', border: '1px solid #E8DED1' },
  memberAvatar: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#5A0006', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' },
  memberName: { fontWeight: '700', fontSize: '0.9rem', color: '#5A0006' },
  memberId: { fontSize: '0.75rem', color: '#6F6259' },
  memberMeta: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' },
  metaLabel: { fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  metaValue: { fontSize: '0.85rem', color: '#4A3D38', fontWeight: '600' },
  paymentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  paymentToggle: { display: 'flex', gap: '6px' },
  payBtn: { padding: '4px 10px', borderRadius: '6px', border: '1px solid #E8DED1', backgroundColor: '#FAF7F2', color: '#8D7E73', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' },
  payBtnPaid: { backgroundColor: '#dcfce7', color: '#16a34a', borderColor: '#16a34a' },
  payBtnUnpaid: { backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#dc2626' },
  txCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#FAF7F2', borderRadius: '10px' },
  txId: { fontSize: '0.8rem', fontWeight: '700', color: '#5A0006' },
  txTime: { fontSize: '0.7rem', color: '#8D7E73' },
  txAmount: { fontSize: '0.9rem', fontWeight: '800', color: '#7A0008' },
  txStatus: { fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  txPaid: { backgroundColor: '#dcfce7', color: '#16a34a' },
  txUnpaid: { backgroundColor: '#fee2e2', color: '#dc2626' },

  // Modal Styles
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '16px', width: '400px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#7A0008' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8D7E73' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  input: { padding: '10px 14px', border: '1.5px solid #E8DED1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: "'Outfit', sans-serif" },
  modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #E8DED1', backgroundColor: 'white', color: '#6F6259', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7A0008', color: 'white', fontWeight: '700', cursor: 'pointer' },
};

export default QuickBill;
