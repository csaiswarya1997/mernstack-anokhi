import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Trash2,
  Bell,
  Package,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API_URL from '../../config';

const AdminRestock = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { userInfo } = useAuth();

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/admin/restock-notifications`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        toast.error('Failed to load restock requests');
      }
    } catch (error) {
      console.error('Error fetching restock notifications', error);
      toast.error('Failed to load restock requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchRequests();
    }
  }, [userInfo]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/products/admin/restock-notifications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
        toast.success(`Request marked as ${newStatus}`);
      } else {
        toast.error('Failed to update request status');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this request from the database?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/admin/restock-notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
        toast.success('Restock request deleted');
      } else {
        toast.error('Failed to delete request');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete request');
    }
  };

  // Demand Analytics calculations
  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const notifiedRequestsCount = requests.filter(r => r.status === 'Notified').length;

  // Calculate most demanded out of stock size
  const getTopDemandedItem = () => {
    if (requests.length === 0) return 'N/A';
    const frequency = {};
    requests.forEach(r => {
      if (r.status === 'Pending') {
        const key = `${r.productName} (${r.size})`;
        frequency[key] = (frequency[key] || 0) + 1;
      }
    });
    let topItem = 'N/A';
    let maxCount = 0;
    Object.entries(frequency).forEach(([item, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topItem = `${item} - ${count} reqs`;
      }
    });
    return topItem;
  };

  const filteredRequests = requests.filter(request => {
    // Filter by status
    if (filter !== 'All' && request.status !== filter) return false;

    // Filter by search keyword
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = request.name?.toLowerCase().includes(term);
      const matchEmail = request.email?.toLowerCase().includes(term);
      const matchProduct = request.productName?.toLowerCase().includes(term);
      const matchCode = request.productCode?.toLowerCase().includes(term);
      return matchName || matchEmail || matchProduct || matchCode;
    }

    return true;
  });

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-secondary/60 font-serif italic">Accessing restock registers...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Demand Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primaryContainer">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Pending Alerts</p>
            <p className="text-2xl font-bold font-sans text-secondary mt-1">{pendingRequestsCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Notified Users</p>
            <p className="text-2xl font-bold font-sans text-secondary mt-1">{notifiedRequestsCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Highest Demand</p>
            <p className="text-sm font-bold font-sans text-secondary mt-2 truncate max-w-[200px]" title={getTopDemandedItem()}>
              {getTopDemandedItem()}
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif text-primary">Restock Ledger</h1>
          <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">Manage Customer Waitlists</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search bar */}
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm max-w-xs w-full">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search waitlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs font-sans outline-none text-primary w-full"
            />
          </div>

          {/* Filter dropdown */}
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none text-primary"
            >
              <option value="All">All Inquiries</option>
              <option value="Pending">Pending</option>
              <option value="Notified">Notified</option>
            </select>
          </div>
          <div className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
            {filteredRequests.length} TOTAL
          </div>
        </div>
      </div>

      {/* Requests Lists */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] py-16 text-center shadow-sm">
            <Inbox size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-secondary/40 font-serif italic text-lg">No waitlist enquiries matching the current selection.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request._id} className="bg-white border border-gray-100 rounded-[2rem] p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden animate-fade-in-up">
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${request.status === 'Pending' ? 'bg-amber-400' : 'bg-green-400'}`} />

              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                {/* Contact & Customer Info */}
                <div className="lg:w-1/3 space-y-4">
                  <div>
                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${request.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                      {request.status}
                    </span>
                    <h3 className="text-2xl font-serif text-primary mt-4 mb-1">{request.name}</h3>
                    <p className="text-[10px] text-secondary/40 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> Registered on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <a href={`mailto:${request.email}`} className="flex items-center gap-3 text-secondary/60 hover:text-primary transition-colors text-xs font-sans">
                      <Mail size={14} className="opacity-45" /> {request.email}
                    </a>
                    {request.phone && (
                      <a href={`tel:${request.phone}`} className="flex items-center gap-3 text-secondary/60 hover:text-primary transition-colors text-xs font-sans">
                        <Phone size={14} className="opacity-45" /> {request.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Demand Target Product Info */}
                <div className="lg:w-1/2 flex items-center gap-5 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-14 h-18 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    {request.product && request.product.image ? (
                      <img
                        src={request.product.image.startsWith('http') ? request.product.image : `${API_URL}${request.product.image}`}
                        alt={request.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-bold font-mono tracking-widest text-primaryContainer bg-primaryContainer/5 px-2 py-0.5 rounded border border-primaryContainer/10">
                      REF: #{request.productCode || 'REF-ZALOURA'}
                    </span>
                    <h4 className="text-lg font-serif text-primary mt-2">{request.productName}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs font-bold text-secondary">Size requested: <strong className="text-primary text-sm font-sans">{request.size}</strong></p>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <p className="text-xs text-gray-400">
                        Current stock: {request.product && request.product.stockBySize?.[request.size] !== undefined ? `${request.product.stockBySize[request.size]} left` : '0 left'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operations & Actions */}
                <div className="lg:w-1/6 flex flex-row lg:flex-col justify-end lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  {request.status === 'Pending' ? (
                    <button
                      onClick={() => handleStatusChange(request._id, 'Notified')}
                      className="text-[9px] font-bold uppercase tracking-widest text-white bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Mark Notified
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(request._id, 'Pending')}
                      className="text-[9px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Set Pending
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(request._id)}
                    className="p-2.5 text-red-400 hover:text-white hover:bg-red-500 bg-red-50 rounded-lg transition-all shadow-sm flex items-center justify-center"
                    title="Remove waitlist record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRestock;
