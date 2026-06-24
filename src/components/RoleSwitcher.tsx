import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Store, 
  Truck, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  Wallet, 
  Star, 
  Heart, 
  Layers, 
  ChevronRight,
  PlusCircle,
  Package,
  Coins,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [hasSellerAccount, setHasSellerAccount] = useState(() => {
    try {
      return !!localStorage.getItem('emakethe_active_seller_id');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isOpen) {
      try {
        setHasSellerAccount(!!localStorage.getItem('emakethe_active_seller_id'));
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('emakethe_open_portal_switcher', handleOpen);
    return () => window.removeEventListener('emakethe_open_portal_switcher', handleOpen);
  }, []);

  // Detect current active persona
  const getActivePersonaName = () => {
    if (currentPath === '/admin') return 'Administrator';
    if (currentPath === '/driver') return 'Delivery Partner';
    if (currentPath === '/dashboard' || currentPath === '/register-seller') return 'Trader / Seller';
    return 'Buyer';
  };

  const getActivePersonaColor = () => {
    const persona = getActivePersonaName();
    if (persona === 'Administrator') return 'bg-slate-800 text-white';
    if (persona === 'Delivery Partner') return 'bg-orange-500 text-white';
    if (persona === 'Trader / Seller') return 'bg-green-700 text-white';
    return 'bg-green-600 text-white';
  };

  const personaLabel = getActivePersonaName();

  const handleRoleJump = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Pill Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 left-4 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-full shadow-lg border border-white/25 font-black text-[10px] uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 md:bottom-6 md:left-6 ${getActivePersonaColor()}`}
      >
        <Layers size={14} />
        <span>Portal: {personaLabel}</span>
      </button>

      {/* Full screen overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[36px] shadow-2xl flex flex-col max-h-[82vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-450 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400">Account Portal Control</span>
                </div>
                <h3 className="text-base font-black tracking-tight mt-0.5 font-display">Switch Active Profile Portal</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full transition-colors"
                id="close-role-switcher"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive Roles Container */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <p className="text-[10px] text-gray-500 font-medium px-1 leading-normal">
                eMakethe supports multiple business portals on a single unified account. Switch your active portal to browse goods, manage vendor stalls, coordinate deliveries, or administer platform rules:
              </p>

              {/* 1. BUYER */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Buyer' ? 'border-green-500 bg-green-50/20' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛒</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">1. Buyer</h4>
                      <p className="text-[9px] text-gray-400">Customers looking for goods & services</p>
                    </div>
                  </div>
                  {personaLabel === 'Buyer' ? (
                     <span className="bg-green-600 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active Portal</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump('/')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       Switch Portal <ArrowRight size={11} />
                     </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-gray-100/80 text-[9px] text-gray-600">
                  <span className="flex items-center gap-1">✅ Browse Feed</span>
                  <span className="flex items-center gap-1">✅ Precise Search</span>
                  <span className="flex items-center gap-1">✅ Contact Seller</span>
                  <span className="flex items-center gap-1">✅ Escrow Pay</span>
                  <span className="flex items-center gap-1">✅ Track Orders</span>
                  <span className="flex items-center gap-1">✅ Save Favorites</span>
                </div>
              </div>

              {/* 2. TRADER/SELLER */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Trader / Seller' ? 'border-green-700 bg-green-50/20' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥬</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">2. Trader / Seller</h4>
                      <p className="text-[9px] text-gray-400">Informal vendors & backyard farmers</p>
                    </div>
                  </div>
                  {personaLabel === 'Trader / Seller' ? (
                     <span className="bg-green-700 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active Portal</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump(hasSellerAccount ? '/dashboard' : '/register-seller')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       {hasSellerAccount ? 'Trader Dashboard' : 'Register Stall'} <ArrowRight size={11} />
                     </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-gray-100/80 text-[9px] text-gray-600">
                  <span className="flex items-center gap-1">✅ 2-Min Shop Setup</span>
                  <span className="flex items-center gap-1">✅ Free Product Upload</span>
                  <span className="flex items-center gap-1">✅ Cash Flow Wallet</span>
                  <span className="flex items-center gap-1">✅ Auto Courier Match</span>
                  <span className="flex items-center gap-1">✅ WhatsApp Responder</span>
                  <span className="flex items-center gap-1">✅ Sales Invoices</span>
                </div>
              </div>

              {/* 3. DELIVERY PARTNER */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Delivery Partner' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏍️</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">3. Delivery Partner</h4>
                      <p className="text-[9px] text-gray-400">Local independent driver couriers</p>
                    </div>
                  </div>
                  {personaLabel === 'Delivery Partner' ? (
                     <span className="bg-orange-500 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active Portal</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump('/driver')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       Driver Portal <ArrowRight size={11} />
                     </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-gray-100/80 text-[9px] text-gray-600">
                  <span className="flex items-center gap-1">✅ Live Job Match</span>
                  <span className="flex items-center gap-1">✅ Landmark Pickups</span>
                  <span className="flex items-center gap-1">✅ One-Tap GPS Nav</span>
                  <span className="flex items-center gap-1">✅ Instant Pay Transfer</span>
                </div>
              </div>

              {/* 4. ADMINISTRATOR */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Administrator' ? 'border-slate-800 bg-slate-100' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">4. Administrator</h4>
                      <p className="text-[9px] text-gray-400">Platform operations & dispute managers</p>
                    </div>
                  </div>
                  {personaLabel === 'Administrator' ? (
                     <span className="bg-slate-800 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active Portal</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump('/admin')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       Admin Center <ArrowRight size={11} />
                     </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-gray-100/80 text-[9px] text-gray-600">
                  <span className="flex items-center gap-1">✅ Revenue Tuner</span>
                  <span className="flex items-center gap-1">✅ Health Analytics</span>
                  <span className="flex items-center gap-1">✅ Badging Verification</span>
                  <span className="flex items-center gap-1">✅ Dispute Resolution</span>
                </div>
              </div>
            </div>

            {/* Bottom Info Banner */}
            <div className="bg-slate-50 p-4 border-t border-gray-100 text-[10px] text-slate-500 font-medium text-center shrink-0">
               Seamlessly switch business roles with automatic secure MTN MoMo wallet syncing.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
