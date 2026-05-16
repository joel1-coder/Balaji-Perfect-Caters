import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/admin/Login';

// ”€”€ Admin Pages ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€
import ExecutiveOverview from './pages/admin/ExecutiveOverview';
import StaffManagement   from './pages/admin/StaffManagement';
import TransactionAudit  from './pages/admin/TransactionAudit';
import MenuItems         from './pages/admin/MenuItems';
import MenuEditor        from './pages/admin/MenuEditor';
import CateringQuotation from './pages/admin/CateringQuotation';

// ”€”€ User / Operator Pages ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€
import QuickBill from './pages/admin/QuickBill';
import OperatorMenu from './pages/admin/OperatorMenu';

// ”€”€ Public Pages (no auth) ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€
import DigitalMenu from './pages/public/DigitalMenu';

import './index.css';

// Auth guards
const role = () => localStorage.getItem('canteen_role');

const AdminRoute = ({ children }) => {
  if (!localStorage.getItem('canteen_auth')) return <Navigate to="/login" replace />;
  if (role() !== 'admin') return <Navigate to="/user/billing" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  if (!localStorage.getItem('canteen_auth')) return <Navigate to="/login" replace />;
  if (role() !== 'operator') return <Navigate to="/admin/overview" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ──── Admin Routes ──── */}
        <Route path="/admin/overview"   element={<AdminRoute><ExecutiveOverview /></AdminRoute>} />
        <Route path="/admin/menu-items" element={<AdminRoute><MenuItems /></AdminRoute>} />
        <Route path="/admin/menu-items/edit/:id" element={<AdminRoute><MenuEditor /></AdminRoute>} />
        <Route path="/admin/audit"      element={<AdminRoute><TransactionAudit /></AdminRoute>} />
        <Route path="/admin/staff"      element={<AdminRoute><StaffManagement /></AdminRoute>} />
        <Route path="/admin/quotation"  element={<AdminRoute><CateringQuotation /></AdminRoute>} />

        {/* ──── User / Operator Routes ──── */}
        <Route path="/user/billing"     element={<UserRoute><QuickBill /></UserRoute>} />
        <Route path="/user/menu"        element={<UserRoute><OperatorMenu /></UserRoute>} />

        {/* Legacy redirects */}
        <Route path="/admin/billing"    element={<Navigate to="/user/billing" replace />} />
        <Route path="/admin/menus"      element={<Navigate to="/admin/menu-items" replace />} />
        <Route path="/quickbill"        element={<Navigate to="/user/billing" replace />} />

        {/* ──── Public QR Menu (no auth required) ──── */}
        <Route path="/public/menu/:id" element={<DigitalMenu />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
