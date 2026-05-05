import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Circle,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { userInfo } = useAuth();

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch (error) {
      console.error('Error fetching enquiries', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [userInfo]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    if (filter === 'All') return true;
    return e.status === filter;
  });

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-secondary/60 font-serif italic">Reviewing correspondence...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif text-primary">Inquiry Ledger</h1>
          <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">Manage Customer Correspondence</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none text-primary"
            >
              <option value="All">All Inquiries</option>
              <option value="New">Unread</option>
              <option value="Read">Read</option>
              <option value="Replied">Responded</option>
            </select>
          </div>
          <div className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
            {filteredEnquiries.length} TOTAL
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredEnquiries.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] py-24 text-center">
            <MessageSquare size={40} className="text-gray-100 mx-auto mb-4" />
            <p className="text-secondary/40 font-serif italic text-lg">No inquiries found in this collection.</p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <div key={enquiry._id} className="bg-white border border-gray-100 rounded-[2rem] p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                enquiry.status === 'New' ? 'bg-blue-400' : 
                enquiry.status === 'Read' ? 'bg-amber-400' : 'bg-green-400'
              }`} />

              <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                {/* Contact Info */}
                <div className="lg:w-1/3 space-y-6">
                  <div>
                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full border ${
                      enquiry.status === 'New' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                      enquiry.status === 'Read' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      'bg-green-50 border-green-100 text-green-600'
                    }`}>
                      {enquiry.status}
                    </span>
                    <h3 className="text-2xl font-serif text-primary mt-4 mb-1">{enquiry.name}</h3>
                    <p className="text-[10px] text-secondary/40 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> {new Date(enquiry.createdAt).toLocaleDateString()} at {new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <a href={`mailto:${enquiry.email}`} className="flex items-center gap-3 text-secondary/60 hover:text-primary transition-colors text-xs font-sans">
                      <Mail size={14} className="opacity-40" /> {enquiry.email}
                    </a>
                    <a href={`tel:${enquiry.phone}`} className="flex items-center gap-3 text-secondary/60 hover:text-primary transition-colors text-xs font-sans">
                      <Phone size={14} className="opacity-40" /> {enquiry.phone}
                    </a>
                  </div>

                  <div className="pt-6 border-t border-gray-0 flex gap-2">
                    {enquiry.status !== 'Read' && (
                      <button 
                        onClick={() => handleStatusChange(enquiry._id, 'Read')}
                        className="text-[9px] font-bold uppercase tracking-widest text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {enquiry.status !== 'Replied' && (
                      <button 
                        onClick={() => handleStatusChange(enquiry._id, 'Replied')}
                        className="text-[9px] font-bold uppercase tracking-widest text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        Responded
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="lg:w-2/3">
                  <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 h-full">
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                      <MessageSquare size={12} /> Enquiry Message
                    </h4>
                    <p className="text-secondary leading-relaxed font-sans italic whitespace-pre-wrap">
                      "{enquiry.comment}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions overlay */}
              <div className="absolute top-8 right-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={`https://wa.me/${enquiry.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEnquiries;
