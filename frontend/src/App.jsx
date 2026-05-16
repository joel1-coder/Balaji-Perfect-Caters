import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/admin/Login';

// â€â‚¬â€â‚¬ Admin Pages â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬
import ExecutiveOverview from './pages/admin/ExecutiveOverview';
import StaffManagement   from './pages/admin/StaffManagement';
import TransactionAudit  from './pages/admin/TransactionAudit';
import MenuItems         from './pages/admin/MenuItems';
import MenuEditor        from './pages/admin/MenuEditor';
import CateringQuotation from './pages/admin/CateringQuotation';

// â€â‚¬â€â‚¬ User / Operator Pages â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬
import QuickBill from './pages/admin/QuickBill';
import OperatorMenu from './pages/admin/OperatorMenu';

// â€â‚¬â€â‚¬ Public Pages (no auth) â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬â€â‚¬
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

        {/* â”€â”€â”€â”€ Admin Routes â”€â”€â”€â”€ */}
        <Route path="/admin/overview"   element={<AdminRoute><ExecutiveOverview /></AdminRoute>} />
        <Route path="/admin/menu-items" element={<AdminRoute><MenuItems /></AdminRoute>} />
        <Route path="/admin/menu-items/edit/:id" element={<AdminRoute><MenuEditor /></AdminRoute>} />
        <Route path="/admin/audit"      element={<AdminRoute><TransactionAudit /></AdminRoute>} />
        <Route path="/admin/staff"      element={<AdminRoute><StaffManagement /></AdminRoute>} />
        <Route path="/admin/quotation"  element={<AdminRoute><CateringQuotation /></AdminRoute>} />

        {/* â”€â”€â”€â”€ User / Operator Routes â”€â”€â”€â”€ */}
        <Route path="/user/billing"     element={<UserRoute><QuickBill /></UserRoute>} />
        <Route path="/user/menu"        element={<UserRoute><OperatorMenu /></UserRoute>} />

        {/* Legacy redirects */}
        <Route path="/admin/billing"    element={<Navigate to="/user/billing" replace />} />
        <Route path="/admin/menus"      element={<Navigate to="/admin/menu-items" replace />} />
        <Route path="/quickbill"        element={<Navigate to="/user/billing" replace />} />

        {/* â”€â”€â”€â”€ Public QR Menu (no auth required) â”€â”€â”€â”€ */}
        <Route path="/public/menu/:id" element={<DigitalMenu />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
