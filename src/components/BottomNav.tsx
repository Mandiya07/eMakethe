import { ReactNode } from 'react';
import { Home, MessageCircle, Wallet, Compass, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-between items-center px-6 py-3 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <NavItem to="/" icon={<Home size={24} />} label="Home" isActive={path === '/'} />
      <NavItem to="/feed" icon={<Compass size={24} />} label="Feed" isActive={path === '/feed'} />
      <NavItem to="/messages" icon={<MessageCircle size={24} />} label="Chat" isActive={path === '/messages'} />
      <NavItem to="/wallet" icon={<Wallet size={24} />} label="Wallet" isActive={path === '/wallet'} />
      <NavItem to="/dashboard" icon={<Menu size={24} />} label="My Shop" isActive={path === '/dashboard'} />
    </div>
  );
}

function NavItem({ to, icon, label, isActive }: { to: string; icon: ReactNode; label: string; isActive: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] gap-1 ${isActive ? 'text-green-600' : 'text-gray-500'} active:bg-gray-50 rounded-xl transition-colors`}>
      <div className={`${isActive ? 'scale-110 transition-transform' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

