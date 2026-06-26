import React, { useState, useEffect } from 'react';
import { ArrowLeft, Megaphone, MonitorPlay, Tags, BellRing, PackageSearch, CreditCard, X, CheckCircle2, Landmark, Smartphone, Receipt, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Advertise() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  // Dynamic Ad Bookings state
  const [adBookings, setAdBookings] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('emakethe_my_ad_bookings');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // Admin official billing settings state
  const [adminMomoName, setAdminMomoName] = useState('MaketiConnect Admin');
  const [adminMomoNumber, setAdminMomoNumber] = useState('+268 7611 2233');
  const [adminMomoOperator, setAdminMomoOperator] = useState('MTN MoMo');
  const [adminBankName, setAdminBankName] = useState('Standard Bank Eswatini');
  const [adminBankAccountName, setAdminBankAccountName] = useState('MaketiConnect (PTY) LTD');
  const [adminBankAccountNumber, setAdminBankAccountNumber] = useState('910234451092');
  const [adminBankBranchCode, setAdminBankBranchCode] = useState('663108 (Mbabane)');
  const [adminBankType, setAdminBankType] = useState('Corporate Trust Escrow');

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [payMode, setPayMode] = useState<'momo' | 'bank'>('momo');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  // Load administrative settings
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const docRef = doc(db, 'admins', 'payment_settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.momoName) setAdminMomoName(data.momoName);
          if (data.momoNumber) setAdminMomoNumber(data.momoNumber);
          if (data.momoOperator) setAdminMomoOperator(data.momoOperator);
          if (data.bankName) setAdminBankName(data.bankName);
          if (data.bankAccountName) setAdminBankAccountName(data.bankAccountName);
          if (data.bankAccountNumber) setAdminBankAccountNumber(data.bankAccountNumber);
          if (data.bankBranchCode) setAdminBankBranchCode(data.bankBranchCode);
          if (data.bankType) setAdminBankType(data.bankType);
        }
      } catch (err) {
        console.warn('Could not load administrative payment settings for advertiser:', err);
      }
    };
    fetchBilling();
  }, []);

  const handleCreateAdBooking = async () => {
    if (payMode === 'momo' && (!senderPhone || !senderName)) {
      alert('Please fill in your Sender phone number and Sender name.');
      return;
    }
    if (payMode === 'bank' && (!senderAccount || !senderName || !receiptNumber)) {
      alert('Please fill in your Bank Account Number, Holder Name, and Bank Reference receipt serial.');
      return;
    }

    setIsSubmittingBooking(true);
    
    const pkg = adPackages.find(p => p.id === selectedPackage);
    const amountVal = pkg ? parseFloat(pkg.price.replace(/[^\d.]/g, '')) : 0;
    
    const newBooking = {
      id: `AD-${Math.floor(1000 + Math.random() * 9000)}B`,
      packageId: selectedPackage,
      packageTitle: pkg?.title || 'Custom Ad Package',
      amount: amountVal,
      status: 'Pending Verification',
      reference: payMode === 'momo' 
        ? `${adminMomoOperator} (Sender: ${senderPhone} - ${senderName})`
        : `EFT (${adminBankName} - Receipt: ${receiptNumber})`,
      date: 'Just now',
      createdAt: new Date().toISOString()
    };

    try {
      // Save to global Firestore database
      await setDoc(doc(db, 'ad_bookings', newBooking.id), newBooking);
      
      // Update local storage representation
      const updatedList = [newBooking, ...adBookings];
      setAdBookings(updatedList);
      localStorage.setItem('emakethe_my_ad_bookings', JSON.stringify(updatedList));
      
      setBookingCompleted(true);
    } catch (err) {
      console.error(err);
      alert('Error creating ad booking in database. Proceeding with offline-first sandbox.');
      const updatedList = [newBooking, ...adBookings];
      setAdBookings(updatedList);
      localStorage.setItem('emakethe_my_ad_bookings', JSON.stringify(updatedList));
      setBookingCompleted(true);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const adPackages = [
    {
      id: 'home_banner',
      title: 'Homepage Banners',
      price: 'E 5,000',
      period: '/ month',
      icon: <MonitorPlay className="text-blue-500" size={24} />,
      color: 'blue',
      description: 'Maximum visibility. Feature your brand on the main homepage carousel seen by every visitor.',
      idealFor: 'Supermarkets, Banks, Mobile Operators'
    },
    {
      id: 'category_sponsor',
      title: 'Category Sponsorships',
      price: 'E 2,000',
      period: '/ month',
      icon: <Tags className="text-purple-500" size={24} />,
      color: 'purple',
      description: 'Own a category. E.g., A hardware store appears first in the "Construction & Building" category.',
      idealFor: 'Hardware stores, Insurances, Niche services'
    },
    {
      id: 'sponsored_product',
      title: 'Sponsored Products',
      price: 'E 500',
      period: '/ week',
      icon: <PackageSearch className="text-amber-500" size={24} />,
      color: 'amber',
      description: 'Boost specific products to the top of search results and local community feeds.',
      idealFor: 'Local sellers, Promoters, Events'
    },
    {
      id: 'push_notif',
      title: 'Push Notifications',
      price: 'E 1,500',
      period: '/ broadcast',
      icon: <BellRing className="text-rose-500" size={24} />,
      color: 'rose',
      description: 'Send a direct SMS/Push notification alert to active buyers in a specific region.',
      idealFor: 'Flash sales, Transport companies, Telecoms'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-12 pb-24 px-5 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="flex items-center gap-3 relative z-10 mb-8">
            <button onClick={() => navigate('/')} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform backdrop-blur-md">
               <ArrowLeft size={18} className="text-white" />
            </button>
            <h1 className="text-lg font-black tracking-tight">Business Advertising</h1>
         </div>

         <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center mb-4">
               <Megaphone size={28} className="text-indigo-300" />
            </div>
            <h2 className="text-3xl font-display font-black leading-tight mb-3">
               Reach thousands of local buyers daily.
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed max-w-md font-medium">
               Connect your local business with ready-to-buy customers across Eswatini. Select from our premium enterprise advertising channels below.
            </p>
         </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-20 flex flex-col gap-4">
         {adPackages.map((pkg) => (
            <div 
               key={pkg.id}
               onClick={() => setSelectedPackage(pkg.id)}
               className={`bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer shadow-sm ${selectedPackage === pkg.id ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.02]' : 'border-gray-100 hover:border-indigo-200'}`}
            >
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-2xl bg-${pkg.color}-50`}>
                        {pkg.icon}
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{pkg.title}</h3>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-0.5">Ideal for: {pkg.idealFor}</p>
                     </div>
                  </div>
               </div>
               
               <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {pkg.description}
               </p>

               <div className="flex justify-between items-end">
                  <div>
                     <span className="text-xl font-black font-mono text-gray-900">{pkg.price}</span>
                     <span className="text-[10px] text-gray-500 font-bold ml-1">{pkg.period}</span>
                  </div>
                  {selectedPackage === pkg.id ? (
                     <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Selected
                     </div>
                  ) : (
                     <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                        Select
                     </div>
                  )}
               </div>
            </div>
         ))}

         <div className="mt-4 bg-indigo-50 p-5 rounded-3xl border border-indigo-100 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
               <CreditCard size={20} className="text-indigo-600" />
            </div>
            <h4 className="font-bold text-indigo-900 mb-1">Corporate Billing Available</h4>
            <p className="text-xs text-indigo-700/70 mb-4 max-w-[260px] leading-relaxed">
               Need a custom enterprise package or multi-category sponsorship?
            </p>
            <button 
               className="bg-white border border-indigo-200 text-indigo-700 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:bg-indigo-50 transition-all active:scale-95"
               onClick={() => alert('Contacting Corporate Sales Team...')}
            >
               Contact Sales Team
            </button>
         </div>

         {/* Real-time Advertisement Campaign Bookings list */}
         <div className="mt-6 flex flex-col gap-3 font-sans">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 px-1 flex items-center gap-1.5">
               <Sparkles size={13} className="text-indigo-500" />
               Your Campaign Bookings ({adBookings.length})
            </h3>
            {adBookings.map((b) => (
               <div key={b.id} className="bg-white p-4 rounded-3xl border border-gray-150 shadow-sm flex justify-between items-center animate-in zoom-in-95">
                  <div>
                     <p className="font-extrabold text-xs text-slate-800">{b.packageTitle}</p>
                     <p className="text-[9.5px] text-gray-500 mt-1 uppercase font-semibold">Ref: {b.reference}</p>
                     <p className="text-[9px] text-gray-400 mt-0.5">{b.date}</p>
                  </div>
                  <div className="text-right">
                     <span className="text-xs font-mono font-extrabold text-slate-800 block">E {b.amount?.toFixed(2)}</span>
                     <span className={`text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase mt-1 inline-block ${
                        b.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                     }`}>
                        {b.status}
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {selectedPackage && (
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-50 animate-in slide-in-from-bottom-4 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="max-w-lg w-full flex items-center gap-4">
               <div className="flex-1">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</span>
                  <span className="block text-lg font-black font-mono text-gray-900">
                     {adPackages.find(p => p.id === selectedPackage)?.price}
                  </span>
               </div>
               <button 
                  onClick={() => {
                     setBookingCompleted(false);
                     setShowCheckoutModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex-1 text-center cursor-pointer"
               >
                  Proceed to Payment
               </button>
            </div>
         </div>
      )}

      {/* Interactive Advertiser Booking Modal */}
      {showCheckoutModal && (
         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 w-full h-full max-w-md mx-auto">
            <div className="bg-white w-full rounded-t-[36px] rounded-b-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col max-h-[85vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-5 shrink-0">
                  <div>
                     <h3 className="font-black text-gray-800 text-base uppercase tracking-tight flex items-center gap-1.5 font-sans">
                        📢 Book Ad Campaign
                     </h3>
                     <p className="text-[10px] text-gray-500 font-medium font-sans">Pay official administrator account to live-boost your reach</p>
                  </div>
                  <button onClick={() => setShowCheckoutModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-500 cursor-pointer">
                     <X size={16} />
                  </button>
               </div>

               {bookingCompleted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center font-sans">
                     <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-150 animate-bounce">
                        <CheckCircle2 size={36} className="text-green-600 stroke-[2.5]" />
                     </div>
                     <h4 className="font-black text-slate-850 text-base uppercase tracking-tight">Yebo! Order Submitted</h4>
                     <p className="text-xs text-gray-500 max-w-[280px] mt-1.5 leading-relaxed">
                        Your advertising request has been submitted to the MaketiConnect Administrator. We will review your payment receipt reference and make the campaign **Active** within 2 hours!
                     </p>
                     <button 
                        onClick={() => setShowCheckoutModal(false)}
                        className="mt-6 w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                     >
                        Done & Continue
                     </button>
                  </div>
               ) : (
                  <div className="flex flex-col gap-4 font-sans text-left">
                     <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-150 text-xs flex justify-between items-center">
                        <div>
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Chosen Channel</span>
                           <strong className="text-slate-850 text-[13px]">{adPackages.find(p => p.id === selectedPackage)?.title}</strong>
                        </div>
                        <span className="font-mono font-black text-indigo-600 text-sm">
                           {adPackages.find(p => p.id === selectedPackage)?.price}
                        </span>
                     </div>

                     {/* Payment Method Switcher */}
                     <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-[10.5px] font-bold">
                        <button 
                           type="button"
                           onClick={() => setPayMode('momo')}
                           className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${payMode === 'momo' ? 'bg-white text-indigo-700 shadow-sm font-extrabold' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           <Smartphone size={13} /> Mobile Money
                        </button>
                        <button 
                           type="button"
                           onClick={() => setPayMode('bank')}
                           className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${payMode === 'bank' ? 'bg-white text-indigo-700 shadow-sm font-extrabold' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           <Landmark size={13} /> Bank Transfer (EFT)
                        </button>
                     </div>

                     {/* Official Billing Details Card */}
                     <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-4 rounded-2xl border border-indigo-500/20 text-xs leading-normal text-slate-700 flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block mb-1">Make Payment to Admin:</span>
                        
                        {payMode === 'momo' ? (
                           <>
                              <div className="flex justify-between items-center pb-1 border-b border-gray-150/50">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Operator</span>
                                 <span className="font-extrabold text-slate-800">{adminMomoOperator}</span>
                              </div>
                              <div className="flex justify-between items-center pb-1 border-b border-gray-150/50">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Account Name</span>
                                 <span className="font-black text-slate-800">{adminMomoName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Admin MoMo Number</span>
                                 <span className="font-mono font-black text-slate-800">{adminMomoNumber}</span>
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="flex justify-between items-center pb-1 border-b border-gray-150/50">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Bank</span>
                                 <span className="font-extrabold text-slate-800">{adminBankName}</span>
                              </div>
                              <div className="flex justify-between items-center pb-1 border-b border-gray-150/50">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Account Name</span>
                                 <span className="font-black text-slate-800">{adminBankAccountName}</span>
                              </div>
                              <div className="flex justify-between items-center pb-1 border-b border-gray-150/50">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Account Number</span>
                                 <span className="font-mono font-black text-slate-800">{adminBankAccountNumber}</span>
                              </div>
                              <div className="flex justify-between items-center pb-1 border-b border-gray-150/50">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Branch Code</span>
                                 <span className="font-mono font-semibold text-slate-800">{adminBankBranchCode}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[9.5px] text-gray-400 font-bold uppercase">Account Type</span>
                                 <span className="font-bold text-slate-850">{adminBankType}</span>
                              </div>
                           </>
                        )}
                     </div>

                     {/* Sender Proof Reference Inputs */}
                     <div className="flex flex-col gap-3 mt-1">
                        <p className="text-[10px] text-gray-400 leading-snug">
                           Transfer the exact amount to the details above, then enter your payment details below to submit verification reference.
                        </p>

                        <div className="flex flex-col gap-1">
                           <label className="text-[10px] text-gray-600 font-bold uppercase">Your Business / Sender Name:</label>
                           <input 
                              type="text"
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="e.g. Store Marketing Ltd"
                              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none"
                           />
                        </div>

                        {payMode === 'momo' ? (
                           <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-gray-600 font-bold uppercase">Your MoMo Phone Number:</label>
                              <input 
                                 type="text"
                                 value={senderPhone}
                                 onChange={(e) => setSenderPhone(e.target.value)}
                                 placeholder="e.g. 7611 2233"
                                 className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none font-mono"
                              />
                           </div>
                        ) : (
                           <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                 <label className="text-[10px] text-gray-600 font-bold uppercase">Your Bank Acc #:</label>
                                 <input 
                                    type="text"
                                    value={senderAccount}
                                    onChange={(e) => setSenderAccount(e.target.value)}
                                    placeholder="e.g. 102049219"
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none font-mono"
                                 />
                              </div>
                              <div className="flex flex-col gap-1">
                                 <label className="text-[10px] text-gray-600 font-bold uppercase">EFT Ref / Receipt Serial:</label>
                                 <input 
                                    type="text"
                                    value={receiptNumber}
                                    onChange={(e) => setReceiptNumber(e.target.value)}
                                    placeholder="e.g. EFT-940210"
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none font-mono"
                                 />
                              </div>
                           </div>
                        )}

                        <button 
                           onClick={handleCreateAdBooking}
                           disabled={isSubmittingBooking}
                           className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold uppercase text-xs py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex justify-center items-center gap-1.5"
                        >
                           {isSubmittingBooking ? 'Submitting Receipt...' : '🚀 Submit Verification Receipt'}
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      )}
   </div>
  );
}
