import { 
  Wallet as WalletIcon, 
  ArrowDownRight, 
  ArrowUpRight, 
  History, 
  Shield, 
  Smartphone, 
  X, 
  Loader2, 
  CheckCircle2, 
  Lock, 
  Truck, 
  ArrowRight, 
  RefreshCw, 
  Send, 
  Landmark, 
  Receipt, 
  Percent, 
  Globe, 
  AlertCircle, 
  HelpCircle,
  PiggyBank,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

// Unified type and configuration for African MoMo networks
type CountryCode = 'SZ' | 'KE' | 'GH' | 'UG' | 'SN';

interface CountryConfig {
  name: string;
  flag: string;
  currency: string;
  providers: {
    id: string;
    name: string;
    color: string;
    textColor: string;
    prefix: string;
    logoText: string;
    samplePhone: string;
    merchantLabel: string;
  }[];
}

const REGIONAL_CONFIG: Record<CountryCode, CountryConfig> = {
  SZ: {
    name: 'Eswatini',
    flag: '🇸🇿',
    currency: 'E',
    providers: [
      { id: 'mtn_sz', name: 'MTN MoMo', color: 'bg-amber-400 border-amber-500 hover:bg-amber-500', textColor: 'text-slate-900', prefix: '76', logoText: 'MoMo', samplePhone: '+268 7611 2345', merchantLabel: 'MoMo Merchant ID' },
      { id: 'emali', name: 'Eswatini Mobile eMali', color: 'bg-blue-600 border-blue-700 hover:bg-blue-700', textColor: 'text-white', prefix: '79', logoText: 'eMali', samplePhone: '+268 7911 2345', merchantLabel: 'eMali Agent Till' }
    ]
  },
  KE: {
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KSh',
    providers: [
      { id: 'mpesa', name: 'Safaricom M-Pesa', color: 'bg-emerald-600 border-emerald-700 hover:bg-emerald-700', textColor: 'text-white', prefix: '72', logoText: 'M-Pesa', samplePhone: '+254 7220 0000', merchantLabel: 'Lipa Na M-Pesa Till' },
      { id: 'airtel_ke', name: 'Airtel Money', color: 'bg-red-600 border-red-700 hover:bg-red-700', textColor: 'text-white', prefix: '73', logoText: 'Airtel', samplePhone: '+254 7330 0000', merchantLabel: 'Airtel Merchant Code' }
    ]
  },
  GH: {
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GH₵',
    providers: [
      { id: 'mtn_gh', name: 'MTN Mobile Money', color: 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500', textColor: 'text-slate-900', prefix: '24', logoText: 'MoMo', samplePhone: '+233 2440 0000', merchantLabel: 'Merchant Till Code' },
      { id: 'telecel', name: 'Telecel Cash', color: 'bg-red-500 border-red-600 hover:bg-red-600', textColor: 'text-white', prefix: '20', logoText: 'Telecel', samplePhone: '+233 2010 0000', merchantLabel: 'Telecel Merchant ID' }
    ]
  },
  UG: {
    name: 'Uganda',
    flag: '🇺🇬',
    currency: 'USh',
    providers: [
      { id: 'mtn_ug', name: 'MTN MoMo Uganda', color: 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500', textColor: 'text-slate-900', prefix: '77', logoText: 'MoMo', samplePhone: '+256 7720 0000', merchantLabel: 'MoMo Merchant Pay' },
      { id: 'airtel_ug', name: 'Airtel Money Uganda', color: 'bg-red-600 border-red-700 hover:bg-red-700', textColor: 'text-white', prefix: '75', logoText: 'Airtel', samplePhone: '+256 7520 0000', merchantLabel: 'Airtel Pay Code' }
    ]
  },
  SN: {
    name: 'Senegal',
    flag: '🇸🇳',
    currency: 'CFA',
    providers: [
      { id: 'orange', name: 'Orange Money', color: 'bg-orange-500 border-orange-600 hover:bg-orange-600', textColor: 'text-white', prefix: '77', logoText: 'Orange', samplePhone: '+221 7710 0000', merchantLabel: 'Orange Business ID' },
      { id: 'wave', name: 'Wave Mobile Money', color: 'bg-cyan-500 border-cyan-600 hover:bg-cyan-600', textColor: 'text-white', prefix: '76', logoText: 'Wave', samplePhone: '+221 7620 0000', merchantLabel: 'Wave Merchant Till' }
    ]
  }
};

interface Transaction {
  id: string;
  type: string;
  detail: string;
  provider: string;
  date: string;
  amount: number;
  isPositive: boolean;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export default function Wallet() {
  // Navigation tabs: wallet status, mobile money integrations toolbox, escrow holds
  const [activeTab, setActiveTab] = useState<'overview' | 'integration' | 'escrow'>('overview');
  
  // Regional settings
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('SZ');
  const [selectedProviderIdx, setSelectedProviderIdx] = useState(0);

  // Stateful financial numbers
  const [balance, setBalance] = useState(0.00);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Escrow state list loaded dynamically
  const [escrowItems, setEscrowItems] = useState<{ id: string; item: string; amount: number; recipient: string; description: string; provider: string; status: string; date: string; image?: string; buyerPhone?: string; }[]>(() => {
    try {
      const stored = localStorage.getItem('activeEscrows');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // Modal displays
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [targetNumber, setTargetNumber] = useState('');
  
  // Custom Interactive MoMo Sandbox inputs
  const [p2pAmount, setP2pAmount] = useState('50');
  const [p2pPhone, setP2pPhone] = useState('');
  const [merchantAmount, setMerchantAmount] = useState('75');
  const [merchantTill, setMerchantTill] = useState('149202');
  const [splitBaseAmount, setSplitBaseAmount] = useState('200');
  const [splitRiderShare, setSplitRiderShare] = useState('10'); // %
  const [splitPlatformShare, setSplitPlatformShare] = useState('5'); // %

  // Loading and feedback automation
  const [processingState, setProcessingState] = useState<'idle' | 'depositing' | 'withdrawing' | 'p2p' | 'merchant' | 'refund' | 'escrow-release' | 'escrow-refund'>('idle');
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const currentCountry = REGIONAL_CONFIG[selectedCountry];
  const activeProvider = currentCountry.providers[selectedProviderIdx] || currentCountry.providers[0];

  const triggerToast = (msg: string) => {
    setLastNotification(msg);
    setTimeout(() => {
      setLastNotification(null);
    }, 5500);
  };

  // 1. Merchant & Wallet Deposits
  const handleDeposit = () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount))) return;
    setProcessingState('depositing');
    
    // Simulate African MoMo Prompt Push (MTN/Airtel USSD popup)
    setTimeout(() => {
      const amt = parseFloat(depositAmount);
      setBalance(prev => prev + amt);
      
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Wallet Top-up',
        detail: `Deposited via ${activeProvider.name}`,
        provider: activeProvider.name,
        date: 'Just now',
        amount: amt,
        isPositive: true,
        status: 'Completed'
      };

      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setShowDepositModal(false);
      setDepositAmount('');
      triggerToast(`💸 Esaliswe: E ${amt.toFixed(2)} deposit from ${activeProvider.name} successful!`);
    }, 2800);
  };

  // 2. Wallet Withdrawals
  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount))) return;
    const amt = parseFloat(withdrawAmount);
    if (amt > balance) {
      alert('Insufficient funds in internal balance!');
      return;
    }
    
    setProcessingState('withdrawing');
    setTimeout(() => {
      setBalance(prev => prev - amt);
      
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'MoMo Withdrawal',
        detail: `Sent to ${targetNumber || activeProvider.samplePhone}`,
        provider: activeProvider.name,
        date: 'Just now',
        amount: amt,
        isPositive: false,
        status: 'Completed'
      };

      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setTargetNumber('');
      triggerToast(`🚀 Sent: E ${amt.toFixed(2)} instantly moved to ${activeProvider.name} wallet!`);
    }, 2500);
  };

  // 3. P2P Direct Customer Transfer
  const handleP2pTransfer = () => {
    if (!p2pAmount || isNaN(parseFloat(p2pAmount))) return;
    const amt = parseFloat(p2pAmount);
    setProcessingState('p2p');

    setTimeout(() => {
      const phoneInput = p2pPhone || activeProvider.samplePhone;
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Customer P2P Transfer',
        detail: `To phone: ${phoneInput}`,
        provider: activeProvider.name,
        date: 'Just now',
        amount: amt,
        isPositive: false,
        status: 'Completed'
      };

      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setP2pPhone('');
      triggerToast(`👋 Transfer Success: ${currentCountry.currency} ${amt.toFixed(2)} sent to ${phoneInput} via ${activeProvider.name}!`);
    }, 2000);
  };

  // 4. Merchant Payment Demo
  const handleMerchantPayment = () => {
    if (!merchantAmount || isNaN(parseFloat(merchantAmount))) return;
    const amt = parseFloat(merchantAmount);
    setProcessingState('merchant');

    setTimeout(() => {
      const code = merchantTill || '149202';
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Merchant Till Payment',
        detail: `Paid to Store Till #${code}`,
        provider: activeProvider.name,
        date: 'Just now',
        amount: amt,
        isPositive: false,
        status: 'Completed'
      };

      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setMerchantTill('');
      triggerToast(`👜 Merchant Paid: ${currentCountry.currency} ${amt} successfully cleared to Till #${code}!`);
    }, 2000);
  };

  // 5. Escrow Release
  const handleReleaseEscrow = (id: string, itemTitle: string, amount: number) => {
    setProcessingState('escrow-release');
    setTimeout(() => {
      setEscrowItems(prev => {
        const updated = prev.map(item => item.id === id ? { ...item, status: 'Paid', description: 'Funds successfully released to Seller!' } : item);
        try {
          localStorage.setItem('activeEscrows', JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      });
      
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Escrow Released',
        detail: `Funds verified for ${itemTitle}`,
        provider: activeProvider.name,
        date: 'Just now',
        amount: amount,
        isPositive: false,
        status: 'Completed'
      };

      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      triggerToast(`🔑 Escrow Release Approved! ${currentCountry.currency} ${amount.toFixed(2)} cleared to Trader account.`);
    }, 1800);
  };

  // 6. Direct Escrow Refund Simulation
  const handleRefundEscrow = (id: string, itemTitle: string, amount: number) => {
    setProcessingState('escrow-refund');
    setTimeout(() => {
      setEscrowItems(prev => {
        const updated = prev.map(item => item.id === id ? { ...item, status: 'Refunded', description: 'Reversed due to cancel / issue' } : item);
        try {
          localStorage.setItem('activeEscrows', JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      });
      setBalance(prev => prev + amount);

      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Refund Back to MoMo',
        detail: `Escrow reversed for ${itemTitle}`,
        provider: activeProvider.name,
        date: 'Just now',
        amount: amount,
        isPositive: true,
        status: 'Refunded'
      };

      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      triggerToast(`↩️ Refund Approved: Code MoMo-Reverse. ${currentCountry.currency} ${amount.toFixed(2)} returned to your phone!`);
    }, 1800);
  };

  // Split payment outputs
  const calculateSplit = () => {
    const total = parseFloat(splitBaseAmount) || 0;
    const riderPct = parseFloat(splitRiderShare) || 0;
    const platformPct = parseFloat(splitPlatformShare) || 0;
    const sellerPct = 100 - riderPct - platformPct;

    const sellerAmount = (total * sellerPct) / 100;
    const riderAmount = (total * riderPct) / 100;
    const platformAmount = (total * platformPct) / 100;

    return {
      sellerAmount,
      riderAmount,
      platformAmount,
      sellerPct
    };
  };

  const { sellerAmount, riderAmount, platformAmount, sellerPct } = calculateSplit();

  return (
    <div className="bg-gray-50 min-h-screen pb-24 w-full relative">
      
      {/* Dynamic Native API Toast Alerts */}
      {lastNotification && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-slate-900 border-l-4 border-green-500 text-white p-3.5 rounded-xl shadow-xl flex items-start gap-2.5 animate-in slide-in-from-top-7 max-w-sm mx-auto">
          <Sparkles className="text-yellow-400 shrink-0 mt-0.5" size={16} />
          <div className="flex-1">
             <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider font-mono">Gateway Confirmation</p>
             <p className="text-xs font-medium text-slate-100 leading-normal">{lastNotification}</p>
          </div>
          <button onClick={() => setLastNotification(null)} className="text-slate-400 hover:text-white p-1">
             <X size={14} />
          </button>
        </div>
      )}

      {/* Modern High-End Wallet Balance Hero Header */}
      <div className="bg-gradient-to-tr from-green-700 via-green-600 to-emerald-500 text-white px-5 pt-8 pb-12 rounded-b-[40px] shadow-lg sticky top-0 z-10 w-full mb-4">
        <div className="flex justify-between items-center mb-5 text-center px-1">
          <h1 className="text-xs font-black uppercase tracking-widest text-emerald-100 flex items-center gap-1">
             <WalletIcon size={14} /> African Mobile Money Core
          </h1>
          <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/15">
            <span>{currentCountry.flag}</span>
            <span>{currentCountry.name}</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-[10px] text-green-100 uppercase tracking-widest font-black opacity-85 block">Total Balance Available</span>
          <h2 className="text-4xl font-black font-display tracking-tight mt-1">E {balance.toFixed(2)}</h2>
          <p className="text-[10px] text-emerald-100/90 font-medium italic mt-1 leading-none">Standard Escrow Trust-Covered Account</p>
        </div>
        
        {/* Rapid Actions */}
        <div className="bg-white/10 rounded-2xl p-3.5 flex justify-between items-center backdrop-blur-md border border-white/10">
          <button 
            onClick={() => setShowDepositModal(true)} 
            className="flex flex-col items-center gap-1.5 flex-1 hover:opacity-90 active:scale-95 transition-all text-center"
          >
            <div className="bg-white text-green-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
               <ArrowDownRight size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Topup</span>
          </button>
          
          <div className="w-[1px] bg-white/20 h-8 shrink-0"></div>
          
          <button 
            onClick={() => setShowWithdrawModal(true)} 
            className="flex flex-col items-center gap-1.5 flex-1 hover:opacity-90 active:scale-95 transition-all text-center"
          >
            <div className="bg-white text-green-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
               <ArrowUpRight size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Segment controls tabbed switcher */}
      <div className="px-4 mb-4">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex w-full">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'overview' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              🏠 Overview
           </button>
           <button 
             onClick={() => setActiveTab('integration')}
             className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'integration' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              ⚡ MoMo Gateways
           </button>
           <button 
             onClick={() => setActiveTab('escrow')}
             className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'escrow' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              🛡️ Escrow {escrowItems.length > 0 && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full ml-1">{escrowItems.length}</span>}
           </button>
        </div>
      </div>

      {/* Selected Country Network Selector Rail */}
      <div className="px-4 mb-4">
         <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select African MoMo System</span>
              <span className="text-[9px] text-green-600 font-bold flex items-center gap-1"><Globe size={10} /> Hot Swappable Regional APIs</span>
           </div>

           {/* Country buttons list */}
           <div className="grid grid-cols-5 gap-1 text-center mb-3.5">
             {(Object.keys(REGIONAL_CONFIG) as CountryCode[]).map((code) => {
               const active = selectedCountry === code;
               return (
                 <button 
                   key={code}
                   onClick={() => {
                     setSelectedCountry(code);
                     setSelectedProviderIdx(0);
                     triggerToast(`📡 Linked ${REGIONAL_CONFIG[code].name} Gateway Node...`);
                   }}
                   className={`p-2 rounded-2xl flex flex-col items-center justify-center border transition-all ${active ? 'border-green-600 bg-green-50/50 shadow-sm' : 'border-gray-100 hover:bg-slate-50'}`}
                 >
                   <span className="text-lg leading-none">{REGIONAL_CONFIG[code].flag}</span>
                   <span className="text-[9px] font-bold mt-1 text-gray-700">{code}</span>
                 </button>
               );
             })}
           </div>

           {/* Providers under active country */}
           <div className="flex flex-col gap-1.5 pt-0.5">
              <span className="text-[9px] font-bold text-gray-400 capitalize">Available Channels:</span>
              <div className="grid grid-cols-2 gap-2">
                 {currentCountry.providers.map((prov, idx) => {
                   const active = selectedProviderIdx === idx;
                   return (
                     <button
                       key={prov.id}
                       onClick={() => setSelectedProviderIdx(idx)}
                       className={`p-2.5 rounded-2xl text-left text-xs font-black border flex items-center justify-between ${active ? 'border-green-500 bg-green-50/20 text-gray-800' : 'border-gray-100 bg-slate-50 text-gray-500'}`}
                     >
                       <span className="line-clamp-1">{prov.name}</span>
                       <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${prov.id.includes('mtn') ? 'bg-yellow-100 text-yellow-800' : prov.id.includes('mpesa') ? 'bg-green-100 text-green-800 font-mono' : 'bg-blue-100 text-blue-800'}`}>
                         {prov.logoText}
                       </span>
                     </button>
                   );
                 })}
              </div>
           </div>
         </div>
      </div>

      {/* CORE TAB VIEWS */}
      <div className="px-4 w-full">
         
         {/* TAB A: OVERVIEW */}
         {activeTab === 'overview' && (
           <div className="flex flex-col gap-4">
              
              {/* MoMo Information bar */}
              <div className="bg-yellow-50 text-yellow-900 p-4 rounded-3xl shadow-sm border border-yellow-100/50 flex gap-3 text-xs">
                 <Smartphone size={20} className="text-yellow-600 shrink-0 mt-0.5 animate-bounce" />
                 <div>
                    <h4 className="font-extrabold flex items-center gap-1 uppercase tracking-wide">African Mobile Money Integrated</h4>
                    <p className="text-[11px] text-yellow-800 leading-relaxed mt-1">
                      Our system automatically integrates with MTN MoMo, Airtel Money, and Safaricom M-Pesa. Secure USSD push prompts are dispatched instantly directly to customer phones to complete transactions without delay.
                    </p>
                 </div>
              </div>

              {/* Transactions log */}
              <div>
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                       <History size={16} /> Transaction History
                    </h3>
                    <button className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                       <RefreshCw size={10} /> Clear Logs
                    </button>
                 </div>

                 <div className="flex flex-col gap-2">
                    {transactions.length === 0 ? (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <History size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs font-bold uppercase">No recent transactions</p>
                      </div>
                    ) : (
                      transactions.map((tx) => (
                        <div key={tx.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.isPositive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-gray-600'}`}>
                              {tx.isPositive ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                              <p className="font-black text-xs text-gray-800 leading-snug">{tx.type}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{tx.detail} · <span className="font-bold font-mono text-gray-600">{tx.provider}</span></p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                             <span className={`text-xs font-black font-mono leading-none block ${tx.isPositive ? 'text-green-600' : 'text-gray-800'}`}>
                               {tx.isPositive ? '+' : '-'}E {tx.amount.toFixed(2)}
                             </span>
                             <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : tx.status === 'Refunded' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>
                               {tx.status}
                             </span>
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>
         )}


         {/* TAB B: INTEGRATIONS SANDBOX */}
         {activeTab === 'integration' && (
           <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* Introduction Card */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-green-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl font-mono tracking-wider">
                  Active Gateway
                </div>
                <h4 className="font-display font-bold text-sm mb-1 text-slate-200">Mobile Money Gateway Control</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                  Manage and execute secure mobile money integrations with MTN MoMo, eMali, M-Pesa, Airtel Money and other major African networks below.
                </p>
              </div>

               {/* SANDBOX SECTION 1: CUSTOMER P2P PAYMENTS */}
               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                       <Send size={14} className="text-blue-500" /> 1. Customer Payments (P2P)
                     </h4>
                     <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black uppercase font-mono">Active Route</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                     Transfer funds directly from the client phone balance to another user's number across Eswatini or selected international gateways.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Target Mobile #</label>
                        <input 
                          type="text" 
                          value={p2pPhone}
                          onChange={(e) => setP2pPhone(e.target.value)}
                          placeholder={activeProvider.samplePhone}
                          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-green-500"
                        />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount ({currentCountry.currency})</label>
                        <input 
                          type="number" 
                          value={p2pAmount}
                          onChange={(e) => setP2pAmount(e.target.value)}
                          placeholder="50"
                          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-green-500"
                        />
                     </div>
                  </div>

                  <button 
                    onClick={handleP2pTransfer}
                    disabled={processingState !== 'idle'}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase mt-1 tracking-wider"
                  >
                     {processingState === 'p2p' ? (
                       <>
                         <Loader2 size={12} className="animate-spin text-white" />
                         <span>Routing Wallet API...</span>
                       </>
                     ) : (
                       <span>Instant P2P Push ({activeProvider.logoText})</span>
                     )}
                  </button>
               </div>


               {/* SANDBOX SECTION 2: MERCHANT PAYMENTS */}
               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                       <Receipt size={14} className="text-orange-500" /> 2. Retail Merchant Payments
                     </h4>
                     <span className="text-[9px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-black uppercase font-mono">B2C / Til ID</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                     Executes a direct mobile money checkout transaction and pushes prompts to custom registered merchant credentials.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">{activeProvider.merchantLabel}</label>
                        <input 
                          type="text" 
                          value={merchantTill}
                          onChange={(e) => setMerchantTill(e.target.value)}
                          placeholder="149202 (Sipho's)"
                          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-green-500"
                        />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Total Amount ({currentCountry.currency})</label>
                        <input 
                          type="number" 
                          value={merchantAmount}
                          onChange={(e) => setMerchantAmount(e.target.value)}
                          placeholder="75"
                          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-green-500"
                        />
                     </div>
                  </div>

                  <button 
                    onClick={handleMerchantPayment}
                    disabled={processingState !== 'idle'}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase mt-1 tracking-wider"
                  >
                     {processingState === 'merchant' ? (
                       <>
                         <Loader2 size={12} className="animate-spin text-white" />
                         <span>Generating USSD Pay Prompt...</span>
                       </>
                     ) : (
                       <span>Submit Till Merchant Payment</span>
                     )}
                  </button>
               </div>


               {/* SANDBOX SECTION 3: REVENUE / SPLIT PAYMENTS DIAGRAM & ENGINE */}
               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                       <Percent size={14} className="text-green-600" /> 3. Regional Multi-Recipient Split Payments
                     </h4>
                     <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-black uppercase font-mono">Commission Router</span>
                  </div>
                  
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                     African systems require splitting money straight out of checkout. Input base customer payments below to see split routing computations:
                  </p>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100/60 my-1 grid grid-cols-3 gap-2">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Customer Order Payment</span>
                        <input 
                          type="number" 
                          value={splitBaseAmount}
                          onChange={(e) => setSplitBaseAmount(e.target.value)}
                          className="text-sm font-bold bg-transparent outline-none border-b border-gray-200 pb-0.5 mt-1 font-mono text-gray-800"
                        />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Rider Delivery Share (%)</span>
                        <input 
                          type="number" 
                          value={splitRiderShare}
                          onChange={(e) => setSplitRiderShare(e.target.value)}
                          className="text-sm font-bold bg-transparent outline-none border-b border-gray-200 pb-0.5 mt-1 font-mono text-gray-800"
                        />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Platform Service Cut (%)</span>
                        <input 
                          type="number" 
                          value={splitPlatformShare}
                          onChange={(e) => setSplitPlatformShare(e.target.value)}
                          className="text-sm font-bold bg-transparent outline-none border-b border-gray-200 pb-0.5 mt-1 font-mono text-gray-800"
                        />
                     </div>
                  </div>

                  {/* Elegant split-flow graphic visualization */}
                  <div className="flex flex-col gap-2.5 bg-slate-950 p-4 rounded-2xl text-white font-mono text-[10px]">
                     <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                        <span>Splitting Route</span>
                        <span className="text-[9px] text-yellow-400 font-bold">MoMo Split-Contract Payload</span>
                     </div>
                     
                     <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                           <span>🌾 Primary Trader:</span>
                        </div>
                        <span className="font-bold text-slate-100">{sellerPct}% &rarr; {currentCountry.currency} {sellerAmount.toFixed(2)}</span>
                     </div>

                     <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                           <span>🏍️ Local Moto Rider:</span>
                        </div>
                        <span className="font-bold text-slate-100">{splitRiderShare}% &rarr; {currentCountry.currency} {riderAmount.toFixed(2)}</span>
                     </div>

                     <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                           <span>🛡️ platform (Escrow Fee):</span>
                        </div>
                        <span className="font-bold text-slate-100">{splitPlatformShare}% &rarr; {currentCountry.currency} {platformAmount.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
           </div>
         )}


         {/* TAB C: ESCROW OPERATIONS & WALLET REFUNDS */}
         {activeTab === 'escrow' && (
           <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* Structured Escrow Protection Process Stepper */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-3xl shadow-sm relative overflow-hidden border border-blue-950">
                <div className="absolute right-0 bottom-0 opacity-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
                <div className="flex items-center gap-1.5 mb-1.5 text-blue-400">
                  <Lock size={12} className="stroke-[2.5]" />
                  <span className="text-[9px] font-black uppercase tracking-widest font-mono">eMakethe Trust Shield</span>
                </div>
                <h4 className="font-display font-black text-sm uppercase tracking-tight">Escrow Safeguard Stepper</h4>
                <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5 mb-4">
                  Protection cycle: funds are secured via Mobile Money and held safely. Payout is released ONLY upon rider Drop-off.
                </p>

                {/* Visual Stepper graphic Milestones */}
                <div className="grid grid-cols-4 gap-1 relative mb-1 text-center">
                  <div className="absolute top-[12px] left-[12%] right-[12%] h-[1px] bg-slate-700 z-0"></div>
                  
                  <div className="flex flex-col items-center z-10">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-slate-900 shadow">1</span>
                    <span className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Buyer Pays</span>
                  </div>
                  
                  <div className="flex flex-col items-center z-10">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-slate-900 shadow">2</span>
                    <span className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Held Safe</span>
                  </div>
                  
                  <div className="flex flex-col items-center z-10">
                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-slate-900 shadow">3</span>
                    <span className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Delivered</span>
                  </div>
                  
                  <div className="flex flex-col items-center z-10">
                    <span className="w-6 h-6 bg-green-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-slate-900 shadow">4</span>
                    <span className="text-[8px] font-bold text-green-400 mt-1 uppercase font-display">Seller Paid</span>
                  </div>
                </div>
              </div>

              {/* Benefits grid conforming to prompt requirements */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-gray-150 shadow-sm leading-snug">
                 <div className="text-left font-sans">
                    <span className="block text-[8px] font-black text-blue-700 uppercase tracking-wider">🛡️ Fraud Prevention</span>
                    <p className="text-[9px] text-gray-500 leading-tight mt-0.5 font-medium">Clamping down on pre-payment runaways completely.</p>
                 </div>
                 <div className="text-left border-l border-gray-200 pl-2 font-sans">
                    <span className="block text-[8px] font-black text-amber-700 uppercase tracking-wider">🤝 Trust Building</span>
                    <p className="text-[9px] text-gray-500 leading-tight mt-0.5 font-medium">Binds buyer and casual seller with deep security.</p>
                 </div>
                 <div className="text-left border-l border-gray-200 pl-2 font-sans">
                    <span className="block text-[8px] font-black text-emerald-700 uppercase tracking-wider">🙋 Client Protect</span>
                    <p className="text-[9px] text-gray-500 leading-tight mt-0.5 font-medium">Trigger 1-click reversals back to your phone instantly.</p>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 {escrowItems.length === 0 ? (
                     <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                       <span className="text-3xl mb-1.5">🛡️</span>
                       <p className="font-bold text-gray-800 text-xs uppercase">No active escrow holds</p>
                       <p className="text-[11px] text-gray-400 max-w-[200px] mt-1">Make purchase via checkout using Mobile Money option to lock escrow cover.</p>
                     </div>
                 ) : (
                   escrowItems.map((esc) => (
                      <div key={esc.id} className="bg-white p-4 rounded-3xl border border-gray-200/55 shadow-sm flex flex-col gap-3 animate-in zoom-in-95">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="font-black text-xs text-slate-800 leading-snug">{esc.item}</p>
                               <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Recipient: {esc.recipient}</p>
                            </div>
                            <div className="text-right">
                               <span className="text-xs font-black text-blue-600 font-mono block">{currentCountry.currency} {esc.amount.toFixed(2)}</span>
                               <span className="bg-blue-50 text-blue-800 text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase mt-1 inline-block">
                                 {esc.status}
                               </span>
                            </div>
                         </div>
                         
                         <p className="text-[10px] text-gray-500 font-medium pb-2 border-b border-gray-100">
                           ℹ️ Routing Code: {esc.id} · Provider: <span className="font-bold">{esc.provider}</span> ({esc.date})
                         </p>

                         {/* Interactive individual order process step tracer */}
                         <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5 border border-gray-100 text-[9px] font-semibold text-gray-500 mb-2 font-sans">
                            <span>Milestone Stage:</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-green-600 font-extrabold">Paid</span>
                              <span>➔</span>
                              <span className={esc.status === 'Locked' ? 'bg-amber-500 text-white px-1.5 py-0.5 rounded text-[8px] font-sans' : 'text-green-600 font-bold'}>In Escrow</span>
                              <span>➔</span>
                              <span className={esc.status === 'Delivered' ? 'bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[8px] font-sans animate-pulse' : esc.status === 'Paid' ? 'text-green-600 font-bold' : 'text-gray-300'}>
                                {esc.status === 'Delivered' ? '🏍️ Delivered' : 'Dropped Off'}
                              </span>
                              {esc.status === 'Paid' && (
                                <>
                                  <span>➔</span>
                                  <span className="text-green-650 font-black">Settled 💸</span>
                                </>
                              )}
                              {esc.status === 'Refunded' && (
                                <>
                                  <span>➔</span>
                                  <span className="text-rose-600 font-black">Reversed ↩️</span>
                                </>
                              )}
                            </div>
                         </div>

                         {/* Action Hub for Escrow */}
                         {esc.status !== 'Paid' && esc.status !== 'Refunded' ? (
                           <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => handleReleaseEscrow(esc.id, esc.item, esc.amount)}
                                disabled={processingState !== 'idle'}
                                className={`text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm ${
                                  esc.status === 'Delivered' 
                                    ? 'bg-green-600 text-white hover:bg-green-700 animate-bounce' 
                                    : 'bg-green-150 text-green-750 hover:bg-green-250'
                                }`}
                              >
                                 {processingState === 'escrow-release' ? 'Releasing...' : esc.status === 'Delivered' ? '🏍️ Confirm Release' : 'Release Cash'}
                              </button>
                              <button 
                                onClick={() => handleRefundEscrow(esc.id, esc.item, esc.amount)}
                                disabled={processingState !== 'idle'}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider border border-rose-100/65 transition-all"
                              >
                                 {processingState === 'escrow-refund' ? 'Refunding...' : 'Refund to MoMo'}
                              </button>
                           </div>
                         ) : (
                           <div className="bg-emerald-50 text-emerald-800 rounded-xl p-2.5 text-center text-[9.5px] font-black uppercase tracking-wider border border-emerald-100/60 font-sans">
                             🤝 Escrow Closed Safely • Status: {esc.status}
                           </div>
                         )}
                      </div>
                   ))
                 )}
              </div>
           </div>
         )}

      </div>


      {/* MODAL 1: TOPUP (DEPOSIT) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 w-full h-full max-w-md mx-auto">
           <div className="bg-white w-full rounded-t-[36px] rounded-b-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
              <div className="flex justify-between items-center mb-5">
                 <div>
                    <h3 className="font-black text-gray-800 text-base uppercase tracking-tight flex items-center gap-1">
                      📥 Deposit to Wallet
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium">Auto-trigger standard MTN MoMo or Airtel Money payment popup</p>
                 </div>
                 <button onClick={() => setShowDepositModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-500">
                    <X size={16} />
                 </button>
              </div>

              {processingState === 'depositing' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                   <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-100 shadow-sm animate-bounce">
                     <Loader2 size={32} className="animate-spin text-green-600" />
                   </div>
                   <h4 className="font-bold text-gray-800 text-sm">USSD Gateway Prompt Dispatched</h4>
                   <p className="text-[11px] text-gray-500 max-w-[200px] mt-1.5 leading-relaxed">
                      Check your mobile phone screen for the secure PIN prompt to authorize E {parseFloat(depositAmount || '0').toFixed(2)} deposit.
                   </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-xs shrink-0 font-mono">
                       MoMo
                     </div>
                     <div>
                       <span className="block text-[10px] text-gray-400 uppercase font-bold">Selected network provider:</span>
                       <span className="text-xs font-black text-gray-800">{activeProvider.name}</span>
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5">Amount to Deposit (E)</label>
                     <input 
                       type="number"
                       value={depositAmount}
                       onChange={(e) => setDepositAmount(e.target.value)}
                       placeholder="Enter amount (e.g. 150)"
                       className="w-full bg-slate-50 border border-gray-200 p-4 rounded-2xl text-lg font-black outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition-all font-mono"
                     />
                  </div>

                  <button 
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    onClick={handleDeposit}
                    className="w-full bg-[#25D366] hover:bg-green-600 font-sans tracking-wide text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-green-500/10 transition-all uppercase text-xs"
                  >
                     Confirm & Disptach USSD Prompt
                  </button>
                </div>
              )}
           </div>
        </div>
      )}


      {/* MODAL 2: WITHDRAWAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 w-full h-full max-w-md mx-auto">
           <div className="bg-white w-full rounded-t-[36px] rounded-b-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
              <div className="flex justify-between items-center mb-5">
                 <div>
                    <h3 className="font-black text-gray-800 text-base uppercase tracking-tight flex items-center gap-1">
                      📤 Withdraw to Mobile Money
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium font-bold">Transfer escrowed platform income instantly back to cell</p>
                 </div>
                 <button onClick={() => setShowWithdrawModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-500">
                    <X size={16} />
                 </button>
              </div>

              {processingState === 'withdrawing' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-pulse">
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100 shadow-sm">
                     <Loader2 size={32} className="animate-spin text-green-600 animate-pulse" />
                   </div>
                   <h4 className="font-bold text-gray-800 text-sm">Processing Network disbursement Request</h4>
                   <p className="text-[11px] text-gray-500 max-w-[200px] mt-1 leading-normal">
                      Connecting with the regional clearing network. Standard clearance takes 10-15 seconds...
                   </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                     <div>
                       <span className="block text-[10px] text-gray-400 uppercase font-black">Destination System:</span>
                       <span className="text-xs font-black text-slate-800">{activeProvider.name}</span>
                     </div>
                     <span className="bg-green-100 text-green-800 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase leading-none">
                       Payout Mode
                     </span>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 font-bold">Destination phone number</label>
                     <input 
                       type="text"
                       value={targetNumber}
                       onChange={(e) => setTargetNumber(e.target.value)}
                       placeholder={activeProvider.samplePhone}
                       className="w-full bg-slate-50 border border-gray-200 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition-all font-mono"
                     />
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 font-bold">Amount to Withdraw (E)</label>
                     <input 
                       type="number"
                       value={withdrawAmount}
                       onChange={(e) => setWithdrawAmount(e.target.value)}
                       placeholder="Enter amount (e.g. 100)"
                       className="w-full bg-slate-50 border border-gray-200 p-4 rounded-2xl text-lg font-black outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition-all font-mono"
                     />
                     <span className="text-[10px] text-gray-400 mt-1 block">Maximum limit available: E {balance.toFixed(2)}</span>
                  </div>

                  <button 
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                    onClick={handleWithdraw}
                    className="w-full bg-[#128C7E] hover:bg-slate-900 tracking-wide font-sans text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase text-xs"
                  >
                     Initiate Instant Wallet Release
                  </button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
