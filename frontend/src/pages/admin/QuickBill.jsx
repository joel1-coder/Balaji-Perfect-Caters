import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserLayout from '../../components/UserLayout';

const MENU_API = 'https://balaji-perfect-caters.onrender.com/api/menus';

const FALLBACK_MENU_ITEMS = [
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

const CATEGORY_STYLES = {
  Snacks: { accent: '#A85B17', tint: '#FFF2E5' },
  Tea: { accent: '#A64B2A', tint: '#FFF3E8' },
  Juice: { accent: '#3B7A43', tint: '#ECF8EE' },
  Breakfast: { accent: '#6C7A2A', tint: '#F5F8E8' },
  Lunch: { accent: '#7A0008', tint: '#FFF0F0' },
  Bottle: { accent: '#2D6F7A', tint: '#EAF7F8' },
  'Cold Drink': { accent: '#6C5A9A', tint: '#F1EDFA' },
};

const toInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const mapMenuItem = (item) => {
  const category = item.category || item.group || 'Food';
  const style = CATEGORY_STYLES[category] || { accent: '#8A4A32', tint: '#FFF6EC' };

  return {
    id: item._id || item.id || item.name,
    name: item.name,
    price: Number(item.price) || 0,
    group: category,
    accent: item.accent || style.accent,
    tint: item.tint || style.tint,
    isAvailable: item.isAvailable !== false,
  };
};

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
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [tempMember, setTempMember] = useState(initialMember);
  const [menuOptions, setMenuOptions] = useState(FALLBACK_MENU_ITEMS.map(mapMenuItem));
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuSource, setMenuSource] = useState('Live menu');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemRate, setCustomItemRate] = useState('');

  useEffect(() => {
    fetchBillingMenu();
  }, []);

  const fetchBillingMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await axios.get(MENU_API, { timeout: 4000 });
      const menus = res.data.data || [];
      const firstMenu = menus.find((menu) => menu.items?.length);
      const liveItems = firstMenu?.items?.filter((item) => item.isAvailable !== false).map(mapMenuItem) || [];

      if (liveItems.length) {
        setMenuOptions(liveItems);
        setMenuSource(firstMenu.restaurantName || 'Live menu');
      } else {
        setMenuOptions(FALLBACK_MENU_ITEMS.map(mapMenuItem));
        setMenuSource('Sample menu');
      }
    } catch (err) {
      console.error('Failed to load billing menu:', err.message);
      setMenuOptions(FALLBACK_MENU_ITEMS.map(mapMenuItem));
      setMenuSource('Sample menu');
    } finally {
      setMenuLoading(false);
    }
  };

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

  const addCustomItem = (e) => {
    e.preventDefault();
    const name = customItemName.trim();
    const rate = Number(customItemRate);

    if (!name) {
      alert('Enter the item name.');
      return;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      alert('Enter a valid rate.');
      return;
    }

    addItemToBill({
      id: `custom-${name.toLowerCase()}-${rate}`,
      name,
      price: rate,
      group: 'Custom',
      accent: '#7A0008',
      tint: '#FFF6EC',
    });
    setCustomItemName('');
    setCustomItemRate('');
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

  const clearOrder = () => setOrderItems([]);

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

  const handleOpenMember = () => {
    setTempMember(member);
    setShowMemberModal(true);
  };

  const handleUpdateMember = () => {
    setMember(tempMember);
    setShowMemberModal(false);
  };

  const userName = localStorage.getItem('canteen_user') || 'Operator';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <UserLayout>
      <div className="quickbill-page-shell" style={s.pageShell}>
        <header className="quickbill-top-bar" style={s.topBar}>
          <div style={s.titleWrap}>
            <div style={s.kicker}>Operator Billing Screen</div>
            <h1 style={s.pageTitle}>Easy Bill Counter</h1>
            <p style={s.pageSubtitle}>1. Tap item  2. Check total  3. Save order</p>
          </div>

          <div className="quickbill-operator-card" style={s.operatorCard}>
            <div style={s.operatorAvatar}>{userInitial}</div>
            <div>
              <div style={s.operatorName}>{userName}</div>
              <div style={s.operatorRole}>Billing Operator</div>
            </div>
          </div>
        </header>

        <div className="quickbill-steps-row" style={s.stepsRow}>
          <div style={s.stepCard}>
            <div style={s.stepNumber}>1</div>
            <div>
              <div style={s.stepTitle}>Choose Food</div>
              <div style={s.stepText}>Large buttons for fast item selection.</div>
            </div>
          </div>
          <div style={s.stepCard}>
            <div style={s.stepNumber}>2</div>
            <div>
              <div style={s.stepTitle}>Review Bill</div>
              <div style={s.stepText}>See quantity and amount on the right.</div>
            </div>
          </div>
          <div style={s.stepCard}>
            <div style={s.stepNumber}>3</div>
            <div>
              <div style={s.stepTitle}>Save Order</div>
              <div style={s.stepText}>One clear button to complete billing.</div>
            </div>
          </div>
        </div>

        <div className="quickbill-content-area" style={s.contentArea}>
          <section className="quickbill-menu-panel" style={s.menuPanel}>
            <div className="quickbill-panel-header" style={s.panelHeader}>
              <div>
                <div style={s.panelLabel}>Select Item</div>
                <h2 style={s.panelTitle}>Tap any item to add it to the bill</h2>
                <div style={s.menuSource}>{menuLoading ? 'Loading latest menu...' : menuSource}</div>
              </div>
              <button style={s.refreshBtn} onClick={fetchBillingMenu} disabled={menuLoading}>
                Refresh
              </button>
            </div>

            <form className="quickbill-custom-item-form" style={s.customItemForm} onSubmit={addCustomItem}>
              <div style={s.customItemTitle}>Quick Add Item</div>
              <div className="quickbill-custom-item-fields" style={s.customItemFields}>
                <input
                  style={s.customInput}
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="Item name, e.g. Biscuits"
                />
                <input
                  style={s.customInput}
                  type="number"
                  min="0"
                  step="any"
                  value={customItemRate}
                  onChange={(e) => setCustomItemRate(e.target.value)}
                  placeholder="Rate"
                />
                <button style={s.customAddButton} type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className="quickbill-grid-container" style={s.gridContainer}>
              {menuOptions.map((item) => (
                <button
                  key={item.id || item.name}
                  style={{ ...s.itemButton, backgroundColor: item.tint, borderColor: item.accent }}
                  onClick={() => addItemToBill(item)}
                >
                  <div style={{ ...s.itemBadge, backgroundColor: item.accent }}>
                    {toInitials(item.name)}
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

          <aside className="quickbill-bill-panel" style={s.billPanel}>
            <div style={s.memberCard}>
              <div>
                <div style={s.memberLabel}>Customer</div>
                <div style={s.memberName}>{member.name}</div>
                <div style={s.memberDept}>{member.dept}</div>
              </div>
              <button style={s.memberButton} onClick={handleOpenMember}>
                Change
              </button>
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
                <button style={s.clearButton} onClick={clearOrder}>
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

      {showMemberModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Customer Details</h3>
              <button style={s.closeBtn} onClick={() => setShowMemberModal(false)}>
                X
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.field}>
                <label style={s.fieldLabel}>Customer Name</label>
                <input
                  style={s.input}
                  value={tempMember.name}
                  onChange={(e) => setTempMember({ ...tempMember, name: e.target.value })}
                />
              </div>

              <div style={s.field}>
                <label style={s.fieldLabel}>Department or Note</label>
                <input
                  style={s.input}
                  value={tempMember.dept}
                  onChange={(e) => setTempMember({ ...tempMember, dept: e.target.value })}
                />
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowMemberModal(false)}>
                Cancel
              </button>
              <button style={s.modalSaveBtn} onClick={handleUpdateMember}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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
    padding: '28px 28px 18px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  titleWrap: { maxWidth: '700px' },
  kicker: {
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#A97A32',
    fontWeight: '800',
    marginBottom: '8px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '2.2rem',
    color: '#7A0008',
    fontFamily: "'Playfair Display', serif",
    lineHeight: 1.05,
  },
  pageSubtitle: {
    margin: '10px 0 0',
    color: '#6F6259',
    fontSize: '1rem',
    fontWeight: '600',
  },
  operatorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.88)',
    border: '1px solid #E8DED1',
    borderRadius: '16px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    padding: '0 28px 20px',
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '1px solid #E8DED1',
    borderRadius: '16px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 12px 24px rgba(90, 0, 6, 0.05)',
  },
  stepNumber: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #E3A23B, #F2C36B)',
    color: '#5A0006',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },
  stepTitle: { color: '#5A0006', fontWeight: '800', marginBottom: '3px' },
  stepText: { color: '#7E7065', fontSize: '0.88rem', lineHeight: 1.35 },
  contentArea: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(340px, 420px)',
    gap: '22px',
    padding: '0 28px 28px',
    alignItems: 'start',
  },
  menuPanel: {
    backgroundColor: 'rgba(255,255,255,0.68)',
    border: '1px solid #E8DED1',
    borderRadius: '20px',
    padding: '22px',
    boxShadow: '0 18px 40px rgba(122, 0, 8, 0.06)',
  },
  panelHeader: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start' },
  panelLabel: {
    color: '#A97A32',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '0.74rem',
    marginBottom: '6px',
  },
  panelTitle: {
    margin: 0,
    color: '#5A0006',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.55rem',
    lineHeight: 1.1,
  },
  menuSource: { marginTop: '8px', color: '#8D7E73', fontWeight: '700', fontSize: '0.85rem' },
  refreshBtn: {
    border: '1px solid #E3A23B',
    backgroundColor: '#FFF8E8',
    color: '#7A0008',
    borderRadius: '10px',
    padding: '10px 12px',
    fontWeight: '800',
    cursor: 'pointer',
    flexShrink: 0,
  },
  customItemForm: {
    backgroundColor: '#FFFDF8',
    border: '1px solid #E8DED1',
    borderRadius: '16px',
    padding: '14px',
    marginBottom: '18px',
    boxShadow: '0 10px 22px rgba(90, 0, 6, 0.04)',
  },
  customItemTitle: {
    color: '#5A0006',
    fontWeight: '900',
    marginBottom: '10px',
    fontSize: '0.96rem',
  },
  customItemFields: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(110px, 0.7fr) auto',
    gap: '10px',
    alignItems: 'center',
  },
  customInput: {
    width: '100%',
    border: '1px solid #E3D6C7',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    color: '#5A0006',
    padding: '12px 13px',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    outline: 'none',
  },
  customAddButton: {
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#7A0008',
    color: '#FAF7F2',
    padding: '12px 18px',
    fontWeight: '900',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
    gap: '16px',
  },
  itemButton: {
    border: '1.5px solid',
    borderRadius: '18px',
    padding: '18px',
    minHeight: '170px',
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
  itemMeta: { marginTop: '18px' },
  itemGroup: { fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' },
  itemName: { marginTop: '8px', color: '#34211A', fontWeight: '800', fontSize: '1.08rem', lineHeight: 1.2 },
  itemPrice: { marginTop: '8px', color: '#7A0008', fontWeight: '900', fontSize: '1.15rem' },
  itemTapHint: { marginTop: '14px', fontWeight: '700', fontSize: '0.88rem' },
  billPanel: { display: 'flex', flexDirection: 'column', gap: '14px' },
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
  memberName: { fontSize: '1.2rem', fontWeight: '800', marginTop: '6px' },
  memberDept: { fontSize: '0.92rem', color: 'rgba(250,247,242,0.78)', marginTop: '3px' },
  memberButton: {
    backgroundColor: '#FAF7F2',
    color: '#7A0008',
    border: 'none',
    borderRadius: '12px',
    padding: '11px 14px',
    fontWeight: '800',
    cursor: 'pointer',
    minWidth: '88px',
  },
  modeWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  modeButton: {
    padding: '14px',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '1px solid #E8DED1',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 18px 40px rgba(122, 0, 8, 0.08)',
  },
  billHeader: {
    padding: '20px 20px 16px',
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
    fontSize: '1.45rem',
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
    maxHeight: '420px',
    overflowY: 'auto',
    padding: '14px 16px 0',
  },
  emptyState: {
    margin: '8px 4px 18px',
    padding: '30px 20px',
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
  itemTotal: { color: '#7A0008', fontWeight: '900', fontSize: '1.08rem' },
  summaryCard: {
    marginTop: '8px',
    padding: '20px',
    background: 'linear-gradient(180deg, #7A0008 0%, #5A0006 100%)',
    color: '#FAF7F2',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.95rem',
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
    fontSize: '1.3rem',
  },
  saveButton: {
    width: '100%',
    marginTop: '18px',
    padding: '16px 18px',
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #E3A23B, #F2C36B)',
    color: '#5A0006',
    fontWeight: '900',
    fontSize: '1.08rem',
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
