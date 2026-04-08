import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  User as UserIcon, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Logo from '../components/Logo';

import { API_URL } from '../store/useAuthStore';


const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'cashier',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Call registration API
      await axios.post(`${API_URL}/auth/register`, {
        username: formData.username,
        password: formData.password,
        role: formData.role
      });
      
      setSuccess(true);
      
      // 2. Short delay for visual feedback, then auto-login
      setTimeout(async () => {
        const loginSuccess = await login(formData.username, formData.password);
        if (loginSuccess) {
          const userRole = useAuthStore.getState().role;
          navigate(userRole === 'admin' ? '/admin' : '/pos');
        }
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username might be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-purple-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400 blur-[120px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[480px] z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden">
          
          <div className="p-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl shadow-slate-200 mb-6 rotate-3 transform transition-transform hover:rotate-0 hover:scale-110 cursor-pointer duration-500 overflow-hidden">
              <Logo size={80} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">Join Juice Bar</h1>
            <p className="text-slate-500 font-medium">Create your credentials to access the POS terminal</p>
          </div>

          <div className="px-10 pb-10">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Success!</h3>
                <p className="text-slate-500 text-center font-medium">Your account is ready. Redirecting you to your workspace...</p>
                <Loader2 size={32} className="text-indigo-500 animate-spin mt-4" />
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Username</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <UserIcon size={18} />
                    </span>
                    <input
                      required
                      className="w-full h-14 pl-12 pr-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-2 border-slate-100/50 focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                      placeholder="e.g. janesmith01"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security Key</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                        <Lock size={18} />
                      </span>
                      <input
                        required
                        type="password"
                        className="w-full h-14 pl-12 pr-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-2 border-slate-100/50 focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Confirm Key</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                        <Shield size={18} />
                      </span>

                      <input
                        required
                        type="password"
                        className="w-full h-14 pl-12 pr-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-2 border-slate-100/50 focus:border-indigo-500/20 rounded-2xl outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Authorization Role</label>
                  <div className="flex gap-4 p-1 bg-slate-100 rounded-[1.25rem]">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, role: 'cashier'})}
                      className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.role === 'cashier' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Cashier
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, role: 'admin'})}
                      className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.role === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 overflow-hidden"
                >
                   {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                   ) : (
                    <>
                      Complete Access Registration
                      <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </>
                   )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-3">
            Already have professional access? 
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4">
              Log in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
