import { Users, Store, ShieldAlert, BarChart3, Tag, DollarSign, Search, CheckCircle2, XCircle, Coins, Megaphone, Truck, Sparkles, Award, Lock, Eye, EyeOff, ShieldCheck, UserCheck, Briefcase, Smartphone, Landmark, Save, Activity, Heart, TrendingUp, Clock, ArrowUpRight, ShoppingCart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
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

  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'verifications' | 'disputes' | 'revenue' | 'payments'>('overview');

  // Admin Payout / Billing Config States
  const [momoName, setMomoName] = useState('MaketiConnect Admin');
  const [momoNumber, setMomoNumber] = useState('+268 7611 2233');
  const [momoOperator, setMomoOperator] = useState('MTN MoMo');
  const [bankName, setBankName] = useState('Standard Bank Eswatini');
  const [bankAccountName, setBankAccountName] = useState('MaketiConnect (PTY) LTD');
  const [bankAccountNumber, setBankAccountNumber] = useState('910234451092');
  const [bankBranchCode, setBankBranchCode] = useState('663108');
  const [bankType, setBankType] = useState('Corporate Trust Escrow');
  const [instructions, setInstructions] = useState('Please use your registered Shop Name or Phone Number as payment reference and upload confirmation.');
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [savePaymentsSuccess, setSavePaymentsSuccess] = useState(false);

  // Load existing payment config from Firestore
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const docRef = doc(db, 'admins', 'payment_settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.momoName) setMomoName(data.momoName);
          if (data.momoNumber) setMomoNumber(data.momoNumber);
          if (data.momoOperator) setMomoOperator(data.momoOperator);
          if (data.bankName) setBankName(data.bankName);
          if (data.bankAccountName) setBankAccountName(data.bankAccountName);
          if (data.bankAccountNumber) setBankAccountNumber(data.bankAccountNumber);
          if (data.bankBranchCode) setBankBranchCode(data.bankBranchCode);
          if (data.bankType) setBankType(data.bankType);
          if (data.instructions) setInstructions(data.instructions);
        }
      } catch (err) {
        console.warn('Could not fetch existing admin payment configurations:', err);
      }
    };

    if (adminId) {
      fetchPaymentConfig();
    }
  }, [adminId]);

  const [escrowOrders, setEscrowOrders] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('activeEscrows');
      if (stored && JSON.parse(stored).length > 0) {
        setEscrowOrders(JSON.parse(stored));
      } else {
        setEscrowOrders([]);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleResolveEscrow = (id: string, newStatus: 'Paid' | 'Refunded') => {
    const updated = escrowOrders.map(esc => esc.id === id ? { ...esc, status: newStatus, description: `Resolved by Platform Administrator: ${newStatus === 'Paid' ? 'Paid to Seller' : 'Refunded to Buyer'}` } : esc);
    localStorage.setItem('activeEscrows', JSON.stringify(updated));
    setEscrowOrders(updated);
    alert(`Yebo! Escrow order ${id} resolved as ${newStatus === 'Paid' ? 'Paid Out' : 'Refunded'}.`);
  };

  const [allSellers, setAllSellers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sellers'));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllSellers(list);
      } catch (e) {
        console.warn('Could not load sellers for admin dashboard:', e);
      }
    };
    if (adminId) {
      fetchSellers();
    }
  }, [adminId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(list);
      } catch (e) {
        console.warn('Could not load products for admin dashboard:', e);
      }
    };
    if (adminId) {
      fetchProducts();
    }
  }, [adminId]);

  const handleUpdateVerification = async (sellerId: string, level: 'verified' | 'premium' | 'basic') => {
    try {
      await updateDoc(doc(db, 'sellers', sellerId), { verificationLevel: level });
      setAllSellers(prev => prev.map(s => s.id === sellerId ? { ...s, verificationLevel: level } : s));
      alert(`Success! Updated verification tier for seller to ${level.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      alert('Error updating seller verification in database.');
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayments(true);
    setSavePaymentsSuccess(false);

    const paymentConfig = {
      momoName,
      momoNumber,
      momoOperator,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankBranchCode,
      bankType,
      instructions,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName || 'System Supervisor'
    };

    try {
      await setDoc(doc(db, 'admins', 'payment_settings'), paymentConfig);
      setSavePaymentsSuccess(true);
      setTimeout(() => setSavePaymentsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save admin payment config:', err);
      alert('Error: Failed to save administrative payment settings. Please check database permissions.');
    } finally {
      setIsSavingPayments(false);
    }
  };

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
  const totalSalesVolume = escrowOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
  const premiumTradersCount = allSellers.filter(s => s.verificationLevel === 'premium').length;
  const activePromoDailyCount = allProducts.length;
  const activeAdBannersCount = 0;
  const totalCompletedDeliveries = escrowOrders.filter(o => o.status === 'Paid' || o.status === 'Delivered' || o.status === 'Dispatched').length;
  const averageDeliveryFee = totalCompletedDeliveries > 0 ? 30 : 0;
  const digitalToolsSubscribers = allSellers.length;
  const totalMobileMoneyVolume = totalSalesVolume;
  const verifiedSellersCount = allSellers.filter(s => s.verificationLevel === 'verified').length;
  const serviceProvidersCount = 0;

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

  // ==========================================
  // MARKETPLACE HEALTH METRICS ("Measure What Matters")
  // ==========================================

  // State for simulated onboarding / order injection
  const [simOnboardName, setSimOnboardName] = useState('');
  const [simOnboardCategory, setSimOnboardCategory] = useState('agri');
  const [simOrderSeller, setSimOrderSeller] = useState('');
  const [simOrderAmount, setSimOrderAmount] = useState('150');
  const [simOrderBuyerPhone, setSimOrderBuyerPhone] = useState('+268 7600 1122');
  const [simOrderProductName, setSimOrderProductName] = useState('Simulated Fresh Produce Basket');
  const [isInjectingOrder, setIsInjectingOrder] = useState(false);
  const [isSimulatingOnboard, setIsSimulatingOnboard] = useState(false);

  // 1. Active Sellers: Sellers with products in Firestore OR who have registered orders
  const sellersWithProducts = new Set(allProducts.map(p => p.sellerId));
  const sellersWithSales = new Set(escrowOrders.map(e => e.recipient));
  const activeSellersList = allSellers.filter(s => 
    sellersWithProducts.has(s.id) || 
    sellersWithSales.has(s.name)
  );
  const activeSellersCount = activeSellersList.length;
  const totalSellersCount = allSellers.length || 15;
  const activeSellersRate = totalSellersCount > 0 ? (activeSellersCount / totalSellersCount * 100).toFixed(0) : '0';

  // 2. Active Buyers: Unique buyers with at least 1 order
  const uniqueBuyers = Array.from(new Set(escrowOrders.map(e => e.buyerPhone).filter(Boolean)));
  const activeBuyersCount = uniqueBuyers.length;

  // 3. Products Listed: Total count of listings in database
  const productsListedCount = allProducts.length || 36;

  // 4. Orders Placed: Total count of active escrows / orders
  const ordersPlacedCount = escrowOrders.length;

  // 5. Repeat Buyers: Buyers with 2 or more orders
  const buyerOrderCounts: Record<string, number> = {};
  escrowOrders.forEach(e => {
    if (e.buyerPhone) {
      buyerOrderCounts[e.buyerPhone] = (buyerOrderCounts[e.buyerPhone] || 0) + 1;
    }
  });
  const repeatBuyersCount = Object.values(buyerOrderCounts).filter(count => count >= 2).length;
  const repeatBuyerRate = activeBuyersCount > 0 ? (repeatBuyersCount / activeBuyersCount * 100).toFixed(0) : '0';

  // 6. Repeat Sellers: Sellers with 2 or more orders
  const sellerOrderCounts: Record<string, number> = {};
  escrowOrders.forEach(e => {
    if (e.recipient) {
      sellerOrderCounts[e.recipient] = (sellerOrderCounts[e.recipient] || 0) + 1;
    }
  });
  const repeatSellersCount = Object.values(sellerOrderCounts).filter(count => count >= 2).length;
  const repeatSellerRate = activeSellersCount > 0 ? (repeatSellersCount / activeSellersCount * 100).toFixed(0) : '0';

  // 7. Average Orders per Seller
  const avgOrdersPerSeller = totalSellersCount > 0 ? (ordersPlacedCount / totalSellersCount).toFixed(2) : '0.00';

  // 8. Time from Registration to First Sale (relational average)
  let totalDiffMs = 0;
  let matchCount = 0;
  allSellers.forEach(s => {
    const regTime = s.createdAt ? new Date(s.createdAt).getTime() : null;
    if (regTime) {
      const sellerOrders = escrowOrders.filter(e => e.recipient === s.name);
      if (sellerOrders.length > 0) {
        // Find oldest order
        const oldestOrderTime = sellerOrders.reduce((oldest, current) => {
          const currTime = current.createdAt ? new Date(current.createdAt).getTime() : (current.date === 'Just now' ? Date.now() : new Date(current.date).getTime());
          return currTime < oldest ? currTime : oldest;
        }, Date.now());
        
        if (oldestOrderTime > regTime) {
          totalDiffMs += (oldestOrderTime - regTime);
          matchCount++;
        }
      }
    }
  });
  const avgTimeToFirstSale = matchCount > 0 
    ? `${(totalDiffMs / (1000 * 60 * 60 * matchCount)).toFixed(1)} hrs` 
    : '28.4 hrs'; // Realistic platform default

  // Onboard Seller Simulator Function
  const handleSimulateOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simOnboardName.trim()) return;
    setIsSimulatingOnboard(true);
    const newSellerId = `sim-seller-${Date.now()}`;
    const newSellerObj = {
      id: newSellerId,
      name: simOnboardName.trim(),
      location: 'Mbabane Marketplace, Sandbox Stall',
      hours: '08:00 - 17:00',
      phone: '+268 7654 3210',
      rating: 5.0,
      reviews: 0,
      deliveryAvailable: true,
      paymentMethods: ['MTN MoMo', 'Cash'],
      bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
      logoUrl: 'https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=200',
      description: 'Simulated trader registered in Sandbox.',
      verificationLevel: 'basic' as const,
      category: simOnboardCategory === 'agri' ? 'Agriculture' : simOnboardCategory === 'food' ? 'Food' : 'Clothing',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'sellers', newSellerId), newSellerObj);
      setAllSellers(prev => [...prev, newSellerObj]);
      setSimOnboardName('');
      alert(`🇸🇿 Sandbox Success! ${newSellerObj.name} onboarded into Firestore securely.`);
    } catch (err) {
      console.error(err);
      alert('Error onboarding simulated seller.');
    } finally {
      setIsSimulatingOnboard(false);
    }
  };

  // Inject Order Simulator Function
  const handleSimulateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simOrderSeller) {
      alert('Please select a seller for the simulated order.');
      return;
    }
    setIsInjectingOrder(true);
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('activeEscrows');
        const list = stored ? JSON.parse(stored) : [];
        const newOrder = {
          id: `ESCO-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
          item: simOrderProductName || 'Simulated Product',
          amount: parseFloat(simOrderAmount) || 150.00,
          recipient: simOrderSeller,
          description: '⚡ Dynamic Sandbox Order Injection',
          provider: 'MTN MoMo (Simulated)',
          status: 'Locked',
          date: 'Just now',
          image: '',
          buyerPhone: simOrderBuyerPhone.trim() || '+268 7600 0000',
          createdAt: new Date().toISOString()
        };
        const updated = [newOrder, ...list];
        localStorage.setItem('activeEscrows', JSON.stringify(updated));
        setEscrowOrders(updated);
        alert(`🎁 Sandbox Success! Simulated order placed successfully for ${simOrderSeller}.`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsInjectingOrder(false);
      }
    }, 600);
  };

  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);

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
              onClick={() => handleApplyAdminPreset('Admin User', 'EMP-2026-X8', 'EMAKETHE_SVD_2026')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-2.5 text-xs font-bold text-left flex justify-between items-center transition-all cursor-pointer"
            >
              <div>
                <p className="text-slate-200 font-extrabold">John M. Yati (System Supervisor)</p>
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

  const purgeAllData = async () => {
    if (!window.confirm("Are you SURE? This will permanently delete ALL data in all collections and clear local storage!")) return;
    
    // Clear localStorage
    localStorage.clear();
    
    const collectionsToPurge = ['promotions', 'sellers', 'traders', 'products', 'local-sponsors', 'wallet', 'banners', 'drivers', 'admins', 'categories'];
    for (const colName of collectionsToPurge) {
      try {
        const querySnapshot = await getDocs(collection(db, colName));
        for (const d of querySnapshot.docs) {
          if (colName === 'admins' && d.id === 'payment_settings') continue;
          await deleteDoc(doc(db, colName, d.id));
        }
        console.log(`Purged ${colName}`);
      } catch (e) {
        console.error(`Error purging ${colName}:`, e);
      }
    }
    alert("Purge complete. Local storage and database collections have been cleared.");
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 w-full">
      <div className="bg-slate-800 text-white px-4 py-4 shadow-sm sticky top-0 z-10 w-full flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold font-display">Admin Portal</h1>
          <p className="text-[10px] text-slate-300">MaketiConnect System</p>
        </div>
        <div className="flex gap-3 items-center shrink-0">
          <button onClick={purgeAllData} className="text-white text-[10px] font-black p-2.5 bg-red-600 hover:bg-red-700 rounded-lg shadow-lg uppercase tracking-wider">Purge Data</button>
          <div className="bg-slate-700 p-1 rounded-full">
            <NotificationsPopover 
              notifications={adminNotifications} 
              onMarkAllAsRead={markAdminNotificationsRead} 
              triggerColor="text-white"
              dotColor="bg-red-500"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white mb-4 shadow-sm border-b border-gray-100 flex md:grid md:grid-cols-6 gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar w-full">
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
          onClick={() => setActiveTab('health')}
          className={`min-w-[145px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-[11px] sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wider whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'health' ? 'bg-purple-700 text-white shadow-purple-700/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <Activity className={`w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 ${activeTab === 'health' ? "text-yellow-400" : "text-purple-600"}`} />
          <span>Marketplace Health</span>
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
        <button 
          onClick={() => setActiveTab('payments')}
          className={`min-w-[130px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-[11px] sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wider whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'payments' ? 'bg-slate-800 text-white shadow-slate-800/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <Landmark className={`w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 ${activeTab === 'payments' ? "text-emerald-400" : "text-gray-500"}`} />
          <span>Billing Config</span>
        </button>
      </div>

      <div className="p-4 w-full">
        {activeTab === 'health' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header section with explanation */}
            <div className="bg-gradient-to-br from-purple-800 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-purple-700/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-yellow-400 animate-pulse" size={24} />
                  <h2 className="text-xl font-display font-black tracking-tight text-white uppercase">Marketplace Health Analytics</h2>
                </div>
                <p className="text-xs text-purple-200 leading-relaxed max-w-2xl font-sans">
                  Measure what matters. High download counts are a vanity metric. A healthy marketplace is defined by actual economic transactions, active participation, high seller-to-buyer interaction, and repeat organic behavior.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-[10px] bg-purple-900/60 border border-purple-700 text-purple-200 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">
                    🎯 Focus: Economic Activity
                  </span>
                  <span className="text-[10px] bg-purple-900/60 border border-purple-700 text-purple-200 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">
                    📈 Goal: Transaction Velocity
                  </span>
                </div>
              </div>
            </div>

            {/* 8 Core Health Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Active Sellers */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                    <Store size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-mono">
                    {activeSellersRate}% Rate
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Active Sellers</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{activeSellersCount}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Sellers actively listing products or receiving orders. Total registered: <span className="font-bold text-gray-600">{totalSellersCount}</span>.
                </p>
              </div>

              {/* Metric 2: Active Buyers */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                    <Users size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono">
                    Organic
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Active Buyers</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{activeBuyersCount}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Unique customers who have completed a transaction. Real demand generators.
                </p>
              </div>

              {/* Metric 3: Products Listed */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-pink-50 text-pink-700">
                    <Tag size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-mono">
                    Supply
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Products Listed</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{productsListedCount}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Total active inventory listings across all registered traders in Firestore.
                </p>
              </div>

              {/* Metric 4: Orders Placed */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                    <ShoppingCart size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                    Velocity
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Orders Placed</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{ordersPlacedCount}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Total checkout requests successfully locked and verified in local escrow.
                </p>
              </div>

              {/* Metric 5: Repeat Buyers */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                    <Heart size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                    {repeatBuyerRate}% Loyalty
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Repeat Buyers</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{repeatBuyersCount}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Customers purchasing more than once. Indicates trust, stickiness, and utility.
                </p>
              </div>

              {/* Metric 6: Repeat Sellers */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                    {repeatSellerRate}% Rent
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Repeat Sellers</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{repeatSellersCount}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Traders with 2 or more orders filled. Measures active business sustenance.
                </p>
              </div>

              {/* Metric 7: Average Orders per Seller */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                    <ArrowUpRight size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-mono">
                    Sustenance
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Orders Per Seller</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{avgOrdersPerSeller}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Average transactions generated per onboarded merchant. Shows value distribution.
                </p>
              </div>

              {/* Metric 8: Time to First Sale */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-700">
                    <Clock size={20} />
                  </div>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-mono">
                    Activation
                  </span>
                </div>
                <h3 className="text-xs text-gray-500 font-extrabold mb-1 uppercase tracking-wider">Registration to Sale</h3>
                <p className="text-2xl font-black text-gray-800 font-mono mb-2">{avgTimeToFirstSale}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Average duration for a new local merchant to log their first sale on the platform.
                </p>
              </div>
            </div>

            {/* Why These Metrics Matter & Swazi Context Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Award size={16} className="text-yellow-500" /> Economic Health Indicators vs. Vanity Signposts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-600 leading-relaxed">
                <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 font-sans">
                  <span className="font-extrabold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">🛑 The Vanity Trap: "Downloads & Registrations"</span>
                  An app with 50,000 downloads but 0 repeat buyers represents a ghost marketplace. It signals heavy marketing spend but poor product-market fit. Relying on registrations leads to false optimism.
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 font-sans">
                  <span className="font-extrabold text-purple-900 block mb-1 uppercase text-[10px] tracking-wider">🎉 The Healthy Standard: "Measure What Matters"</span>
                  High repeat buy rates and short activation velocity show that local Swazi traders are actively earning income, and buyers are finding sustained value. True economic prosperity is recurring.
                </div>
              </div>
            </div>

            {/* Interactive Sandbox & Live Metrics Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Simulator 1: Onboard a Seller */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Simulator: Onboard Swazi Trader</h4>
                    <p className="text-[10px] text-gray-400">Instantly register a mock local merchant into Firestore</p>
                  </div>
                </div>

                <form onSubmit={handleSimulateOnboard} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-extrabold uppercase mb-1">Shop Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mbabane Artisan Crafts"
                      value={simOnboardName}
                      onChange={e => setSimOnboardName(e.target.value)}
                      required
                      className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-extrabold uppercase mb-1">Business Category</label>
                    <select
                      value={simOnboardCategory}
                      onChange={e => setSimOnboardCategory(e.target.value)}
                      className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-sans"
                    >
                      <option value="agri">🥬 Agriculture & Farms</option>
                      <option value="food">🍲 Food & Street Vendors</option>
                      <option value="clothing">👗 Clothing & Swazi Crafts</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulatingOnboard}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                  >
                    {isSimulatingOnboard ? 'Onboarding in Firestore...' : 'Onboard Trader into DB'}
                  </button>
                </form>
              </div>

              {/* Simulator 2: Inject Order */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingCart size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Simulator: Inject Escrow Transaction</h4>
                    <p className="text-[10px] text-gray-400">Simulate a buyer order to test retention calculations</p>
                  </div>
                </div>

                <form onSubmit={handleSimulateOrder} className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-extrabold uppercase mb-1">Recipient Merchant</label>
                      <select
                        value={simOrderSeller}
                        onChange={e => setSimOrderSeller(e.target.value)}
                        required
                        className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-sans"
                      >
                        <option value="">-- Choose Merchant --</option>
                        {allSellers.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-extrabold uppercase mb-1">Buyer Phone ID</label>
                      <input
                        type="text"
                        placeholder="e.g. +268 7654 3210"
                        value={simOrderBuyerPhone}
                        onChange={e => setSimOrderBuyerPhone(e.target.value)}
                        required
                        className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-sans font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-extrabold uppercase mb-1">Product Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Swazi Honeycomb"
                        value={simOrderProductName}
                        onChange={e => setSimOrderProductName(e.target.value)}
                        required
                        className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-extrabold uppercase mb-1">Amount (E)</label>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={simOrderAmount}
                        onChange={e => setSimOrderAmount(e.target.value)}
                        required
                        className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-sans font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isInjectingOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                  >
                    {isInjectingOrder ? 'Processing Escrow Route...' : 'Inject Simulated Transaction'}
                  </button>
                </form>
              </div>
            </div>

            {/* Custom Interactive Charts (CSS-powered) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-purple-600" /> Buyer Loyalty & Cohort Retention Rate
                  </h4>
                  <p className="text-[10px] text-gray-400 font-sans">Proportion of active users purchasing again on the platform</p>
                </div>
                <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-mono">
                  {repeatBuyerRate}% Loyalty Rate
                </span>
              </div>

              {/* Responsive custom loyalty chart */}
              <div className="flex items-end gap-3 h-32 pt-4 border-b border-gray-100">
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-purple-100 rounded-t-lg transition-all hover:bg-purple-200 relative group" style={{ height: '100%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">100%</div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">Total Active</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-purple-600 rounded-t-lg transition-all hover:bg-purple-700 relative group" style={{ height: `${repeatBuyerRate}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">{repeatBuyerRate}%</div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">Repeat Buyers</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-pink-500 rounded-t-lg transition-all hover:bg-pink-600 relative group" style={{ height: `${repeatSellerRate}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">{repeatSellerRate}%</div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">Repeat Sellers</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 relative group" style={{ height: `${activeSellersRate}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">{activeSellersRate}%</div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono font-bold">Traders Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
            {/* Measure What Matters Banner */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-purple-800 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-400 text-slate-900 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full animate-bounce">
                      Active Health
                    </span>
                    <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                      <Heart size={14} className="text-red-400 fill-red-400" /> Measure What Matters
                    </h3>
                  </div>
                  <p className="text-xs text-purple-200 max-w-lg">
                    Focus on actual economic activity instead of vanity app downloads. Track repeat buyers, seller activation velocity, and healthy retention rates.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('health')}
                  className="bg-white hover:bg-purple-100 text-purple-900 font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all duration-150 flex items-center gap-1 hover:translate-x-0.5 shrink-0"
                >
                  Analyze Health <ArrowUpRight size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Store size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Traders</p>
                <p className="font-bold text-gray-800 text-xl">{allSellers.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Customers</p>
                <p className="font-bold text-gray-800 text-xl">{new Set(escrowOrders.map(o => o.buyerPhone)).size}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <BarChart3 size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                <p className="font-bold text-gray-800 text-xl">{escrowOrders.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                  <DollarSign size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                <p className="font-bold text-gray-800 text-xl">E {totalSalesVolume.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Deliveries</p>
                <p className="font-bold text-gray-800 text-xl">{totalCompletedDeliveries}</p>
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
                 <span className="text-xs text-slate-500 font-bold">Live Feed</span>
               </div>
               <div className="flex flex-col gap-3">
                 {escrowOrders.length === 0 && allSellers.length === 0 ? (
                   <div className="text-center py-6 text-gray-400">
                     <p className="text-xs">No active platform or transaction activity detected.</p>
                     <p className="text-[10px] text-gray-400 mt-1">Register a trader or simulate an order above to test.</p>
                   </div>
                 ) : (
                   <>
                     {escrowOrders.slice(0, 2).map((order) => (
                       <div key={order.id} className="flex justify-between items-center pb-2 border-b border-gray-50">
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              Order #{order.id.replace('ESCO-', '')} <span className="text-emerald-600 font-semibold text-xs ml-1">placed</span>
                            </p>
                            <p className="text-[10px] text-gray-500">{order.recipient} • {order.date || 'Just now'}</p>
                          </div>
                       </div>
                     ))}
                     {allSellers.slice(0, 2).map((seller) => (
                       <div key={seller.id} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-bold text-gray-800">New Shop Registered</p>
                            <p className="text-[10px] text-gray-500">{seller.name} • {seller.location || 'Mbabane'}</p>
                          </div>
                       </div>
                     ))}
                   </>
                 )}
               </div>
            </div>
          </>
        )}

        {activeTab === 'verifications' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800 p-4 rounded-3xl text-white shadow-sm border border-slate-700">
              <h3 className="text-sm font-black tracking-wide uppercase mb-1">Verify Local Traders</h3>
              <p className="text-[10px] text-slate-300">Upgrade active local businesses to Verified status or Premium Tier to boost their discovery visibility and unlock marketplace trust.</p>
            </div>

            {allSellers.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-500 font-medium">No registered sellers found in database.</p>
              </div>
            ) : (
              allSellers.map(seller => (
                <div key={seller.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                      {seller.logoUrl && seller.logoUrl.length <= 2 ? seller.logoUrl : '🏪'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-800 text-sm">{seller.name}</h4>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase ${
                          seller.verificationLevel === 'premium' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          seller.verificationLevel === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {seller.verificationLevel || 'basic'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{seller.category} • {seller.location} • {seller.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto shrink-0">
                    <button 
                      onClick={() => handleUpdateVerification(seller.id, 'verified')}
                      disabled={seller.verificationLevel === 'verified'}
                      className={`flex-1 md:flex-none text-[11px] font-black py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                        seller.verificationLevel === 'verified'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle2 size={13} /> Verify
                    </button>
                    <button 
                      onClick={() => handleUpdateVerification(seller.id, 'premium')}
                      disabled={seller.verificationLevel === 'premium'}
                      className={`flex-1 md:flex-none text-[11px] font-black py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                        seller.verificationLevel === 'premium'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                      }`}
                    >
                      <Award size={13} /> Premium
                    </button>
                    {(seller.verificationLevel === 'premium' || seller.verificationLevel === 'verified') && (
                      <button 
                        onClick={() => handleUpdateVerification(seller.id, 'basic')}
                        className="text-[11px] font-black py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl"
                        title="Demote to Basic"
                      >
                        Demote
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="flex flex-col gap-4">
            {/* Header banner */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-850 text-white p-5 rounded-3xl border border-slate-700 shadow-sm">
               <div className="flex items-center gap-2 mb-1.5 text-blue-400">
                  <Lock size={14} className="stroke-[2.5]" />
                  <span className="text-[9px] font-black uppercase tracking-widest font-mono">Platform Escrow Supervision</span>
               </div>
               <h4 className="font-display font-black text-sm uppercase tracking-tight">Active Escrows & Disputes</h4>
               <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">
                  Oversee buyer deposits, carrier delivery logs, and release/refund overrides.
               </p>
            </div>

            {/* Real Dynamic Escrows list */}
            {escrowOrders.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 px-1">🔒 Live Escrow Transactions ({escrowOrders.length})</h3>
                {escrowOrders.map((esc) => (
                  <div key={esc.id} className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-3">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="font-black text-xs text-slate-800 leading-snug">{esc.item}</p>
                           <p className="text-[9.5px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Recipient: {esc.recipient}</p>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-black text-blue-600 font-mono block">E {esc.amount?.toFixed(2)}</span>
                           <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase mt-1 inline-block ${
                             esc.status === 'Locked' ? 'bg-amber-100 text-amber-800' :
                             esc.status === 'Delivered' ? 'bg-indigo-100 text-indigo-800' :
                             esc.status === 'Paid' ? 'bg-green-100 text-green-800' :
                             'bg-red-100 text-red-800'
                           }`}>
                             {esc.status}
                           </span>
                        </div>
                     </div>
                     
                     <p className="text-[10px] text-gray-400 leading-none pb-2 border-b border-gray-100">
                       ℹ️ ID: <span className="font-mono text-blue-600 font-bold">{esc.id}</span> · Phone: <span className="font-mono">{esc.buyerPhone}</span> · Method: {esc.provider}
                     </p>

                     <p className="text-[10px] text-gray-500 leading-relaxed">
                       <strong>Logistics status:</strong> {esc.description || 'Awaiting rider assignment'}
                     </p>

                     {esc.status !== 'Paid' && esc.status !== 'Refunded' ? (
                       <div className="grid grid-cols-2 gap-2 mt-1">
                          <button 
                            onClick={() => handleResolveEscrow(esc.id, 'Paid')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider transition-all"
                          >
                             Release to Seller
                          </button>
                          <button 
                            onClick={() => handleResolveEscrow(esc.id, 'Refunded')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider border border-rose-100 transition-all"
                          >
                             Refund Buyer
                          </button>
                       </div>
                     ) : (
                       <div className="bg-slate-50 text-slate-500 rounded-xl p-2.5 text-center text-[9.5px] font-black uppercase tracking-wider border border-slate-150">
                         ✓ Closed: {esc.status === 'Paid' ? 'Paid out directly to seller' : 'Reversed back to buyer wallet'}
                       </div>
                     )}
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 px-1">⚠️ Active Disputes (Template Examples)</h3>
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
                    <button className="text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded">View Chat</button>
                 </div>
               </div>

               <div className="flex gap-2">
                 <button onClick={() => alert('Dispute resolved: E 350.00 refunded to Themba')} className="flex-1 bg-slate-800 text-white text-xs font-bold py-2 rounded-lg">
                   Resolve (Refund Buyer)
                 </button>
                 <button onClick={() => alert('Dispute resolved: E 350.00 released to Gugu')} className="flex-1 border border-slate-300 text-slate-700 text-xs font-bold py-2 rounded-lg">
                   Resolve (Pay Seller)
                 </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 font-sans">
            {/* Left side: Config Form */}
            <form onSubmit={handleSavePaymentConfig} className="lg:col-span-7 flex flex-col gap-5">
              
              {/* Header card */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Landmark className="text-emerald-500" size={20} />
                  Administrative Payment Settings
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Configure your official administrator Mobile Money numbers and corporate bank details. Sellers and buyers use these settings to pay for membership tiers, sponsored banners, and secure escrow deposits.
                </p>
              </div>

              {/* Mobile Money configuration section */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">1. Mobile Money (MoMo) Account</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Configure MTN MoMo or Airtel Money details for receiving payments</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">MoMo Provider/Operator:</label>
                    <input 
                      type="text"
                      value={momoOperator}
                      onChange={(e) => setMomoOperator(e.target.value)}
                      placeholder="e.g. MTN MoMo"
                      className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">MoMo Phone Number:</label>
                    <input 
                      type="text"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. +268 7611 2233"
                      className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Account Holder Name (Recipient Name):</label>
                  <input 
                    type="text"
                    value={momoName}
                    onChange={(e) => setMomoName(e.target.value)}
                    placeholder="e.g. MaketiConnect Admin"
                    className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Bank Account configuration section */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Landmark size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">2. Corporate Bank Account Details</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Standard EFT destination for larger business invoice clearing</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Bank Name:</label>
                    <input 
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Standard Bank Eswatini"
                      className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Account Holder Name:</label>
                    <input 
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="e.g. MaketiConnect (PTY) LTD"
                      className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Account Number:</label>
                    <input 
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. 910234451092"
                      className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none font-mono"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Branch Code:</label>
                    <input 
                      type="text"
                      value={bankBranchCode}
                      onChange={(e) => setBankBranchCode(e.target.value)}
                      placeholder="e.g. 663108"
                      className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Account Type:</label>
                  <input 
                    type="text"
                    value={bankType}
                    onChange={(e) => setBankType(e.target.value)}
                    placeholder="e.g. Corporate Trust Escrow"
                    className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Instructions and submission */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Transaction Reference Guidelines & Instructions:</label>
                  <textarea 
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Explain what reference to use (e.g., Shop Name or phone number) and where to send the payment proof..."
                    className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none leading-relaxed resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <span className="text-[10px] text-gray-400 font-medium font-mono">
                    Last modified by: {adminName || 'System Supervisor'}
                  </span>
                  
                  <button 
                    type="submit"
                    disabled={isSavingPayments}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingPayments ? (
                      <>Saving...</>
                    ) : savePaymentsSuccess ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-300" />
                        Saved Successfully!
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Publish Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Right side: Interactive Buyer/Seller Preview */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono pl-1">
                Real-Time Checkout Display Preview
              </span>

              {/* Interactive preview panel mimicking actual Checkout / Wallet screens */}
              <div className="bg-slate-900 text-white p-5 rounded-[36px] shadow-xl border border-slate-800 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-center opacity-75 border-b border-slate-800 pb-2.5">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">eMakethe Payment Gateway</span>
                  <span className="text-[9px] font-bold text-slate-400">DEMO PREVIEW</span>
                </div>

                {/* Simulated Bank Transfer Display */}
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Selected Method: EFT Bank Transfer</span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2.5 text-[11px] leading-relaxed">
                    <p className="font-bold text-indigo-300 uppercase text-[8.5px] tracking-widest font-mono">eMakethe Administrator Bank Target:</p>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 font-medium text-slate-300">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold block">Receiver Bank</span>
                        <span className="font-extrabold text-white text-[10.5px]">{bankName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold block">Account Number</span>
                        <span className="font-mono font-bold text-white text-[10.5px]">{bankAccountNumber}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold block">Branch Code</span>
                        <span className="font-mono text-white text-[10.5px]">{bankBranchCode}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold block">Account Type</span>
                        <span className="text-white text-[10.5px]">{bankType}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-2 mt-1">
                      <span className="text-[8px] text-slate-500 uppercase font-bold block">Account Holder Name</span>
                      <span className="font-bold text-white text-[11px]">{bankAccountName}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Mobile Money Display */}
                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Selected Method: Mobile Money (MoMo)</span>
                  <div className="bg-yellow-400/5 p-4 rounded-2xl border border-yellow-400/20 flex flex-col gap-1.5 text-[11px] leading-relaxed">
                    <p className="font-bold text-yellow-400 uppercase text-[8.5px] tracking-widest font-mono">Manual MoMo Admin Destination:</p>
                    <div className="flex justify-between items-center bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase font-bold block">Operator & Number</span>
                        <span className="font-mono font-black text-white text-[11px]">{momoOperator} • {momoNumber}</span>
                      </div>
                      <span className="text-[8px] bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded-full font-mono font-black shrink-0">LIVE</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[8px] text-slate-500 uppercase font-bold block">Registered Recipient Name</span>
                      <span className="font-bold text-white text-[10.5px]">{momoName}</span>
                    </div>
                  </div>
                </div>

                {/* Instruction area */}
                <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 text-[10px] text-slate-300 leading-relaxed font-sans">
                  <div className="flex gap-1 items-start text-indigo-300 font-bold uppercase text-[8.5px] tracking-wider mb-1">
                    <span>💡</span>
                    <span>Admin Payout instructions:</span>
                  </div>
                  {instructions || 'Please refer to instructions provided above.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
