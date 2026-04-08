import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Logo from '../components/Logo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    
    if (success) {
      const userRole = useAuthStore.getState().role;
      navigate(userRole === 'admin' ? '/admin' : '/pos');
    } else {
      setError('Invalid credentials. Check your username and key.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-100 via-white to-indigo-50 auth-page-root">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
         <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-200 blur-[100px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-100 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden">
          
          {/* Header */}
          <div className="p-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] shadow-2xl mb-6 transform -rotate-3 transition-transform hover:rotate-0 duration-500 overflow-hidden">
              <Logo size={80} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">Juice Bar POS</h1>
            <p className="text-slate-500 font-medium">Welcome back! Please login to your terminal.</p>
          </div>

          <div className="px-10 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-shake">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Username</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-slate-900 transition-colors">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-2 border-slate-100/50 focus:border-slate-900/10 rounded-2xl outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                    placeholder="Enter your system ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Access Key</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-slate-900 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-2 border-slate-100/50 focus:border-slate-900/10 rounded-2xl outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Authorize Access
                    <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-center hover:bg-slate-100 transition-colors cursor-default group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Admin</p>
                  <p className="text-xs font-bold text-slate-600">admin / admin123</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-center hover:bg-slate-100 transition-colors cursor-default group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Cashier</p>
                  <p className="text-xs font-bold text-slate-600">cashier / cashier123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            New team member? 
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4">
              Register local account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
