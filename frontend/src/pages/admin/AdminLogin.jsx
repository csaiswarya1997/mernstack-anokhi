import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API_URL from '../../config';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isAdmin) {
          localStorage.setItem('anokhi_admin_auth', 'true');
          // We also need to store the user info so other components can access the token
          localStorage.setItem('userInfo', JSON.stringify(data));
          onLogin();
          navigate('/admin/products');
          // Reload to ensure all contexts are updated
          window.location.reload();
        } else {
          setError('Access Denied: You do not have administrative privileges.');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface border border-champagne/50 p-8 rounded-lg shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-primary mb-2">Admin Portal</h1>
          <p className="text-secondary font-sans text-sm">Please sign in to access the dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 font-sans text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Email Address</label>
            <input 
              required 
              type="email" 
              value={credentials.email}
              onChange={e => setCredentials({...credentials, email: e.target.value})}
              className="w-full border-b border-champagne bg-transparent py-2 outline-none focus:border-primary transition-colors font-sans text-primary" 
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Password</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={credentials.password}
                onChange={e => setCredentials({...credentials, password: e.target.value})}
                className="w-full border-b border-champagne bg-transparent py-2 pr-10 outline-none focus:border-primary transition-colors font-sans text-primary" 
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primaryContainer text-white py-4 rounded-md font-sans uppercase tracking-widest text-sm font-semibold hover:bg-primary transition-colors mt-8"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-xs font-sans text-secondary hover:text-primary transition-colors">
            &larr; Return to Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
