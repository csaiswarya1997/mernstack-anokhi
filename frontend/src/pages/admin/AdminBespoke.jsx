import React, { useState, useEffect } from 'react';
import { Mail, Clock, MessageSquare, Phone, MessageCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';

const AdminBespoke = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuth();

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bespoke`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching bespoke requests', error);
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
      const res = await fetch(`${API_URL}/api/bespoke/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRequests(prev => prev.map(req => 
          req._id === id ? { ...req, status: newStatus } : req
        ));
      }
    } catch (err) {
      console.error('Error updating bespoke status', err);
    }
  };

  const handleContacted = async (id, method) => {
    const currentRequest = requests.find(r => r._id === id);
    let currentStatus = Array.isArray(currentRequest.contactStatus) ? currentRequest.contactStatus : [];
    
    let newStatus;
    if (currentStatus.includes(method)) {
      newStatus = currentStatus.filter(m => m !== method);
    } else {
      newStatus = [...currentStatus, method];
    }
    
    try {
      const res = await fetch(`${API_URL}/api/bespoke/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ contactStatus: newStatus })
      });
      if (res.ok) {
        setRequests(prev => prev.map(req => 
          req._id === id ? { ...req, contactStatus: newStatus } : req
        ));
      }
    } catch (err) {
      console.error('Error updating contact status', err);
    }
  };
  const handleView = (id) => {
    navigate(`/admin/bespoke/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Accepted': return 'bg-purple-100 text-purple-700';
      case 'Processing': return 'bg-amber-100 text-amber-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-primary mb-2">Bespoke Requests</h1>
        <p className="text-secondary font-sans text-sm">Manage custom tailoring and consultation requests from customers.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-champagne/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-secondary font-sans">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-secondary font-sans">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No bespoke requests received yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-surface border-b border-champagne/50 text-secondary uppercase tracking-widest text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Requirement</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/30">
                  {requests.map(request => (
                    <tr key={request._id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-primary font-semibold">{request.firstName} {request.lastName}</p>
                        <div className="space-y-2 mt-2 pt-2 border-t border-champagne/20">
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-1 text-secondary text-[10px]">
                              <Mail size={12} className="opacity-60" />
                              <a href={`mailto:${request.email}`} className="hover:text-primary transition-colors">{request.email}</a>
                            </div>
                            <button onClick={() => handleContacted(request._id, 'Email')} className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${request.contactStatus?.includes('Email') ? 'bg-green-100 text-green-600' : 'bg-surface text-secondary/30 hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                              {request.contactStatus?.includes('Email') ? 'Sent' : 'Mark Sent'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-1 text-secondary text-[10px]">
                              <Phone size={12} className="opacity-60" />
                              <a href={`tel:${request.phone || ''}`} className="hover:text-primary transition-colors">{request.phone || 'N/A'}</a>
                            </div>
                            <button onClick={() => handleContacted(request._id, 'Phone')} className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${request.contactStatus?.includes('Phone') ? 'bg-blue-100 text-blue-600' : 'bg-surface text-secondary/30 hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                              {request.contactStatus?.includes('Phone') ? 'Called' : 'Mark Call'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                              <MessageCircle size={12} />
                              <a href={`https://wa.me/${(request.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp</a>
                            </div>
                            <button onClick={() => handleContacted(request._id, 'WhatsApp')} className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${request.contactStatus?.includes('WhatsApp') ? 'bg-green-600 text-white' : 'bg-surface text-secondary/30 hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                              {request.contactStatus?.includes('WhatsApp') ? 'Sent' : 'Mark WA'}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-secondary line-clamp-2 max-w-md">{request.requirement}</p>
                      </td>
                      <td className="px-6 py-4 text-secondary text-xs">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none appearance-none cursor-pointer pr-6 ${getStatusColor(request.status)}`}
                          style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.6em auto' }}
                        >
                          <option value="New">New Inquiry</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Processing">Processing</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleView(request._id)}
                          className="p-2 text-primary hover:bg-surface rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-champagne/30">
              {requests.map(request => (
                <div key={request._id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-primary font-serif font-bold text-lg">{request.firstName} {request.lastName}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center gap-1 text-secondary text-[10px]">
                          <Mail size={10} />
                          {request.email}
                        </div>
                        <div className="flex items-center gap-1 text-secondary text-[10px]">
                          <Phone size={10} />
                          {request.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                          <MessageCircle size={10} />
                          {request.whatsapp || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="bg-surface/50 p-3 rounded-lg border border-champagne/20">
                    <p className="text-[10px] uppercase text-secondary font-bold tracking-widest mb-1 flex items-center gap-2">
                      <MessageSquare size={10} /> Requirement
                    </p>
                    <p className="text-secondary text-xs leading-relaxed italic">"{request.requirement}"</p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1 text-secondary/60 text-[10px] uppercase tracking-tighter">
                      <Clock size={12} />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest outline-none border-none appearance-none cursor-pointer pr-5 ${getStatusColor(request.status)}`}
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.4rem center', backgroundSize: '0.6em auto' }}
                    >
                      <option value="New">New</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Processing">Processing</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-champagne/10">
                    <button onClick={() => handleContacted(request._id, 'Email')} className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-colors ${request.contactStatus?.includes('Email') ? 'bg-green-100 text-green-600 border-green-200' : 'bg-white text-secondary border-champagne'}`}>
                      Email {request.contactStatus?.includes('Email') && '✓'}
                    </button>
                    <button onClick={() => handleContacted(request._id, 'Phone')} className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-colors ${request.contactStatus?.includes('Phone') ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white text-secondary border-champagne'}`}>
                      Call {request.contactStatus?.includes('Phone') && '✓'}
                    </button>
                    <button onClick={() => handleContacted(request._id, 'WhatsApp')} className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-colors ${request.contactStatus?.includes('WhatsApp') ? 'bg-green-600 text-white border-green-700' : 'bg-white text-secondary border-champagne'}`}>
                      WA {request.contactStatus?.includes('WhatsApp') && '✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBespoke;
