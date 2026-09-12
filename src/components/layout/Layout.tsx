import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, useTheme } from '../../context';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Activity, 
  PieChart, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  CreditCard,
  FileText
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/live', icon: Activity, label: 'Anlık Kar/Zarar' },
  { path: '/accounts', icon: Wallet, label: 'Hesaplarım' },
  { path: '/transactions', icon: ArrowRightLeft, label: 'İşlemler' },
  { path: '/stocks', icon: PieChart, label: 'Hisse Analizi' },
  { path: '/movements', icon: CreditCard, label: 'Para Hareketleri' },
  { path: '/reports', icon: FileText, label: 'Raporlar' },
  { path: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function Layout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Mobile Header & Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-blue-600 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2 text-white">
          <Wallet className="h-6 w-6" />
          <span className="text-lg font-bold">Borsa Takip</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white hover:bg-blue-700 dark:hover:bg-slate-800 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-slate-900 z-40 overflow-y-auto pb-20 shadow-xl border-t-4 border-blue-500">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={20} />
              Çıkış Yap
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-sm z-20">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-100 dark:border-slate-800">
          <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">Borsa Takip</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full mt-1 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Desktop Blue Header Stripe */}
        <header className="hidden md:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-8 shadow-sm border-t-4 border-t-blue-600 dark:border-t-blue-500 z-10 shrink-0">
           <div className="flex-1"></div>
           <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
             Kişisel Portföy Yönetimi
           </div>
        </header>

        {/* Thick Blue Stripe for Mobile (if they meant mobile) - already handled by bg-blue-600 header */}
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 md:pt-6 p-4 md:p-8">
          <div className="max-w-5xl mx-auto pb-20 md:pb-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
