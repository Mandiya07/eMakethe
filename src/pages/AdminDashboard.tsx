import { Users, Store, ShieldAlert, BarChart3, Tag, DollarSign, Search, CheckCircle2, XCircle, Coins, Megaphone, Truck, Sparkles, Award, Lock, Eye, EyeOff, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { NotificationsPopover, NotificationItem } from '../components/NotificationsPopover';

export default function AdminDashboard() {
  // Onboarding & Admin Gate States
  const [adminId, setAdminId] = useState<string | null>(() => {
    return localStorage.getItem('emakethe_authenticated_admin_id');
  });

  const [adminName, setAdminName] = useState('');
  const [adminEmpId, setAdminEmpId] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  const handleApplyAdminPreset = (name: string, empId: string, passcode: string) => {
    setAdminName(name);
    setAdminEmpId(empId);
    setAdminPasscode(passcode);
    setAdminError(null);
  };

  const handleAdminRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmpId || !adminPasscode) {
      setAdminError('Please fill in all Administrator registration details.');
      return;
    }

    // Require specific structural passcode to complete system enrollment
    if (adminPasscode !== 'EMAKETHE_SVD_2026') {
      setAdminError('Invalid secure platform authorization passcode. Please contact lead architect.');
      return;
    }

    setIsSubmittingAdmin(true);
    setAdminError(null);
    const newAdminId = `adm-${Math.random().toString(36).substr(2, 9)}`;
    const adminProfile = {
      id: newAdminId,
      name: adminName,
      employeeId: adminEmpId,
      passcode: adminPasscode,
      registeredAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'admins', newAdminId), adminProfile);
      localStorage.setItem('emakethe_authenticated_admin_id', newAdminId);
      localStorage.setItem('emakethe_admin_profile', JSON.stringify(adminProfile));
      setAdminId(newAdminId);
    } catch (err) {
      setAdminError('Failed to register Admin session. Please check Firestore permissions.');
      try {
        handleFirestoreError(err, OperationType.CREATE, `admins/${newAdminId}`);
      } catch (f) {
        console.error(f);
      }
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'disputes' | 'revenue'>('overview');

  // Revenue settings representing the Platform's core Revenue Model
  const [commissionRate, setCommissionRate] = useState(5.0); // 1. Commission Model: Percentage per transaction
  const [simAverageTx, setSimAverageTx] = useState(150); // Growth Simulator: Average Transaction Amount (E)
  const [simMonthlyVolume, setSimMonthlyVolume] = useState(50000); // Growth Simulator: Monthly Volume
  const [premiumMonthlyFee, setPremiumMonthlyFee] = useState(149); // 2. Premium Shops: Monthly subscription
  const [featuredListingFee, setFeaturedListingFee] = useState(20); // 3. Featured Listings: Paid promotion
  const [adBannerFee, setAdBannerFee] = useState(100); // 4. Advertisements: Local business ads
  const [deliveryCommRate, setDeliveryCommRate] = useState(20.0); // 5. Delivery Fees: Commission from logistics
  const [digitalToolsFee, setDigitalToolsFee] = useState(49); // 6. Digital Services: Business tools for traders
  const [momoPlatformFeeRate, setMomoPlatformFeeRate] = useState(1.0); // 7. Mobile Money Platform Fee
  const [verificationFee, setVerificationFee] = useState(100); // 8. Business Verification Fee
  const [serviceProviderFee, setServiceProviderFee] = useState(149); // 9. Service Provider Subscription

  // Estimated stats calculated based on current rates
  const totalSalesVolume = 124020; // E 124,020 in marketplace sales
  const premiumTradersCount = 128;
  const activePromoDailyCount = 54;
  const activeAdBannersCount = 8;
  const totalCompletedDeliveries = 8912;
  const averageDeliveryFee = 50; // E 50 per delivery
  const digitalToolsSubscribers = 42;
  const totalMobileMoneyVolume = 95000;
  const verifiedSellersCount = 120;
  const serviceProvidersCount = 85;

  // Real-time calculations of revenue streams based on dynamic inputs
  const estimatedCommissionRev = (totalSalesVolume * (commissionRate / 100));
  const estimatedPremiumRev = premiumTradersCount * premiumMonthlyFee;
  const estimatedPromoRev = activePromoDailyCount * featuredListingFee * 30; // 30-day projection
  const estimatedAdRev = activeAdBannersCount * adBannerFee * 4; // 4-week projection
  const estimatedDeliveryRev = totalCompletedDeliveries * averageDeliveryFee * (deliveryCommRate / 100);
  const estimatedDigitalRev = digitalToolsSubscribers * digitalToolsFee;
  const estimatedMomoFeeRev = totalMobileMoneyVolume * (momoPlatformFeeRate / 100);
  const estimatedVerificationRev = verifiedSellersCount * verificationFee;
  const estimatedServiceProviderRev = serviceProvidersCount * serviceProviderFee;

  const totalCalculatedProjectedMonthly = estimatedPremiumRev + (estimatedPromoRev / 12) + (estimatedAdRev / 12) + (estimatedDigitalRev) + (estimatedCommissionRev / 12) + (estimatedDeliveryRev / 12) + (estimatedMomoFeeRev / 12) + (estimatedVerificationRev / 12) + estimatedServiceProviderRev;

  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([
    { id: '1', type: 'error', title: 'Failed Payment Alert', message: 'System detected multiple failed MoMo attempts from User ID: U8912.', time: '12m ago', read: false },
    { id: '2', type: 'warning', title: 'Suspicious Transaction', message: 'Unusually large order of E 12,000 flagged for review (Seller ID: S400).', time: '1h ago', read: false },
    { id: '3', type: 'error', title: 'System Payment Error', message: 'Gateway timeout reported by Mobile Money API at 14:02 UTC.', time: '2h ago', read: true },
  ]);

  const markAdminNotificationsRead = () => {
    setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!adminId) {
    return (
      <div className="bg-slate-900 min-h-screen text-white flex flex-col justify-center items-center p-4 font-sans">
        <div className="max-w-md w-full">
          {/* Logo / Badge */}
          <div className="flex flex-col items-center mb-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-slate-800 border border-slate-700 text-yellow-400 rounded-3xl flex items-center justify-center shadow-lg mb-3">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-xl font-black font-display tracking-tight text-white uppercase">MaketiConnect Admin Hub</h1>
            <p className="text-slate-400 text-xs mt-1">Authorized Eswatini Platform Operations & Dispute Desk</p>
          </div>

          {/* Preset Helper */}
          <div className="bg-slate-800/80 border border-slate-700/65 rounded-3xl p-4 mb-5 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-1.5 mb-2 text-yellow-400">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono">System Testing Auth Preset</span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-normal mb-3 font-sans">
              To expedite portal evaluation, load the authorized personnel preset, or register with your staff credentials.
            </p>
            <button
              type="button"
              onClick={() => handleApplyAdminPreset('Sipho M. Yati', 'EMP-2026-X8', 'EMAKETHE_SVD_2026')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-2.5 text-xs font-bold text-left flex justify-between items-center transition-all cursor-pointer"
            >
              <div>
                <p className="text-slate-200 font-extrabold">Sipho M. Yati (System Supervisor)</p>
                <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Emp ID: EMP-2026-X8 • Key: EMAKETHE_SVD_2026</p>
              </div>
              <UserCheck size={14} className="text-emerald-400" />
            </button>
          </div>

          {/* Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-650/15 border-l border-b border-red-500/25 px-3 py-1 rounded-bl-2xl text-[9px] font-black text-red-405 tracking-wider font-mono">
              SECURE SESSION
            </div>

            <div className="flex items-center gap-1.5 mb-4">
              <Lock className="text-red-500" size={16} />
              <h2 className="font-extrabold text-xs uppercase tracking-widest text-slate-300 font-mono">Staff Gate & Credentials</h2>
            </div>

            {adminError && (
              <div className="bg-red-950/45 border border-red-900/50 text-red-200 rounded-xl p-3 text-xs mb-4 text-left leading-normal font-sans">
                ⚠️ {adminError}
              </div>
            )}

            <form onSubmit={handleAdminRegisterSubmit} className="flex flex-col gap-4 font-sans">
              <div>
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">Admin Officer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your legal full name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">Designated Employee ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-2026-01"
                  value={adminEmpId}
                  onChange={(e) => setAdminEmpId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">System Secure Passcode *</label>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    placeholder="Enter 16-character authorization key"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-300 cursor-pointer"
                  >
                    {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAdmin}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-xs uppercase tracking-widest transition-all mt-2 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmittingAdmin ? 'Validating Secure Session...' : 'Authorize Admin Operations'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 w-full">
      <div className="bg-slate-800 text-white px-4 py-4 shadow-sm sticky top-0 z-10 w-full flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold font-display">Admin Portal</h1>
          <p className="text-[10px] text-slate-300">MaketiConnect System</p>
        </div>
        <div className="bg-slate-700 p-1 rounded-full">
          <NotificationsPopover 
            notifications={adminNotifications} 
            onMarkAllAsRead={markAdminNotificationsRead} 
            triggerColor="text-white"
            dotColor="bg-red-500"
          />
        </div>
      </div>

      <div className="px-4 py-3 bg-white mb-4 shadow-sm border-b border-gray-100 flex md:grid md:grid-cols-4 gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar w-full">
        <button 
          onClick={() => setActiveTab('revenue')}
          className={`min-w-[140px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-[11px] sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wider whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'revenue' ? 'bg-slate-800 text-white shadow-slate-800/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <Coins className={`w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 ${activeTab === 'revenue' ? "text-yellow-400" : "text-gray-500"}`} />
          <span>Revenue Models</span>
        </button>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`min-w-[110px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-[11px] sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wider whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow-slate-800/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <BarChart3 className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>Analytics</span>
        </button>
        <button 
          onClick={() => setActiveTab('verifications')}
          className={`min-w-[165px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-[11px] sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wider whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'verifications' ? 'bg-slate-800 text-white shadow-slate-800/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span className="flex items-center gap-1 justify-center md:flex-col lg:flex-row">
            <span className="truncate">Seller Verifications</span>
            <span className="bg-red-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0">3</span>
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('disputes')}
          className={`min-w-[115px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-[11px] sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wider whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'disputes' ? 'bg-slate-800 text-white shadow-slate-800/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span className="flex items-center gap-1 justify-center md:flex-col lg:flex-row">
            <span>Disputes</span>
            <span className="bg-orange-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0">1</span>
          </span>
        </button>
      </div>

      <div className="p-4 w-full">
        {activeTab === 'revenue' && (
          <div className="flex flex-col gap-5">
            {/* Projected Live Platform Revenue Tracker Card */}
            <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-slate-800/40 rounded-full blur-xl pointer-events-none"></div>
               <div className="absolute left-6 top-6 text-yellow-400 opacity-20"><Coins size={80} /></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Platform Yield Estimate</span>
                     <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Projected Monthly</span>
                  </div>
                  <h2 className="text-3xl font-display font-black tracking-tight text-white mt-1">
                    E {totalCalculatedProjectedMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    Interactive simulation based on active marketplace metrics: <strong className="text-slate-300">{premiumTradersCount} Premium Shops</strong>, <strong className="text-slate-300">{activePromoDailyCount} Daily Boosts</strong>, and <strong className="text-slate-300">{totalCompletedDeliveries} Logistics Transactions</strong>.
                  </p>

                  <div className="w-full h-[1px] bg-slate-800 my-4"></div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                     <div className="flex justify-between border-b border-slate-800/50 pb-1">
                       <span className="text-slate-400">Commissions:</span>
                       <span className="font-bold text-slate-200">E {estimatedCommissionRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800/50 pb-1">
                       <span className="text-slate-400">Subscriptions:</span>
                       <span className="font-bold text-slate-200">E {estimatedPremiumRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800/50 pb-1">
                       <span className="text-slate-400">Featured Boosts:</span>
                       <span className="font-bold text-slate-200">E {estimatedPromoRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800/50 pb-1">
                       <span className="text-slate-400">Banner Ads:</span>
                       <span className="font-bold text-slate-200">E {estimatedAdRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between pb-1 border-b border-slate-800/50">
                       <span className="text-slate-400">Logistics Cut:</span>
                       <span className="font-bold text-slate-200">E {estimatedDeliveryRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between pb-1 border-b border-slate-800/50">
                       <span className="text-slate-400">Trader Tools:</span>
                       <span className="font-bold text-slate-200">E {estimatedDigitalRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between pb-1 border-b border-slate-800/50">
                       <span className="text-slate-400">MoMo Fees:</span>
                       <span className="font-bold text-slate-200">E {estimatedMomoFeeRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between pb-1 border-b border-slate-800/50">
                       <span className="text-slate-400">Verifications:</span>
                       <span className="font-bold text-slate-200">E {estimatedVerificationRev.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between pb-1">
                       <span className="text-slate-400">Service Providers:</span>
                       <span className="font-bold text-slate-200">E {estimatedServiceProviderRev.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* TRANSACTION COMMISSION GROWTH & SCALE SIMULATOR */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-950 to-slate-900 border border-emerald-800/40 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden flex flex-col gap-4">
               <div className="absolute right-0 top-0 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider font-mono">
                  🚀 MOST POWERFUL STREAM
               </div>
               
               <div>
                  <h3 className="font-display font-black text-xs text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                     📈 Commission Growth & Scale Simulator
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                     Simulate how a small platform commission per transaction scales as the marketplace expands. As active shops grow, transaction volumes compound this into highly stable recurring revenue.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-slate-800/60 py-4">
                  {/* SLIDER 1: COMMISSION RATE */}
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Commission Rate:</span>
                        <span className="font-mono font-black text-emerald-400 text-xs">{commissionRate}%</span>
                     </div>
                     <input 
                       type="range" 
                       min="1" 
                       max="15" 
                       step="0.5"
                       value={commissionRate}
                       onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                       className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="text-[8px] text-slate-500 font-medium">Synced with core revenue settings</span>
                  </div>

                  {/* SLIDER 2: AVERAGE TRANSACTION */}
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Avg Sale Value:</span>
                        <span className="font-mono font-black text-emerald-400 text-xs">E {simAverageTx}</span>
                     </div>
                     <input 
                       type="range" 
                       min="10" 
                       max="500" 
                       step="5"
                       value={simAverageTx}
                       onChange={(e) => setSimAverageTx(parseInt(e.target.value))}
                       className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="text-[8px] text-slate-500 font-medium">E.g., Vegetables, livestock, clothing, etc.</span>
                  </div>

                  {/* SLIDER 3: MONTHLY TRANSACTIONS */}
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Monthly Transactions:</span>
                        <span className="font-mono font-black text-emerald-400 text-xs">{simMonthlyVolume.toLocaleString()} tx</span>
                     </div>
                     <input 
                       type="range" 
                       min="500" 
                       max="100000" 
                       step="500"
                       value={simMonthlyVolume}
                       onChange={(e) => setSimMonthlyVolume(parseInt(e.target.value))}
                       className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="text-[8px] text-slate-500 font-medium">Marketplace growth projection</span>
                  </div>
               </div>

               {/* RESULTS BOX */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950/55 p-3 rounded-2xl border border-slate-800/40">
                  <div className="flex flex-col">
                     <span className="text-[8px] text-slate-400 uppercase font-black tracking-wide">Earned Per Sale</span>
                     <span className="text-xs font-mono font-extrabold text-slate-200 mt-1">
                        E {(simAverageTx * (commissionRate / 100)).toFixed(2)}
                     </span>
                     <span className="text-[8px] text-slate-500 mt-0.5">At current {commissionRate}% commission</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-800/40 pl-3">
                     <span className="text-[8px] text-slate-400 uppercase font-black tracking-wide">Projected Monthly</span>
                     <span className="text-xs font-mono font-extrabold text-emerald-400 mt-1">
                        E {(simMonthlyVolume * simAverageTx * (commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                     </span>
                     <span className="text-[8px] text-slate-500 mt-0.5">Based on {simMonthlyVolume.toLocaleString()} sales</span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1 border-l md:border-l border-slate-800/40 pl-0 md:pl-3 pt-2 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
                     <span className="text-[8px] text-slate-400 uppercase font-black tracking-wide">Projected Annual</span>
                     <span className="text-xs font-mono font-extrabold text-yellow-400 mt-1">
                        E {(simMonthlyVolume * simAverageTx * (commissionRate / 100) * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                     </span>
                     <span className="text-[8px] text-slate-500 mt-0.5">Annual recurring platform flow</span>
                  </div>
               </div>

               {/* Growth Milestones Timeline */}
               <div className="flex flex-col gap-2">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Compounding Marketplace Scale Milestones:</span>
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                     <div className={`p-2 rounded-xl flex flex-col justify-between border ${simMonthlyVolume >= 1000 ? 'bg-emerald-950/35 border-emerald-800/40 text-slate-100' : 'bg-slate-900/30 border-slate-800/20 text-slate-400'}`}>
                        <span className="font-sans font-bold text-slate-300">Basic</span>
                        <span className="font-extrabold text-[10px] mt-1 text-slate-200">1K tx</span>
                        <span className="mt-1.5 font-bold text-emerald-400">E {((1000) * simAverageTx * (commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                     </div>
                     <div className={`p-2 rounded-xl flex flex-col justify-between border ${simMonthlyVolume >= 10000 ? 'bg-emerald-950/35 border-emerald-800/40 text-slate-100' : 'bg-slate-900/30 border-slate-800/20 text-slate-400'}`}>
                        <span className="font-sans font-bold text-slate-300">Scaling</span>
                        <span className="font-extrabold text-[10px] mt-1 text-slate-200">10K tx</span>
                        <span className="mt-1.5 font-bold text-emerald-400">E {((10000) * simAverageTx * (commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                     </div>
                     <div className={`p-2 rounded-xl flex flex-col justify-between border ${simMonthlyVolume >= 50000 ? 'bg-emerald-950/50 border-emerald-500/30 text-white shadow-sm ring-1 ring-emerald-500/20' : 'bg-slate-900/30 border-slate-800/20 text-slate-400'}`}>
                        <span className="font-sans font-bold text-slate-200 flex items-center gap-0.5">Growth ★</span>
                        <span className="font-extrabold text-[10px] mt-1 text-white">50K tx</span>
                        <span className="mt-1.5 font-bold text-emerald-400">E {((50000) * simAverageTx * (commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                     </div>
                     <div className={`p-2 rounded-xl flex flex-col justify-between border ${simMonthlyVolume >= 100000 ? 'bg-emerald-950/35 border-emerald-800/40 text-slate-100' : 'bg-slate-900/30 border-slate-800/20 text-slate-400'}`}>
                        <span className="font-sans font-bold text-slate-300">Hyper</span>
                        <span className="font-extrabold text-[10px] mt-1 text-slate-200">100K tx</span>
                        <span className="mt-1.5 font-bold text-emerald-400">E {((100000) * simAverageTx * (commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Config title */}
            <div className="flex justify-between items-center -mb-2 px-1">
               <h3 className="font-bold text-sm text-slate-700">Revenue Stream Tuner</h3>
               <span className="text-[10px] text-gray-400 font-semibold font-mono">6 Modes Configured</span>
            </div>

            {/* 1. COMMISSION MODEL */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">1. Commission Model</h4>
                        <p className="text-[9px] text-gray-400">Percentage per transaction</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{commissionRate}%</span>
               </div>
               
               <input 
                 type="range" 
                 min="1" 
                 max="15" 
                 step="0.5"
                 value={commissionRate}
                 onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                 className="w-full accent-emerald-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Projected Annual:</span>
                  <span className="font-bold text-emerald-700">E {estimatedCommissionRev.toLocaleString(undefined, {maximumFractionDigits: 0})} / yr</span>
               </div>
            </div>

            {/* 2. PREMIUM SHOPS */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Award size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">2. Premium Shops</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Monthly subscriber fees</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">E {premiumMonthlyFee}/mo</span>
               </div>
               
               <input 
                 type="range" 
                 min="49" 
                 max="399" 
                 step="10"
                 value={premiumMonthlyFee}
                 onChange={(e) => setPremiumMonthlyFee(parseInt(e.target.value))}
                 className="w-full accent-amber-500 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Active Membership Revenue:</span>
                  <span className="font-bold text-amber-700">E {estimatedPremiumRev.toLocaleString()} / mo</span>
               </div>
            </div>

            {/* 3. FEATURED LISTINGS */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-pink-50 text-pink-600 rounded-xl"><Megaphone size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">3. Featured Listings</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Paid search promotions</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">E {featuredListingFee}/day</span>
               </div>
               
               <input 
                 type="range" 
                 min="5" 
                 max="50" 
                 step="5"
                 value={featuredListingFee}
                 onChange={(e) => setFeaturedListingFee(parseInt(e.target.value))}
                 className="w-full accent-pink-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Platform Promo Intake:</span>
                  <span className="font-bold text-pink-700">E {estimatedPromoRev.toLocaleString()} / mo</span>
               </div>
            </div>

            {/* 4. ADVERTISEMENTS */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Tag size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">4. Advertisements</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Local business banner ads</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">E {adBannerFee}/wk</span>
               </div>
               
               <input 
                 type="range" 
                 min="50" 
                 max="300" 
                 step="10"
                 value={adBannerFee}
                 onChange={(e) => setAdBannerFee(parseInt(e.target.value))}
                 className="w-full accent-indigo-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Current Slot Booking yield:</span>
                  <span className="font-bold text-indigo-700">E {estimatedAdRev.toLocaleString()} / mo</span>
               </div>
            </div>

            {/* 5. DELIVERY FEES */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Truck size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">5. Delivery Fees cut</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Platform commission on logistics</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{deliveryCommRate}%</span>
               </div>
               
               <input 
                 type="range" 
                 min="5" 
                 max="50" 
                 step="1"
                 value={deliveryCommRate}
                 onChange={(e) => setDeliveryCommRate(parseInt(e.target.value))}
                 className="w-full accent-orange-500 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Logistics Commission:</span>
                  <span className="font-bold text-orange-700">E {estimatedDeliveryRev.toLocaleString(undefined, {maximumFractionDigits: 0})} / overall</span>
               </div>
            </div>

            {/* 6. DIGITAL SERVICES */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Sparkles size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">6. Digital Services</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Business tools for traders</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">E {digitalToolsFee}/mo</span>
               </div>
               
               <input 
                 type="range" 
                 min="19" 
                 max="149" 
                 step="10"
                 value={digitalToolsFee}
                 onChange={(e) => setDigitalToolsFee(parseInt(e.target.value))}
                 className="w-full accent-purple-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Premium Tools Adoption:</span>
                  <span className="font-bold text-purple-700">E {estimatedDigitalRev.toLocaleString()} / mo</span>
               </div>
            </div>

            {/* 7. MOBILE MONEY FEE */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 mb-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">7. MoMo Platform Fee</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Service fee on payments</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{momoPlatformFeeRate.toFixed(1)}%</span>
               </div>
               
               <input 
                 type="range" 
                 min="0.5" 
                 max="5.0" 
                 step="0.5"
                 value={momoPlatformFeeRate}
                 onChange={(e) => setMomoPlatformFeeRate(parseFloat(e.target.value))}
                 className="w-full accent-emerald-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Transaction Fee Yield:</span>
                  <span className="font-bold text-emerald-700">E {estimatedMomoFeeRev.toLocaleString()} / overall</span>
               </div>
            </div>

            {/* 8. BUSINESS VERIFICATION FEE */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 mb-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ShieldAlert size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">8. Verification Fee</h4>
                        <p className="text-[9px] text-gray-400 font-medium">One-time fee for Verified Sellers</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">E {verificationFee}</span>
               </div>
               
               <input 
                 type="range" 
                 min="50" 
                 max="200" 
                 step="10"
                 value={verificationFee}
                 onChange={(e) => setVerificationFee(parseInt(e.target.value))}
                 className="w-full accent-blue-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Verification Yield:</span>
                  <span className="font-bold text-blue-700">E {estimatedVerificationRev.toLocaleString()} / overall</span>
               </div>
            </div>

            {/* 9. SERVICE PROVIDER SUBSCRIPTION */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 mb-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Briefcase size={16} /></div>
                     <div>
                        <h4 className="font-bold text-xs text-gray-800">9. Service Provider Plan</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Monthly fee for Tradesmen & Tutors</p>
                     </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">E {serviceProviderFee}/mo</span>
               </div>
               
               <input 
                 type="range" 
                 min="50" 
                 max="500" 
                 step="10"
                 value={serviceProviderFee}
                 onChange={(e) => setServiceProviderFee(parseInt(e.target.value))}
                 className="w-full accent-indigo-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />

               <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg">
                  <span className="text-gray-500">Provider Subscriptions:</span>
                  <span className="font-bold text-indigo-700">E {estimatedServiceProviderRev.toLocaleString()} / mo</span>
               </div>
            </div>
         </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Store size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Traders</p>
                <p className="font-bold text-gray-800 text-xl">1,245</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Customers</p>
                <p className="font-bold text-gray-800 text-xl">8,432</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <BarChart3 size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                <p className="font-bold text-gray-800 text-xl">12,402</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                  <DollarSign size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                <p className="font-bold text-gray-800 text-xl">E 4.2M</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Deliveries</p>
                <p className="font-bold text-gray-800 text-xl">8,912</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2">
                  <ShieldAlert size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">System Health</p>
                <p className="font-bold text-gray-800 text-xl">100%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 text-sm">Marketplace Activity</h3>
                 <span className="text-xs text-slate-500 font-bold">View All</span>
               </div>
               <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Order #8423 <span className="text-gray-500 font-normal text-xs ml-1">placed</span></p>
                      <p className="text-[10px] text-gray-500">Mbabane &rarr; Eveni • 2 mins ago</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800">New Shop Registered</p>
                      <p className="text-[10px] text-gray-500">Gugu's Fresh Produce • 10 mins ago</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pb-1">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Delivery #8410 <span className="text-gray-500 font-normal text-xs ml-1">completed</span></p>
                      <p className="text-[10px] text-gray-500">Manzini &rarr; Matsapha • 15 mins ago</p>
                    </div>
                 </div>
               </div>
            </div>
          </>
        )}

        {activeTab === 'verifications' && (
          <div className="flex flex-col gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex gap-3 mb-3">
                 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                 <div>
                   <h3 className="font-bold text-gray-800 text-sm">Zinle's Fashion Boutique</h3>
                   <p className="text-[10px] text-gray-500">Requested Premium Verification</p>
                 </div>
               </div>
               <div className="bg-gray-50 p-2 rounded-lg mb-3">
                 <p className="text-xs font-bold text-gray-700 mb-1">Documents Provided:</p>
                 <u className="text-[10px] text-blue-600 flex flex-col gap-1">
                   <li>National ID Front & Back</li>
                   <li>Market Stall Permit</li>
                 </u>
               </div>
               <div className="flex gap-2">
                 <button className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                   <CheckCircle2 size={14} /> Approve
                 </button>
                 <button className="flex-1 bg-red-100 text-red-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                   <XCircle size={14} /> Reject
                 </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="flex flex-col gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">Active Dispute</span>
                 <span className="text-[10px] text-gray-500">Order #8401</span>
               </div>
               <h3 className="font-bold text-gray-800 text-sm mb-1">Item Not Delivered</h3>
               <p className="text-xs text-gray-600 mb-3 line-clamp-2">Buyer claims the dress was never delivered, but driver marked it as delivered at 14:00 yesterday.</p>
               
               <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg">
                 <div className="flex-1 text-center border-r border-gray-200">
                    <p className="text-[10px] text-gray-500">Escrow Hold</p>
                    <p className="font-bold text-red-600 text-sm">E 350.00</p>
                 </div>
                 <div className="flex-1 flex justify-center gap-2">
                    <button className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded">View Chat</button>
                 </div>
               </div>

               <div className="flex gap-2">
                 <button className="flex-1 bg-slate-800 text-white text-xs font-bold py-2 rounded-lg">
                   Resolve (Refund Buyer)
                 </button>
                 <button className="flex-1 border border-slate-300 text-slate-700 text-xs font-bold py-2 rounded-lg">
                   Resolve (Pay Seller)
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
