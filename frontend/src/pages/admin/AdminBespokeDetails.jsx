import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mail, Clock, CheckCircle, MessageSquare, Phone, 
  MessageCircle, ArrowLeft, Save, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';

const AdminBespokeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bespoke/${id}`, {
          headers: { 'Authorization': `Bearer ${userInfo?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
          setAdminNotes(data.adminNotes || '');
        }
      } catch (error) {
        console.error('Error fetching bespoke details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, userInfo]);

  const handleStatusChange = async (newStatus) => {
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
        setRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleContactToggle = async (method) => {
    let currentStatus = Array.isArray(request.contactStatus) ? request.contactStatus : [];
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
        setRequest(prev => ({ ...prev, contactStatus: newStatus }));
      }
    } catch (err) {
      console.error('Error updating contact status', err);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/bespoke/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ adminNotes })
      });
      if (res.ok) {
        setRequest(prev => ({ ...prev, adminNotes }));
      }
    } catch (err) {
      console.error('Error saving notes', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary font-sans">Loading inquiry details...</div>;
  if (!request) return <div className="p-8 text-center text-secondary font-sans">Inquiry not found.</div>;

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
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/bespoke')}
            className="p-2 hover:bg-surface rounded-full transition-colors text-secondary"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-primary">Inquiry Details</h1>
            <p className="text-xs text-secondary/60 uppercase tracking-widest mt-1">ID: {request._id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={request.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest outline-none shadow-sm cursor-pointer ${getStatusColor(request.status)}`}
          >
            <option value="New">New Inquiry</option>
            <option value="Accepted">Accepted</option>
            <option value="Processing">Processing</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
          <a 
            href={`https://wa.me/${(request.whatsapp || '').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Requirements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-champagne/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-champagne/30 pb-4 mb-6">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-secondary/60 mb-1">Full Name</p>
                <p className="text-lg font-serif text-primary">{request.firstName} {request.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-secondary/60 mb-1">Email Address</p>
                <p className="text-sm font-sans text-primary flex items-center gap-2">
                  <Mail size={14} className="text-secondary/40" />
                  {request.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary/60 mb-1">Phone Number</p>
                <p className="text-sm font-sans text-primary flex items-center gap-2">
                  <Phone size={14} className="text-secondary/40" />
                  {request.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary/60 mb-1">WhatsApp Number</p>
                <p className="text-sm font-sans text-green-600 font-bold flex items-center gap-2">
                  <MessageCircle size={14} />
                  {request.whatsapp || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements & Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-champagne/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-champagne/30 pb-4 mb-6">Requirement Details</h3>
            <div className="bg-surface/30 p-6 rounded-xl border border-champagne/20 mb-8">
              <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap italic">
                "{request.requirement}"
              </p>
            </div>

            {request.images?.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-bold text-secondary/40 tracking-widest">Inspiration References</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {request.images.map((img, idx) => (
                    <a 
                      key={idx} 
                      href={`${API_URL}${img}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="aspect-square rounded-xl overflow-hidden border border-champagne/30 group relative"
                    >
                      <img src={`${API_URL}${img}`} alt="Reference" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink size={20} className="text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Internal Notes */}
        <div className="space-y-8">
          {/* Contact Tracking */}
          <div className="bg-white rounded-2xl shadow-sm border border-champagne/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-champagne/30 pb-4 mb-6">Contact Tracking</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleContactToggle('Email')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${request.contactStatus?.includes('Email') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-champagne text-secondary hover:border-primary/30'}`}
              >
                <div className="flex items-center gap-3">
                  <Mail size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Email Sent</span>
                </div>
                {request.contactStatus?.includes('Email') && <CheckCircle size={16} />}
              </button>
              
              <button 
                onClick={() => handleContactToggle('Phone')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${request.contactStatus?.includes('Phone') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-champagne text-secondary hover:border-primary/30'}`}
              >
                <div className="flex items-center gap-3">
                  <Phone size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Phone Call</span>
                </div>
                {request.contactStatus?.includes('Phone') && <CheckCircle size={16} />}
              </button>

              <button 
                onClick={() => handleContactToggle('WhatsApp')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${request.contactStatus?.includes('WhatsApp') ? 'bg-green-600 border-green-700 text-white' : 'bg-white border-champagne text-secondary hover:border-primary/30'}`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">WhatsApp Message</span>
                </div>
                {request.contactStatus?.includes('WhatsApp') && <CheckCircle size={16} />}
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-champagne/50 p-6 border-t-4 border-t-amber-400">
            <div className="flex justify-between items-center mb-6 border-b border-champagne/30 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600">Admin Notes</h3>
              <button 
                onClick={handleSaveNotes}
                disabled={saving}
                className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-700 hover:text-amber-900 transition-colors disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <textarea 
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Record measurements, fabric choices, quotes..."
              className="w-full h-64 bg-amber-50/30 rounded-xl p-4 text-sm text-secondary font-sans outline-none focus:ring-2 ring-amber-100 transition-all resize-none"
            ></textarea>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-600/60 italic">
              <Clock size={12} />
              Last updated: {new Date(request.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBespokeDetails;
