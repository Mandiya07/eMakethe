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
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { useFirebase } from '../components/FirebaseProvider';

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
  const [processingState, setProcessingState] = useState<'idle' | 'ussd_push_sent' | 'processing_escrow' | 'completed'>('idle');
  const [pinInput, setPinInput] = useState('');
  
  // Custom scheduled date & slot selection
  const [scheduledDay, setScheduledDay] = useState('Tomorrow');
  const [scheduledSlot, setScheduledSlot] = useState('Morning (08:00 - 12:00)');
  
  // Static wallet balance setup for client split-payments demo
  const userWalletBalance = 240.00;

  if (!product || !seller) return <div className="p-10 text-center font-bold">Product or Seller not found</div>;

  // Delivery Cost calculation
  const deliveryCosts = {
    pickup: 0,
    home: 10,
    sameday: 20,
    scheduled: 15
  };
  const deliveryFee = deliveryCosts[deliveryMethod];
  const itemTotal = product.price;
  const checkoutGrandTotal = itemTotal + deliveryFee;

  // Split calculations
  const walletDeduction = isSplitPayment ? Math.min(userWalletBalance, checkoutGrandTotal - 15) : 0;
  const mobileMoneyAmount = checkoutGrandTotal - walletDeduction;

  const handleStartPayment = (e: FormEvent) => {
    e.preventDefault();
    setProcessingState('ussd_push_sent');
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
        const escrowList = existingData ? JSON.parse(existingData) : [
          { id: 'ESCO-921A-108', item: 'Fresh Premium Tomatoes', amount: 120.00, recipient: "Sipho's Fruits & Vegetables", description: 'Awaiting delivery acknowledgement', provider: 'MTN Mobile Money', status: 'Locked', date: 'Just now' },
          { id: 'ESCO-921A-240', item: 'Custom Traditional Attire', amount: 280.00, recipient: "Zinhle's Custom Boutique", description: 'In progress dress fabrication', provider: 'Eswatini Mobile eMali', status: 'Locked', date: 'Yesterday' }
        ];

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
          provider: REGIONAL_SYSTEMS[selectedProviderIdx].name,
          status: 'Locked',
          date: 'Just now',
          image: product.images?.[0] || "",
          buyerPhone: phoneNumber || '+268 7600 0000',
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
      } catch (e) {
        console.warn('Error saving new escrow:', e);
      }
      
      setProcessingState('completed');
    }, 2800);
  };

  const activeProv = REGIONAL_SYSTEMS[selectedProviderIdx];

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
          Your payment of <span className="font-bold text-slate-800">{activeProv.currency} {checkoutGrandTotal.toFixed(2)}</span> was secured successfully. {seller.name} has been notified over cellular and SMS!
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
                 Funds stay locked securely in the eMakethe/MaketiConnect Escrow Trust Node. The supplier Sipho only receives the payoff once you confirm the harvest delivery!
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
                    <p className="text-[9px] text-gray-400">Custom Moto Rider Courier to your area (+E 10.00)</p>
                 </div>
                 <span className="text-xs font-black text-green-600 shrink-0 font-mono">+E 10</span>
               </label>

               <label className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${deliveryMethod === 'sameday' ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white hover:bg-slate-50'}`}>
                 <input type="radio" className="hidden" checked={deliveryMethod === 'sameday'} onChange={() => setDeliveryMethod('sameday')} />
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${deliveryMethod === 'sameday' ? 'border-green-500' : 'border-gray-200'}`}>
                   {deliveryMethod === 'sameday' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </div>
                 <Zap size={16} className="text-gray-400 mr-3 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 leading-snug">Same-Day Express Moto</p>
                    <p className="text-[9px] text-gray-400">Guaranteed delivery within 4 hours (+E 20.00)</p>
                 </div>
                 <span className="text-xs font-black text-green-600 shrink-0 font-mono">+E 20</span>
               </label>

               <label className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${deliveryMethod === 'scheduled' ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 bg-white hover:bg-slate-50'}`}>
                 <input type="radio" className="hidden" checked={deliveryMethod === 'scheduled'} onChange={() => setDeliveryMethod('scheduled')} />
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${deliveryMethod === 'scheduled' ? 'border-green-500' : 'border-gray-200'}`}>
                   {deliveryMethod === 'scheduled' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </div>
                 <Calendar size={16} className="text-gray-400 mr-3 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 leading-snug">Scheduled Delivery Slot</p>
                    <p className="text-[9px] text-gray-400">Choose custom date & time slot for drop-off (+E 15.00)</p>
                 </div>
                 <span className="text-xs font-black text-green-600 shrink-0 font-mono">+E 15</span>
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

         {/* African Payment Method systems */}
         <div>
            <div className="flex justify-between items-center mb-2.5 px-1">
               <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Select Mobile Money Network</h3>
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
                          <span className="text-xs font-extrabold text-slate-800">{item.name}</span>
                          <span>{item.flag}</span>
                       </div>
                       <p className="text-[9px] text-gray-400 leading-none mt-0.5 font-medium">{item.description}</p>
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

         {/* SPLIT PAYMENT ENGINE SELECTOR (wallet deduction vs mobile money payment) */}
         <div className="bg-white p-4 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Wallet size={16} className="text-yellow-600" />
                 <div>
                    <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">Split checkout payment</span>
                    <span className="block text-[9px] text-slate-400 font-medium">Split between Wallet & Mobile Money</span>
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
              Internal Wallet Balance is <span className="font-bold text-slate-700">E {userWalletBalance.toFixed(2)}</span>. Enabling split payments automatically deducts available internal balances, charging only the leftovers to your {activeProv.name} setup.
            </p>

            {isSplitPayment && (
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex flex-col gap-2 font-mono text-[10px]">
                 <div className="flex justify-between text-yellow-900 font-bold">
                    <span>Internal Wallet Deduction:</span>
                    <span>- E {walletDeduction.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-800 font-black pt-1.5 border-t border-amber-200/50">
                    <span>Outstanding MoMo Billed:</span>
                    <span>{activeProv.currency} {mobileMoneyAmount.toFixed(2)}</span>
                 </div>
              </div>
            )}
         </div>

      </div>

      {/* Floating Action checkout payment tray */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-150 p-4 pb-safe z-20 flex flex-col gap-3.5 shadow-[-2px_-4px_15px_rgba(0,0,0,0.04)]">
         <div className="flex justify-between items-center px-1">
            <span className="text-gray-500 font-extrabold text-xs uppercase">Sum Grand Total:</span>
            <span className="text-lg font-black text-green-600 font-mono">{activeProv.currency} {checkoutGrandTotal.toFixed(2)}</span>
         </div>
         
         <form onSubmit={handleStartPayment}>
            <button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-black py-4.5 rounded-2xl shadow-lg shadow-green-600/20 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
               <span>🔐 Pay with {activeProv.name}</span>
               {isSplitPayment && <span className="text-[9.5px] bg-white/20 px-1.5 py-0.5 rounded font-mono">(Split Option)</span>}
            </button>
         </form>
      </div>

    </div>
  );
}
