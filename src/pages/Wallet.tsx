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
  Sparkles,
  QrCode,
  Scan,
  CreditCard
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

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

export interface SavedCard {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'American Express' | 'UnionPay';
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  isDefault: boolean;
  addedAt: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextBilling: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  cardId: string;
}

export default function Wallet() {
  // Navigation tabs: wallet status, mobile money integrations toolbox, escrow holds, bank transfers, credit/debit cards
  const [activeTab, setActiveTab] = useState<'overview' | 'integration' | 'escrow' | 'bank' | 'card'>('overview');
  
  // Regional settings
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('SZ');
  const [selectedProviderIdx, setSelectedProviderIdx] = useState(0);

  // Stateful financial numbers - pre-populate with some balance to make testing easier
  const [balance, setBalance] = useState(480.00);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-802',
      type: 'Merchant Payment',
      detail: 'Mbabane Kiosk #492',
      provider: 'MTN MoMo',
      date: '10 mins ago',
      amount: 120.00,
      isPositive: false,
      status: 'Completed'
    },
    {
      id: 'tx-711',
      type: 'Wallet-to-Wallet Transfer',
      detail: 'Received from +268 7611 2345',
      provider: 'MTN MoMo',
      date: '1 hour ago',
      amount: 250.00,
      isPositive: true,
      status: 'Completed'
    },
    {
      id: 'tx-605',
      type: 'Cash-out (Agent Withdrawal)',
      detail: 'Withdrawn at Agent #77102',
      provider: 'Eswatini Mobile eMali',
      date: 'Yesterday',
      amount: 50.00,
      isPositive: false,
      status: 'Completed'
    }
  ]);

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

  // QR Code payment states
  const [qrMode, setQrMode] = useState<'scan' | 'generate'>('scan');
  const [scannedMerchant, setScannedMerchant] = useState<{ name: string; till: string; amount: number; provider: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showMyQr, setShowMyQr] = useState(false);

  // Cash-out states
  const [cashoutAgentCode, setCashoutAgentCode] = useState('');
  const [cashoutAmount, setCashoutAmount] = useState('100');
  const [cashoutCarrier, setCashoutCarrier] = useState<'mtn' | 'emali'>('mtn');

  // Bank Transfer States
  const [bankTab, setBankTab] = useState<'eft' | 'instant' | 'deposit'>('eft');
  const [selectedBank, setSelectedBank] = useState('First National Bank (FNB)');
  const [bankAmount, setBankAmount] = useState('2500');
  const [bankRef, setBankRef] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [uploadedPopName, setUploadedPopName] = useState<string | null>(null);
  const [popUploadProgress, setPopUploadProgress] = useState<number | null>(null);

  // Card states
  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
    const saved = localStorage.getItem('emakethe_saved_cards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'card-1',
        brand: 'Visa',
        number: '•••• •••• •••• 4242',
        holder: 'Sipho Myati',
        expiry: '12/28',
        cvv: '123',
        isDefault: true,
        addedAt: '2026-01-10'
      },
      {
        id: 'card-2',
        brand: 'Mastercard',
        number: '•••• •••• •••• 8899',
        holder: 'Myati Trading Enterprise',
        expiry: '09/27',
        cvv: '456',
        isDefault: false,
        addedAt: '2026-03-15'
      }
    ];
  });

  const [oneClickCheckout, setOneClickCheckout] = useState<boolean>(() => {
    const saved = localStorage.getItem('emakethe_one_click_checkout');
    return saved !== 'false'; // default to true
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    const saved = localStorage.getItem('emakethe_subscriptions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'sub-1',
        name: 'Eswatini Agricultural Wholesalers Premium',
        amount: 150.00,
        frequency: 'Monthly',
        nextBilling: '2026-07-15',
        status: 'Active',
        cardId: 'card-1'
      },
      {
        id: 'sub-2',
        name: 'MTN Business Fiber Lease Backup',
        amount: 890.00,
        frequency: 'Monthly',
        nextBilling: '2026-07-20',
        status: 'Active',
        cardId: 'card-1'
      },
      {
        id: 'sub-3',
        name: 'eMakethe Vendor Priority Placement',
        amount: 45.00,
        frequency: 'Weekly',
        nextBilling: '2026-07-01',
        status: 'Paused',
        cardId: 'card-2'
      }
    ];
  });

  // State to manage card inputs
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardBrand, setNewCardBrand] = useState<'Visa' | 'Mastercard' | 'American Express' | 'UnionPay'>('Visa');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [makeDefaultCard, setMakeDefaultCard] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  // Loading and feedback automation
  const [processingState, setProcessingState] = useState<'idle' | 'depositing' | 'withdrawing' | 'p2p' | 'merchant' | 'refund' | 'escrow-release' | 'escrow-refund' | 'qr-pay' | 'cashout' | 'bank-eft' | 'bank-instant' | 'bank-confirm'>('idle');
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

  // Bank Transfer Handlers & Upload simulation
  const simulatePopUpload = (fileName: string) => {
    setUploadedPopName(fileName);
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

  const handleBankEftSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bankAmount || isNaN(parseFloat(bankAmount))) return;
    const amt = parseFloat(bankAmount);
    setProcessingState('bank-eft');
    
    setTimeout(() => {
      const refCode = bankRef || `EMK-EFT-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'EFT Bank Deposit',
        detail: `Pending Clearance (Ref: ${refCode}) - ${selectedBank}`,
        provider: selectedBank,
        date: 'Just now',
        amount: amt,
        isPositive: true,
        status: 'Pending'
      };
      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setBankAmount('2500');
      setBankRef('');
      setBankAccount('');
      setBankAccountName('');
      triggerToast(`🏦 EFT Received: Notification for ${currentCountry.currency} ${amt.toFixed(2)} with reference ${refCode} is pending clearance.`);
    }, 2500);
  };

  const handleBankInstantSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bankAmount || isNaN(parseFloat(bankAmount))) return;
    const amt = parseFloat(bankAmount);
    setProcessingState('bank-instant');
    
    setTimeout(() => {
      setBalance(prev => prev + amt);
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Instant Bank Transfer',
        detail: `Deposited via ${selectedBank} (Cleared)`,
        provider: selectedBank,
        date: 'Just now',
        amount: amt,
        isPositive: true,
        status: 'Completed'
      };
      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setBankAmount('2500');
      setBankAccount('');
      setBankAccountName('');
      triggerToast(`⚡ Instant Clearance: ${currentCountry.currency} ${amt.toFixed(2)} added directly to your eMakethe balance via ${selectedBank}!`);
    }, 2800);
  };

  const handleBankDepositConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (!bankAmount || isNaN(parseFloat(bankAmount))) return;
    const amt = parseFloat(bankAmount);
    setProcessingState('bank-confirm');
    
    setTimeout(() => {
      setBalance(prev => prev + amt);
      const refCode = bankRef || `DEP-SLIP-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Bank Deposit Confirmed',
        detail: `Cleared: Ref ${refCode} - ${selectedBank}`,
        provider: selectedBank,
        date: 'Just now',
        amount: amt,
        isPositive: true,
        status: 'Completed'
      };
      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setBankAmount('2500');
      setBankRef('');
      setUploadedPopName(null);
      setPopUploadProgress(null);
      triggerToast(`📄 Proof Approved: Bank Cash Deposit of ${currentCountry.currency} ${amt.toFixed(2)} verified & credited successfully!`);
    }, 3000);
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

  // 7. Direct Transaction Refund Reversal
  const handleRequestDirectRefund = (txId: string) => {
    const txToRefund = transactions.find(t => t.id === txId);
    if (!txToRefund) return;
    setProcessingState('refund');
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === txId) {
          setBalance(curr => curr + tx.amount);
          return { ...tx, status: 'Refunded' };
        }
        return tx;
      }));
      setProcessingState('idle');
      triggerToast(`↩️ Reversal Success: E ${txToRefund.amount.toFixed(2)} refunded instantly back to your phone!`);
    }, 1800);
  };

  // 8. QR Code Payment Executor
  const handleQrPayment = (merchantName: string, merchantTill: string, amount: number, carrierName: string) => {
    if (amount > balance) {
      alert('Insufficient funds in internal balance for QR Payment!');
      return;
    }
    setProcessingState('qr-pay');
    setTimeout(() => {
      setBalance(prev => prev - amount);
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'QR Merchant Payment',
        detail: `Paid to ${merchantName} (Till #${merchantTill})`,
        provider: carrierName,
        date: 'Just now',
        amount: amount,
        isPositive: false,
        status: 'Completed'
      };
      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setScannedMerchant(null);
      triggerToast(`👜 QR Paid: ${currentCountry.currency} ${amount.toFixed(2)} successfully cleared to Till #${merchantTill} via ${carrierName}!`);
    }, 2000);
  };

  // 9. Agent Cash-out Executor
  const handleAgentCashout = () => {
    const amt = parseFloat(cashoutAmount);
    if (!cashoutAgentCode) {
      alert('Please enter an Agent Code!');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount!');
      return;
    }
    if (amt > balance) {
      alert('Insufficient funds for Agent Cash-out!');
      return;
    }
    setProcessingState('cashout');
    setTimeout(() => {
      setBalance(prev => prev - amt);
      const carrierName = cashoutCarrier === 'mtn' ? 'MTN MoMo' : 'Eswatini Mobile eMali';
      const newTx: Transaction = {
        id: `tx-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Cash-out (Agent Withdrawal)',
        detail: `Withdrawn at Agent #${cashoutAgentCode}`,
        provider: carrierName,
        date: 'Just now',
        amount: amt,
        isPositive: false,
        status: 'Completed'
      };
      setTransactions(prev => [newTx, ...prev]);
      setProcessingState('idle');
      setCashoutAgentCode('');
      setCashoutAmount('100');
      triggerToast(`💸 Cash-out Success: Received E ${amt.toFixed(2)} cash from Agent #${cashoutAgentCode} via ${carrierName}!`);
    }, 2000);
  };

  // Card Management Handlers
  const handleAddCard = (e: FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExpiry || !newCardCvv) {
      alert('Please fill out all card fields');
      return;
    }
    
    // Validate card number length
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 13 || cleanNum.length > 19) {
      alert('Please enter a valid credit card number');
      return;
    }

    const maskedNum = `•••• •••• •••• ${cleanNum.slice(-4)}`;
    
    const newCard: SavedCard = {
      id: `card-${Math.floor(Math.random() * 90000) + 10000}`,
      brand: newCardBrand,
      number: maskedNum,
      holder: newCardHolder,
      expiry: newCardExpiry,
      cvv: newCardCvv,
      isDefault: makeDefaultCard || savedCards.length === 0,
      addedAt: new Date().toISOString().split('T')[0]
    };

    let updatedCards = [...savedCards];
    if (newCard.isDefault) {
      updatedCards = updatedCards.map(c => ({ ...c, isDefault: false }));
    }
    updatedCards.push(newCard);

    setSavedCards(updatedCards);
    localStorage.setItem('emakethe_saved_cards', JSON.stringify(updatedCards));
    
    // reset form
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvv('');
    setMakeDefaultCard(false);
    setShowAddCardForm(false);
    triggerToast(`💳 Card successfully secured: Added ${newCardBrand} card ending in ${cleanNum.slice(-4)}`);
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = savedCards.filter(c => c.id !== cardId);
    // If we deleted the default, set first remaining as default
    if (updated.length > 0 && !updated.some(c => c.isDefault)) {
      updated[0].isDefault = true;
    }
    setSavedCards(updated);
    localStorage.setItem('emakethe_saved_cards', JSON.stringify(updated));
    triggerToast('🗑️ Card removed from secured profile.');
  };

  const handleSetDefaultCard = (cardId: string) => {
    const updated = savedCards.map(c => ({
      ...c,
      isDefault: c.id === cardId
    }));
    setSavedCards(updated);
    localStorage.setItem('emakethe_saved_cards', JSON.stringify(updated));
    triggerToast('⭐ Default payment card updated.');
  };

  const handleToggleOneClick = (val: boolean) => {
    setOneClickCheckout(val);
    localStorage.setItem('emakethe_one_click_checkout', String(val));
    triggerToast(val ? '⚡ One-Click instant checkouts enabled.' : '🔒 One-Click disabled. Secure PIN authorization required.');
  };

  const handleToggleSubscription = (subId: string, newStatus: 'Active' | 'Paused' | 'Cancelled') => {
    const updated = subscriptions.map(sub => {
      if (sub.id === subId) {
        return { ...sub, status: newStatus };
      }
      return sub;
    });
    setSubscriptions(updated);
    localStorage.setItem('emakethe_subscriptions', JSON.stringify(updated));
    const statusMsg = newStatus === 'Active' ? 'Activated' : newStatus === 'Paused' ? 'Paused' : 'Cancelled';
    triggerToast(`🔁 Subscription recurring billing updated to ${statusMsg}.`);
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
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-5 gap-0.5">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-normal transition-all ${activeTab === 'overview' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              🏠 Overview
           </button>
           <button 
             onClick={() => setActiveTab('integration')}
             className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-normal transition-all ${activeTab === 'integration' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              ⚡ MoMo
           </button>
           <button 
             onClick={() => setActiveTab('bank')}
             className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-normal transition-all ${activeTab === 'bank' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              🏦 Banks
           </button>
           <button 
             onClick={() => setActiveTab('card')}
             className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-normal transition-all ${activeTab === 'card' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              💳 Cards
           </button>
           <button 
             onClick={() => setActiveTab('escrow')}
             className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-normal transition-all ${activeTab === 'escrow' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
           >
              🛡️ Escrow {escrowItems.length > 0 && <span className="bg-blue-100 text-blue-700 text-[8px] px-0.5 py-0.5 rounded-full ml-0.5">{escrowItems.length}</span>}
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
                <h4 className="font-display font-bold text-sm mb-1 text-slate-200">Eswatini Mobile Money Control Hub</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                  Seamlessly access MTN MoMo, Eswatini Mobile e-Mali, and other regional wallets. Features instant authorizations, QR scanning, cash-outs, and transaction protection.
                </p>
              </div>

               {/* SANDBOX SECTION 1: CUSTOMER P2P PAYMENTS */}
               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                       <Send size={14} className="text-emerald-500" /> 1. Wallet-to-Wallet Transfer (P2P)
                     </h4>
                     <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-black uppercase font-mono font-bold">Instant P2P</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                     Send funds instantly from your mobile wallet directly to another phone number in Eswatini or connected regions.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Receiver Mobile #</label>
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
                         <span>Routing GSM Node...</span>
                       </>
                     ) : (
                       <span>Instant Transfer via {activeProvider.logoText}</span>
                     )}
                  </button>
               </div>


                {/* SERVICE 2: QR CODE PAYMENTS (SCAN & PAY) */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                   <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                        <QrCode size={14} className="text-indigo-600" /> 2. QR Code Payments (Scan & Pay)
                      </h4>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black uppercase font-mono font-bold">Contactless</span>
                   </div>
                   
                   {/* Sub tabs for QR mode */}
                   <div className="flex gap-2 bg-slate-50 p-1 rounded-xl text-xs">
                     <button 
                       type="button"
                       onClick={() => { setQrMode('scan'); setScannedMerchant(null); }}
                       className={`flex-1 text-center py-1.5 rounded-lg font-bold transition-all ${qrMode === 'scan' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400'}`}
                     >
                       📷 Scan Merchant Code
                     </button>
                     <button 
                       type="button"
                       onClick={() => setQrMode('generate')}
                       className={`flex-1 text-center py-1.5 rounded-lg font-bold transition-all ${qrMode === 'generate' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400'}`}
                     >
                       🏷️ Show My Pay QR
                     </button>
                   </div>

                   {qrMode === 'scan' ? (
                     <div className="flex flex-col gap-3 mt-1">
                       {scannedMerchant ? (
                         // Scanned Confirmation Box
                         <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col gap-3 animate-in zoom-in-95">
                           <div className="flex justify-between items-start">
                             <div>
                               <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest font-mono font-bold">Scanned Merchant Payload</p>
                               <h5 className="font-extrabold text-xs text-slate-800 mt-1">{scannedMerchant.name}</h5>
                               <p className="text-[9px] text-slate-500 mt-0.5">Till / Merchant ID: <span className="font-bold font-mono">{scannedMerchant.till}</span></p>
                             </div>
                             <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-xl font-mono">
                               E {scannedMerchant.amount.toFixed(2)}
                             </span>
                           </div>

                           <button 
                             type="button"
                             onClick={() => handleQrPayment(scannedMerchant.name, scannedMerchant.till, scannedMerchant.amount, scannedMerchant.provider)}
                             disabled={processingState !== 'idle'}
                             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase"
                           >
                             {processingState === 'qr-pay' ? (
                               <>
                                 <Loader2 size={12} className="animate-spin text-white" />
                                 <span>Authorizing QR Payment...</span>
                               </>
                             ) : (
                               <span>Pay E {scannedMerchant.amount.toFixed(2)} via {scannedMerchant.provider}</span>
                             )}
                           </button>
                           
                           <button 
                             type="button"
                             onClick={() => setScannedMerchant(null)}
                             className="text-[10px] text-slate-500 font-semibold hover:underline"
                           >
                             Cancel Scan
                           </button>
                         </div>
                       ) : (
                         // Scanner Simulation Area
                         <div className="flex flex-col gap-3">
                           <p className="text-[11px] text-gray-500">
                             Scan an official MTN MoMo QR code or Eswatini Mobile e-Mali QR placard at any kiosk or cooperative store.
                           </p>

                           {/* Visual Scanner Camera Simulation */}
                           <div className="bg-slate-950 border border-slate-800 h-32 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                             {/* Pulsing Scan Lines */}
                             <div className="absolute inset-x-0 h-0.5 bg-green-400 opacity-60 animate-bounce top-1/4"></div>
                             
                             {/* Scan Frame Overlay */}
                             <div className="w-16 h-16 border-2 border-indigo-500 border-dashed rounded-lg animate-pulse opacity-75"></div>

                             <span className="text-[9px] font-mono text-slate-400 mt-3 flex items-center gap-1"><Smartphone size={10} /> Camera stream ready</span>
                           </div>

                           {/* Simulation action triggers */}
                           <div className="grid grid-cols-2 gap-2 mt-1">
                             <button
                               type="button"
                               onClick={() => setScannedMerchant({ name: 'Eswatini Harvest Coop', till: 'MOMO-99120', amount: 85.00, provider: 'MTN MoMo' })}
                               className="bg-slate-100 hover:bg-slate-200 border border-gray-200 p-2.5 rounded-xl text-left text-[10px] font-bold text-gray-700 flex flex-col gap-0.5 transition-all"
                             >
                               <span className="text-[8px] text-amber-600 uppercase font-black font-mono font-bold">Mock Scan A</span>
                               <span>🌾 Harvest Coop QR</span>
                             </button>

                             <button
                               type="button"
                               onClick={() => setScannedMerchant({ name: 'Mbabane Fresh Market', till: 'EMALI-44201', amount: 140.00, provider: 'Eswatini Mobile eMali' })}
                               className="bg-slate-100 hover:bg-slate-200 border border-gray-200 p-2.5 rounded-xl text-left text-[10px] font-bold text-gray-700 flex flex-col gap-0.5 transition-all"
                             >
                               <span className="text-[8px] text-blue-600 uppercase font-black font-mono font-bold">Mock Scan B</span>
                               <span>🍅 Fresh Market QR</span>
                             </button>
                           </div>
                         </div>
                       )}
                     </div>
                   ) : (
                     // Show personal QR Code
                     <div className="flex flex-col items-center justify-center py-4 text-center animate-in zoom-in-95">
                       <div className="bg-white p-3.5 rounded-3xl border border-gray-200/80 shadow-md flex flex-col items-center justify-center relative">
                         {/* High-quality styled mock QR code vector */}
                         <div className="w-32 h-32 bg-slate-900 rounded-2xl p-2 flex flex-col justify-between relative overflow-hidden">
                           <div className="flex justify-between">
                             <div className="w-6 h-6 border-4 border-white bg-slate-900"></div>
                             <div className="w-6 h-6 border-4 border-white bg-slate-900"></div>
                           </div>
                           <div className="flex items-center justify-center absolute inset-0">
                             <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center border-2 border-slate-900 text-[10px] font-black text-slate-950 font-mono">
                               MoMo
                             </div>
                           </div>
                           <div className="flex justify-between">
                             <div className="w-6 h-6 border-4 border-white bg-slate-900"></div>
                             <div className="w-4 h-4 bg-white/20 rounded"></div>
                           </div>
                         </div>
                       </div>
                       <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mt-4 flex items-center gap-1 justify-center">
                         🇸🇿 My Eswatini Wallet QR
                       </p>
                       <p className="text-[9.5px] text-gray-500 max-w-[220px] mt-1 leading-normal">
                         Merchants or friends can scan this QR code to initiate a direct peer-to-peer wallet transfer to your number.
                       </p>
                     </div>
                   )}
                </div>


               {/* SANDBOX SECTION 3: RETAIL MERCHANT PAYMENTS */}
               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                       <Receipt size={14} className="text-orange-500" /> 3. Retail Merchant Payments (Till ID)
                     </h4>
                     <span className="text-[9px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-black uppercase font-mono font-bold">B2C Pay</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                     Make payments to a retail merchant using their Till Number / Agent ID, prompting a fast secure approval popup.
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
                         <span>Generating GSM Prompt...</span>
                       </>
                     ) : (
                       <span>Submit Till Merchant Payment</span>
                     )}
                  </button>
               </div>


                {/* SERVICE 4: AGENT CASH-OUT (WITHDRAWAL) */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                   <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                        <Landmark size={14} className="text-red-500" /> 4. Cash-out (Agent Withdrawal)
                      </h4>
                      <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-black uppercase font-mono font-bold">Agent Terminal</span>
                   </div>
                   <p className="text-[11px] text-gray-500 leading-relaxed">
                      Withdraw cash physically at any local registered carrier agent kiosk by submitting the Agent Code below.
                   </p>

                   {/* Carrier Selector */}
                   <div className="grid grid-cols-2 gap-2 mt-1">
                     <button
                       type="button"
                       onClick={() => setCashoutCarrier('mtn')}
                       className={`p-2 rounded-xl text-center text-[10px] font-black border transition-all ${cashoutCarrier === 'mtn' ? 'border-amber-500 bg-amber-50/20 text-slate-800' : 'border-gray-100 bg-slate-50 text-gray-500'}`}
                     >
                       MTN MoMo Agent 🟡
                     </button>
                     <button
                       type="button"
                       onClick={() => setCashoutCarrier('emali')}
                       className={`p-2 rounded-xl text-center text-[10px] font-black border transition-all ${cashoutCarrier === 'emali' ? 'border-blue-600 bg-blue-50/20 text-slate-800' : 'border-gray-100 bg-slate-50 text-gray-500'}`}
                     >
                       e-Mali Agent 🔵
                     </button>
                   </div>

                   <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col gap-1">
                         <label className="text-[9px] font-black text-gray-400 uppercase">Agent Code / Till #</label>
                         <input 
                           type="text" 
                           value={cashoutAgentCode}
                           onChange={(e) => setCashoutAgentCode(e.target.value)}
                           placeholder="770125"
                           className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-green-500"
                         />
                      </div>
                      <div className="flex flex-col gap-1">
                         <label className="text-[9px] font-black text-gray-400 uppercase">Amount ({currentCountry.currency})</label>
                         <input 
                           type="number" 
                           value={cashoutAmount}
                           onChange={(e) => setCashoutAmount(e.target.value)}
                           placeholder="100"
                           className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-green-500"
                         />
                      </div>
                   </div>

                   <button 
                     onClick={handleAgentCashout}
                     disabled={processingState !== 'idle'}
                     className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider"
                   >
                      {processingState === 'cashout' ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-white" />
                          <span>Authorizing Agent Handshake...</span>
                        </>
                      ) : (
                        <span>Initiate Cash-out Withdrawal</span>
                      )}
                   </button>
                </div>


                {/* SERVICE 5: REVENUE / SPLIT PAYMENTS DIAGRAM & ENGINE */}
               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                       <Percent size={14} className="text-green-600" /> 5. Regional Multi-Recipient Split Payments
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


         {/* TAB: DEBIT & CREDIT CARDS */}
         {activeTab === 'card' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
               
               {/* Secure Cards Header */}
               <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-3xl shadow-sm relative overflow-hidden border border-slate-800">
                 <div className="absolute right-0 top-0 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl font-mono tracking-wider">
                   💳 PCI-DSS SECURED
                 </div>
                 <h4 className="font-display font-bold text-sm mb-1 text-slate-100 flex items-center gap-1.5 font-sans">
                   <Shield size={16} className="text-emerald-400" /> Secure Card Vault v2
                 </h4>
                 <p className="text-[10px] text-slate-300 leading-relaxed font-normal font-sans">
                   Manage your card profiles securely. Saved cards enable seamless one-click checkouts and automate recurring supplier subscriptions securely using end-to-end tokenized escrows.
                 </p>
               </div>

               {/* One-Click Checkout Controller */}
               <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 font-sans">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                       <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-bold shrink-0">
                          ⚡
                       </div>
                       <div>
                          <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">One-Click Checkout</span>
                          <span className="block text-[9px] text-slate-400 font-medium">Saves checkout confirmation time</span>
                       </div>
                    </div>

                    {/* Styled Switch Button */}
                    <button 
                      type="button"
                      onClick={() => handleToggleOneClick(!oneClickCheckout)}
                      className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center ${oneClickCheckout ? 'bg-green-600 justify-end' : 'bg-gray-200 justify-start'}`}
                    >
                      <div className="bg-white w-5 h-5 rounded-full shadow-md"></div>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                     When enabled, you can instantly settle wholesale supplier agreements with a single tap using your default saved card, bypassing multi-factor M-Pesa or USSD push delays.
                  </p>
               </div>

               {/* Saved Cards Title & Action */}
               <div className="flex justify-between items-center px-1 font-sans">
                  <h3 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                     <CreditCard size={14} className="text-green-600" /> Saved Payment Cards
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowAddCardForm(!showAddCardForm)}
                    className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                     {showAddCardForm ? '✕ Close Form' : '＋ Add New Card'}
                  </button>
               </div>

               {/* Add Card Form */}
               {showAddCardForm && (
                  <form onSubmit={handleAddCard} className="bg-white p-5 rounded-3xl border border-green-200/60 shadow-md flex flex-col gap-3.5 animate-in slide-in-from-top-4 duration-200 font-sans font-sans">
                     <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-gray-100 pb-2">Secured Card Information</h4>
                     
                     <div className="grid grid-cols-2 gap-3 font-sans">
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-black text-gray-400 uppercase">Card Brand</label>
                           <select 
                             value={newCardBrand} 
                             onChange={(e) => setNewCardBrand(e.target.value as any)}
                             className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                           >
                              <option value="Visa">Visa</option>
                              <option value="Mastercard">Mastercard</option>
                              <option value="American Express">American Express (Amex)</option>
                              <option value="UnionPay">UnionPay</option>
                           </select>
                        </div>
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-black text-gray-400 uppercase">Cardholder Name</label>
                           <input 
                             type="text" 
                             required
                             value={newCardHolder}
                             onChange={(e) => setNewCardHolder(e.target.value)}
                             placeholder="Sipho Myati"
                             className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                           />
                        </div>
                     </div>

                     <div className="flex flex-col gap-1 font-sans">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Card Number</label>
                        <input 
                          type="text" 
                          required
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-3 font-sans font-sans">
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-black text-gray-400 uppercase">Expiry Date</label>
                           <input 
                             type="text" 
                             required
                             value={newCardExpiry}
                             onChange={(e) => setNewCardExpiry(e.target.value)}
                             placeholder="MM/YY"
                             maxLength={5}
                             className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-black text-gray-400 uppercase">CVV Code</label>
                           <input 
                             type="password" 
                             required
                             value={newCardCvv}
                             onChange={(e) => setNewCardCvv(e.target.value)}
                             placeholder="•••"
                             maxLength={4}
                             className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
                           />
                        </div>
                     </div>

                     <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="checkbox" 
                          id="makeDefault"
                          checked={makeDefaultCard}
                          onChange={(e) => setMakeDefaultCard(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
                        />
                        <label htmlFor="makeDefault" className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Make Default Card for Payments</label>
                     </div>

                     <button 
                       type="submit"
                       className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase py-3 rounded-xl transition-all tracking-wider mt-1 cursor-pointer"
                     >
                       🔒 Save Card Secures
                     </button>
                  </form>
               )}

               {/* Physical Cards Stack Slider rendering */}
               <div className="flex flex-col gap-3 font-sans font-sans">
                  {savedCards.length === 0 ? (
                     <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <CreditCard size={28} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs font-bold uppercase">No saved cards linked</p>
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto">Link a Visa, Mastercard, or American Express to start checkouts.</p>
                     </div>
                  ) : (
                     savedCards.map((card) => {
                        let cardColorClass = 'from-slate-900 to-slate-800 border-slate-800';
                        if (card.brand === 'Mastercard') cardColorClass = 'from-amber-850 to-red-950 border-amber-900';
                        if (card.brand === 'American Express') cardColorClass = 'from-sky-900 to-blue-950 border-sky-900';
                        if (card.brand === 'UnionPay') cardColorClass = 'from-teal-900 to-emerald-950 border-teal-900';

                        return (
                           <div 
                             key={card.id} 
                             className={`bg-gradient-to-tr ${cardColorClass} border p-5 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]`}
                           >
                              {/* Background overlay brand graphic */}
                              <div className="absolute right-[-10px] bottom-[-20px] text-white/5 font-black text-7xl select-none uppercase tracking-tighter">
                                 {card.brand === 'American Express' ? 'Amex' : card.brand}
                              </div>

                              <div className="flex justify-between items-start z-10">
                                 <div>
                                    <span className="text-[10px] font-black tracking-widest text-white/60 uppercase font-mono">eMakethe Secured</span>
                                    {card.isDefault && (
                                       <span className="bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded-full ml-2 font-mono">
                                          ★ DEFAULT CARD
                                       </span>
                                    )}
                                 </div>
                                 <span className="text-sm font-extrabold font-mono tracking-wider italic text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/5">
                                    {card.brand}
                                 </span>
                              </div>

                              <div className="my-3 z-10">
                                 <span className="text-lg font-bold font-mono tracking-widest block text-slate-100">{card.number}</span>
                              </div>

                              <div className="flex justify-between items-end z-10">
                                 <div>
                                    <span className="text-[8px] uppercase font-bold text-white/50 block">Cardholder</span>
                                    <span className="text-xs font-bold text-white tracking-wide block">{card.holder}</span>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[8px] uppercase font-bold text-white/50 block">Expiry</span>
                                    <span className="text-xs font-bold font-mono text-white block">{card.expiry}</span>
                                 </div>
                              </div>

                              {/* Card Action overlays */}
                              <div className="absolute bottom-4 right-4 flex gap-1.5 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity bg-slate-950/85 p-1.5 rounded-xl border border-white/10">
                                 {!card.isDefault && (
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDefaultCard(card.id)}
                                      className="text-[8px] font-bold text-emerald-400 hover:text-emerald-300 bg-white/5 px-2 py-1 rounded cursor-pointer animate-none"
                                    >
                                       Set Default
                                    </button>
                                 )}
                                 <button 
                                   type="button"
                                   onClick={() => handleDeleteCard(card.id)}
                                   className="text-[8px] font-bold text-red-400 hover:text-red-300 bg-white/5 px-2 py-1 rounded cursor-pointer animate-none"
                                 >
                                    Delete
                                 </button>
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>

               {/* Subscriptions Billed Automatically */}
               <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 font-sans font-sans">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                     <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Recurring Subscription Payments</h4>
                        <p className="text-[9px] text-gray-400 font-medium">Billed automatically to your default saved card</p>
                     </div>
                     <span className="text-[8px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-mono">AUTOPAY</span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                     {subscriptions.map((sub) => {
                        const associatedCard = savedCards.find(c => c.id === sub.cardId) || savedCards[0];
                        return (
                           <div key={sub.id} className="border border-gray-100 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all flex justify-between items-center text-xs">
                              <div className="flex-1 pr-3">
                                 <p className="font-extrabold text-slate-800 line-clamp-1">{sub.name}</p>
                                 <p className="text-[9.5px] text-slate-400 mt-0.5 leading-none">
                                    Billed <span className="font-bold">{sub.frequency}</span> &middot; Charged to <span className="font-bold font-mono">{associatedCard ? `${associatedCard.brand} (${associatedCard.number.slice(-4)})` : 'No Card'}</span>
                                 </p>
                                 <p className="text-[9px] font-bold text-slate-500 font-mono mt-1">Next due: {sub.nextBilling}</p>
                              </div>

                              <div className="text-right shrink-0 flex flex-col items-end gap-1.5 font-sans">
                                 <span className="font-black text-xs text-slate-800 font-mono">E {sub.amount.toFixed(2)}</span>
                                 <div className="flex gap-1 items-center">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${sub.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                       {sub.status}
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleSubscription(sub.id, sub.status === 'Active' ? 'Paused' : 'Active')}
                                      className="text-[8px] font-extrabold text-indigo-600 hover:underline bg-white px-1.5 py-0.5 border border-gray-200 rounded cursor-pointer"
                                    >
                                       {sub.status === 'Active' ? 'Pause' : 'Resume'}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

            </div>
         )}


         {/* TAB: BANK TRANSFERS AND DEPOSITS */}
         {activeTab === 'bank' && (
           <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* Bank Header Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-sm relative overflow-hidden border border-slate-850">
                <div className="absolute right-0 top-0 bg-indigo-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl font-mono tracking-wider">
                  Wholesale Hub
                </div>
                <h4 className="font-display font-bold text-sm mb-1 text-slate-100 flex items-center gap-1.5">
                  <Landmark size={16} className="text-indigo-400" /> Regional Bank Settlement Hub
                </h4>
                <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
                  Settle high-volume wholesale contracts and supplier deliveries using secure local bank clearing. Supported across all major financial institutions in Eswatini.
                </p>
              </div>

              {/* Bank Mode Switcher */}
              <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex gap-1.5 text-[11px] font-bold">
                <button 
                  type="button"
                  onClick={() => setBankTab('eft')}
                  className={`flex-1 text-center py-2 rounded-xl transition-all ${bankTab === 'eft' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  📄 Standard EFT
                </button>
                <button 
                  type="button"
                  onClick={() => setBankTab('instant')}
                  className={`flex-1 text-center py-2 rounded-xl transition-all ${bankTab === 'instant' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  ⚡ Instant Bank
                </button>
                <button 
                  type="button"
                  onClick={() => setBankTab('deposit')}
                  className={`flex-1 text-center py-2 rounded-xl transition-all ${bankTab === 'deposit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  🏦 Slip Deposit
                </button>
              </div>

              {/* EFT Mode View */}
              {bankTab === 'eft' && (
                <form onSubmit={handleBankEftSubmit} className="flex flex-col gap-4">
                  {/* Bank Account Escrow Details */}
                  <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100/70 flex flex-col gap-2.5">
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest font-mono">eMakethe Trust Escrow Account</span>
                    
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-medium text-slate-700 mt-0.5">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Receiver Bank</p>
                        <p className="font-extrabold text-slate-900">Standard Bank Eswatini</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Account Number</p>
                        <p className="font-mono font-bold text-slate-950">9102 3445 1092</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Branch Code</p>
                        <p className="font-mono text-slate-900">663108 (Mbabane)</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Account Type</p>
                        <p className="text-slate-900">Corporate Trust Escrow</p>
                      </div>
                    </div>

                    <div className="bg-white/70 p-2.5 rounded-xl border border-indigo-100 text-[10px] text-indigo-800 font-medium leading-relaxed mt-1">
                      💡 <span className="font-extrabold">Instructions:</span> Please process the EFT from your own banking portal using the unique reference code generated below to ensure automatic system matching.
                    </div>
                  </div>

                  {/* Form Details */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase">Sender Bank Name</label>
                       <select 
                         value={selectedBank}
                         onChange={(e) => setSelectedBank(e.target.value)}
                         className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-800 animate-none"
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
                          <label className="text-[9px] font-black text-gray-400 uppercase">EFT Settlement Amount ({currentCountry.currency})</label>
                          <input 
                            type="number" 
                            value={bankAmount}
                            onChange={(e) => setBankAmount(e.target.value)}
                            placeholder="2500"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Custom Settlement Reference</label>
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              value={bankRef}
                              onChange={(e) => setBankRef(e.target.value)}
                              placeholder="EMK-EFT-72109"
                              className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 flex-1 text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => setBankRef(`EMK-EFT-${Math.floor(10000 + Math.random() * 90000)}`)}
                              className="bg-slate-100 hover:bg-slate-200 border border-gray-200 rounded-xl px-2.5 text-xs text-slate-700 font-bold"
                              title="Generate random reference"
                            >
                              🔄
                            </button>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Sender Account Holder Name</label>
                          <input 
                            type="text" 
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            placeholder="Maseko Wholesalers Ltd"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Sender Bank Account #</label>
                          <input 
                            type="text" 
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            placeholder="62100892231"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={processingState !== 'idle'}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3 px-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider mt-1.5 cursor-pointer"
                    >
                      {processingState === 'bank-eft' ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-white" />
                          <span>Broadcasting Settlement Signal...</span>
                        </>
                      ) : (
                        <span>Submit EFT Settlement Notice</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* INSTANT BANK MODE VIEW */}
              {bankTab === 'instant' && (
                <form onSubmit={handleBankInstantSubmit} className="flex flex-col gap-4">
                  <div className="bg-slate-900 text-white p-4.5 rounded-3xl border border-indigo-950 flex flex-col gap-2">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">Instant Interbank Clearance</span>
                    <p className="text-[10px] text-slate-300 leading-normal font-normal">
                      Debit your bank account in real-time through secure automated routing. Clears in under 60 seconds with no standard interbank settlement lag.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase">Select Clearing Institution</label>
                       <select 
                         value={selectedBank}
                         onChange={(e) => setSelectedBank(e.target.value)}
                         className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-800"
                       >
                         <option>First National Bank (FNB) Eswatini</option>
                         <option>Standard Bank Eswatini</option>
                         <option>Nedbank Eswatini</option>
                         <option>Swaziland Building Society</option>
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Instant Debit Amount ({currentCountry.currency})</label>
                          <input 
                            type="number" 
                            value={bankAmount}
                            onChange={(e) => setBankAmount(e.target.value)}
                            placeholder="2500"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Interbank Routing Code</label>
                          <input 
                            type="text" 
                            value="AUTO-SHAP-99"
                            disabled
                            className="bg-slate-100 border border-gray-150 rounded-xl px-3 py-2 text-xs font-bold font-mono text-gray-500 outline-none"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Bank Username / Acc ID</label>
                          <input 
                            type="text" 
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            placeholder="maseko_wholesale"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Primary Bank Account Number</label>
                          <input 
                            type="text" 
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            placeholder="62100892231"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={processingState !== 'idle'}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3 px-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider mt-1.5 cursor-pointer"
                    >
                      {processingState === 'bank-instant' ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-white" />
                          <span>Pulsing Instant Clearing Node...</span>
                        </>
                      ) : (
                        <span>Initialize Instant Interbank Route</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* DEPOSIT SLIP VIEW */}
              {bankTab === 'deposit' && (
                <form onSubmit={handleBankDepositConfirm} className="flex flex-col gap-4">
                  <div className="bg-indigo-50/50 p-4.5 rounded-3xl border border-indigo-100/70 flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest font-mono">ATM & Branch Deposit Slips</span>
                    <p className="text-[10px] text-indigo-900 leading-normal font-medium">
                      Have you deposited cash at an FNB Slimline ATM or branch counter? Enter the receipt serial number and upload the slip photo below to claim wallet credits.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Deposited Amount ({currentCountry.currency})</label>
                          <input 
                            type="number" 
                            value={bankAmount}
                            onChange={(e) => setBankAmount(e.target.value)}
                            placeholder="2500"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Deposit Slip Reference</label>
                          <input 
                            type="text" 
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            placeholder="ATM-DEP-99812A"
                            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none focus:border-indigo-500 text-slate-800"
                            required
                          />
                       </div>
                    </div>

                    {/* Premium Upload Proof drag-drop simulator */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase">Upload Bank Deposit Slip / PDF Receipts</label>
                      
                      <div 
                        onClick={() => simulatePopUpload(`DEP_SLIP_${Math.floor(1000 + Math.random()*9000)}_CONFIRM.pdf`)}
                        className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50"
                      >
                        {uploadedPopName ? (
                          <div className="flex flex-col items-center gap-1.5 w-full">
                            <div className="bg-indigo-100 text-indigo-700 w-9 h-9 rounded-full flex items-center justify-center">
                              📄
                            </div>
                            <p className="text-xs font-bold text-slate-800">{uploadedPopName}</p>
                            
                            {popUploadProgress !== null && (
                              <div className="w-full max-w-[200px] bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="bg-indigo-600 h-full transition-all duration-300" 
                                  style={{ width: `${popUploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                            
                            <p className="text-[9px] text-gray-400 font-bold font-mono">
                              {popUploadProgress === 100 ? "UPLOAD COMPLETE (100%)" : "UPLOADING..."}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-2xl text-gray-400">📁</div>
                            <p className="text-xs font-bold text-slate-700 mt-1">Click or drag receipt files here</p>
                            <p className="text-[9px] text-gray-400 font-medium">Supports PDF, JPG, PNG up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={processingState !== 'idle' || !uploadedPopName || popUploadProgress !== 100}
                      className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-black py-3 px-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider mt-1.5 cursor-pointer"
                    >
                      {processingState === 'bank-confirm' ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-white" />
                          <span>Verifying Deposit Slip Proof...</span>
                        </>
                      ) : (
                        <span>Confirm Cash Deposit Clearance</span>
                      )}
                    </button>
                    
                    {!uploadedPopName && (
                      <p className="text-[9px] text-amber-600 font-bold text-center mt-0.5 leading-tight">
                        ⚠️ You must upload a deposit receipt file first to authorize the validation handshake.
                      </p>
                    )}
                  </div>
                </form>
              )}
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
