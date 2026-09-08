import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Store, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Shield,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { UserRole } from '../types';

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { userProfile, user } = useFirebase();

  const getActivePersonaName = () => {
    if (currentPath === '/admin') return 'Administrator';
    if (currentPath === '/dashboard' || currentPath === '/register-seller') return 'Trader / Seller';
    if (currentPath === '/driver') return 'Delivery Partner';
    return 'Buyer';
  };

  const personaLabel = getActivePersonaName();

  const getActivePersonaColor = () => {
    if (personaLabel === 'Administrator') return 'bg-slate-900 text-white border-slate-700';
    if (personaLabel === 'Trader / Seller') return 'bg-emerald-700 text-white border-emerald-600';
    if (personaLabel === 'Delivery Partner') return 'bg-orange-600 text-white border-orange-500';
    return 'bg-emerald-600 text-white border-emerald-500';
  };

  const handleRoleJump = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Pill Trigger */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg border font-black text-[10px] uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 md:bottom-6 md:left-6 ${getActivePersonaColor()}`}
      >
        <Layers size={14} />
        <span>Portal: {personaLabel}</span>
      </button>

      {/* Full screen overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[36px] shadow-2xl flex flex-col max-h-[82vh] overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400">Account Portal Control</span>
                </div>
                <h3 className="text-base font-black tracking-tight mt-0.5 font-display">Switch Active Role Portal</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive Roles Container */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <p className="text-[10px] text-gray-500 font-medium leading-normal">
                eMakethe supports role-based workflows on a single unified marketplace account. Switch between customer discovery, merchant management, or administration:
              </p>

              {/* 1. BUYER */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Buyer' ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛒</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">1. Buyer Portal</h4>
                      <p className="text-[9px] text-gray-400">Browse goods, WhatsApp sellers & order</p>
                    </div>
                  </div>
                  {personaLabel === 'Buyer' ? (
                     <span className="bg-emerald-600 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump('/')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       Shop <ArrowRight size={11} />
                     </button>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleRoleJump('/orders')}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold py-1.5 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 border border-emerald-200/50"
                  >
                    <ShoppingBag size={12} />
                    <span>Track Live Orders</span>
                  </button>
                </div>
              </div>

              {/* 2. TRADER/SELLER */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Trader / Seller' ? 'border-emerald-700 bg-emerald-50/20' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥬</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">2. Trader / Seller</h4>
                      <p className="text-[9px] text-gray-400">Informal stall owners & backyard farmers</p>
                    </div>
                  </div>
                  {personaLabel === 'Trader / Seller' ? (
                     <span className="bg-emerald-700 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump('/dashboard')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       Dashboard <ArrowRight size={11} />
                     </button>
                  )}
                </div>
              </div>

              {/* 3. ADMINISTRATOR */}
              <div className={`p-4 rounded-3xl border transition-all ${personaLabel === 'Administrator' ? 'border-slate-800 bg-slate-100' : 'border-gray-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">3. Administrator</h4>
                      <p className="text-[9px] text-gray-400">Platform governance & operations</p>
                    </div>
                  </div>
                  {personaLabel === 'Administrator' ? (
                     <span className="bg-slate-800 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                  ) : (
                     <button 
                       onClick={() => handleRoleJump('/admin')}
                       className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                     >
                       Admin Center <ArrowRight size={11} />
                     </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Info Banner */}
            <div className="bg-slate-50 p-3.5 border-t border-gray-100 text-[10px] text-slate-500 font-medium text-center shrink-0">
               Empowering local informal commerce across Eswatini & Africa.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
