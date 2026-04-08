import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3, 
  LogOut, 
  Store
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Sales Reports', path: '/admin', icon: BarChart3, exact: true },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden print:bg-white bg-[#121212] text-white">
      {/* Fixed Top Header (Hide on Print) */}
      <header className="bg-[#282828]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 shadow-xl print:hidden transition-all duration-300">
        <div className="h-20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-12">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden transition-transform hover:scale-110 shrink-0">
                <Logo size={40} />
              </div>
              <div>
                <h2 className="font-bold text-white leading-tight whitespace-nowrap">Admin Portal</h2>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold whitespace-nowrap hidden sm:block">Juice Bar POS</p>
              </div>
            </div>

            {/* Navigation Items (Desktop) */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/10 text-white border border-white/10' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User Profile & Logout (Combined) */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:pr-4 rounded-full border border-white/10 bg-[#202020] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-300 group shadow-sm active:scale-95 shrink-0"
            title="Logout"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 font-bold uppercase group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
              {user?.username?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-white leading-none group-hover:text-red-400">{user?.username || 'Admin'}</p>
              <p className="text-[9px] text-slate-500 uppercase font-black mt-1 tracking-widest flex items-center gap-1 group-hover:text-red-500">
                Logout <LogOut size={10} />
              </p>
            </div>
            <LogOut size={18} className="sm:hidden text-slate-400 group-hover:text-red-400 mr-2" />
          </button>
        </div>

        {/* Navigation Items (Mobile/Tablet) */}
        <div className="lg:hidden px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </header>


      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-8 px-0 w-full print:p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
