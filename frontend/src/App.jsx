import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Sustainability from './pages/Sustainability';
import About from './pages/About';
import Bespoke from './pages/Bespoke';
import Login from './pages/Login';
import Register from './pages/Register';
import BespokeDetails from './pages/BespokeDetails';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Faq from './pages/Faq';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminBespoke from './pages/admin/AdminBespoke';
import AdminBespokeDetails from './pages/admin/AdminBespokeDetails';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminRestock from './pages/admin/AdminRestock';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMedia from './pages/admin/AdminMedia';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="zaloura-ethnic-wear" element={<Shop />} />
              <Route path="zaloura-kurtis" element={<Shop categoryOverride="Kurti" />} />
              <Route path="zaloura-salwars" element={<Shop categoryOverride="Salwar" />} />
              <Route path="zaloura-product/:id" element={<ProductDetails />} />
              <Route path="zaloura-cart" element={<Cart />} />
              <Route path="zaloura-login" element={<Login />} />
              <Route path="zaloura-register" element={<Register />} />
              <Route path="zaloura-checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="zaloura-profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="zaloura-profile/bespoke/:id" element={
                <ProtectedRoute>
                  <BespokeDetails />
                </ProtectedRoute>
              } />
              <Route path="zaloura-sustainability" element={<Sustainability />} />
              <Route path="about-zaloura" element={<About />} />
              <Route path="zaloura-bespoke" element={<Bespoke />} />
              <Route path="zaloura-bespoke/edit/:id" element={
                <ProtectedRoute>
                  <Bespoke />
                </ProtectedRoute>
              } />
              <Route path="contact-zaloura" element={<Contact />} />
              <Route path="zaloura-shipping" element={<Shipping />} />
              <Route path="zaloura-faq" element={<Faq />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders-processing" element={<AdminOrders filter="Processing" />} />
              <Route path="orders-fulfillment" element={<AdminOrders filter="Fulfillment" />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="bespoke" element={<AdminBespoke />} />
              <Route path="bespoke/:id" element={<AdminBespokeDetails />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="restock" element={<AdminRestock />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
