import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserLayout from '../../components/UserLayout';

const MOCK_ITEMS = [];

const MENU_OPTIONS = [
  { name: 'Masala Tea', price: 15, icon: '☕', color: '#fef3c7', text: '#d97706' },
  { name: 'Coffee', price: 20, icon: '☕', color: '#dbeafe', text: '#2563eb' },
  { name: 'Veg. Club Sandwich', price: 85, icon: '🥪', color: '#dcfce7', text: '#16a34a' },
  { name: 'Mineral Water', price: 20, icon: '💧', color: '#e0e7ff', text: '#4f46e5' },
  { name: 'Cold Coffee', price: 40, icon: '🥤', color: '#fce7f3', text: '#db2777' },
  { name: 'Samosa', price: 15, icon: '🥟', color: '#ffedd5', text: '#ea580c' },
  { name: 'Paneer Puff', price: 25, icon: '🥐', color: '#fef3c7', text: '#d97706' },
  { name: 'Fresh Juice', price: 50, icon: '🍹', color: '#dcfce7', text: '#16a34a' },
  { name: 'Lassi', price: 30, icon: '🥛', color: '#e0e7ff', text: '#4f46e5' },
];

const QuickBill = () => {
  const [orderItems, setOrderItems] = useState(MOCK_ITEMS);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  
  // Member State
  const [member, setMember] = useState({
    name: 'Walk-in Customer',
    id: 'NA',
    dept: 'General',
    limit: 0
  });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [tempMember, setTempMember] = useState(member);

  const handleGridTap = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => 
          i.name === item.name 
            ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.rate }
            : i
        );
      } else {
        return [...prev, {
          id: Date.now() + Math.random(),
          name: item.name,
          qty: 1,
          rate: item.price,
          total: item.price
        }];
      }
    });
  };

  const updateQty = (id, change) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + change);
        return { ...item, qty: newQty, total: newQty * item.rate };
      }
      return item;
    }).filter(item => item.qty > 0)); // Remove if qty is 0
  };

  const grandTotal = orderItems.reduce((sum, i) => sum + i.total, 0);
  const totalUnits = orderItems.reduce((sum, i) => sum + i.qty, 0);

  const saveOrder = async () => {
    if (orderItems.length === 0) return alert('Cannot save empty order');
    
    const orderId = 'BB' + Math.floor(1000 + Math.random() * 9000);
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
      <header style={s.topBar}>
        <div style={s.topBarLeft}>
          <h1 style={s.pageTitle}>POS Terminal</h1>
          <span style={s.liveBadge}> Live</span>
        </div>
        <div style={s.topBarRight}>
          <div style={s.userBadge}>
            <div style={s.userAvatar}>{localStorage.getItem('canteen_user')?.charAt(0).toUpperCase() || 'A'}</div>
            <div>
              <div style={s.userName}>{localStorage.getItem('canteen_user') || 'Admin'}</div>
              <div style={s.userRole}>Operator</div>
            </div>
          </div>
        </div>
      </header>

      <div style={s.contentArea}>
        {/* Left: Visual Menu Grid */}
        <div style={s.menuGridPanel}>
          <div style={s.gridContainer}>
            {MENU_OPTIONS.map((item, idx) => (
              <button 
                key={idx} 
                style={{ ...s.itemButton, backgroundColor: item.color }}
                onClick={() => handleGridTap(item)}
              >
                <div style={s.itemIcon}>{item.icon}</div>
                <div style={{ ...s.itemName, color: item.text }}>{item.name}</div>
                <div style={{ ...s.itemPrice, color: item.text }}>Rs. {item.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Current Bill Receipt */}
        <aside style={s.receiptPanel}>
          {/* Minimal Member Area */}
          <div style={s.memberMini}>
            <div style={s.memberMiniInfo}>
              <div style={s.memberMiniName}>👤 {member.name}</div>
              <div style={s.memberMiniDept}>{member.dept}</div>
            </div>
            <button style={s.memberEditBtn} onClick={() => { setTempMember(member); setShowMemberModal(true); }}>Edit</button>
          </div>

          <div style={s.receiptArea}>
            <div style={s.receiptHeader}>
              <span style={s.receiptTitle}>Current Order</span>
              <button style={s.clearBtn} onClick={() => setOrderItems([])}>Clear All</button>
            </div>

            <div style={s.receiptItemsList}>
              {orderItems.length === 0 ? (
                <div style={s.emptyBill}>Tap items on the left to add</div>
              ) : (
                orderItems.map((item, i) => (
                  <div key={item.id} style={s.receiptItem}>
                    <div style={s.receiptItemInfo}>
                      <div style={s.receiptItemName}>{item.name}</div>
                      <div style={s.receiptItemRate}>Rs. {item.rate} x {item.qty}</div>
                    </div>
                    
                    <div style={s.receiptControls}>
                      <button style={s.qtyBtnSmall} onClick={() => updateQty(item.id, -1)}>−</button>
                      <span style={s.qtyDisplaySmall}>{item.qty}</span>
                      <button style={s.qtyBtnSmall} onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>

                    <div style={s.receiptItemTotal}>
                      Rs. {item.total}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={s.receiptBottom}>
              <div style={s.receiptSummaryRow}>
                <span>Total Items</span>
                <span>{totalUnits} Units</span>
              </div>
              <div style={s.receiptSummaryRowBig}>
                <span>Grand Total</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
              
              <button 
                style={{ ...s.payBtnBig, opacity: orderItems.length > 0 ? 1 : 0.5 }} 
                onClick={saveOrder}
                disabled={orderItems.length === 0}
              >
                PAY RS. {grandTotal.toFixed(2)}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Member Edit Modal */}
      {showMemberModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Set Customer</h3>
              <button style={s.closeBtn} onClick={() => setShowMemberModal(false)}>×</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.field}>
                <label style={s.fieldLabel}>Customer Name</label>
                <input style={s.input} value={tempMember.name} 
                  onChange={e => setTempMember({...tempMember, name: e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>Department / Info</label>
                <input style={s.input} value={tempMember.dept} 
                  onChange={e => setTempMember({...tempMember, dept: e.target.value})} />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={handleUpdateMember}>Save</button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', backgroundColor: 'white', borderBottom: '1px solid #E8DED1', flexShrink: 0 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#7A0008' },
  liveBadge: { backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7A0008', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem' },
  userName: { fontSize: '0.9rem', fontWeight: '700', color: '#5A0006', textTransform: 'capitalize' },
  userRole: { fontSize: '0.75rem', color: '#6F6259' },
  
  contentArea: { display: 'flex', flex: 1, gap: '0', overflow: 'hidden', fontFamily: "'Outfit', sans-serif", backgroundColor: '#F4EFE7' },
  
  menuGridPanel: { flex: 1, padding: '24px', overflowY: 'auto' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' },
  itemButton: { border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', minHeight: '160px' },
  itemIcon: { fontSize: '3.5rem', marginBottom: '12px' },
  itemName: { fontSize: '1.2rem', fontWeight: '800', textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' },
  itemPrice: { fontSize: '1rem', fontWeight: '700', opacity: 0.8 },

  receiptPanel: { width: '380px', backgroundColor: 'white', borderLeft: '1px solid #E8DED1', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '-5px 0 20px rgba(0,0,0,0.03)' },
  
  memberMini: { padding: '16px 20px', borderBottom: '1px solid #E8DED1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' },
  memberMiniInfo: { display: 'flex', flexDirection: 'column' },
  memberMiniName: { fontSize: '1rem', fontWeight: '700', color: '#4A3D38' },
  memberMiniDept: { fontSize: '0.8rem', color: '#8D7E73' },
  memberEditBtn: { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },

  receiptArea: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  receiptHeader: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#5A0006' },
  clearBtn: { backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer' },
  
  receiptItemsList: { flex: 1, overflowY: 'auto', padding: '10px 0' },
  emptyBill: { padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', fontWeight: '500' },
  receiptItem: { padding: '12px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px dashed #e2e8f0' },
  receiptItemInfo: { flex: 1 },
  receiptItemName: { fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  receiptItemRate: { fontSize: '0.8rem', color: '#64748b', marginTop: '2px' },
  receiptControls: { display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '4px', margin: '0 12px' },
  qtyBtnSmall: { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '700', color: '#0f172a' },
  qtyDisplaySmall: { minWidth: '24px', textAlign: 'center', fontWeight: '700', fontSize: '1rem' },
  receiptItemTotal: { width: '60px', textAlign: 'right', fontWeight: '800', fontSize: '1rem', color: '#0f172a' },

  receiptBottom: { padding: '20px', backgroundColor: '#FAF7F2', borderTop: '2px solid #E8DED1' },
  receiptSummaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6F6259', fontWeight: '600', marginBottom: '8px' },
  receiptSummaryRowBig: { display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', color: '#5A0006', fontWeight: '800', marginBottom: '20px' },
  payBtnBig: { width: '100%', padding: '20px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.4rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)', transition: 'opacity 0.2s' },

  // Modal Styles
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '16px', width: '360px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#7A0008' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#8D7E73', lineHeight: 1 },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#64748b' },
  input: { padding: '12px', border: '1.5px solid #E8DED1', borderRadius: '8px', fontSize: '1rem', outline: 'none', fontFamily: "'Outfit', sans-serif" },
  modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #E8DED1', backgroundColor: 'white', color: '#6F6259', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7A0008', color: 'white', fontWeight: '700', cursor: 'pointer' },
};

export default QuickBill;
