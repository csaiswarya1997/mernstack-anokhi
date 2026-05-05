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
import AdminBespoke from './pages/admin/AdminBespoke';
import AdminBespokeDetails from './pages/admin/AdminBespokeDetails';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminSettings from './pages/admin/AdminSettings';

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
              <Route path="shop" element={<Shop />} />
              <Route path="category/:category" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="profile/bespoke/:id" element={
                <ProtectedRoute>
                  <BespokeDetails />
                </ProtectedRoute>
              } />
              <Route path="sustainability" element={<Sustainability />} />
              <Route path="bespoke" element={<Bespoke />} />
              <Route path="bespoke/edit/:id" element={
                <ProtectedRoute>
                  <Bespoke />
                </ProtectedRoute>
              } />
              <Route path="contact" element={<Contact />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="faq" element={<Faq />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders-processing" element={<AdminOrders filter="Processing" />} />
              <Route path="orders-fulfillment" element={<AdminOrders filter="Fulfillment" />} />
              <Route path="payments" element={<AdminOrders filter="Payments" />} />
              <Route path="bespoke" element={<AdminBespoke />} />
              <Route path="bespoke/:id" element={<AdminBespokeDetails />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
