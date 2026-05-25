import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, LayoutDashboard, LogOut, Clock, Truck, CreditCard, Mail, Settings, Users } from 'lucide-react';
import AdminLogin from './AdminLogin';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('anokhi_admin_auth') === 'true'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('anokhi_admin_auth');
    logout();
    setIsAuthenticated(false);
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-surface relative">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-6 left-4 z-[60] bg-primaryContainer text-white p-2 rounded-md shadow-lg"
      >
        <LayoutDashboard size={20} />
      </button>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:sticky top-0 left-0 z-50
        w-64 bg-secondary text-white flex flex-col h-screen transition-transform duration-300 ease-in-out
      `}>
        <div className="p-8 border-b border-primary/20 bg-secondary/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-secondary font-serif font-bold">Z</div>
            <h1 className="text-xl font-serif tracking-tight font-bold text-white">Zaloura <span className="text-primary">Admin</span></h1>
          </div>
          <p className="text-[8px] text-primary font-sans tracking-[0.4em] uppercase font-bold">Management Portal</p>
        </div>

        <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto">
          <Link
            to="/admin/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/products') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Package size={18} />
            <span className="font-sans text-sm font-semibold">Products</span>
          </Link>
          <Link
            to="/admin/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname === '/admin/orders' ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <ShoppingBag size={18} />
            <span className="font-sans text-sm font-semibold">All Orders</span>
          </Link>
          <Link
            to="/admin/orders-processing"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/orders-processing') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Clock size={18} />
            <span className="font-sans text-sm font-semibold">Processing</span>
          </Link>
          <Link
            to="/admin/orders-fulfillment"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/orders-fulfillment') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Truck size={18} />
            <span className="font-sans text-sm font-semibold">Fulfillment</span>
          </Link>
          <Link
            to="/admin/payments"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/payments') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <CreditCard size={18} />
            <span className="font-sans text-sm font-semibold">Payments</span>
          </Link>
          <Link
            to="/admin/bespoke"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/bespoke') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} />
            <span className="font-sans text-sm font-semibold">Bespoke</span>
          </Link>
          <Link
            to="/admin/enquiries"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/enquiries') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Mail size={18} />
            <span className="font-sans text-sm font-semibold">Enquiries</span>
          </Link>
          <Link
            to="/admin/users"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/users') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Users size={18} />
            <span className="font-sans text-sm font-semibold">Customers</span>
          </Link>
          <Link
            to="/admin/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/settings') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Settings size={18} />
            <span className="font-sans text-sm font-semibold">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut size={18} />
            <span className="font-sans text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-background min-w-0">
        <header className="bg-white border-b border-champagne/50 h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <h2 className="text-xl font-serif text-primary">
            {location.pathname.includes('products') ? 'Product Management' :
              location.pathname.includes('orders-processing') ? 'Processing Orders' :
                location.pathname.includes('orders-fulfillment') ? 'Order Fulfillment' :
                  location.pathname.includes('payments') ? 'Payment Ledger' :
                    location.pathname.includes('orders') ? 'All Orders' :
                      location.pathname.includes('bespoke') ? 'Bespoke Requests' :
                        location.pathname.includes('enquiries') ? 'Customer Enquiries' :
                          location.pathname.includes('users') ? 'Customer Ledger' :
                            location.pathname.includes('settings') ? 'Portal Settings' : 'Dashboard'}
          </h2>
          <div className="hidden sm:flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-champagne/30 flex items-center justify-center text-primary font-bold text-xs">A</div>
            <span className="text-xs font-sans font-bold text-secondary uppercase tracking-widest">Administrator</span>
          </div>
        </header>
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
