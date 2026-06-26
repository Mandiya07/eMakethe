import { Outlet, Link, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import GlobalAiAssistant from './GlobalAiAssistant';
import AccessibilityMenu from './AccessibilityMenu';
import RoleSwitcher from './RoleSwitcher';
import { useState, useEffect } from 'react';
import { WifiOff, Home, Compass, MessageCircle, Wallet, Menu } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lowDataMode, setLowDataMode] = useState(() => {
    try {
      return localStorage.getItem('emakethe_low_data') === 'true';
    } catch { return false; }
  });

  const handleToggleLowData = (val: boolean) => {
    setLowDataMode(val);
    try {
      localStorage.setItem('emakethe_low_data', String(val));
      window.dispatchEvent(new Event('emakethe_low_data_changed'));
    } catch (e) {
      console.error(e);
    }
  };

  const [walletBalance, setWalletBalance] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('emakethe_wallet_balance');
      return stored ? parseFloat(stored).toFixed(2) : '0.00';
    } catch {
      return '0.00';
    }
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkState = () => {
      try {
        const current = localStorage.getItem('emakethe_low_data') === 'true';
        if (current !== lowDataMode) {
          setLowDataMode(current);
        }
      } catch {}
    };
    window.addEventListener('emakethe_low_data_changed', checkState);

    const updateBalance = () => {
      try {
        const stored = localStorage.getItem('emakethe_wallet_balance');
        setWalletBalance(stored ? parseFloat(stored).toFixed(2) : '0.00');
      } catch {}
    };
    window.addEventListener('storage', updateBalance);
    window.addEventListener('emakethe_wallet_balance_changed', updateBalance);

    updateBalance();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('emakethe_low_data_changed', checkState);
      window.removeEventListener('storage', updateBalance);
      window.removeEventListener('emakethe_wallet_balance_changed', updateBalance);
    };
  }, [lowDataMode, location.pathname]);

  return (
    <div className={`min-h-screen bg-gray-100 flex justify-center items-start ${lowDataMode ? 'low-data-mode' : ''} md:py-6 md:px-4`}>
      {/* Complete Responsive Flex Container */}
      <div className="w-full max-w-md md:max-w-7xl mx-auto flex flex-col md:flex-row md:gap-6 justify-center items-stretch relative min-h-screen md:min-h-0">
        
        {/* DESKTOP SIDEBAR (Visible on md+ viewports) */}
        <aside className="hidden md:flex flex-col w-64 bg-white rounded-[2rem] border border-gray-200/80 p-6 shadow-sm sticky top-6 h-[calc(100vh-3rem)] justify-between shrink-0">
          <div className="flex flex-col gap-6">
            {/* Header branding with African Kente motif */}
            <div>
              <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#F59E0B,#F59E0B_8px,#10B981_8px,#10B981_16px,#EF4444_16px,#EF4444_24px)] rounded-t-full"></div>
              <div className="pt-4">
                <span className="text-[10px] tracking-widest font-black uppercase text-amber-500">Swaziland Express</span>
                <h1 className="text-2xl font-black text-gray-900 leading-none mt-1">eMakethe</h1>
                <p className="text-xs text-gray-400 mt-1.5">Universal commerce portal</p>
              </div>
            </div>

            {/* Main Navigation Links */}
            <nav className="flex flex-col gap-1.5 mt-2" id="desktop-nav-menu">
              <DesktopNavItem to="/" label="Home Feed" icon={<Home size={20} />} isActive={location.pathname === '/'} />
              <DesktopNavItem to="/feed" label="Interactive Feed" icon={<Compass size={20} />} isActive={location.pathname === '/feed'} />
              <DesktopNavItem to="/messages" label="Trader Chats" icon={<MessageCircle size={20} />} isActive={location.pathname === '/messages'} />
              <DesktopNavItem to="/wallet" label="My e-Wallet" icon={<Wallet size={20} />} isActive={location.pathname === '/wallet'} />
              <DesktopNavItem to="/dashboard" label="Seller Center" icon={<Menu size={20} />} isActive={location.pathname === '/dashboard'} />
            </nav>
          </div>

          {/* Core Balance Simulation & App State */}
          <div className="border-t border-gray-100 pt-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 border border-slate-100">
              <div className="flex justify-between text-[10px] font-black text-gray-400 tracking-wider">
                <span>WALLET BAL</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SECURE
                </span>
              </div>
              <div className="text-lg font-black text-slate-800">E {walletBalance}</div>
              <div className="text-[9px] text-gray-400 font-medium">Synced with MTN MoMo & SwaziPay</div>
            </div>
            
            <div className="text-[10px] text-gray-400 text-center mt-4 font-medium">
              eMakethe v3.2 Desktop Portal
            </div>
          </div>
        </aside>

        {/* MAIN USER INTERFACE CONTAINER (Fits both perfectly) */}
        <main className="flex-1 w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-white md:rounded-[2rem] md:border md:border-gray-200/80 md:shadow-md min-h-screen md:min-h-[calc(100vh-3rem)] relative flex flex-col overflow-hidden">
          {isOffline && (
            <div className="bg-orange-500 text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-2">
              <WifiOff size={14} /> You are currently offline. Working from local cache.
            </div>
          )}
          <div className="flex-1 overflow-y-auto pb-20 md:pb-6 no-scrollbar relative w-full h-full">
            <Outlet />
          </div>
          
          <GlobalAiAssistant />
          <AccessibilityMenu lowDataMode={lowDataMode} setLowDataMode={handleToggleLowData} />
          <RoleSwitcher />
          
          {/* Mobile Bottom navigation (Hidden on desktop) */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </main>

        {/* RIGHT DESKTOP COMPANION BAR (Visible on lg+ viewports) */}
        <aside className="hidden lg:flex flex-col w-72 bg-white rounded-[2rem] border border-gray-200/80 p-6 shadow-sm sticky top-6 h-[calc(100vh-3rem)] justify-between shrink-0 overflow-y-auto no-scrollbar gap-5">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="text-amber-500">⚡</span> Swaziland Market Peg
              </h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Real-time pegged rates</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-emerald-800">E1 Lilangeni</span>
                  <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Pegged currency unit</p>
                </div>
                <span className="text-sm font-black text-emerald-700">1.00 ZAR</span>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-amber-800">Instant MoMo Cash-In</span>
                  <p className="text-[9px] text-amber-600 font-bold mt-0.5">MTN / Eswatini Mobile</p>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-md">FREE</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-black text-gray-800">Interactive Traders Dashboard</h3>
              
              <div className="flex flex-col gap-2 mt-3">
                <Link to="/map" className="bg-gray-50 border border-gray-150 p-3 rounded-2xl flex items-center justify-between text-xs text-gray-700 font-bold hover:bg-gray-100 hover:border-emerald-200 transition-all">
                  <span className="flex items-center gap-2">📍 GPS Live Map</span>
                  <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-lg">View</span>
                </Link>
                
                <Link to="/wallet" className="bg-gray-50 border border-gray-150 p-3 rounded-2xl flex items-center justify-between text-xs text-gray-700 font-bold hover:bg-gray-100 hover:border-emerald-200 transition-all">
                  <span className="flex items-center gap-2">💸 Cash Out (MoMo)</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg">MoMo</span>
                </Link>

                <Link to="/register-seller" className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs font-black shadow-sm transition-all mt-1">
                  <span>🚀 Open Swazi Stall</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md text-emerald-50">Free</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Featured Swazi Trader</span>
            <div className="bg-emerald-50/30 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">SZ</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-xs text-slate-800 truncate">Mbabane Fresh Market</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">Stall 4A • Fresh Greens</p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// Reusable Desktop nav item component
function DesktopNavItem({ to, label, icon, isActive }: { to: string, label: string, icon: any, isActive: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
      }`}
    >
      <div className={`transition-transform duration-250 ${isActive ? 'scale-105' : ''}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}

