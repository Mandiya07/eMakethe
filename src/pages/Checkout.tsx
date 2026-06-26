import { 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  Store, 
  Truck, 
  Zap, 
  Calendar, 
  Lock, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Percent, 
  Wallet,
  CheckCircle,
  AlertTriangle,
  Landmark
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Highly customizable African regional configuration
interface MobileMoneyProvider {
  id: string;
  name: string;
  flag: string;
  currency: string;
  logoColor: string;
  badgeText: string;
  samplePrefix: string;
  placeholder: string;
  description: string;
}

const REGIONAL_SYSTEMS: MobileMoneyProvider[] = [
  { id: 'mtn_sz', name: 'MTN Mobile Money', flag: '🇸🇿', currency: 'E', logoColor: 'bg-yellow-400 text-slate-800', badgeText: 'MOMO', samplePrefix: '76', placeholder: '+268 7611 2233', description: 'Available in Eswatini & Ghana' },
  { id: 'emali_sz', name: 'Eswatini Mobile eMali', flag: '🇸🇿', currency: 'E', logoColor: 'bg-blue-600 text-white', badgeText: 'EMALI', samplePrefix: '79', placeholder: '+268 7911 2233', description: 'Zero Eswatini wallet transfer fee' },
  { id: 'mpesa_ke', name: 'Safaricom M-Pesa', flag: '🇰🇪', currency: 'KSh', logoColor: 'bg-emerald-600 text-white font-mono', badgeText: 'M-PESA', samplePrefix: '72', placeholder: '+254 7220 0000', description: 'Leading Kenyan payment gateway' },
  { id: 'airtel_ke', name: 'Airtel Money', flag: '🇰🇪', currency: 'KSh', logoColor: 'bg-red-600 text-white', badgeText: 'AIRTEL', samplePrefix: '73', placeholder: '+254 7330 0000', description: 'Fast East African clearing node' },
  { id: 'orange_sn', name: 'Orange Money', flag: '🇸🇳', currency: 'CFA', logoColor: 'bg-orange-500 text-white', badgeText: 'ORANGE', samplePrefix: '77', placeholder: '+221 7710 0000', description: 'Senegal & West Africa coverage' }
];

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, sellers } = useFirebase();
  const product = products.find(p => p.id === id);
  const seller = product ? sellers.find(s => s.id === product.sellerId) : null;
  
  // Checkout States
  const [selectedProviderIdx, setSelectedProviderIdx] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'home' | 'sameday' | 'scheduled'>('home');
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'ussd_push_sent' | 'processing_escrow' | 'completed' | 'bank_instant_verify' | 'bank_eft_verify' | 'bank_deposit_verify'>('idle');
  const [pinInput, setPinInput] = useState('');
  
  // Custom scheduled date & slot selection
  const [scheduledDay, setScheduledDay] = useState('Tomorrow');
  const [scheduledSlot, setScheduledSlot] = useState('Morning (08:00 - 12:00)');

  // Bank Transfer states
  const [paymentMode, setPaymentMode] = useState<'momo' | 'bank'>('momo');
  const [bankTab, setBankTab] = useState<'eft' | 'instant' | 'deposit'>('eft');
  const [selectedBank, setSelectedBank] = useState('First National Bank (FNB) Eswatini');
  const [bankSenderAccount, setBankSenderAccount] = useState('');
  const [bankSenderName, setBankSenderName] = useState('');
  const [bankDepositRef, setBankDepositRef] = useState('');
  const [uploadedPopName, setUploadedPopName] = useState<string | null>(null);
  const [popUploadProgress, setPopUploadProgress] = useState<number | null>(null);
  
  // Static wallet balance setup for client split-payments demo
  const userWalletBalance = 240.00;

  // Admin Payout Settings (loaded from Firestore with safe hardcoded fallbacks)
  const [adminMomoName, setAdminMomoName] = useState('MaketiConnect Admin');
  const [adminMomoNumber, setAdminMomoNumber] = useState('+268 7611 2233');
  const [adminMomoOperator, setAdminMomoOperator] = useState('MTN MoMo');
  const [adminBankName, setAdminBankName] = useState('Standard Bank Eswatini');
  const [adminBankAccountName, setAdminBankAccountName] = useState('MaketiConnect (PTY) LTD');
  const [adminBankAccountNumber, setAdminBankAccountNumber] = useState('9102 3445 1092');
  const [adminBankBranchCode, setAdminBankBranchCode] = useState('663108');
  const [adminBankType, setAdminBankType] = useState('Corporate Trust Escrow');
  const [adminInstructions, setAdminInstructions] = useState('Please use your registered Shop Name or Phone Number as payment reference and upload confirmation.');

  useEffect(() => {
    const loadAdminPayments = async () => {
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
          if (data.instructions) setAdminInstructions(data.instructions);
        }
      } catch (err) {
        console.warn('Error loading admin payment settings:', err);
      }
    };
    loadAdminPayments();
  }, []);

  if (!product || !seller) return <div className="p-10 text-center font-bold">Product or Seller not found</div>;

  // Delivery Cost calculation
  const deliveryCosts = {
    pickup: 0,
    home: 50,
    sameday: 70,
    scheduled: 60
  };
  const deliveryFee = deliveryCosts[deliveryMethod];
  const itemTotal = product.price;
  const checkoutGrandTotal = itemTotal + deliveryFee;

  // Split calculations
  const walletDeduction = isSplitPayment ? Math.min(userWalletBalance, checkoutGrandTotal - 15) : 0;
  const paymentBaseAmount = checkoutGrandTotal - walletDeduction;
  
  // Mobile money service fee (1% platform fee)
  const mobileMoneyFee = paymentMode === 'momo' ? paymentBaseAmount * 0.01 : 0;
  const mobileMoneyAmount = paymentBaseAmount + mobileMoneyFee;

  const simulatePopUpload = (filename: string) => {
    setUploadedPopName(filename);
    setPopUploadProgress(10);
    const interval = setInterval(() => {
      setPopUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleStartPayment = (e: FormEvent) => {
    e.preventDefault();
    if (paymentMode === 'momo') {
      setProcessingState('ussd_push_sent');
    } else {
      if (bankTab === 'instant') {
        setProcessingState('bank_instant_verify');
      } else if (bankTab === 'eft') {
        setProcessingState('bank_eft_verify');
      } else {
        setProcessingState('bank_deposit_verify');
      }
    }
  };

  const handleConfirmPin = () => {
    if (!pinInput || pinInput.length < 4) {
      alert('Please enter a secure 4-digit Mobile Money PIN');
      return;
    }
    setProcessingState('processing_escrow');
    
    // Simulate multi-tier split payments routing & escrow locking callback
    setTimeout(() => {
      try {
        const existingData = localStorage.getItem('activeEscrows');
        const escrowList = existingData ? JSON.parse(existingData) : [];

        const newEscrow = {
          id: `ESCO-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
          item: product.name,
          amount: itemTotal,
          recipient: seller.name,
          description: deliveryMethod === 'pickup' 
            ? '🏛️ Store Pickup Option selected' 
            : deliveryMethod === 'scheduled' 
              ? `📅 Scheduled for ${scheduledDay} (${scheduledSlot})` 
              : deliveryMethod === 'sameday' 
                ? '⚡ Same-Day Express Delivery' 
                : '🏍️ Standard Home Delivery',
          provider: paymentMode === 'bank' 
            ? `${selectedBank} (${bankTab === 'eft' ? 'EFT' : bankTab === 'instant' ? 'Instant Bank' : 'Deposit Slip'})` 
            : REGIONAL_SYSTEMS[selectedProviderIdx].name,
          status: 'Locked',
          date: 'Just now',
          image: product.images?.[0] || "",
          buyerPhone: paymentMode === 'bank' ? bankSenderAccount : (phoneNumber || '+268 7600 0000'),
          deliveryMethod: deliveryMethod,
          deliveryDetails: deliveryMethod === 'scheduled' 
            ? `${scheduledDay} @ ${scheduledSlot}` 
            : deliveryMethod === 'pickup' 
              ? 'Self Pickup' 
              : deliveryMethod === 'sameday' 
                ? 'Same-Day (within 4 hours)' 
                : 'Standard Home Delivery'
        };

        // Prepend the new escrow item
        escrowList.unshift(newEscrow);
        localStorage.setItem('activeEscrows', JSON.stringify(escrowList));

        // Deduct from wallet balance
        const currentBal = parseFloat(localStorage.getItem('emakethe_wallet_balance') || '0.00');
        const newBal = Math.max(0, currentBal - itemTotal);
        localStorage.setItem('emakethe_wallet_balance', newBal.toFixed(2));
        
        // Add wallet transaction record
        const txsStr = localStorage.getItem('emakethe_wallet_transactions') || '[]';
        const txs = JSON.parse(txsStr);
        txs.unshift({
          id: `tx-${Math.floor(100 + Math.random() * 900)}`,
          type: 'Merchant Payment',
          detail: seller.name,
          provider: paymentMode === 'bank' ? 'Bank Transfer' : REGIONAL_SYSTEMS[selectedProviderIdx].name,
          date: 'Just now',
          amount: itemTotal,
          isPositive: false,
          status: 'Completed'
        });
        localStorage.setItem('emakethe_wallet_transactions', JSON.stringify(txs));

        // Add customer notification record
        const notificationsStr = localStorage.getItem('emakethe_customer_notifications') || '[]';
        const list = JSON.parse(notificationsStr);
        list.unshift({
          id: `nt-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'success',
          title: 'Payment Escrow Locked',
          message: `Your payment of E ${itemTotal.toFixed(2)} for ${product.name} is securely locked in platform escrow.`,
          time: 'Just now',
          read: false
        });
        localStorage.setItem('emakethe_customer_notifications', JSON.stringify(list));
        window.dispatchEvent(new Event('emakethe_notifications_updated'));

      } catch (e) {
        console.warn('Error saving new escrow:', e);
      }
      
      setProcessingState('completed');
    }, 2800);
  };

  const activeProv = REGIONAL_SYSTEMS[selectedProviderIdx];

  // Component states for Bank checkouts
  if (processingState === 'bank_instant_verify') {
    return (
      <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-6 text-center text-white font-sans max-w-md mx-auto relative shadow-2xl rounded-[40px] overflow-hidden">
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center opacity-75">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Real-Time Bank Settlement v2</span>
          <span className="text-[10px] font-bold">⚡ SECURE GATEWAY</span>
        </div>

        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
           <Landmark size={32} className="stroke-[2.5]" />
        </div>

        <h1 className="text-xl font-black uppercase tracking-tight mb-2">Instant Bank Authorize</h1>
        
        <p className="text-xs font-normal text-slate-300 mb-6 px-4 leading-relaxed font-sans">
          Please confirm the direct automated interbank clearing transfer from your <span className="font-bold text-emerald-400">{selectedBank}</span> account.<br />
          Authorizing Amount: <span className="font-extrabold text-white text-sm font-mono">{activeProv.currency} {mobileMoneyAmount.toFixed(2)}</span>
        </p>

        {/* Interactive Account Login & Pin verification */}
        <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700/80 w-full text-left flex flex-col gap-3">
           <div>
             <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block mb-1">Enter Bank Username / Account Number</label>
             <input 
               type="text"
               value={bankSenderAccount}
               onChange={(e) => setBankSenderAccount(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 w-full text-xs font-bold font-mono text-white focus:border-emerald-400 outline-none"
               placeholder="62100892231"
             />
           </div>

           <div>
             <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block mb-1">Sender Full Name (Account Holder)</label>
             <input 
               type="text"
               value={bankSenderName}
               onChange={(e) => setBankSenderName(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 w-full text-xs font-bold text-white focus:border-emerald-400 outline-none"
               placeholder="Maseko Wholesalers Ltd"
             />
           </div>

           <div>
             <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block mb-1">Bank App Secure PIN / Password</label>
             <input 
               type="password"
               value={pinInput}
               onChange={(e) => setPinInput(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 w-full text-xs font-bold text-white focus:border-emerald-400 outline-none font-mono"
               placeholder="••••"
             />
           </div>

           <button 
             onClick={() => {
               if (!bankSenderAccount || !bankSenderName || !pinInput) {
                 alert('Please fill in all banking authorize fields');
                 return;
               }
               setProcessingState('processing_escrow');
             }}
             className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase py-3.5 rounded-xl transition-all tracking-wider mt-1 cursor-pointer"
           >
             Confirm Secure Bank Debit
           </button>
           <button 
             onClick={() => setProcessingState('idle')}
             className="w-full bg-transparent hover:bg-white/5 text-slate-400 font-bold text-[10px] uppercase py-2 rounded-xl transition-all tracking-wider text-center"
           >
             Go Back & Modify
           </button>
        </div>
      </div>
    );
  }

  if (processingState === 'bank_eft_verify') {
    const defaultRef = bankDepositRef || `EMK-CHECK-EFT-${Math.floor(10000 + Math.random() * 90000)}`;
    return (
      <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-6 text-center text-white font-sans max-w-md mx-auto relative shadow-2xl rounded-[40px] overflow-hidden">
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center opacity-75">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">EFT Escrow Clearance</span>
          <span className="text-[10px] font-bold">📄 MANUAL AUDIT</span>
        </div>

        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
           <Landmark size={32} className="stroke-[2.5]" />
        </div>

        <h1 className="text-xl font-black uppercase tracking-tight mb-1">Standard EFT Settlement</h1>
        
        <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-900 text-left text-[11px] mb-5 leading-relaxed font-sans">
          <p className="font-bold text-indigo-300 uppercase text-[9px] tracking-widest mb-1.5 font-mono">eMakethe Trust Escrow Bank Target:</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 font-medium text-slate-200">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Receiver Bank</span>
              <span className="font-extrabold text-white">{adminBankName}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Account Number</span>
              <span className="font-mono font-bold text-white">{adminBankAccountNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Branch Code</span>
              <span className="font-mono text-white">{adminBankBranchCode}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">EFT Reference Code</span>
              <span className="font-mono font-black text-yellow-400">{defaultRef}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-300 mt-2 border-t border-indigo-900/50 pt-1.5 font-normal">
            💡 Settle <span className="font-bold text-white">{activeProv.currency} {mobileMoneyAmount.toFixed(2)}</span> from your bank portal using the reference above.
          </p>
          <div className="text-[9.5px] text-indigo-200 bg-indigo-900/40 p-2 rounded-xl mt-2 border border-indigo-800/50 leading-relaxed">
            📢 <strong>Admin Guidelines:</strong> {adminInstructions}
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700/80 w-full text-left flex flex-col gap-3">
           <div>
             <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono block mb-1">Your (Sender) Account Holder Name</label>
             <input 
               type="text"
               value={bankSenderName}
               onChange={(e) => setBankSenderName(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 w-full text-xs font-bold text-white focus:border-indigo-400 outline-none"
               placeholder="Maseko Wholesalers Ltd"
             />
           </div>

           <div>
             <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono block mb-1">Your (Sender) Bank Account Number</label>
             <input 
               type="text"
               value={bankSenderAccount}
               onChange={(e) => setBankSenderAccount(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 w-full text-xs font-bold font-mono text-white focus:border-indigo-400 outline-none"
               placeholder="62100892231"
             />
           </div>

           <button 
             onClick={() => {
               if (!bankSenderName || !bankSenderAccount) {
                 alert('Please enter your sender account details to match EFT clearance.');
                 return;
               }
               if (!bankDepositRef) {
                 setBankDepositRef(defaultRef);
               }
               setProcessingState('processing_escrow');
             }}
             className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all tracking-wider mt-1 cursor-pointer"
           >
             Submit EFT Settlement & Lock Escrow
           </button>
           <button 
             onClick={() => setProcessingState('idle')}
             className="w-full bg-transparent hover:bg-white/5 text-slate-400 font-bold text-[10px] uppercase py-2 rounded-xl transition-all tracking-wider text-center"
           >
             Go Back & Modify
           </button>
        </div>
      </div>
    );
  }

  if (processingState === 'bank_deposit_verify') {
    return (
      <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-6 text-center text-white font-sans max-w-md mx-auto relative shadow-2xl rounded-[40px] overflow-hidden">
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center opacity-75">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Bank Deposit Slip Proof</span>
          <span className="text-[10px] font-bold">🏦 CASH / ATM</span>
        </div>

        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
           <Landmark size={32} className="stroke-[2.5]" />
        </div>

        <h1 className="text-xl font-black uppercase tracking-tight mb-1">Cash Deposit Slip Claim</h1>
        
        <p className="text-xs font-normal text-slate-300 mb-5 px-4 leading-relaxed font-sans">
          Please upload a photo/receipt of your cash deposit slip or ATM slip for <span className="font-bold text-white">{activeProv.currency} {mobileMoneyAmount.toFixed(2)}</span>.
        </p>

        <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700/80 w-full text-left flex flex-col gap-3.5">
           <div>
             <label className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono block mb-1">ATM Deposit Slip Serial Number</label>
             <input 
               type="text"
               value={bankDepositRef}
               onChange={(e) => setBankDepositRef(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 w-full text-xs font-bold font-mono text-white focus:border-amber-400 outline-none"
               placeholder="ATM-DEP-99812A"
             />
           </div>

           {/* Interactive PDF/JPG Receipt Uploader */}
           <div>
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono block mb-1.5">Upload Receipt Attachment</label>
             <div 
               onClick={() => simulatePopUpload(`DEP_CHECKOUT_SLIP_${Math.floor(1000 + Math.random()*9000)}.pdf`)}
               className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80"
             >
               {uploadedPopName ? (
                 <div className="flex flex-col items-center gap-1">
                   <span className="text-xl">📄</span>
                   <p className="text-[11px] font-bold text-slate-200">{uploadedPopName}</p>
                   {popUploadProgress !== null && (
                     <div className="w-full max-w-[150px] bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                       <div 
                         className="bg-amber-400 h-full transition-all duration-300" 
                         style={{ width: `${popUploadProgress}%` }}
                       ></div>
                     </div>
                   )}
                   <p className="text-[8px] text-gray-500 font-bold font-mono">
                     {popUploadProgress === 100 ? "READY" : "PROCESSING..."}
                   </p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                   <span className="text-xl">📁</span>
                   <p className="text-[11px] font-bold text-slate-300 mt-1">Tap here to attach slip photo</p>
                 </div>
               )}
             </div>
           </div>

           <button 
             disabled={!uploadedPopName || popUploadProgress !== 100 || !bankDepositRef}
             onClick={() => {
               setProcessingState('processing_escrow');
             }}
             className="w-full bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase py-3.5 rounded-xl transition-all tracking-wider mt-1 cursor-pointer"
           >
             Confirm Deposit Slip & Lock Escrow
           </button>
           
           <button 
             onClick={() => setProcessingState('idle')}
             className="w-full bg-transparent hover:bg-white/5 text-slate-400 font-bold text-[10px] uppercase py-2 rounded-xl transition-all tracking-wider text-center"
           >
             Go Back & Modify
           </button>
        </div>
      </div>
    );
  }

  // Component states during USSD processing / completion
  if (processingState === 'ussd_push_sent') {
    return (
      <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-6 text-center text-white font-sans max-w-md mx-auto relative shadow-2xl rounded-[40px] overflow-hidden">
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center opacity-75">
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest font-mono">USSD Gateway Link v3</span>
          <span className="text-[10px] font-bold">{activeProv.flag} Connected</span>
        </div>

        <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-500 text-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-bounce">
           <Smartphone size={32} className="stroke-[2.5]" />
        </div>

        <h1 className="text-xl font-black uppercase tracking-tight mb-3">Authorize Payment Prompt</h1>
        
        <p className="text-xs font-normal text-slate-300 mb-6 px-4 leading-relaxed">
          We have dispatched an instant USSD popup request to <span className="font-bold text-yellow-400 font-mono">{phoneNumber || activeProv.placeholder}</span>.<br />
          Authorizing: <span className="font-extrabold text-white text-sm font-mono">{activeProv.currency} {mobileMoneyAmount.toFixed(2)}</span>
        </p>

        {/* Interactive PIN input widget */}
        <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700/80 w-full text-left flex flex-col gap-3">
           <label className="text-[9px] font-black text-yellow-400 uppercase tracking-widest font-mono">Enter 4-Digit MoMo PIN</label>
           <input 
             type="password"
             maxLength={4}
             value={pinInput}
             onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
             className="bg-slate-950 border border-slate-700 rounded-xl py-3.5 text-center text-xl font-bold tracking-[1.5em] text-white focus:border-yellow-400 outline-none font-mono"
             placeholder="••••"
           />
           <button 
             onClick={handleConfirmPin}
             className="w-full bg-[#25D366] hover:bg-green-600 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all tracking-wider mt-1"
           >
              Approve Custom USSD Payment
           </button>
        </div>

        {/* Security badge and info */}
        <p className="text-[10px] text-slate-500 mt-6 flex items-center gap-1.5 justify-center">
          <Lock size={12} /> Standard 256-bit Mobile Money GSM Encryption
        </p>
      </div>
    );
  }

  if (processingState === 'processing_escrow') {
    return (
      <div className="bg-slate-950 min-h-screen flex flex-col items-center justify-center p-6 text-center text-white font-sans max-w-md mx-auto shadow-2xl rounded-[40px] overflow-hidden">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-5 animate-spin">
           <Loader2 size={32} className="text-white" />
        </div>
        
        <h2 className="text-lg font-black uppercase tracking-tight text-white">Escrow Trust Cover Lock</h2>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] leading-relaxed">
           Routing payments, writing double-ledger escrow protection entries, and dispatching webhook notifications to {seller.name}...
        </p>

        {/* Real-time split settlement detail display */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-left w-full flex flex-col gap-3 font-mono text-[10px]">
           <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Escrow Distribution (Split)</span>
              <span className="text-green-400 font-bold">MoMo Active API</span>
           </div>
           
           <div className="flex justify-between">
              <span className="text-slate-300">🏢 Merchant ({seller.name}):</span>
              <span className="font-bold text-white">85% &rarr; {activeProv.currency} {(itemTotal * 0.85).toFixed(2)}</span>
           </div>
           
           <div className="flex justify-between">
              <span className="text-slate-300">🏍️ Moto Rider Dispatch:</span>
              <span className="font-bold text-white">10% &rarr; {activeProv.currency} {(itemTotal * 0.10 + deliveryFee).toFixed(2)}</span>
           </div>
           
           <div className="flex justify-between">
              <span className="text-slate-300">🛡️ Platform Escrow Margins:</span>
              <span className="font-bold text-white">5% &rarr; {activeProv.currency} {(itemTotal * 0.05).toFixed(2)}</span>
           </div>
        </div>
      </div>
    );
  }

  if (processingState === 'completed') {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto shadow-2xl rounded-[40px]">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <CheckCircle2 size={44} className="stroke-[2.5]" />
        </div>
        
        <h1 className="text-2xl font-display font-black text-gray-800 mb-2 uppercase tracking-tight">Order Locked in Escrow!</h1>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 px-4">
          Your payment of <span className="font-bold text-slate-800">{activeProv.currency} {(checkoutGrandTotal + mobileMoneyFee).toFixed(2)}</span> was secured successfully. {seller.name} has been notified over cellular and SMS!
        </p>
        
        {/* Settlement logs */}
        <div className="bg-gray-50 rounded-3xl p-5 w-full text-left mb-6 border border-gray-100/50">
           <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-wider mb-3">Order Settlement & Routing</h3>
           
           <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-gray-200/50">
             <span className="text-[11px] text-gray-500">Secure escrow reference ID:</span>
             <span className="text-xs font-bold text-blue-600 font-mono">ESCO-921A-{Math.floor(Math.random() * 900) + 10}</span>
           </div>

           <div className="flex justify-between items-center mb-2">
             <span className="text-[11px] text-gray-500">Ordered item:</span>
             <span className="text-xs font-bold text-gray-800">{product.name}</span>
           </div>

           <div className="flex justify-between items-center mb-2">
             <span className="text-[11px] text-gray-500">Cleared through:</span>
             <span className="text-xs font-bold text-green-600 font-mono">{activeProv.name}</span>
           </div>

           {isSplitPayment && (
             <div className="bg-yellow-50 text-yellow-800 text-[9px] font-bold p-2 rounded-xl border border-yellow-100/50 flex items-center gap-1.5 mt-2.5">
               <Info size={12} /> Split checkout completed: deducted E {walletDeduction.toFixed(2)} from in-app balances.
             </div>
           )}
        </div>

        <button 
          onClick={() => navigate('/messages')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg transition-transform text-xs uppercase tracking-wider mb-2.5"
        >
          Message Seller on Chat
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider"
        >
          Back to Home Market
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-36 max-w-md mx-auto shadow-2xl rounded-[40px] relative overflow-hidden">
      
      {/* Sticky header bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-3 text-gray-800 hover:opacity-85">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black text-gray-800 uppercase tracking-wide">Checkout Security Node</h1>
      </div>

      <div className="p-4 flex flex-col gap-4">
         
         {/* Simple Product overview summary */}
         <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200/50 flex gap-3.5">
            <img src={product.images[0]} className="w-16 h-16 rounded-2xl object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-gray-800 text-xs truncate leading-snug">{product.name}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Billed by: {seller.name}</p>
              <div className="font-extrabold text-green-600 mt-1.5 text-xs flex items-baseline gap-1">
                 <span>E {product.price.toFixed(2)}</span>
                 <span className="text-[9px] font-normal text-gray-400">({product.unit})</span>
              </div>
            </div>
         </div>

         {/* Secure Check badges block */}
         <div className="bg-emerald-50 text-emerald-950 p-4 rounded-3xl border border-emerald-100 flex gap-3 text-xs">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
               <h4 className="font-extrabold uppercase text-[10px] tracking-wide text-emerald-900">100% Secure Escrow Lock Guarantee</h4>
               <p className="text-[10px] text-emerald-800 leading-relaxed mt-0.5">
                 Funds stay locked securely in the eMakethe/MaketiConnect Escrow Trust Node. The supplier Store only receives the payoff once you confirm the harvest delivery!
               </p>
            </div>
         </div>

         {/* Delivery Selection */}
         <div>
            <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2.5 px-1">Choose Delivery Preference</h3>
            
            <div className="flex flex-col gap-2">
               <label className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${deliveryMethod === 'pickup' ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white hover:bg-slate-50'}`}>
                 <input type="radio" className="hidden" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${deliveryMethod === 'pickup' ? 'border-green-500' : 'border-gray-200'}`}>
                   {deliveryMethod === 'pickup' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </div>
                 <Store size={16} className="text-gray-400 mr-3 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 leading-snug">Store Pickup</p>
                    <p className="text-[9px] text-gray-400">Collect physically from merchant kiosk/farm (Free)</p>
                 </div>
               </label>

               <label className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${deliveryMethod === 'home' ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white hover:bg-slate-50'}`}>
                 <input type="radio" className="hidden" checked={deliveryMethod === 'home'} onChange={() => setDeliveryMethod('home')} />
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${deliveryMethod === 'home' ? 'border-green-500' : 'border-gray-200'}`}>
                   {deliveryMethod === 'home' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </div>
                 <Truck size={16} className="text-gray-400 mr-3 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 leading-snug">Standard Home Dispatch</p>
                    <p className="text-[9px] text-gray-400">Custom Moto Rider Courier to your area (+E 50.00)</p>
                 </div>
                 <span className="text-xs font-black text-green-600 shrink-0 font-mono">+E 50</span>
               </label>

               <label className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${deliveryMethod === 'sameday' ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white hover:bg-slate-50'}`}>
                 <input type="radio" className="hidden" checked={deliveryMethod === 'sameday'} onChange={() => setDeliveryMethod('sameday')} />
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${deliveryMethod === 'sameday' ? 'border-green-500' : 'border-gray-200'}`}>
                   {deliveryMethod === 'sameday' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </div>
                 <Zap size={16} className="text-gray-400 mr-3 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 leading-snug">Same-Day Express Moto</p>
                    <p className="text-[9px] text-gray-400">Guaranteed delivery within 4 hours (+E 70.00)</p>
                 </div>
                 <span className="text-xs font-black text-green-600 shrink-0 font-mono">+E 70</span>
               </label>

               <label className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${deliveryMethod === 'scheduled' ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white hover:bg-slate-50'}`}>
                 <input type="radio" className="hidden" checked={deliveryMethod === 'scheduled'} onChange={() => setDeliveryMethod('scheduled')} />
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${deliveryMethod === 'scheduled' ? 'border-green-500' : 'border-gray-200'}`}>
                   {deliveryMethod === 'scheduled' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </div>
                 <Calendar size={16} className="text-gray-400 mr-3 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 leading-snug">Scheduled Delivery Slot</p>
                    <p className="text-[9px] text-gray-400">Choose custom date & time slot for drop-off (+E 60.00)</p>
                 </div>
                 <span className="text-xs font-black text-green-600 shrink-0 font-mono">+E 60</span>
               </label>

               {/* Interactive Custom Date & Slot Picker for Scheduled Deliveries */}
               {deliveryMethod === 'scheduled' && (
                 <div className="mt-3 bg-amber-50/40 p-4 rounded-3xl border border-amber-200/50 flex flex-col gap-3 font-sans animate-in slide-in-from-top duration-250">
                   <div>
                     <span className="block text-[8px] font-black text-amber-700 uppercase tracking-widest font-mono mb-1.5 font-sans">Select Scheduled Delivery Day</span>
                     <div className="grid grid-cols-4 gap-1.5 font-sans">
                       {['Tomorrow', 'Monday', 'Tuesday', 'Wednesday'].map(day => (
                         <button
                           key={day}
                           type="button"
                           onClick={() => setScheduledDay(day)}
                           className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                             scheduledDay === day 
                               ? 'bg-amber-600 border-amber-600 text-white font-extrabold' 
                               : 'bg-white border-gray-150 text-gray-600 hover:bg-amber-50/20'
                           }`}
                         >
                           {day}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div>
                     <span className="block text-[8px] font-black text-amber-700 uppercase tracking-widest font-mono mb-1.5 font-sans">Choose Preferred Time Window</span>
                     <div className="flex flex-col gap-1.5 font-sans">
                       {[
                         'Morning (08:00 - 12:00)',
                         'Afternoon (13:00 - 17:00)',
                         'Evening (18:00 - 21:00)'
                       ].map(slot => (
                         <button
                           key={slot}
                           type="button"
                           onClick={() => setScheduledSlot(slot)}
                           className={`p-2.5 rounded-xl text-[10px] font-bold text-left border flex justify-between items-center transition-all ${
                             scheduledSlot === slot 
                               ? 'bg-amber-100 border-amber-650 text-amber-900 font-extrabold' 
                               : 'bg-white border-gray-150 text-gray-600'
                           }`}
                         >
                           <span>{slot}</span>
                           <span className={`${scheduledSlot === slot ? 'text-amber-700 font-black' : 'text-gray-300'} text-[9px]`}>
                             {scheduledSlot === slot ? '✓ Selected' : 'Unchosen'}
                           </span>
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
               )}
            </div>
         </div>

         {/* Delivery address input */}
         {deliveryMethod !== 'pickup' && (
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                     <MapPin size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 leading-snug">Checkout Delivery Address</p>
                    <p className="text-[9px] text-slate-400">Checkers Plot 45, Near Mbabane Clinic</p>
                  </div>
               </div>
               <button className="text-[9px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase">Modify</button>
            </div>
         )}

          {/* Primary Payment Mode Switcher */}
          {/* Seller's Recommended Payment Platform Panel */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4 rounded-3xl border border-green-500/25 shadow-sm flex flex-col gap-3 text-left">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-600 flex items-center justify-center font-black text-xs shrink-0 shadow-inner animate-pulse">
                   ★
                </div>
                <div>
                   <h4 className="text-[11.5px] font-black text-green-950 uppercase tracking-wide">Recommended Payment Platform</h4>
                   <p className="text-[9px] text-green-700 font-medium">Official recommendation on the app for {seller.name}</p>
                </div>
             </div>

             <div className="bg-white/95 p-3 rounded-2xl border border-green-100/80 text-[11px] leading-relaxed text-slate-700 flex flex-col gap-1.5 font-sans shadow-sm">
                <div className="flex justify-between items-center pb-1 border-b border-gray-150">
                   <span className="text-[9.5px] text-gray-400 font-bold uppercase">Platform Name</span>
                   <span className="font-extrabold text-slate-800">{seller.preferredPaymentPlatform || 'MTN Mobile Money'}</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-gray-150">
                   <span className="text-[9.5px] text-gray-400 font-bold uppercase">Account Name</span>
                   <span className="font-black text-slate-800">{seller.payoutName || seller.name}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9.5px] text-gray-400 font-bold uppercase">Account / Phone</span>
                   <span className="font-mono font-black text-slate-800">{seller.payoutNumber || seller.phone}</span>
                </div>
             </div>

             <button 
                type="button"
                onClick={() => {
                   const preferred = seller.preferredPaymentPlatform || 'MTN MoMo';
                   if (preferred === 'MTN MoMo' || preferred === 'Eswatini Mobile eMali') {
                      setPaymentMode('momo');
                      setSelectedProviderIdx(preferred === 'MTN MoMo' ? 0 : 1);
                      const cleanedPhone = (seller.payoutNumber || seller.phone || '').replace(/\s+/g, '');
                      setPhoneNumber(cleanedPhone);
                   } else {
                      setPaymentMode('bank');
                      setBankTab('eft');
                      setSelectedBank(preferred === 'FNB Bank' ? 'First National Bank (FNB) Eswatini' : 'Standard Bank Eswatini');
                      setBankSenderName('Maseko Wholesalers Ltd');
                   }
                }}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-extrabold text-[10.5px] uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md shadow-green-600/10 flex items-center justify-center gap-1 font-sans cursor-pointer"
             >
                ⚡ Use Recommended Payment Setup
             </button>
          </div>

          <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm flex gap-1.5 text-xs font-bold font-sans">
             <button 
               type="button"
               onClick={() => setPaymentMode('momo')}
               className={`flex-1 text-center py-2.5 rounded-xl transition-all ${paymentMode === 'momo' ? 'bg-green-600 text-white shadow-sm font-extrabold' : 'text-gray-500 hover:text-gray-800'}`}
             >
               📱 Mobile Money
             </button>
             <button 
               type="button"
               onClick={() => setPaymentMode('bank')}
               className={`flex-1 text-center py-2.5 rounded-xl transition-all ${paymentMode === 'bank' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
             >
               🏦 Bank Settlement
             </button>
          </div>

          {/* Render Payment Details based on selection */}
          {paymentMode === 'momo' ? (
            <div className="flex flex-col gap-4">
              {/* African Payment Method systems */}
              <div>
                 <div className="flex justify-between items-center mb-2.5 px-1">
                    <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider font-sans">Select Mobile Money Network</h3>
                    <span className="text-[9px] text-gray-400 flex items-center gap-1 font-mono"><Lock size={10} /> GSM Secured</span>
                 </div>

                 <div className="flex flex-col gap-2">
                    {REGIONAL_SYSTEMS.map((item, idx) => {
                      const active = selectedProviderIdx === idx;
                      return (
                        <label 
                          key={item.id}
                          onClick={() => setSelectedProviderIdx(idx)} 
                          className={`flex items-center p-3.5 rounded-2xl border cursor-pointer transition-all ${active ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${active ? 'border-green-500' : 'border-gray-200'}`}>
                            {active && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                          </div>

                          <div className={`w-12 h-8 rounded-lg ${item.logoColor} font-black text-[8px] flex items-center justify-center shrink-0 mr-3 shadow-inner`}>
                            {item.badgeText}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                               <span className="text-xs font-extrabold text-slate-800 font-sans">{item.name}</span>
                               <span>{item.flag}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 leading-none mt-0.5 font-medium font-sans">{item.description}</p>
                          </div>
                        </label>
                      );
                    })}
                 </div>
              </div>

              {/* Phone Number Input */}
              <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-2">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Mobile Money Account Number</span>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600 font-mono">📲 WP:</span>
                    <input 
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={activeProv.placeholder}
                      className="w-full bg-slate-50 border border-gray-200 text-xs font-bold font-mono py-3 pl-14 pr-4 rounded-xl outline-none focus:border-green-550 focus:ring-1 focus:ring-green-400 transition-all text-slate-800"
                    />
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Regional Bank Settlement Options */}
              <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-white p-4.5 rounded-3xl border border-indigo-900 shadow-sm relative overflow-hidden font-sans">
                <span className="absolute right-0 top-0 bg-indigo-500 text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-bl-lg font-mono">Wholesale Hub</span>
                <p className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5 mb-0.5">
                  <Landmark size={14} className="text-indigo-400" /> Secure Regional Bank settlement
                </p>
                <p className="text-[9px] text-slate-300 leading-relaxed font-normal">
                  Lock high-volume wholesales and suppliers inside eMakethe corporate trust escrows. Settle via FNB, Standard Bank, Nedbank or Swaziland Building Society.
                </p>
              </div>

              {/* Bank Switcher Tabs */}
              <div className="bg-white p-1 rounded-xl border border-gray-150 flex gap-1 text-[10px] font-bold font-sans">
                 <button
                   type="button"
                   onClick={() => setBankTab('eft')}
                   className={`flex-1 text-center py-1.5 rounded-lg transition-all ${bankTab === 'eft' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                   📄 Standard EFT
                 </button>
                 <button
                   type="button"
                   onClick={() => setBankTab('instant')}
                   className={`flex-1 text-center py-1.5 rounded-lg transition-all ${bankTab === 'instant' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                   ⚡ Instant Bank
                 </button>
                 <button
                   type="button"
                   onClick={() => setBankTab('deposit')}
                   className={`flex-1 text-center py-1.5 rounded-lg transition-all ${bankTab === 'deposit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                   🏦 ATM Cash Slip
                 </button>
              </div>

              {/* Bank-Specific Form Subviews */}
              {bankTab === 'eft' && (
                <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 font-sans">
                  <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/60 text-[10px] text-indigo-900 leading-normal mb-1">
                    ℹ️ <span className="font-bold">Instructions:</span> Choose your bank and provide your account details. A unique settlement reference will be generated for you on the next confirmation screen.
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Your Banking Institution</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option>First National Bank (FNB) Eswatini</option>
                      <option>Standard Bank Eswatini</option>
                      <option>Nedbank Eswatini</option>
                      <option>Eswatini Bank</option>
                      <option>Swaziland Building Society</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">Sender Account Name</label>
                      <input
                        type="text"
                        value={bankSenderName}
                        onChange={(e) => setBankSenderName(e.target.value)}
                        placeholder="Maseko Wholesalers Ltd"
                        className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">Sender Account #</label>
                      <input
                        type="text"
                        value={bankSenderAccount}
                        onChange={(e) => setBankSenderAccount(e.target.value)}
                        placeholder="62100892231"
                        className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {bankTab === 'instant' && (
                <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 font-sans">
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/60 text-[10px] text-emerald-900 leading-normal mb-1">
                    ⚡ <span className="font-bold">Real-time Debit:</span> Instantly authorize a direct secure checkout debit from your bank account. Clears under 60 seconds with no interbank delays.
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Secure Interbank Institution</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option>First National Bank (FNB) Eswatini</option>
                      <option>Standard Bank Eswatini</option>
                      <option>Nedbank Eswatini</option>
                      <option>Swaziland Building Society</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">Interbank Acc ID / User</label>
                      <input
                        type="text"
                        value={bankSenderName}
                        onChange={(e) => setBankSenderName(e.target.value)}
                        placeholder="maseko_wholesale"
                        className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">Primary Account #</label>
                      <input
                        type="text"
                        value={bankSenderAccount}
                        onChange={(e) => setBankSenderAccount(e.target.value)}
                        placeholder="62100892231"
                        className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {bankTab === 'deposit' && (
                <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 font-sans">
                  <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/60 text-[10px] text-indigo-900 leading-normal mb-1 font-sans">
                    🏦 <span className="font-bold">Walk-in Deposits:</span> Deposited physical cash at FNB or Standard Bank counter/ATM? Match the slip receipt details to automatically authorize the escrow.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">ATM Receipt Slip Serial</label>
                      <input
                        type="text"
                        value={bankDepositRef}
                        onChange={(e) => setBankDepositRef(e.target.value)}
                        placeholder="ATM-DEP-99812A"
                        className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">Receiving Bank Node</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option>First National Bank (FNB) Eswatini</option>
                        <option>Standard Bank Eswatini</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SPLIT PAYMENT ENGINE SELECTOR (wallet deduction vs mobile money payment) */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col gap-3">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-yellow-600" />
                  <div>
                     <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">Split checkout payment</span>
                     <span className="block text-[9px] text-slate-400 font-medium">Split between Wallet & MoMo/Bank</span>
                  </div>
                </div>
                
                <input 
                  type="checkbox"
                  checked={isSplitPayment}
                  onChange={(e) => setIsSplitPayment(e.target.checked)}
                  className="accent-green-600 h-4 w-4 shrink-0 rounded transition-all cursor-pointer"
                />
             </div>

             <p className="text-[10px] text-slate-500 leading-normal">
               Internal Wallet Balance is <span className="font-bold text-slate-700">E {userWalletBalance.toFixed(2)}</span>. Enabling split payments automatically deducts available internal balances, charging only the leftovers to your {paymentMode === 'bank' ? 'selected bank route' : activeProv.name} setup.
             </p>

             {isSplitPayment && (
               <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex flex-col gap-2 font-mono text-[10px]">
                  <div className="flex justify-between text-yellow-900 font-bold">
                     <span>Internal Wallet Deduction:</span>
                     <span>- E {walletDeduction.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-black pt-1.5 border-t border-amber-200/50">
                     <span>Outstanding Amount Billed:</span>
                     <span>{activeProv.currency} {mobileMoneyAmount.toFixed(2)}</span>
                  </div>
               </div>
             )}
          </div>

      </div>

      {/* Floating Action checkout payment tray */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-150 p-4 pb-safe z-20 flex flex-col gap-3.5 shadow-[-2px_-4px_15px_rgba(0,0,0,0.04)]">
         <div className="flex flex-col gap-1.5 px-1">
            <div className="flex justify-between items-center">
               <span className="text-gray-500 font-extrabold text-xs uppercase">Sum Grand Total:</span>
               <span className="text-lg font-black text-green-600 font-mono">{activeProv.currency} {checkoutGrandTotal.toFixed(2)}</span>
            </div>
            {paymentMode === 'momo' && mobileMoneyFee > 0 && (
               <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-1">
                  <span>Mobile Money Platform Fee (1%):</span>
                  <span className="font-mono text-gray-600">+ {activeProv.currency} {mobileMoneyFee.toFixed(2)}</span>
               </div>
            )}
         </div>
         
         <form onSubmit={handleStartPayment}>
            <button 
              type="submit"
              className={`w-full ${paymentMode === 'bank' ? 'bg-indigo-650 hover:bg-indigo-750 shadow-indigo-650/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'} active:scale-[0.98] text-white font-black py-4.5 rounded-2xl shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
            >
               <span>
                 {paymentMode === 'bank' 
                   ? '🔐 Proceed to Bank Settlement' 
                   : `🔐 Pay with ${activeProv.name}`}
               </span>
               {isSplitPayment && <span className="text-[9.5px] bg-white/20 px-1.5 py-0.5 rounded font-mono">(Split Option)</span>}
            </button>
         </form>
      </div>

    </div>
  );
}
