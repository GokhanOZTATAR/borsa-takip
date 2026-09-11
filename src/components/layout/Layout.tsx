import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../../context';
import { 
  LayoutDashboard, 
  Activity, 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  Banknote, 
  PieChart, 
  Settings,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/live', icon: <Activity size={20} />, label: 'Anlık K/Z' },
    { to: '/accounts', icon: <Wallet size={20} />, label: 'Hesaplar' },
    { to: '/transactions', icon: <ArrowRightLeft size={20} />, label: 'İşlemler' },
    { to: '/stocks', icon: <TrendingUp size={20} />, label: 'Hisse Analizi' },
    { to: '/movements', icon: <Banknote size={20} />, label: 'Para Hareketleri' },
    { to: '/reports', icon: <PieChart size={20} />, label: 'Raporlar' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Ayarlar' },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Portföy Takip</h1>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="md:hidden">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Portföy Takip</h1>
      </div>
      <div className="flex-1"></div>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
};

const MobileNav = () => {
  // Mobile bottom tab bar logic will go here
  return null; 
};

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
