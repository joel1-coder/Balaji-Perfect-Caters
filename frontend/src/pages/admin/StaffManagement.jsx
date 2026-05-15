import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API = 'https://balaji-perfect-caters.onrender.com/api/staff';

const ROLES = ['Chef', 'Cashier', 'Server', 'Manager'];
const STATUSES = ['ON-DUTY', 'OFF-DUTY', 'ABSENT'];

const BLANK_FORM = { name: '', empId: '', role: 'Cashier', shiftTiming: '09:00 AM - 05:00 PM', shiftLabel: 'General Shift', status: 'ON-DUTY', rating: 5 };

const toast = (msg, type = 'success') => {
  const el = document.createElement('div');
  el.innerText = msg;
  Object.assign(el.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    background: type === 'success' ? '#0f2444' : '#dc2626',
    color: 'white', padding: '12px 20px', borderRadius: '10px',
    fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
};

const statusStyle = {
  'ON-DUTY': { bg: '#dcfce7', color: '#16a34a', dot: '#16a34a' },
  'OFF-DUTY': { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  'ABSENT': { bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' },
};

const roleColors = {
  Chef: { bg: '#eff6ff', color: '#2563eb' },
  Cashier: { bg: '#f0fdf4', color: '#16a34a' },
  Server: { bg: '#fdf4ff', color: '#9333ea' },
  Manager: { bg: '#fef3c7', color: '#d97706' },
};

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setStaffList(res.data.data);
    } catch {
      toast('Failed to load staff data', 'error');
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    try {
      await axios.post(`${API}/seed`);
      toast('Demo staff seeded!');
      fetchStaff();
    } catch { toast('Seed failed', 'error'); }
  };

  // —— Modal Actions ——
  const openAdd = () => {
    setEditItem(null);
    setForm(BLANK_FORM);
    setShowModal(true);
  };

  const openEdit = (staff) => {
    setEditItem(staff);
    setForm({ 
      name: staff.name, empId: staff.empId, role: staff.role, 
      shiftTiming: staff.shiftTiming, shiftLabel: staff.shiftLabel, 
      status: staff.status, rating: staff.rating 
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditItem(null); };

  // —— Save (Create / Update) ——
  const handleSave = async () => {
    if (!form.name.trim() || !form.empId.trim()) { toast('Name and Employee ID are required', 'error'); return; }
    
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`${API}/${editItem._id}`, form);
        toast('Staff updated!');
      } else {
        await axios.post(API, form);
        toast('Staff member added!');
      }
      closeModal();
      fetchStaff();
    } catch (err) {
      toast(err.response?.data?.error || 'Save failed', 'error');
    }
    setSaving(false);
  };

  // —— Delete ——
  const handleDelete = async (staff) => {
    if (!window.confirm(`Remove ${staff.name} (${staff.empId}) from the roster?`)) return;
    try {
      await axios.delete(`${API}/${staff._id}`);
      toast('Staff member removed');
      fetchStaff();
    } catch { toast('Delete failed', 'error'); }
  };

  // Stats calculation
  const totalStaff = staffList.length;
  const onDutyCount = staffList.filter(s => s.status === 'ON-DUTY').length;
  const chefsCount = staffList.filter(s => s.role === 'Chef').length;
  const cashiersCount = staffList.filter(s => s.role === 'Cashier').length;

  return (
    <AdminLayout>
      <header style={s.topBar}>
        <h1 style={s.pageTitle}>Staff Roster</h1>
        <div style={s.topRight}>
          <button style={s.seedBtn} onClick={handleSeed}>⚡ Seed Demo</button>
          <button style={s.addBtn} onClick={openAdd}>👤+ Add Employee</button>
        </div>
      </header>

      <div style={s.page}>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Manage shifts, roles, and review team performance for the current week.</p>

        {/* Stats Row */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statIcon}>👥</div>
            <div style={s.statLabel}>Overall</div>
            <div style={s.statSub}>Total Staff</div>
            <div style={s.statVal}>{totalStaff}</div>
          </div>
          <div style={{ ...s.statCard, backgroundColor: '#0f2444', color: 'white' }}>
            <div style={s.statIcon}>⏱️</div>
            <div style={{ ...s.statLabel, color: 'rgba(255,255,255,0.7)' }}><span style={s.liveDot}></span> Live</div>
            <div style={{ ...s.statSub, color: 'rgba(255,255,255,0.7)' }}>Currently On-Duty</div>
            <div style={{ ...s.statVal, color: 'white' }}>{onDutyCount}</div>
          </div>
          <div style={{ ...s.statCard, flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Department Distribution</span>
            </div>
            {[{ label: 'Kitchen (Chef)', count: chefsCount }, { label: 'Front Desk (Cashier)', count: cashiersCount }].map(d => {
              const pct = totalStaff ? Math.round((d.count / totalStaff) * 100) : 0;
              return (
                <div key={d.label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{d.label}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{d.count} Staff ({pct}%)</span>
                  </div>
                  <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${pct}%` }}></div></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Roster Table */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Active Roster</h3>
          </div>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
          ) : staffList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No staff members found. Click "Seed Demo" or add an employee.
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['EMPLOYEE', 'ROLE', 'SHIFT TIMING', 'STATUS', 'RATING', 'ACTIONS'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.map(emp => (
                  <tr key={emp._id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.empCell}>
                        <div style={{ ...s.avatar, backgroundColor: emp.color || '#e2e8f0' }}>
                          {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={s.empName}>{emp.name}</div>
                          <div style={s.empId}>{emp.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.roleBadge, backgroundColor: roleColors[emp.role]?.bg || '#f1f5f9', color: roleColors[emp.role]?.color || '#475569' }}>
                        {emp.role}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>{emp.shiftTiming}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{emp.shiftLabel}</div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, backgroundColor: statusStyle[emp.status].bg, color: statusStyle[emp.status].color }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle[emp.status].dot, display: 'inline-block', marginRight: '5px' }}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={s.rating}>⭐ {emp.rating}</span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={s.actionBtnEdit} onClick={() => openEdit(emp)}>✏️ Edit</button>
                        <button style={s.actionBtnDel} onClick={() => handleDelete(emp)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* —— Modal Form —— */}
      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editItem ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button style={s.closeBtn} onClick={closeModal}>×</button>
            </div>

            <div style={s.formGrid}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Full Name *</label>
                <input style={s.input} placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Employee ID *</label>
                <input style={s.input} placeholder="e.g. EMP-101" value={form.empId} onChange={e => setForm({...form, empId: e.target.value})} disabled={!!editItem} />
              </div>
              
              <div style={s.fieldGroup}>
                <label style={s.label}>Role</label>
                <select style={s.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Status</label>
                <select style={s.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Shift Timing</label>
                <input style={s.input} placeholder="09:00 AM - 05:00 PM" value={form.shiftTiming} onChange={e => setForm({...form, shiftTiming: e.target.value})} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Shift Label</label>
                <input style={s.input} placeholder="General Shift" value={form.shiftLabel} onChange={e => setForm({...form, shiftLabel: e.target.value})} />
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={closeModal}>Cancel</button>
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editItem ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' },
  pageTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' },
  topRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  seedBtn:   { padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },
  addBtn: { backgroundColor: '#0f2444', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" },
  page: { flex: 1, padding: '24px', overflow: 'auto', fontFamily: "'Outfit', sans-serif" },
  
  statsRow: { display: 'grid', gridTemplateColumns: '180px 200px 1fr', gap: '16px', marginBottom: '20px' },
  statCard: { backgroundColor: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' },
  statIcon: { fontSize: '1.5rem', marginBottom: '12px' },
  statLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' },
  statSub: { fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', marginTop: '4px' },
  statVal: { fontSize: '2rem', fontWeight: '800', color: '#0f172a' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' },
  progressBar: { height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px' },
  progressFill: { height: '100%', backgroundColor: '#0f2444', borderRadius: '10px', transition: 'width 0.3s' },
  
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardTitle: { fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #f1f5f9', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '16px 14px', verticalAlign: 'middle' },
  empCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '800', flexShrink: 0, color: '#0f172a' },
  empName: { fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' },
  empId: { fontSize: '0.75rem', color: '#94a3b8' },
  roleBadge: { fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' },
  statusBadge: { fontSize: '0.78rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center' },
  rating: { color: '#0f172a', fontWeight: '600', fontSize: '0.9rem' },
  actionBtnEdit: { padding: '6px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },
  actionBtnDel: { padding: '6px 10px', backgroundColor: '#fff1f2', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' },
  
  // Modal
  overlay:    { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal:      { backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  modalHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' },
  closeBtn:   { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '0.8rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:      { padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', color: '#0f172a', outline: 'none', fontFamily: "'Outfit', sans-serif", width: '100%', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' },
  cancelBtn:   { padding: '12px 24px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontWeight: '600', fontFamily: "'Outfit', sans-serif" },
  saveBtn:     { padding: '12px 28px', backgroundColor: '#0f2444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
};

export default StaffManagement;
