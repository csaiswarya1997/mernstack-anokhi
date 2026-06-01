import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, LayoutDashboard, LogOut, Clock, Truck, CreditCard, Mail, Settings, Users, Bell, QrCode, Download, Loader2, Instagram, Image } from 'lucide-react';
import AdminLogin from './AdminLogin';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('anokhi_admin_auth') === 'true'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Storefront QR Popover States
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrTab, setQrTab] = useState('store'); // 'store' or 'instagram'
  const [qrUrl, setQrUrl] = useState('https://www.zaloura.in/');
  const [downloadingQr, setDownloadingQr] = useState(false);

  const handleDownloadQr = async () => {
    setDownloadingQr(true);
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrUrl)}`;
      const res = await fetch(qrApiUrl);
      if (!res.ok) throw new Error('Failed to generate QR code');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Zaloura_Store_QR_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Storefront QR Code downloaded successfully!');
    } catch (err) {
      console.error('Error downloading QR code:', err);
      toast.error('Failed to download QR code. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  const handleDownloadInstagramQr = async () => {
    setDownloadingQr(true);
    try {
      const res = await fetch('/instagram_qr.jpg');
      if (!res.ok) throw new Error('Failed to load Instagram QR image');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Zaloura_Instagram_QR.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Instagram QR Code downloaded successfully!');
    } catch (err) {
      console.error('Error downloading Instagram QR code:', err);
      toast.error('Failed to download Instagram QR. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

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
            to="/admin/restock"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/restock') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Bell size={18} />
            <span className="font-sans text-sm font-semibold">Restock Alerts</span>
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
            to="/admin/media"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/admin/media') ? 'bg-primary text-secondary shadow-md' : 'text-white/60 hover:text-primary hover:bg-white/5'}`}
          >
            <Image size={18} />
            <span className="font-sans text-sm font-semibold">Media Assets</span>
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
                          location.pathname.includes('restock') ? 'Restock Alerts' :
                            location.pathname.includes('users') ? 'Customer Ledger' :
                              location.pathname.includes('media') ? 'Media Assets' :
                                location.pathname.includes('settings') ? 'Portal Settings' : 'Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
            {/* Storefront QR Popover */}
            <div className="relative">
              <button
                onClick={() => setIsQrOpen(!isQrOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-secondary hover:text-primary hover:bg-gray-100 hover:border-gray-200 transition-all shadow-sm focus:outline-none"
                title="Storefront QR Code"
              >
                <QrCode size={18} />
              </button>

              {isQrOpen && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsQrOpen(false)}></div>
                  
                  {/* Popover Card */}
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-champagne/40 rounded-[2rem] p-6 shadow-xl z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-primaryContainer/10 flex items-center justify-center text-primary">
                        <QrCode size={16} />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm text-primary font-bold">Brand QR Codes</h4>
                        <p className="text-[9px] text-secondary/40 uppercase tracking-widest font-bold">Zaloura Brand Assets</p>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-100 mb-4">
                      <button
                        onClick={() => setQrTab('store')}
                        className={`flex-1 text-center pb-2.5 text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 ${
                          qrTab === 'store'
                            ? 'text-primary border-primary font-bold'
                            : 'text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                      >
                        Storefront
                      </button>
                      <button
                        onClick={() => setQrTab('instagram')}
                        className={`flex-1 text-center pb-2.5 text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 ${
                          qrTab === 'instagram'
                            ? 'text-primary border-primary font-bold'
                            : 'text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                      >
                        Instagram
                      </button>
                    </div>

                    {qrTab === 'store' ? (
                      <div className="space-y-4">
                        {/* Storefront QR Code Preview */}
                        <div className="w-40 h-40 mx-auto bg-gray-50/50 rounded-2xl border border-champagne/20 p-4 flex items-center justify-center shadow-inner relative overflow-hidden group">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`} 
                            alt="Storefront QR" 
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-gray-400 tracking-widest block ml-1">Scan Target Link</label>
                          <input
                            type="text"
                            value={qrUrl}
                            onChange={(e) => setQrUrl(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-primary transition-colors font-sans text-xs text-primary font-bold shadow-sm"
                            placeholder="Store URL..."
                          />
                        </div>

                        <button
                          onClick={handleDownloadQr}
                          disabled={downloadingQr || !qrUrl}
                          className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-bold uppercase tracking-wider text-[9px] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {downloadingQr ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                          Download QR (PNG)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Instagram QR Code Preview */}
                        <div className="w-40 h-40 mx-auto bg-gray-50/50 rounded-2xl border border-champagne/20 p-4 flex items-center justify-center shadow-inner relative overflow-hidden group">
                          <img 
                            src="/instagram_qr.jpg" 
                            alt="Instagram QR" 
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-1 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[10px] text-pink-600 font-bold font-sans uppercase tracking-wider border border-pink-100">
                            <Instagram size={10} /> @zaloura.in_
                          </span>
                        </div>

                        <button
                          onClick={handleDownloadInstagramQr}
                          disabled={downloadingQr}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-[9px] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {downloadingQr ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                          Download Instagram QR (JPG)
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-4 border-l border-gray-100 pl-6">
              <div className="w-8 h-8 rounded-full bg-champagne/30 flex items-center justify-center text-primary font-bold text-xs">A</div>
              <span className="text-xs font-sans font-bold text-secondary uppercase tracking-widest">Administrator</span>
            </div>
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
