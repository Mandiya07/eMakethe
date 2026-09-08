import { ReactNode } from 'react';
import { Home, Package, MessageCircle, Compass, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-between items-center px-4 py-2.5 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
      <NavItem to="/" icon={<Home size={22} />} label="Home" isActive={path === '/'} />
      <NavItem to="/orders" icon={<Package size={22} />} label="Orders" isActive={path === '/orders' || path === '/buyer-dashboard'} />
      <NavItem to="/feed" icon={<Compass size={22} />} label="Feed" isActive={path === '/feed'} />
      <NavItem to="/messages" icon={<MessageCircle size={22} />} label="Chat" isActive={path === '/messages'} />
      <NavItem to="/dashboard" icon={<Menu size={22} />} label="My Stall" isActive={path === '/dashboard'} />
    </div>
  );
}

function NavItem({ to, icon, label, isActive }: { to: string; icon: ReactNode; label: string; isActive: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-500'} active:bg-gray-50 rounded-xl transition-colors`}>
      <div className={`${isActive ? 'scale-110 transition-transform font-bold' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </Link>
  );
}
