import React, { useState } from 'react';
import axios from 'axios';
import UserLayout from '../../components/UserLayout';

const MENU_OPTIONS = [
  { name: 'Masala Tea', price: 15, group: 'Hot Drink', accent: '#A64B2A', tint: '#FFF3E8' },
  { name: 'Coffee', price: 20, group: 'Hot Drink', accent: '#6E4A32', tint: '#F7EEE8' },
  { name: 'Veg Club Sandwich', price: 85, group: 'Snack', accent: '#6C7A2A', tint: '#F5F8E8' },
  { name: 'Mineral Water', price: 20, group: 'Bottle', accent: '#2D6F7A', tint: '#EAF7F8' },
  { name: 'Cold Coffee', price: 40, group: 'Cold Drink', accent: '#8A4A64', tint: '#FAEDF4' },
  { name: 'Samosa', price: 15, group: 'Snack', accent: '#A85B17', tint: '#FFF2E5' },
  { name: 'Paneer Puff', price: 25, group: 'Snack', accent: '#A86A1F', tint: '#FFF4E7' },
  { name: 'Fresh Juice', price: 50, group: 'Juice', accent: '#3B7A43', tint: '#ECF8EE' },
  { name: 'Lassi', price: 30, group: 'Cold Drink', accent: '#6C5A9A', tint: '#F1EDFA' },
];

const PAYMENT_MODES = [
  { id: 'paid', label: 'Paid Now' },
  { id: 'credit', label: 'Credit' },
];

const initialMember = {
  name: 'Walk-in Customer',
  id: 'NA',
  dept: 'General',
  limit: 0,
};

const QuickBill = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [member, setMember] = useState(initialMember);

  const addItemToBill = (menuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.name === menuItem.name);

      if (existing) {
        return prev.map((item) =>
          item.name === menuItem.name
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.rate }
            : item
        );
      }

      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name: menuItem.name,
          qty: 1,
          rate: menuItem.price,
          total: menuItem.price,
          group: menuItem.group,
          accent: menuItem.accent,
          tint: menuItem.tint,
        },
      ];
    });
  };

  const updateQty = (id, change) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = Math.max(0, item.qty + change);
          return { ...item, qty: nextQty, total: nextQty * item.rate };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalUnits = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  const saveOrder = async () => {
    if (orderItems.length === 0) {
      alert('Add at least one item before saving.');
      return;
    }

    const orderId = `BB${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanedItems = orderItems.map(({ id, accent, tint, group, ...rest }) => rest);

    const payload = {
      orderId,
      customerName: member.name,
      customerId: member.id,
      department: member.dept,
      items: cleanedItems,
      totalAmount: grandTotal,
      paymentStatus,
    };

    try {
      await axios.post('https://balaji-perfect-caters.onrender.com/api/transactions', payload);
      alert(`Order ${orderId} saved successfully.`);
      setOrderItems([]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      alert(`Save failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const userName = localStorage.getItem('canteen_user') || 'Operator';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <UserLayout>
      <div style={s.pageShell} className="quickbill-page-shell">
        <header style={s.topBar} className="quickbill-top-bar">
          <div style={s.titleWrap}>
            <div style={s.kicker}>Operator Billing Screen</div>
            <h1 style={s.pageTitle}>Easy Bill Counter</h1>
            <p style={s.pageSubtitle}>1. Tap item 2. Check total 3. Save order</p>
          </div>

          <div style={s.operatorCard} className="quickbill-operator-card">
            <div style={s.operatorAvatar}>{userInitial}</div>
            <div>
              <div style={s.operatorName}>{userName}</div>
              <div style={s.operatorRole}>Billing Operator</div>
            </div>
          </div>
        </header>

        <div style={s.contentArea} className="quickbill-content-area">
          <section style={s.menuPanel} className="quickbill-menu-panel">
            <div style={s.panelHeader} className="quickbill-panel-header">
              <div>
                <div style={s.panelLabel}>Select Item</div>
                <h2 style={s.panelTitle}>Tap any item to add it to the bill</h2>
              </div>
            </div>

            <div style={s.gridContainer} className="quickbill-grid-container">
              {MENU_OPTIONS.map((item) => (
                <button
                  key={item.name}
                  style={{ ...s.itemButton, backgroundColor: item.tint, borderColor: item.accent }}
                  onClick={() => addItemToBill(item)}
                >
                  <div style={{ ...s.itemBadge, backgroundColor: item.accent }}>
                    {item.name
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div style={s.itemMeta}>
                    <div style={{ ...s.itemGroup, color: item.accent }}>{item.group}</div>
                    <div style={s.itemName}>{item.name}</div>
                    <div style={s.itemPrice}>Rs. {item.price}</div>
                  </div>
                  <div style={{ ...s.itemTapHint, color: item.accent }}>Tap to add</div>
                </button>
              ))}
            </div>
          </section>

          <aside style={s.billPanel} className="quickbill-bill-panel">
            <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E8DED1', marginBottom: '0' }}>
              <div style={{ fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '10px' }}>Customer Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  style={{ padding: '8px 12px', border: '1px solid #E8DED1', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                  placeholder="Customer Name"
                  value={member.name}
                  onChange={(e) => setMember({ ...member, name: e.target.value })}
                />
                <input
                  style={{ padding: '8px 12px', border: '1px solid #E8DED1', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                  placeholder="Department or Note"
                  value={member.dept}
                  onChange={(e) => setMember({ ...member, dept: e.target.value })}
                />
              </div>
            </div>

            <div style={s.modeWrap}>
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  style={{
                    ...s.modeButton,
                    ...(paymentStatus === mode.id ? s.modeButtonActive : {}),
                  }}
                  onClick={() => setPaymentStatus(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div style={s.billCard}>
              <div style={s.billHeader}>
                <div>
                  <div style={s.panelLabel}>Current Bill</div>
                  <h2 style={s.billTitle}>Order Summary</h2>
                </div>
                <button style={s.clearButton} onClick={() => setOrderItems([])}>
                  Clear Bill
                </button>
              </div>

              <div style={s.billItems}>
                {orderItems.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={s.emptyTitle}>No items yet</div>
                    <div style={s.emptyText}>Start by tapping an item card on the left side.</div>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} style={s.billItem}>
                      <div style={s.billItemHead}>
                        <div>
                          <div style={s.billItemName}>{item.name}</div>
                          <div style={s.billItemSub}>Rs. {item.rate} each</div>
                        </div>
                        <button style={s.removeButton} onClick={() => removeItem(item.id)}>
                          Remove
                        </button>
                      </div>

                      <div style={s.billItemBottom}>
                        <div style={s.qtyWrap}>
                          <button style={s.qtyButton} onClick={() => updateQty(item.id, -1)}>
                            -
                          </button>
                          <div style={s.qtyValue}>{item.qty}</div>
                          <button style={s.qtyButton} onClick={() => updateQty(item.id, 1)}>
                            +
                          </button>
                        </div>
                        <div style={s.itemTotal}>Rs. {item.total}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={s.summaryCard}>
                <div style={s.summaryRow}>
                  <span>Total Items</span>
                  <strong>{totalUnits}</strong>
                </div>
                <div style={s.summaryRow}>
                  <span>Payment</span>
                  <strong>{paymentStatus === 'paid' ? 'Paid Now' : 'Credit'}</strong>
                </div>
                <div style={s.summaryTotal}>
                  <span>Grand Total</span>
                  <strong>Rs. {grandTotal.toFixed(2)}</strong>
                </div>

                <button
                  style={{ ...s.saveButton, ...(orderItems.length === 0 ? s.saveButtonDisabled : {}) }}
                  onClick={saveOrder}
                  disabled={orderItems.length === 0}
                >
                  Save Order
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </UserLayout>
  );
};

const s = {
  pageShell: {
    minHeight: '100%',
    background: 'linear-gradient(180deg, #FFF8F0 0%, #F6EEE3 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '22px 24px 12px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  titleWrap: { maxWidth: '700px' },
  kicker: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#A97A32',
    fontWeight: '800',
    marginBottom: '6px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '2rem',
    color: '#7A0008',
    fontFamily: "'Playfair Display', serif",
    lineHeight: 1.05,
  },
  pageSubtitle: {
    margin: '8px 0 0',
    color: '#6F6259',
    fontSize: '0.92rem',
    fontWeight: '600',
  },
  operatorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.88)',
    border: '1px solid #E8DED1',
    borderRadius: '14px',
    padding: '12px 16px',
    boxShadow: '0 10px 24px rgba(90, 0, 6, 0.06)',
  },
  operatorAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '14px',
    backgroundColor: '#7A0008',
    color: '#FAF7F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1rem',
  },
  operatorName: { color: '#5A0006', fontWeight: '800', textTransform: 'capitalize' },
  operatorRole: { color: '#8D7E73', fontSize: '0.83rem', fontWeight: '600' },
  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    padding: '0 24px 18px',
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '1px solid #E8DED1',
    borderRadius: '14px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 10px 22px rgba(90, 0, 6, 0.05)',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #E3A23B, #F2C36B)',
    color: '#5A0006',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    flexShrink: 0,
  },
  stepTitle: { color: '#5A0006', fontWeight: '800', marginBottom: '3px', fontSize: '0.95rem' },
  stepText: { color: '#7E7065', fontSize: '0.8rem', lineHeight: 1.35 },
  contentArea: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 380px)',
    gap: '18px',
    padding: '0 24px 24px',
    alignItems: 'start',
  },
  menuPanel: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    border: '1px solid #E8DED1',
    borderRadius: '16px',
    padding: '18px',
    boxShadow: '0 18px 40px rgba(122, 0, 8, 0.06)',
  },
  panelHeader: { marginBottom: '16px' },
  panelLabel: {
    color: '#A97A32',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '0.72rem',
    marginBottom: '6px',
  },
  panelTitle: {
    margin: 0,
    color: '#5A0006',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.45rem',
    lineHeight: 1.1,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
  },
  itemButton: {
    border: '1.5px solid',
    borderRadius: '16px',
    padding: '16px',
    minHeight: '168px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(90, 0, 6, 0.06)',
  },
  itemBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    color: '#FFF8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.95rem',
  },
  itemMeta: { marginTop: '14px' },
  itemGroup: { fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' },
  itemName: { marginTop: '8px', color: '#34211A', fontWeight: '800', fontSize: '1rem', lineHeight: 1.2 },
  itemPrice: { marginTop: '8px', color: '#7A0008', fontWeight: '900', fontSize: '1.05rem' },
  itemTapHint: { marginTop: '12px', fontWeight: '700', fontSize: '0.82rem' },
  billPanel: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
  memberCard: {
    backgroundColor: '#7A0008',
    borderRadius: '20px',
    padding: '18px',
    color: '#FAF7F2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 18px 34px rgba(122, 0, 8, 0.18)',
  },
  memberLabel: { color: '#F2C36B', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  memberName: { fontSize: '1.15rem', fontWeight: '800', marginTop: '6px' },
  memberDept: { fontSize: '0.9rem', color: 'rgba(250,247,242,0.78)', marginTop: '3px' },
  memberButton: {
    backgroundColor: '#FAF7F2',
    color: '#7A0008',
    border: 'none',
    borderRadius: '12px',
    padding: '11px 14px',
    fontWeight: '800',
    cursor: 'pointer',
    minWidth: '92px',
  },
  modeWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  modeButton: {
    padding: '13px',
    borderRadius: '14px',
    border: '1px solid #E2D3C0',
    backgroundColor: 'rgba(255,255,255,0.88)',
    color: '#6F6259',
    fontWeight: '800',
    cursor: 'pointer',
  },
  modeButtonActive: {
    backgroundColor: '#F9E7BF',
    borderColor: '#E3A23B',
    color: '#7A0008',
    boxShadow: '0 8px 18px rgba(227, 162, 59, 0.18)',
  },
  billCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    border: '1px solid #E8DED1',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 18px 40px rgba(122, 0, 8, 0.08)',
  },
  billHeader: {
    padding: '18px 18px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    borderBottom: '1px solid #EFE4D7',
  },
  billTitle: {
    margin: 0,
    color: '#5A0006',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.35rem',
  },
  clearButton: {
    border: 'none',
    backgroundColor: '#FFF3F0',
    color: '#B42318',
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  billItems: {
    maxHeight: '340px',
    overflowY: 'auto',
    padding: '14px 16px 0',
  },
  emptyState: {
    margin: '8px 4px 18px',
    padding: '28px 18px',
    backgroundColor: '#FAF7F2',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px dashed #DFCDB8',
  },
  emptyTitle: { color: '#5A0006', fontWeight: '800', fontSize: '1rem' },
  emptyText: { color: '#8D7E73', marginTop: '8px', lineHeight: 1.45, fontWeight: '600' },
  billItem: {
    backgroundColor: '#FFFDFC',
    border: '1px solid #EFE4D7',
    borderRadius: '16px',
    padding: '14px',
    marginBottom: '12px',
  },
  billItemHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
  },
  billItemName: { color: '#412520', fontWeight: '800', fontSize: '1rem', lineHeight: 1.2 },
  billItemSub: { color: '#8D7E73', fontSize: '0.84rem', marginTop: '5px', fontWeight: '600' },
  removeButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#B42318',
    fontWeight: '800',
    cursor: 'pointer',
  },
  billItemBottom: {
    marginTop: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  qtyWrap: {
    display: 'grid',
    gridTemplateColumns: '42px 56px 42px',
    alignItems: 'center',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid #E5D4C4',
    backgroundColor: '#FAF7F2',
  },
  qtyButton: {
    height: '42px',
    border: 'none',
    backgroundColor: '#FAF1E4',
    color: '#7A0008',
    fontSize: '1.2rem',
    fontWeight: '900',
    cursor: 'pointer',
  },
  qtyValue: {
    textAlign: 'center',
    color: '#5A0006',
    fontWeight: '800',
    fontSize: '1rem',
  },
  itemTotal: { color: '#7A0008', fontWeight: '900', fontSize: '1.05rem' },
  summaryCard: {
    marginTop: '8px',
    padding: '18px',
    background: 'linear-gradient(180deg, #7A0008 0%, #5A0006 100%)',
    color: '#FAF7F2',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.92rem',
    color: 'rgba(250,247,242,0.82)',
    marginBottom: '10px',
    fontWeight: '600',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(242,195,107,0.35)',
    color: '#F2C36B',
    fontWeight: '900',
    fontSize: '1.26rem',
  },
  saveButton: {
    width: '100%',
    marginTop: '18px',
    padding: '16px 18px',
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #E3A23B, #B76A36)',
    color: '#5A0006',
    fontWeight: '900',
    fontSize: '1.05rem',
    cursor: 'pointer',
    boxShadow: '0 12px 22px rgba(227, 162, 59, 0.25)',
  },
  saveButtonDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(32, 12, 9, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#FFFDFB',
    borderRadius: '20px',
    border: '1px solid #E8DED1',
    boxShadow: '0 26px 48px rgba(90, 0, 6, 0.18)',
    padding: '22px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
  },
  modalTitle: {
    margin: 0,
    color: '#5A0006',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.4rem',
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #E8DED1',
    backgroundColor: '#FAF7F2',
    color: '#7A0008',
    fontWeight: '800',
    cursor: 'pointer',
  },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  fieldLabel: { color: '#7A6A5F', fontSize: '0.82rem', fontWeight: '800' },
  input: {
    padding: '13px 14px',
    borderRadius: '12px',
    border: '1px solid #E3D6C7',
    fontSize: '1rem',
    fontFamily: "'Outfit', sans-serif",
    outline: 'none',
    backgroundColor: '#FFFFFF',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    padding: '11px 16px',
    borderRadius: '12px',
    border: '1px solid #E8DED1',
    backgroundColor: '#FFFFFF',
    color: '#6F6259',
    fontWeight: '800',
    cursor: 'pointer',
  },
  modalSaveBtn: {
    padding: '11px 16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#7A0008',
    color: '#FAF7F2',
    fontWeight: '800',
    cursor: 'pointer',
  },
};

export default QuickBill;
