import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Clock,
  Save,
  Loader2,
  Truck,
  RotateCcw,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    instagram: '',
    workingHours: '',
    shippingPolicy: '',
    returnsPolicy: '',
    internationalPolicy: '',
    qualityPolicy: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            workingHours: data.workingHours || '',
            shippingPolicy: data.shippingPolicy || '',
            returnsPolicy: data.returnsPolicy || '',
            internationalPolicy: data.internationalPolicy || '',
            qualityPolicy: data.qualityPolicy || ''
          });
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-secondary/60 font-serif italic">Loading portal settings...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-primary">Store Configuration</h1>
        <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">Manage Public Contact Information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10">
          
          {/* Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <MapPin size={20} className="text-primary/40" /> Address
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Physical location of the boutique shown on the contact page.</p>
            </div>
            <div className="md:col-span-8">
              <textarea 
                required
                rows="3"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-sans text-sm resize-none"
                placeholder="Full address..."
              />
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <Phone size={20} className="text-primary/40" /> Connectivity
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Direct lines for customer support and inquiries.</p>
            </div>
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Phone Number</label>
                <input 
                  required
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <Instagram size={20} className="text-primary/40" /> Digital Presence
              </h3>
              <p className="text-xs text-secondary/40 mt-2">WhatsApp and Instagram handles for social engagement.</p>
            </div>
            <div className="md:col-span-8 space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-4 border border-gray-100">
                <MessageCircle size={20} className="text-green-500" />
                <div className="flex-1">
                  <label className="text-[8px] uppercase font-bold text-gray-400 tracking-widest block mb-1">WhatsApp Business</label>
                  <input 
                    type="text"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-transparent outline-none font-sans text-sm"
                    placeholder="+91 ..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-4 border border-gray-100">
                <Instagram size={20} className="text-pink-500" />
                <div className="flex-1">
                  <label className="text-[8px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Instagram Handle</label>
                  <input 
                    type="text"
                    value={formData.instagram}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                    className="w-full bg-transparent outline-none font-sans text-sm"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Operational Hours */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <Clock size={20} className="text-primary/40" /> Availability
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Working hours displayed to users for consultation.</p>
            </div>
            <div className="md:col-span-8">
              <input 
                required
                type="text"
                value={formData.workingHours}
                onChange={e => setFormData({...formData, workingHours: e.target.value})}
                className="w-full border-b border-gray-200 py-3 outline-none focus:border-primary transition-colors bg-transparent font-sans text-sm"
                placeholder="e.g. 10 AM — 7 PM"
              />
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Shipping Policy */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <Truck size={20} className="text-primary/40" /> Shipping Policy
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Information about delivery times, costs, and international shipping.</p>
            </div>
            <div className="md:col-span-8">
              <textarea 
                rows="6"
                value={formData.shippingPolicy}
                onChange={e => setFormData({...formData, shippingPolicy: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-sans text-sm resize-none"
                placeholder="Shipping details..."
              />
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Returns Policy */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <RotateCcw size={20} className="text-primary/40" /> Returns Policy
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Information about exchange windows, altered items, and quality assurance.</p>
            </div>
            <div className="md:col-span-8">
              <textarea 
                rows="6"
                value={formData.returnsPolicy}
                onChange={e => setFormData({...formData, returnsPolicy: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-sans text-sm resize-none"
                placeholder="Return and exchange details..."
              />
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* International Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <Globe size={20} className="text-primary/40" /> International Delivery
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Information about customs, taxes, and global courier partners.</p>
            </div>
            <div className="md:col-span-8">
              <textarea 
                rows="6"
                value={formData.internationalPolicy}
                onChange={e => setFormData({...formData, internationalPolicy: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-sans text-sm resize-none"
                placeholder="International shipping details..."
              />
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Quality Assurance */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="font-serif text-xl text-primary flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary/40" /> Quality Assurance
              </h3>
              <p className="text-xs text-secondary/40 mt-2">Information about handcrafted defects, inspections, and support.</p>
            </div>
            <div className="md:col-span-8">
              <textarea 
                rows="6"
                value={formData.qualityPolicy}
                onChange={e => setFormData({...formData, qualityPolicy: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-sans text-sm resize-none"
                placeholder="Quality and inspection details..."
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
