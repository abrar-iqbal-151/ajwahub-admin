import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminPanel from './pages/AdminPanel';
import Admin_Description from './pages/Admin_Description';
import Users from './pages/Users';
import Admin_Home from './pages/Admin_Home';
import Admin_Product from './pages/Admin_Product';
import Admin_Wishlist from './pages/Admin_Wishlist';
import Admin_GiftOrders from './pages/Admin_GiftOrders';
import Admin_GiftBoxes from './pages/Admin_GiftBoxes';
import Admin_Contact from './pages/Admin_Contact';
import Admin_Payment from './pages/Admin_Payment';
import Admin_GymAI from './pages/Admin_GymAI';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<AdminSignup />} />
      <Route path="/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/panel" element={<AdminPanel />} />
      <Route path="/panel/users" element={<Users />} />
      <Route path="/description" element={<Admin_Description />} />
      <Route path="/home-editor" element={<Admin_Home />} />
      <Route path="/admin-products" element={<Admin_Product />} />
      <Route path="/admin-wishlist" element={<Admin_Wishlist />} />
      <Route path="/admin-gift-orders" element={<Admin_GiftOrders />} />
      <Route path="/admin-gift-boxes" element={<Admin_GiftBoxes />} />
      <Route path="/admin-contact" element={<Admin_Contact />} />
      <Route path="/admin-payments" element={<Admin_Payment />} />
      <Route path="/admin-gymai" element={<Admin_GymAI />} />
    </Routes>
  );
}

export default App;
