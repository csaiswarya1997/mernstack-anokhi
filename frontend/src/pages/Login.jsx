import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, login } = useAuth();

  const redirect = location.state?.from?.pathname || '/zaloura-profile';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-white">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="max-w-md w-full space-y-10"
      >
        <div className="text-center space-y-4">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase font-bold text-gray-400 block"
          >
            The Maison Zaloura Member Experience
          </motion.span>
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-serif text-primary tracking-tighter italic leading-tight">Bienvenue</motion.h1>
          <motion.p variants={fadeInUp} className="text-secondary/60 font-serif italic text-lg leading-relaxed">Sign in to your account</motion.p>
        </div>

        <motion.div
          variants={fadeInUp}
          className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden"
        >
          {/* Highlighted Top Access Link */}
          <div className="mb-10 pb-8 border-b border-gray-100 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">Don't have an account?</p>
            <Link
              to="/zaloura-register"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all text-sm font-sans font-bold uppercase tracking-wider w-full justify-center"
            >
              Register
            </Link>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-wider"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={submitHandler} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  placeholder="name@maison.com"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-sans text-sm font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-sans text-sm font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </motion.button>
          </form>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
