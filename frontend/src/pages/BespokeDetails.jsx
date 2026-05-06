import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Palette,
  Edit3,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const BespokeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    const fetchBespokeDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bespoke/${id}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        } else {
          toast.error('Project not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bespoke details:', error);
        toast.error('Failed to load project details');
        setLoading(false);
      }
    };

    fetchBespokeDetails();
  }, [id, userInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary"
        ></motion.div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="font-serif text-2xl text-primary mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-8">The request you are looking for does not exist or you don't have access.</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-8 py-3 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Accepted': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-serif text-4xl lg:text-5xl text-primary">Project #{request._id.slice(-6).toUpperCase()}</h1>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <Calendar size={14} />
              Submitted on {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex gap-4">
            {request.status === 'New' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/bespoke/edit/${request._id}`)}
                className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Edit3 size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Edit Project</span>
              </motion.button>
            )}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`https://wa.me/91${request.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition-colors"
            >
              <MessageSquare size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">WhatsApp Support</span>
            </motion.a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visual References */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100/50"
            >
              <div className="flex items-center gap-3 mb-8">
                <Palette className="text-primaryContainer" size={24} />
                <h2 className="font-serif text-2xl text-primary">Design & Inspiration</h2>
              </div>

              {request.images?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {request.images.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group relative"
                    >
                      <img
                        src={`${API_URL}${img}`}
                        alt={`Reference ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <FileText size={40} className="mb-4 opacity-20" />
                  <p className="text-sm">No visual references provided</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Requirement Details</h3>
                <p className="text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                  "{request.requirement || 'No additional instructions provided.'}"
                </p>
              </div>
            </motion.div>

            {/* Artisan Response / Admin Notes */}
            {request.adminNotes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-50/50 rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-amber-100/50"
              >
                <div className="flex items-center gap-3 mb-8 text-amber-800">
                  <MessageSquare size={24} />
                  <h2 className="font-serif text-2xl">Artisan Updates</h2>
                </div>
                <div className="bg-white/80 p-8 rounded-2xl border border-amber-200/20 shadow-sm">
                  <p className="text-secondary leading-relaxed whitespace-pre-wrap italic">
                    {request.adminNotes}
                  </p>
                </div>
                <p className="mt-6 text-[9px] uppercase font-bold text-amber-600/40 tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Last updated by design team
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-primary text-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-primary/20"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 opacity-60">Status Overview</h3>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-8 relative"
              >
                {['New', 'Accepted', 'Processing', 'Completed'].map((s, idx) => {
                  const isActive = request.status === s;
                  const isPast = ['New', 'Accepted', 'Processing', 'Completed'].indexOf(request.status) >= idx;

                  return (
                    <motion.div
                      key={s}
                      variants={fadeInUp}
                      className="flex items-start gap-4 relative z-10"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isPast ? 'bg-white border-white text-primary' : 'border-white/20'}`}>
                        {isPast ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                      </div>
                      <div className={isPast ? 'opacity-100' : 'opacity-40'}>
                        <p className="text-[11px] font-bold uppercase tracking-widest">{s}</p>
                        {isActive && <p className="text-[9px] mt-1 opacity-60">Current Stage</p>}
                      </div>
                    </motion.div>
                  );
                })}
                {/* Progress Line */}
                <div className="absolute left-3 top-3 bottom-3 w-px bg-white/20 -z-0" />
              </motion.div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-[9px] leading-relaxed opacity-60">
                  Your project is currently in the <span className="text-white font-bold">{request.status}</span> phase. Our master tailors are reviewing your requirements.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400">Name</p>
                    <p className="text-sm font-medium">{request.firstName} {request.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400">Email</p>
                    <p className="text-sm font-medium">{request.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400">Phone</p>
                    <p className="text-sm font-medium">{request.phone}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BespokeDetails;
