import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Key,
  X,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API_URL from '../../config';

const AdminUsers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastOrderDate'); // 'lastOrderDate', 'totalOrders', 'totalSpent'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  
  // Password reset states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { userInfo } = useAuth();

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/purchased`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        toast.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error fetching customers', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchCustomers();
    }
  }, [userInfo]);

  // Handle password reset submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${resetUser._id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successfully');
        setIsResetModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred during password reset');
    } finally {
      setResetting(false);
    }
  };

  // Handle row expansion
  const toggleRow = (email) => {
    if (expandedCustomer === email) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(email);
    }
  };

  // Sort toggle handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort customer records
  const filteredCustomers = customers
    .filter(customer => {
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'lastOrderDate') {
        comparison = new Date(a.lastOrderDate) - new Date(b.lastOrderDate);
      } else if (sortBy === 'totalOrders') {
        comparison = a.totalOrders - b.totalOrders;
      } else if (sortBy === 'totalSpent') {
        comparison = a.totalSpent - b.totalSpent;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate high-level metrics
  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpend = customers.length > 0 ? totalSpend / customers.length : 0;
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-secondary/60 font-serif italic">Loading customer ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-primary">Customer Ledger</h1>
        <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">
          Manage and Analyze Shoppers & Purchase Logs
        </p>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Shoppers</p>
            <h3 className="text-2xl font-serif text-primary mt-1 font-bold">{customers.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue</p>
            <h3 className="text-2xl font-serif text-primary mt-1 font-bold">₹{totalSpend.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Purchases</p>
            <h3 className="text-2xl font-serif text-primary mt-1 font-bold">{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowUpDown size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Customer Value</p>
            <h3 className="text-2xl font-serif text-primary mt-1 font-bold">₹{Math.round(avgSpend).toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Search Box */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:bg-white focus:border-primary/20 transition-all font-sans"
            />
          </div>

          {/* Quick Counter */}
          <div className="bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-primary/10">
            {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''} Found
          </div>
        </div>
      </div>

      {/* Shoppers Table */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50 text-left">
                <th className="py-5 px-8 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Shopper</th>
                <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Contact Details</th>
                <th 
                  onClick={() => handleSort('totalOrders')}
                  className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    Orders
                    <ArrowUpDown size={12} className={sortBy === 'totalOrders' ? 'text-primary' : 'opacity-40'} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('totalSpent')}
                  className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    Total Spent
                    <ArrowUpDown size={12} className={sortBy === 'totalSpent' ? 'text-primary' : 'opacity-40'} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('lastOrderDate')}
                  className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    Last active
                    <ArrowUpDown size={12} className={sortBy === 'lastOrderDate' ? 'text-primary' : 'opacity-40'} />
                  </div>
                </th>
                <th className="py-5 px-8 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-secondary/40 font-serif italic text-lg bg-white">
                    No customers found matching this criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const isExpanded = expandedCustomer === customer.email;
                  const firstLetter = customer.name.charAt(0).toUpperCase();

                  return (
                    <React.Fragment key={customer.email}>
                      <tr className={`border-b border-gray-50 transition-colors hover:bg-gray-50/30 ${isExpanded ? 'bg-gray-50/20' : ''}`}>
                        {/* Name and avatar info */}
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-champagne/30 text-primary flex items-center justify-center font-bold font-serif text-sm border border-champagne/10">
                              {firstLetter}
                            </div>
                            <div>
                              <h4 className="font-serif text-primary text-base font-bold">{customer.name}</h4>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans mt-0.5">
                                {customer._id ? 'Registered Account' : 'Guest Checkout'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="py-6 px-6">
                          <div className="space-y-1">
                            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-secondary/70 hover:text-primary transition-colors text-xs font-sans">
                              <Mail size={12} className="opacity-40" /> {customer.email}
                            </a>
                            <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-secondary/70 hover:text-primary transition-colors text-xs font-sans">
                              <Phone size={12} className="opacity-40" /> {customer.phone}
                            </a>
                          </div>
                        </td>

                        {/* Order Count */}
                        <td className="py-6 px-6">
                          <span className="bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/5">
                            {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Total Spent */}
                        <td className="py-6 px-6 font-serif text-primary font-bold text-sm">
                          ₹{customer.totalSpent.toLocaleString('en-IN')}
                        </td>

                        {/* Last purchase date */}
                        <td className="py-6 px-6 text-xs text-secondary/60 font-sans">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="opacity-40" />
                            {new Date(customer.lastOrderDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Collapse expand actions */}
                        <td className="py-6 px-8 text-right">
                          <div className="flex items-center justify-end gap-3.5">
                            {customer._id && (
                              <button
                                onClick={() => {
                                  setResetUser(customer);
                                  setIsResetModalOpen(true);
                                }}
                                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-all focus:outline-none"
                              >
                                Reset Pass
                              </button>
                            )}
                            <button
                              onClick={() => toggleRow(customer.email)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-all focus:outline-none"
                            >
                              {isExpanded ? 'Hide Logs' : 'View Logs'}
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Order details row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="bg-gray-50/40 border-b border-gray-100 p-8">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 max-w-4xl shadow-inner">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                <ShoppingBag size={14} /> Transaction History for {customer.name}
                              </h4>
                              
                              <div className="space-y-4">
                                {customer.orders.map((ord, idx) => (
                                  <div key={ord.orderId} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-50 rounded-xl hover:border-champagne/30 transition-all bg-gray-50/20">
                                    <div className="flex items-center gap-4">
                                      <span className="text-[10px] font-sans font-bold text-gray-300">
                                        #{idx + 1}
                                      </span>
                                      <div>
                                        <p className="text-xs font-bold font-sans text-secondary flex items-center gap-1.5">
                                          Order ID: <span className="font-mono text-primary font-medium">{ord.orderId}</span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-sans">
                                          Placed on {new Date(ord.createdAt).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                      {/* Status Label */}
                                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                        ord.status === 'Cancelled' ? 'bg-red-50 border-red-100 text-red-600' :
                                        ord.status === 'Processing' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                        ord.status === 'Completed' || ord.status === 'Delivered' ? 'bg-green-50 border-green-100 text-green-600' :
                                        'bg-amber-50 border-amber-100 text-amber-600'
                                      }`}>
                                        {ord.status}
                                      </span>

                                      {/* Transaction Price */}
                                      <p className="font-serif font-bold text-primary text-sm min-w-[70px] text-right">
                                        ₹{ord.totalPrice.toLocaleString('en-IN')}
                                      </p>
                                      
                                      {/* Link to all orders page with context */}
                                      <a
                                        href="/admin/orders"
                                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center"
                                        title="View in Order Ledger"
                                      >
                                        <ExternalLink size={12} />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {isResetModalOpen && resetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsResetModalOpen(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <Key size={18} />
              </div>
              <div>
                <h3 className="text-xl font-serif text-primary font-bold">Reset Password</h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">Change credentials for {resetUser.name}</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 block">New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-red-500/20 transition-all font-sans text-primary pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 block">Confirm Password</label>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-red-500/20 transition-all font-sans text-primary"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-secondary py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
