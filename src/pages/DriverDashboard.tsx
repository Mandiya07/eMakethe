import { MapPin, CheckCircle2, Navigation2, DollarSign, Package, User, Phone, Lock, Sparkles, Truck, ShieldCheck, Award } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function DriverDashboard() {
  // Onboarding & Registration States
  const [driverId, setDriverId] = useState<string | null>(() => {
    return localStorage.getItem('emakethe_active_driver_id');
  });

  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerVehicleType, setRegisterVehicleType] = useState('Motorcycle');
  const [registerMomoNumber, setRegisterMomoNumber] = useState('');
  const [registerLicenseId, setRegisterLicenseId] = useState('');
  const [registerSuburb, setRegisterSuburb] = useState('Mbabane Central');
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleApplyDriverPreset = (name: string, phone: string, vehicle: string, momo: string, license: string, suburb: string) => {
    setRegisterName(name);
    setRegisterPhone(phone);
    setRegisterVehicleType(vehicle);
    setRegisterMomoNumber(momo);
    setRegisterLicenseId(license);
    setRegisterSuburb(suburb);
    setRegError(null);
  };

  const handleRegisterDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerPhone || !registerMomoNumber || !registerLicenseId) {
      setRegError('Please fill in all required registration fields.');
      return;
    }
    setIsSubmittingDriver(true);
    setRegError(null);
    const newDriverId = `drv-${Math.random().toString(36).substr(2, 9)}`;
    const driverProfile = {
      id: newDriverId,
      name: registerName,
      phone: registerPhone,
      vehicleType: registerVehicleType,
      momoNumber: registerMomoNumber,
      licenseId: registerLicenseId,
      suburb: registerSuburb,
      registeredAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'drivers', newDriverId), driverProfile);
      localStorage.setItem('emakethe_active_driver_id', newDriverId);
      localStorage.setItem('emakethe_driver_profile', JSON.stringify(driverProfile));
      setDriverId(newDriverId);
    } catch (err) {
      setRegError('Failed to register driver profile. Please try again.');
      try {
        handleFirestoreError(err, OperationType.CREATE, `drivers/${newDriverId}`);
      } catch (f) {
        console.error(f);
      }
    } finally {
      setIsSubmittingDriver(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'earnings'>('requests');
  
  // Escrow Orders synchronization
  const [escrowOrders, setEscrowOrders] = useState<any[]>([]);
  const [activeEscrowId, setActiveEscrowId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('activeEscrows');
      if (stored) {
        setEscrowOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const syncLocalStorage = (updatedOrders: any[]) => {
    try {
      localStorage.setItem('activeEscrows', JSON.stringify(updatedOrders));
      setEscrowOrders(updatedOrders);
    } catch (e) {
      console.warn(e);
    }
  };

  // Interactive Simulator States
  const [isPendingAvailable, setIsPendingAvailable] = useState(true);
  const [hasActiveJob, setHasActiveJob] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(145.00);
  const [deliveryCount, setDeliveryCount] = useState(6);
  const [hoursSpent, setHoursSpent] = useState(4.5);

  // GPS Simulation and Trust Verification Proof States
  const [navigationStep, setNavigationStep] = useState(0);
  const [otpCode, setOtpCode] = useState('');
  const [proofMethod, setProofMethod] = useState<'otp' | 'photo' | 'signature'>('otp');
  const [proofPhotoAttached, setProofPhotoAttached] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const [recentPayouts, setRecentPayouts] = useState([
    { id: '#ESCO-910A', time: 'Today, 2:15 PM', amount: 25.00 },
    { id: '#ESCO-839B', time: 'Today, 11:30 AM', amount: 30.00 }
  ]);

  const handleAcceptJob = () => {
    setIsPendingAvailable(false);
    setHasActiveJob(true);
    setActiveTab('active');
  };

  const handleDeclineJob = () => {
    setIsPendingAvailable(false);
  };

  const handleAcceptEscrowJob = (id: string) => {
    setActiveEscrowId(id);
    const updated = escrowOrders.map(esc => esc.id === id ? { ...esc, description: 'Matched driver en route for pickup...' } : esc);
    syncLocalStorage(updated);
    setActiveTab('active');
  };

  const handleCompleteEscrowJob = (id: string) => {
    const updated = escrowOrders.map(esc => esc.id === id ? { ...esc, status: 'Delivered', description: 'Package dropped off. Awaiting buyer confirmation release.' } : esc);
    syncLocalStorage(updated);
    setActiveEscrowId(null);
    setTodayEarnings(prev => prev + 25.00);
    setDeliveryCount(prev => prev + 1);
    setRecentPayouts(prev => [
      { id: id, time: 'Just now', amount: 25.00 },
      ...prev
    ]);
    setActiveTab('earnings');
  };

  const handleCompleteJob = () => {
    setHasActiveJob(false);
    setTodayEarnings(prev => prev + 25.00);
    setDeliveryCount(prev => prev + 1);
    setHoursSpent(prev => parseFloat((prev + 0.5).toFixed(1)));
    
    // Add new payout record
    setRecentPayouts(prev => [
      { id: '#982', time: 'Just now', amount: 25.00 },
      ...prev
    ]);
    
    setActiveTab('earnings');
  };

  if (!driverId) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20 w-full font-sans">
        {/* Header */}
        <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 w-full">
          <div>
            <h1 className="text-lg font-bold text-gray-800 font-display">Driver Hub</h1>
            <p className="text-[10px] text-gray-500">Logistics Courier Partner Portal</p>
          </div>
          <div className="bg-red-50 text-red-650 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono tracking-wider animate-pulse flex items-center gap-1">
            <Lock size={10} /> Pending Onboarding
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md mx-auto p-4">
          <div className="bg-orange-50 border border-orange-200 text-orange-950 p-4 rounded-2xl mb-5 flex gap-3 items-start animate-in fade-in">
            <Truck className="text-orange-600 mt-0.5 shrink-0" size={20} />
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wide">Logistics Partner Verification Required</h4>
              <p className="text-[11px] text-orange-850 leading-relaxed mt-0.5 font-normal">
                To accept local customer orders, view GPS navigation pins, and earn direct MoMo transaction split payments, you must first register your carrier details.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-green-600" size={20} />
              <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-wide font-sans">Register New Courier Profile</h3>
            </div>

            {/* Quick Presets */}
            <div className="bg-slate-50 p-3 rounded-2xl mb-5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">Quick Fill Demo Presets:</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyDriverPreset('Musa Dlamini', '+268 7604 1122', 'Motorcycle', '+268 7604 1122', 'SZ-891-23B', 'Ezulwini')}
                  className="w-full text-left bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-2 text-xs flex justify-between items-center transition-all cursor-pointer"
                >
                  <div>
                    <p className="font-bold">🏍️ Musa Dlamini (Ezulwini)</p>
                    <p className="text-[10px] text-slate-400 font-sans">Motorcycle • License: SZ-891-23B • MoMo: +268 7604 1122</p>
                  </div>
                  <Sparkles size={12} className="text-blue-500 animate-pulse" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDriverPreset('Sizwe Gamedze', '+268 7812 5543', 'Sedan Car', '+268 7812 5543', 'SZ-452-91C', 'Mbabane Heights')}
                  className="w-full text-left bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-2 text-xs flex justify-between items-center transition-all cursor-pointer"
                >
                  <div>
                    <p className="font-bold">🚗 Sizwe Gamedze (Mbabane)</p>
                    <p className="text-[10px] text-slate-405 font-sans">Sedan Car • License: SZ-452-91C • MoMo: +268 7812 5543</p>
                  </div>
                  <Sparkles size={12} className="text-blue-500 animate-pulse" />
                </button>
              </div>
            </div>

            {regError && (
              <div className="bg-rose-50 border border-rose-105 text-rose-700 rounded-xl p-3 text-xs font-bold mb-4 font-sans">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterDriverSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Musa Dlamini"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+268 76xx xxxx"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-green-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">Vehicle Type *</label>
                  <select
                    value={registerVehicleType}
                    onChange={(e) => setRegisterVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-green-500 animate-in"
                  >
                    <option value="Motorcycle">🏍️ Motorcycle</option>
                    <option value="Sedan Car">🚗 Sedan Car</option>
                    <option value="Light Truck">🚚 Light Truck</option>
                    <option value="Bicycle">🚲 Bicycle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">MTN MoMo Number (payouts) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +268 7604 1122"
                  value={registerMomoNumber}
                  onChange={(e) => setRegisterMomoNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-green-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">License ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="SZ-XXXXX"
                    value={registerLicenseId}
                    onChange={(e) => setRegisterLicenseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-green-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">Operating Hub *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ezulwini"
                    value={registerSuburb}
                    onChange={(e) => setRegisterSuburb(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-green-500 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingDriver}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-3 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmittingDriver ? 'Registering Couriers...' : 'Join our Delivery Fleet!'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 w-full animate-in fade-in duration-300">
      <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 w-full">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Driver Hub</h1>
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online & Ready
          </p>
        </div>
        <div className="bg-gray-100 p-2 rounded-full">
          <User size={20} className="text-gray-600" />
        </div>
      </div>

      <div className="px-4 py-3 bg-white mb-2 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'requests' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}
        >
          New Requests {isPendingAvailable && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">1</span>}
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'active' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}
        >
          Active Delivery {hasActiveJob && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">1</span>}
        </button>
        <button 
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'earnings' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}
        >
          My Earnings
        </button>
      </div>

      <div className="p-4 w-full">
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-4 animate-in fade-in">
             {/* Render Dynamic Escrow Jobs with Locked status */}
             {escrowOrders.filter(esc => esc.status === 'Locked' && esc.id !== activeEscrowId).map((esc) => (
                <div key={esc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-200 relative overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg font-mono">
                     🔒 Escrow Parcel
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Job #{esc.id}</h4>
                  
                  <div className="relative pl-5 mb-4">
                    <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-gray-200"></div>
                    
                    <div className="mb-3 relative">
                      <div className="absolute -left-5 top-0.5 w-3 h-3 rounded-full border-2 border-green-500 bg-white"></div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Pickup Location</p>
                      <p className="text-sm font-bold text-gray-800">{esc.recipient}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">Agricultural Market Stall</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-5 top-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Deliver Destination</p>
                      <p className="text-sm font-bold text-gray-800">Swazi Resident Address</p>
                      <p className="text-xs text-gray-500 line-clamp-1">Contact Phone: {esc.buyerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl mb-3 border border-blue-100">
                     <div className="flex items-center gap-2">
                       <Package size={16} className="text-blue-600" />
                       <span className="text-xs font-bold text-blue-800 leading-normal line-clamp-1">{esc.item}</span>
                     </div>
                     <div className="text-right shrink-0">
                       <span className="block text-[10px] text-gray-500 font-medium">Earn (MoMo)</span>
                       <span className="font-bold text-green-600 text-sm">E 25.00</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => handleAcceptEscrowJob(esc.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-xl shadow-sm transition-colors uppercase tracking-wider"
                  >
                    Accept Escrow Consignment
                  </button>
                </div>
             ))}

             {isPendingAvailable ? (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    1.2km away
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Delivery Job #982</h4>
                  
                  <div className="relative pl-5 mb-4">
                    <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-gray-200"></div>
                    
                    <div className="mb-3 relative">
                      <div className="absolute -left-5 top-0.5 w-3 h-3 rounded-full border-2 border-green-500 bg-white"></div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Pickup</p>
                      <p className="text-sm font-bold text-gray-800">Mbabane Central Market</p>
                      <p className="text-xs text-gray-500 line-clamp-1">Sipho's Fresh Produce, Stall 12</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-5 top-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Drop-off</p>
                      <p className="text-sm font-bold text-gray-800">Checkers, Mbabane</p>
                      <p className="text-xs text-gray-500 line-clamp-1">Plot 45, Near the clinic</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-3">
                     <div className="flex items-center gap-2">
                       <Package size={16} className="text-gray-500" />
                       <span className="text-xs font-bold text-gray-700">Small Package (2kg)</span>
                     </div>
                     <div className="text-right">
                       <span className="block text-[10px] text-gray-500 font-medium">You Earn</span>
                       <span className="font-bold text-green-600 text-sm">E 25.00</span>
                     </div>
                  </div>

                  <div className="flex gap-2">
                     <button 
                       onClick={handleAcceptJob}
                       className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-3 rounded-xl shadow-sm transition-colors"
                     >
                       Accept Delivery
                     </button>
                     <button 
                       onClick={handleDeclineJob}
                       className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3 rounded-xl transition-colors"
                     >
                       Decline
                     </button>
                  </div>
               </div>
             ) : escrowOrders.filter(e => e.status === 'Locked').length === 0 && (
                <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                  <span className="text-3xl mb-2">🏍️</span>
                  <p className="font-bold text-gray-800 text-sm">No new requests</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Waiting for traders to dispatch nearby shipments...</p>
                  <button 
                    onClick={() => setIsPendingAvailable(true)}
                    className="mt-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs px-4 py-2.5 rounded-full transition-colors flex items-center gap-1 border border-green-200/50"
                  >
                    🔄 Scan for Nearby Customer Shipments
                  </button>
                </div>
             )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="flex flex-col gap-4">
            {activeEscrowId ? (
              (() => {
                const activeEscrow = escrowOrders.find(esc => esc.id === activeEscrowId);
                if (!activeEscrow) return null;

                // Simulated coordinates along SVG road route based on navigationStep:
                // Step 0: Start at Stall (50, 140)
                // Step 1: MR3 Highway (120, 85)
                // Step 2: Clinic turn (220, 55)
                // Step 3: Destination Cottage (290, 110)
                const coordinates = [
                  { x: 50, y: 140, text: 'Mbabane Stall' },
                  { x: 120, y: 85, text: 'MR3 highway segment' },
                  { x: 220, y: 55, text: 'Clinic Turn' },
                  { x: 290, y: 110, text: 'Recipient Cottage' }
                ];
                const activeCoord = coordinates[navigationStep] || coordinates[0];

                const triggerCompleteWithProof = () => {
                  if (proofMethod === 'otp') {
                    if (otpCode !== '4902') {
                      setVerificationFeedback('❌ Securing release requires the correct 4-digit buyer PIN (4902).');
                      return;
                    }
                  } else if (proofMethod === 'photo') {
                    if (!proofPhotoAttached) {
                      setVerificationFeedback('❌ photographic timestamp is required for drop-off proof.');
                      return;
                    }
                  } else if (proofMethod === 'signature') {
                    if (!signedName.trim()) {
                      setVerificationFeedback('❌ Recipient confirmation signature name is required.');
                      return;
                    }
                  }
                  
                  setVerificationFeedback('✓ Security Proof Accepted! Releasing locked Escrow payouts...');
                  setTimeout(() => {
                    handleCompleteEscrowJob(activeEscrow.id);
                    // Clear state
                    setNavigationStep(0);
                    setOtpCode('');
                    setProofPhotoAttached(false);
                    setSignedName('');
                    setVerificationFeedback(null);
                  }, 1200);
                };

                return (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-200 animate-in zoom-in-95 duration-150 font-sans">
                     <div className="flex justify-between items-center mb-4">
                       <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-1 rounded-md">🛡️ ESCROW PARCEL NAVIGATION</span>
                       <span className="text-xs font-bold text-gray-800 font-mono">{activeEscrow.id}</span>
                     </div>

                     {/* Interactive Live SVG Route Map */}
                     <div className="relative bg-[#f1f5f9] rounded-2xl border border-slate-200 overflow-hidden mb-3">
                       <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full z-10 font-mono tracking-wider">
                         Live GPS Navigation Map
                       </div>

                       <svg className="w-full h-44" viewBox="0 0 340 180">
                         {/* Grid representing streets */}
                         <defs>
                           <pattern id="street-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                             <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                           </pattern>
                         </defs>
                         <rect width="100%" height="100%" fill="url(#street-grid)" />

                         {/* Map Major Highways */}
                         <path d="M 50 140 L 120 85 L 220 55 L 290 110" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                         
                         {/* Traversed dynamic GPS track highlight */}
                         <path 
                           d={
                             navigationStep === 0 ? "M 50 140" :
                             navigationStep === 1 ? "M 50 140 L 120 85" :
                             navigationStep === 2 ? "M 50 140 L 120 85 L 220 55" :
                             "M 50 140 L 120 85 L 220 55 L 290 110"
                           } 
                           fill="none" 
                           stroke="#0ea5e9" 
                           strokeWidth="8" 
                           strokeLinecap="round" 
                           strokeLinejoin="round" 
                           className="transition-all duration-500"
                         />

                         {/* Pickup Marker A */}
                         <circle cx="50" cy="140" r="8" fill="#16a34a" stroke="white" strokeWidth="2.5" />
                         <text x="50" y="157" textAnchor="middle" className="text-[7.5px] font-black fill-green-800 uppercase tracking-tight">Pickup Stall</text>

                         {/* Destination Marker B */}
                         <circle cx="290" cy="110" r="8" fill="#dc2626" stroke="white" strokeWidth="2.5" />
                         <text x="290" y="127" textAnchor="middle" className="text-[7.5px] font-black fill-red-800 uppercase tracking-tight">Buyer Lodge</text>

                         {/* Pulse behind active bike coordinates rider */}
                         <circle cx={activeCoord.x} cy={activeCoord.y} r="14" fill="#0ea5e9" className="opacity-25 animate-ping" />
                         {/* Biker Marker */}
                         <g transform={`translate(${activeCoord.x - 7}, ${activeCoord.y - 7})`} className="transition-all duration-500">
                           <circle cx="7" cy="7" r="7" fill="#0ea5e9" stroke="white" strokeWidth="2" />
                           <path d="M 7 4 L 9 9 L 7 8 L 5 9 Z" fill="white" />
                         </g>
                       </svg>

                       <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs p-2 rounded-xl flex justify-between items-center border border-slate-200/50 shadow-xs">
                         <div className="min-w-0 flex-1">
                           <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Current Sector</p>
                           <p className="text-[10px] font-black text-slate-800 truncate">{activeCoord.text}</p>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setNavigationStep(prev => (prev < 3 ? prev + 1 : 0))}
                           className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg shrink-0 transition-all shadow-xs uppercase font-mono"
                         >
                           {navigationStep === 3 ? 'Restart Path' : 'Drive Next Sector →'}
                         </button>
                       </div>
                     </div>

                     {/* Turn-by-Turn Guidance HUD Card */}
                     <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 mb-3 flex flex-col gap-1.5 font-mono">
                       <span className="text-[7.5px] uppercase text-emerald-400 font-bold tracking-widest block mb-0.5">Turn-by-Turn GPS Guidance HUD</span>
                       <div className="flex items-start gap-2.5 text-xs">
                         <Navigation2 size={14} className="text-blue-400 rotate-90 shrink-0 mt-0.5" />
                         <div>
                           {navigationStep === 0 && <p className="leading-snug text-slate-200">📍 [0.0 km] Start at Mbabane Central Stall. Pack fresh consignment securely and fire ignition.</p>}
                           {navigationStep === 1 && <p className="leading-snug text-slate-200">🏍️ [1.2 km] Speeding along MR3 Highway route. Keeping left lane past commercial taxi stop.</p>}
                           {navigationStep === 2 && <p className="leading-snug text-slate-200">🛣️ [1.8 km] Turn left into Hospital Road lane. Drive slowly past the community medical stall.</p>}
                           {navigationStep === 3 && <p className="leading-snug text-slate-200">🏁 [2.2 km] Arrived at destination residence stall on the right side. Ask buyer for OTP PIN.</p>}
                         </div>
                       </div>
                     </div>

                     <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                           <User size={18} />
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-500">Secured Payout Escrow Client</p>
                           <p className="text-sm font-bold text-gray-800">Phone: {activeEscrow.buyerPhone}</p>
                         </div>
                       </div>
                       <button 
                         type="button" 
                         onClick={() => window.open(`https://wa.me/${activeEscrow.buyerPhone.replace(/\D/g, '')}`, '_blank')}
                         className="bg-[#25D366]/10 text-[#128C7E] px-3 py-1 rounded-full font-black text-[10px] hover:bg-[#25D366]/20 transition-all font-sans"
                       >
                         WhatsApp Chat
                       </button>
                     </div>

                     {/* Trust Protection verification card */}
                     <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-3xl flex flex-col gap-3 font-sans mb-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                           <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Secure Proof of Drop-off</span>
                           <span className="text-[9px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold font-mono">Step 1 of 2</span>
                        </div>

                        {/* Selector buttons */}
                        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200/50 text-[9.5px] font-bold">
                           <button 
                              type="button" 
                              onClick={() => { setProofMethod('otp'); setVerificationFeedback(null); }}
                              className={`p-1.5 rounded-lg text-center transition-all ${proofMethod === 'otp' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                              Buyer PIN Code
                           </button>
                           <button 
                              type="button" 
                              onClick={() => { setProofMethod('photo'); setVerificationFeedback(null); }}
                              className={`p-1.5 rounded-lg text-center transition-all ${proofMethod === 'photo' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                              Photo Stamp
                           </button>
                           <button 
                              type="button" 
                              onClick={() => { setProofMethod('signature'); setVerificationFeedback(null); }}
                              className={`p-1.5 rounded-lg text-center transition-all ${proofMethod === 'signature' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                              Hand Signature
                           </button>
                        </div>

                        {proofMethod === 'otp' && (
                           <div className="flex flex-col gap-2 font-sans animate-in fade-in duration-150 text-left">
                              <p className="text-[10px] text-slate-500 leading-normal">
                                Enter the secure 4-digit verification code generated inside the buyer's Wallet tab (Expected code is <strong className="font-mono text-purple-600">4902</strong>).
                              </p>
                              <input 
                                 type="text" 
                                 maxLength={4}
                                 value={otpCode}
                                 onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                 placeholder="E.g. 4902"
                                 className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-center text-sm font-black font-mono tracking-widest outline-none focus:border-blue-500"
                              />
                           </div>
                        )}

                        {proofMethod === 'photo' && (
                           <div className="flex flex-col gap-2 font-sans animate-in fade-in duration-150 text-left">
                              <p className="text-[10px] text-slate-500 leading-normal">
                                Snap and attach a live photo of the package at the drop-off location as permanent trust proof.
                              </p>
                              {proofPhotoAttached ? (
                                 <div className="bg-green-50 text-green-800 p-2.5 rounded-xl border border-green-200 flex items-center justify-between text-[10px] font-bold">
                                    <span className="flex items-center gap-1.5">✓ dropoff_photo_verified.jpg attached</span>
                                    <button type="button" onClick={() => setProofPhotoAttached(false)} className="text-red-500 hover:underline">Remove</button>
                                 </div>
                              ) : (
                                 <button 
                                    type="button"
                                    onClick={() => setProofPhotoAttached(true)}
                                    className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white p-4 rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                                 >
                                    <Sparkles className="text-blue-500" size={16} />
                                    <span className="text-[10px] font-bold text-slate-700">Attach Delivery Verification Photo</span>
                                    <span className="text-[8px] text-slate-400 font-sans">Verifies location GPS & timestamp metadata</span>
                                 </button>
                              )}
                           </div>
                        )}

                        {proofMethod === 'signature' && (
                           <div className="flex flex-col gap-2 font-sans animate-in fade-in duration-150 text-left">
                              <p className="text-[10px] text-slate-500 leading-normal">
                                Kindly ask the recipient to write their full name below as signature proof.
                              </p>
                              <input 
                                 type="text" 
                                 value={signedName}
                                 onChange={(e) => setSignedName(e.target.value)}
                                 placeholder="Write Recipient Full Name"
                                 className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold font-sans outline-none focus:border-blue-500 text-slate-800"
                              />
                              <div className="h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden" style={{ cursor: 'crosshair' }}>
                                 {signedName ? (
                                    <span className="font-serif italic text-sm text-slate-700 select-none">{signedName}</span>
                                 ) : (
                                    <span className="text-[8.5px] text-slate-400 font-bold select-none">[ Sign Area: Draw signature above ]</span>
                                 )}
                              </div>
                           </div>
                        )}

                        {verificationFeedback && (
                           <p className={`text-[10.5px] font-bold ${verificationFeedback.startsWith('✓') ? 'text-green-600' : 'text-rose-600'} animate-in slide-in-from-top-1 duration-150 text-left leading-normal`}>
                              {verificationFeedback}
                           </p>
                        )}
                     </div>

                     <button 
                       type="button"
                       onClick={triggerCompleteWithProof}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                     >
                       <CheckCircle2 size={16} /> Complete Delivery Receipt
                     </button>
                  </div>
                );
              })()
            ) : hasActiveJob ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-200 animate-in zoom-in-95 duration-150 font-sans">
                 <div className="flex justify-between items-center mb-4 font-sans">
                   <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md">In Progress</span>
                   <span className="text-xs font-bold text-gray-800 font-mono">Order #982</span>
                 </div>

                 {/* Interactive Live SVG Route Map for Cash Order */}
                 <div className="relative bg-[#f1f5f9] rounded-2xl border border-slate-200 overflow-hidden mb-3">
                   <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full z-10 font-mono tracking-wider">
                     Live GPS Navigation Map
                   </div>

                   <svg className="w-full h-44" viewBox="0 0 340 180">
                     <defs>
                       <pattern id="street-grid-cash" width="30" height="30" patternUnits="userSpaceOnUse">
                         <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                       </pattern>
                     </defs>
                     <rect width="100%" height="100%" fill="url(#street-grid-cash)" />

                     {/* Road */}
                     <path d="M 50 140 L 120 85 L 220 55 L 290 110" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                     <path 
                       d={
                         navigationStep === 0 ? "M 50 140" :
                         navigationStep === 1 ? "M 50 140 L 120 85" :
                         navigationStep === 2 ? "M 50 140 L 120 85 L 220 55" :
                         "M 50 140 L 120 85 L 220 55 L 290 110"
                       } 
                       fill="none" 
                       stroke="#16a342" 
                       strokeWidth="8" 
                       strokeLinecap="round" 
                       strokeLinejoin="round" 
                       className="transition-all duration-500"
                     />

                     {/* Pickup A */}
                     <circle cx="50" cy="140" r="8" fill="#16a34a" stroke="white" strokeWidth="2.5" />
                     <text x="50" y="157" textAnchor="middle" className="text-[7.5px] font-black fill-green-800 uppercase tracking-tight font-sans">Mbabane Market</text>

                     {/* Dropoff B */}
                     <circle cx="290" cy="110" r="8" fill="#dc2626" stroke="white" strokeWidth="2.5" />
                     <text x="290" y="127" textAnchor="middle" className="text-[7.5px] font-black fill-red-800 uppercase tracking-tight font-sans">Drop-off Home</text>

                     {/* pulsing rider dot */}
                     <circle cx={navigationStep === 0 ? 50 : navigationStep === 1 ? 120 : navigationStep === 2 ? 220 : 290} cy={navigationStep === 0 ? 140 : navigationStep === 1 ? 85 : navigationStep === 2 ? 55 : 110} r="14" fill="#16a342" className="opacity-25 animate-ping" />
                     <g transform={`translate(${(navigationStep === 0 ? 50 : navigationStep === 1 ? 120 : navigationStep === 2 ? 220 : 290) - 7}, ${(navigationStep === 0 ? 140 : navigationStep === 1 ? 85 : navigationStep === 2 ? 55 : 110) - 7})`} className="transition-all duration-500">
                       <circle cx="7" cy="7" r="7" fill="#16a342" stroke="white" strokeWidth="2" />
                       <path d="M 7 4 L 9 9 L 7 8 L 5 9 Z" fill="white" />
                     </g>
                   </svg>

                   <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs p-2 rounded-xl flex justify-between items-center border border-slate-200/50 shadow-xs">
                     <div className="min-w-0 flex-1">
                       <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Sector Progress</p>
                       <p className="text-[10px] font-black text-slate-800 truncate font-sans">
                         {navigationStep === 0 && 'At SiphoProduce Produce'}
                         {navigationStep === 1 && 'Cruising MR3 Expressway'}
                         {navigationStep === 2 && 'Passing Hospital Lane'}
                         {navigationStep === 3 && 'Arrived Destination'}
                       </p>
                     </div>
                     <button 
                       type="button"
                       onClick={() => setNavigationStep(prev => (prev < 3 ? prev + 1 : 0))}
                       className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg shrink-0 transition-all shadow-xs uppercase font-mono"
                     >
                       {navigationStep === 3 ? 'Restart Path' : 'Drive Next Sector →'}
                     </button>
                   </div>
                 </div>

                 {/* GPS Turn Guidance HUD */}
                 <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 mb-3 flex flex-col gap-1.5 font-mono">
                   <span className="text-[7.5px] uppercase text-emerald-400 font-bold tracking-widest block mb-0.5 font-sans">Turn Guidance HUD</span>
                   <div className="flex items-start gap-2.5 text-xs">
                     <Navigation2 size={14} className="text-green-400 rotate-90 shrink-0 mt-0.5" />
                     <div>
                       {navigationStep === 0 && <p className="leading-snug text-slate-200">📍 [0.0 km] Start at Mbabane Central Market stall. Collect cash invoice.</p>}
                       {navigationStep === 1 && <p className="leading-snug text-slate-200">🏍️ [1.2 km] Cruising the MR3 dual lane segment. Traffic flow is light.</p>}
                       {navigationStep === 2 && <p className="leading-snug text-slate-200">🛣️ [1.8 km] Turning left past clinic lanes. Road turns quiet.</p>}
                       {navigationStep === 3 && <p className="leading-snug text-slate-200">🏁 [2.2 km] Arrived at drop-off cottage gate. Confirm package with Themba!</p>}
                     </div>
                   </div>
                 </div>

                 <div className="flex justify-between items-center mb-3 font-sans">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                       <User size={18} className="text-gray-600" />
                     </div>
                     <div>
                       <p className="text-[10px] text-gray-500">Customer</p>
                       <p className="text-sm font-bold text-gray-800">Themba Dlamini</p>
                     </div>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => window.open(`tel:+26876123456`, '_self')}
                     className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-green-600 transition-colors"
                   >
                     <Phone size={18} />
                   </button>
                 </div>

                 {/* Trust Verification card */}
                 <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-3xl flex flex-col gap-3 font-sans mb-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                       <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Secure Proof of Drop-off</span>
                       <span className="text-[9px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold font-mono">Standard Match</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200/50 text-[9.5px] font-bold">
                       <button 
                          type="button" 
                          onClick={() => { setProofMethod('photo'); setVerificationFeedback(null); }}
                          className={`p-1.5 rounded-lg text-center transition-all ${proofMethod === 'photo' ? 'bg-green-600 text-white font-extrabold' : 'text-slate-500'}`}
                       >
                          Photo Stamp
                       </button>
                       <button 
                          type="button" 
                          onClick={() => { setProofMethod('signature'); setVerificationFeedback(null); }}
                          className={`p-1.5 rounded-lg text-center transition-all ${proofMethod === 'signature' ? 'bg-green-650 text-white font-extrabold' : 'text-slate-500'}`}
                       >
                          Recipient Signature
                       </button>
                    </div>

                    {proofMethod === 'photo' ? (
                       <div className="flex flex-col gap-2 font-sans animate-in fade-in duration-150 text-left">
                          <p className="text-[10px] text-slate-500 leading-normal">
                             Snap and attach a live photo of the package at the drop-off location as permanent trust proof.
                          </p>
                          {proofPhotoAttached ? (
                             <div className="bg-green-50 text-green-800 p-2.5 rounded-xl border border-green-200 flex items-center justify-between text-[10px] font-bold">
                                <span className="flex items-center gap-1.5">✓ dropoff_photo_verified.jpg attached</span>
                                <button type="button" onClick={() => setProofPhotoAttached(false)} className="text-red-500 hover:underline">Remove</button>
                             </div>
                          ) : (
                             <button 
                                type="button"
                                onClick={() => setProofPhotoAttached(true)}
                                className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white p-4 rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                             >
                                <Sparkles className="text-green-600" size={16} />
                                <span className="text-[10px] font-bold text-slate-700">Attach Delivery Verification Photo</span>
                             </button>
                          )}
                       </div>
                    ) : (
                       <div className="flex flex-col gap-2 font-sans animate-in fade-in duration-150 text-left">
                          <p className="text-[10px] text-slate-500 leading-normal">
                             Kindly ask Themba to write their full name below as signature proof.
                          </p>
                          <input 
                             type="text" 
                             value={signedName}
                             onChange={(e) => setSignedName(e.target.value)}
                             placeholder="Write Recipient Full Name"
                             className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold font-sans outline-none focus:border-green-500 text-slate-800"
                          />
                          <div className="h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden" style={{ cursor: 'crosshair' }}>
                             {signedName ? (
                                <span className="font-serif italic text-sm text-slate-700 select-none">{signedName}</span>
                             ) : (
                                <span className="text-[8.5px] text-slate-400 font-bold select-none">[ Sign Area ]</span>
                             )}
                          </div>
                       </div>
                    )}

                    {verificationFeedback && (
                       <p className={`text-[10.5px] font-bold ${verificationFeedback.startsWith('✓') ? 'text-green-605' : 'text-rose-600'} animate-in slide-in-from-top-1 duration-150 text-left leading-normal`}>
                          {verificationFeedback}
                       </p>
                    )}
                 </div>

                 <button 
                   type="button"
                   onClick={() => {
                     if (proofMethod === 'photo' && !proofPhotoAttached) {
                       setVerificationFeedback('❌ Image upload timestamp is required.');
                       return;
                     }
                     if (proofMethod === 'signature' && !signedName.trim()) {
                       setVerificationFeedback('❌ Recipient signature name is required.');
                       return;
                     }
                     setVerificationFeedback('✓ Security Proof Accepted! Completing standard delivery...');
                     setTimeout(() => {
                       handleCompleteJob();
                       // reset
                       setNavigationStep(0);
                       setOtpCode('');
                       setProofPhotoAttached(false);
                       setSignedName('');
                       setVerificationFeedback(null);
                     }, 1000);
                   }}
                   className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                 >
                   <CheckCircle2 size={18} /> Mark as Delivered
                 </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                 <span className="text-3xl mb-2">📦</span>
                 <p className="font-bold text-gray-800 text-sm">No active delivery</p>
                 <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Go to the "New Requests" tab to accept an incoming delivery job.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
             <div className="bg-green-600 text-white p-6 rounded-3xl shadow-md text-center relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-sm text-green-100 mb-1">Today's Earnings</p>
                <h2 className="text-4xl font-extrabold font-display mb-4">E {todayEarnings.toFixed(2)}</h2>
                <div className="grid grid-cols-2 gap-4 border-t border-green-500/50 pt-4 mt-2">
                  <div className="border-r border-green-500/35">
                    <p className="text-xs text-green-100">Deliveries</p>
                    <p className="font-bold text-base mt-0.5">{deliveryCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-100">Hours</p>
                    <p className="font-bold text-base mt-0.5">{hoursSpent}h</p>
                  </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Recent Payouts to Wallet</h3>
                <div className="flex flex-col gap-3">
                  {recentPayouts.map((payout, index) => (
                    <div key={`${payout.id}-${index}`} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <DollarSign size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">Delivery {payout.id}</p>
                          <p className="text-[10px] text-gray-500">{payout.time}</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600 text-sm">+E {payout.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
