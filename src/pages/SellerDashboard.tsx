import { Settings, Plus, Package, DollarSign, TrendingUp, Bell, MapPin, Truck, CheckCircle2, UserCheck, X, Navigation, Sparkles, MessageSquare, Image as ImageIcon, Megaphone, ShieldAlert, Fingerprint, Lock, Coins, Award, Info, FileText, Store, Phone, ShieldCheck, BarChart3, Palette } from 'lucide-react';
import { SELLERS, PRODUCTS, CATEGORIES, addProductToStorage } from '../data/mockData';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationBadge } from '../components/VerificationBadge';
import { db } from '../lib/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '../components/FirebaseProvider';
import { NotificationsPopover, NotificationItem } from '../components/NotificationsPopover';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { sellers: firebaseSellers, products: firebaseProducts } = useFirebase();
  const PRODUCTS = firebaseProducts;
  const SELLERS = firebaseSellers.reduce((acc, s) => ({...acc, [s.id]: s}), {} as Record<string, any>);
  
  const [activeSellerId] = useState(() => {
    return localStorage.getItem('emakethe_active_seller_id') || '';
  });

  useEffect(() => {
    const storedSellerId = localStorage.getItem('emakethe_active_seller_id');
    if (!storedSellerId) {
      navigate('/register-seller');
    }
  }, [navigate]);

  const seller = firebaseSellers.find(s => s.id === activeSellerId) || firebaseSellers.find(s => s.id === 's1') || {
    id: activeSellerId,
    name: "Sipho's Organic Harvest",
    location: 'Mbabane Market',
    phone: '+268 7600 0000',
    rating: 5,
    reviews: 0,
    deliveryAvailable: true,
    paymentMethods: ['MTN MoMo'],
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=200',
    description: 'Fresh vegetables direct from Eswatini farms.',
    verificationLevel: 'verified',
    category: 'Agriculture'
  };
  
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (seller) {
      setProducts(firebaseProducts.filter(p => p.sellerId === seller.id));
    }
  }, [firebaseProducts, seller?.id]);
  
  // Escrow Orders list loaded dynamically
  const [escrowOrders, setEscrowOrders] = useState<any[]>([]);

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
  
  // Dynamic monetization states matching Admin and User requests
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'ai-coach' | 'ads' | 'security' | 'premium_hub' | 'whatsapp_setup'>('analytics');
  const [shopTier, setShopTier] = useState<'basic' | 'premium' | 'business' | 'service_pro'>(() => {
    try {
      const saved = localStorage.getItem('emakethe_shop_tier');
      return (saved as 'basic' | 'premium' | 'business' | 'service_pro') || 'basic';
    } catch { return 'basic'; }
  });
  const isPremiumMerchant = shopTier !== 'basic';

  const [designerDesc, setDesignerDesc] = useState(seller?.description || '');
  const [designerHours, setDesignerHours] = useState(seller?.hours || '');
  const [designerPhone, setDesignerPhone] = useState(seller?.phone || '');
  const [designerLocation, setDesignerLocation] = useState(seller?.location || '');
  const [designerBanner, setDesignerBanner] = useState(seller?.bannerUrl || '');
  const [designerTheme, setDesignerTheme] = useState(seller?.themeColor || 'emerald');
  const [designerAnnouncement, setDesignerAnnouncement] = useState(seller?.announcement || '');
  const [designerFacebook, setDesignerFacebook] = useState(seller?.facebook || '');
  const [designerInstagram, setDesignerInstagram] = useState(seller?.instagram || '');

  useEffect(() => {
    if (seller) {
      setDesignerDesc(seller.description || '');
      setDesignerHours(seller.hours || '');
      setDesignerPhone(seller.phone || '');
      setDesignerLocation(seller.location || '');
      setDesignerBanner(seller.bannerUrl || '');
      setDesignerTheme(seller.themeColor || 'emerald');
      setDesignerAnnouncement(seller.announcement || '');
      setDesignerFacebook(seller.facebook || '');
      setDesignerInstagram(seller.instagram || '');
      
      const tierMap: Record<string, 'basic' | 'premium' | 'business'> = {
        'basic': 'basic',
        'verified': 'premium',
        'premium': 'business'
      };
      const dbTier = tierMap[seller.verificationLevel || 'basic'] || 'basic';
      setShopTier(dbTier);
      localStorage.setItem('emakethe_shop_tier', dbTier);
    }
  }, [seller?.id, seller?.verificationLevel]);

  const updateShopTier = async (newTier: 'basic' | 'premium' | 'business' | 'service_pro') => {
    setShopTier(newTier);
    try {
      localStorage.setItem('emakethe_shop_tier', newTier);
      const vLevel = newTier === 'business' ? 'premium' : newTier === 'premium' ? 'verified' : newTier === 'service_pro' ? 'premium' : 'basic';
      if (seller && seller.id) {
        await setDoc(doc(db, 'sellers', seller.id), {
          ...seller,
          verificationLevel: vLevel
        });
      }
    } catch (err) {
      console.error("Failed to update shop tier", err);
    }
  };
  const [isDigitalToolsActive, setIsDigitalToolsActive] = useState(false); // Digital services / business tools for traders
  const [merchantBalance, setMerchantBalance] = useState(380.00); // Merchant in-app digital wallet
  const [activePromotions, setActivePromotions] = useState<{ [key: string]: boolean }>({
    featured: false,
    sponsored: false,
    banner: false
  });

  // Dynamic Persistent Campaign States
  const [featuredProducts, setFeaturedProducts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_featured_products');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [sponsoredListings, setSponsoredListings] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_sponsored_listings');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isStoreBoosted, setIsStoreBoosted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('emakethe_store_boosted_s1') === 'true';
    } catch { return false; }
  });
  const [customBannerAds, setCustomBannerAds] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_banner_ads');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Campaign builder inputs
  const [selectedFeaturedProduct, setSelectedFeaturedProduct] = useState<string>('');
  const [featuredDuration, setFeaturedDuration] = useState<number>(1);
  const [featuredPlan, setFeaturedPlan] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [featuredMultiplier, setFeaturedMultiplier] = useState<number>(1);
  const [featuredCampaignsMeta, setFeaturedCampaignsMeta] = useState<Record<string, { planType: string, multiplier: number, cost: number, dateAdded: string }>>(() => {
    try {
      const saved = localStorage.getItem('emakethe_featured_campaigns_meta');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [selectedSponsoredProduct, setSelectedSponsoredProduct] = useState<string>('');
  const [sponsoredPlacement, setSponsoredPlacement] = useState<string>('Homepage Feed');
  const [sponsoredDuration, setSponsoredDuration] = useState<number>(1); // weeks
  
  // Custom Banner fields
  const [bannerTitle, setBannerTitle] = useState("Sipho's Organic Harvest Special");
  const [bannerHeading, setBannerHeading] = useState("Fresh veggies straight to your door!");
  const [bannerTheme, setBannerTheme] = useState<'emerald' | 'sunset' | 'indigo' | 'midnight'>('emerald');
  const [bannerCoupon, setBannerCoupon] = useState("HARVEST10");
  const [bannerImgPreset, setBannerImgPreset] = useState("https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=600");

  useEffect(() => {
    if (products.length > 0) {
      if (!selectedFeaturedProduct) setSelectedFeaturedProduct(products[0].id);
      if (!selectedSponsoredProduct) setSelectedSponsoredProduct(products[0].id);
    }
  }, [products]);

  // Synchronizers
  useEffect(() => {
    localStorage.setItem('emakethe_featured_products', JSON.stringify(featuredProducts));
  }, [featuredProducts]);

  useEffect(() => {
    localStorage.setItem('emakethe_featured_campaigns_meta', JSON.stringify(featuredCampaignsMeta));
  }, [featuredCampaignsMeta]);

  useEffect(() => {
    localStorage.setItem('emakethe_sponsored_listings', JSON.stringify(sponsoredListings));
  }, [sponsoredListings]);

  useEffect(() => {
    localStorage.setItem('emakethe_store_boosted_s1', isStoreBoosted ? 'true' : 'false');
  }, [isStoreBoosted]);

  useEffect(() => {
    localStorage.setItem('emakethe_banner_ads', JSON.stringify(customBannerAds));
  }, [customBannerAds]);
  
  // WhatsApp Integration & Automation states
  const [whatsappPhone, setWhatsappPhone] = useState('+26871234567');
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [isSavedWhatsapp, setIsSavedWhatsapp] = useState(true);
  
  // Custom business automation checkmarks
  const [waFeatures, setWaFeatures] = useState({
    oneClickChat: true,
    priceNegotiation: true,
    deliveryRequests: true,
    photoRequests: true,
    automatedOrderAlerts: true,
    automatedDeliveryAlerts: true,
    automatedPaymentAlerts: true,
  });

  // Seller Logistics template configuration states
  const [selfDeliveryEnabled, setSelfDeliveryEnabled] = useState(true);
  const [selfDeliveryCost, setSelfDeliveryCost] = useState('50.00');
  const [selfDeliveryVehicle, setSelfDeliveryVehicle] = useState('Motorcycle Rider');
  
  const [courierEnabled, setCourierEnabled] = useState(true);
  const [courierName, setCourierName] = useState('Eswatini Express Courier');
  const [courierCostRate, setCourierCostRate] = useState('25.00');
  const [courierTrackingCode, setCourierTrackingCode] = useState('ESCX-7749-SZ');
  
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  const [marketplaceCostRate, setMarketplaceCostRate] = useState('50.00');

  const [sellerSelectedMethod, setSellerSelectedMethod] = useState<'self' | 'courier' | 'marketplace' | null>('marketplace');

  // Simulated notification console logs
  const [simulatedNotifications, setSimulatedNotifications] = useState<Array<{
    id: string;
    type: string;
    icon: string;
    message: string;
    time: string;
    sentStatus: 'Sent' | 'Failed' | 'Pending';
  }>>([
    {
      id: 'wa-msg-1',
      type: 'Order Notification',
      icon: '📦',
      message: 'MaketiConnect: New order #982 received! Buyer Themba Dlamini deposited E245.00 in secure Escrow. Items: 10kg tomatoes.',
      time: 'Just now',
      sentStatus: 'Sent'
    },
    {
      id: 'wa-msg-2',
      type: 'Payment Confirmation',
      icon: '💵',
      message: 'MaketiConnect Pay: E125.00 released to your digital wallet of Sipho’s Fresh Vegetables for order #910.',
      time: '3h ago',
      sentStatus: 'Sent'
    },
    {
      id: 'wa-msg-3',
      type: 'Delivery Dispatch',
      icon: '🏍️',
      message: 'MaketiConnect: Moto Rider #45 (Musa) accepted delivery for Order #982. Estimated pickup: 12 minutes.',
      time: 'Yesterday',
      sentStatus: 'Sent'
    }
  ]);

  const [notificationMsg, setNotificationMsg] = useState('');

  const handleSimulateNotification = (type: string) => {
    let text = "";
    let iconSymbol = "🔔";
    if (type === 'order') {
       text = `MaketiConnect: New order #108 received from customer Nandi! E${(Math.random() * 100 + 50).toFixed(2)} in Escrow.`;
       iconSymbol = "📦";
    } else if (type === 'delivery') {
       text = `MaketiConnect Dispatch: Moto Rider is 2 mins away with parcel container. Please prepare handover.`;
       iconSymbol = "🏍️";
    } else if (type === 'payment') {
       text = `MaketiConnect Wallet: Your payout of E150.00 is settled in Mobile Money account. Thank you!`;
       iconSymbol = "💵";
    } else {
       text = notificationMsg || `MaketiConnect Update: Direct chat notice from Sipho's Fresh Vegetables.`;
       iconSymbol = "✉️";
    }

    const newNotify = {
      id: `wa-msg-${Date.now()}`,
      type: type === 'order' ? 'Order Notification' : type === 'delivery' ? 'Delivery Notification' : type === 'payment' ? 'Payment Confirmation' : 'Custom Broadcast',
      icon: iconSymbol,
      message: text,
      time: 'Just now',
      sentStatus: 'Sent' as const
    };

    setSimulatedNotifications(prev => [newNotify, ...prev]);
    if (type === 'custom') setNotificationMsg('');
  };

  // State for business tools demo
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [smsTemplate, setSmsTemplate] = useState('Default greeting');
  
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [acceptedOrder, setAcceptedOrder] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnit, setProductUnit] = useState('per kg');
  const [newProductCategory, setNewProductCategory] = useState('agri');
  const [newProductSubcategory, setNewProductSubcategory] = useState('Vegetables');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [productAiPrompt, setProductAiPrompt] = useState('');
  const [pricingAdvice, setPricingAdvice] = useState('');

  const handleSaveProduct = async () => {
    if (!productTitle.trim()) {
      alert("Please enter a product title!");
      return;
    }

    // Limit checks based on Premium / Business shop tier
    const sellerProducts = PRODUCTS.filter(p => p.sellerId === seller.id);
    if (shopTier === 'basic' && sellerProducts.length >= 3) {
      alert("Listing Limit Reached! Basic free shops are limited to 3 product listings. Please upgrade to Premium (max 10) or Business (unlimited) in the Premium Hub to list more items.");
      return;
    }
    if (shopTier === 'premium' && sellerProducts.length >= 10) {
      alert("Listing Limit Reached! Premium shops are limited to 10 product listings. Please upgrade to Business (unlimited) in the Premium Hub to list more items.");
      return;
    }

    const productId = `prod-${Date.now()}`;
    const newProductObj = {
      id: productId,
      sellerId: seller.id,
      name: productTitle.trim(),
      description: productDesc.trim() || `${productTitle.trim()} from ${seller.name}`,
      price: parseFloat(productPrice) || 12.00,
      currency: 'E',
      unit: productUnit,
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600'
      ],
      stock: 100,
      categoryId: newProductCategory,
      subCategoryId: newProductSubcategory,
      distance: '0.2km'
    };
    
    try {
      await setDoc(doc(db, 'products', productId), newProductObj);
      
      // reset form fields
      setProductTitle('');
      setProductDesc('');
      setProductPrice('');
      setPricingAdvice('');
      setShowAddProduct(false);
    } catch (err) {
      console.error(err);
      alert("Error saving product to the database. Please try again.");
    }
  };

  // States for dynamic AI Coach
  const [coachingTopic, setCoachingTopic] = useState<'sales' | 'photos' | 'inventory' | 'service'>('sales');
  const [coachResponse, setCoachResponse] = useState<{title: string, tip: string, checklist: string[]} | null>(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  const fetchCoachingAdvice = async (topic: 'sales' | 'photos' | 'inventory' | 'service') => {
    setIsLoadingCoach(true);
    try {
      const response = await fetch('/api/ai/seller-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sellerName: seller.name })
      });
      const data = await response.json();
      if (data) {
        setCoachResponse(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-coach' && !coachResponse) {
      fetchCoachingAdvice(coachingTopic);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ai-coach') {
      fetchCoachingAdvice(coachingTopic);
    }
  }, [coachingTopic]);

  const handleAiGenerate = async () => {
    setGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/product-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: productAiPrompt || productTitle || "Local Cabbage Harvest",
          category: CATEGORIES.find(c => c.id === newProductCategory)?.name || "Agriculture",
          subcategory: newProductSubcategory,
          basePrice: productPrice
        })
      });
      const data = await response.json();
      if (data) {
        setProductTitle(data.title || '');
        setProductDesc(data.description || '');
        if (data.suggestedPrice) {
          setProductPrice(data.suggestedPrice);
        }
        if (data.pricingAnalysis) {
          setPricingAdvice(data.pricingAnalysis);
        } else {
          setPricingAdvice('');
        }
      }
    } catch (error) {
      console.error(error);
      setProductTitle('Premium Local Cabbages (Large)');
      setProductDesc('Fresh, crisp green cabbages sourced from organic Eswatini farms. Perfect for stews, salads, and traditional dishes. Excellent shelf life.');
      setProductPrice('20.00');
      setPricingAdvice('Average cabbage sales list around E15.00-E25.00 depending on harvest sizes. Ensuring fresh presentation builds premium value.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const [sellerNotifications, setSellerNotifications] = useState<NotificationItem[]>([
    { id: '1', type: 'success', title: 'Payment Received', message: 'You received E 250.00 from Sipho via MTN MoMo.', time: '10m ago', read: false },
    { id: '2', type: 'info', title: 'Order Paid', message: 'Order #8920 (Handcrafted Baskets) has been fully paid.', time: '1h ago', read: false },
    { id: '3', type: 'success', title: 'Cash Payment Confirmed', message: 'Cash on delivery for Order #8911 confirmed by driver.', time: '3h ago', read: true },
  ]);

  const markSellerNotificationsRead = () => {
    setSellerNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!seller) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 px-4 w-full flex flex-col items-center justify-center text-center">
        <Store size={48} className="text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-2">No Seller Profile Found</h1>
        <p className="text-gray-500 mb-6 max-w-sm">You need to register as a seller before you can access the Seller Dashboard.</p>
        <button onClick={() => window.location.href = '/register-seller'} className="bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-md">Register as Seller</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 w-full relative">
      <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-10 w-full flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-800">{seller.name}</h1>
          <VerificationBadge level={seller.verificationLevel} showText={true} showDetails={true} />
        </div>
        <div className="flex gap-3">
          <NotificationsPopover 
            notifications={sellerNotifications} 
            onMarkAllAsRead={markSellerNotificationsRead} 
            triggerColor="text-gray-600"
            dotColor="bg-red-500"
          />
          <button className="text-gray-600"><Settings size={20}/></button>
        </div>
      </div>

      <div className="px-4 py-3 bg-white mb-4 shadow-sm border-b border-gray-100 flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar w-full">
        <button 
          onClick={() => setActiveTab('premium_hub')}
          className={`min-w-[155px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'premium_hub' ? 'bg-amber-600 text-white shadow-amber-600/10' : 'bg-amber-50 text-amber-700 hover:bg-amber-100/50'}`}
        >
          <Award className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>Premium & Tools</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`min-w-[170px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'analytics' ? 'bg-green-600 text-white shadow-green-600/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <BarChart3 className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>Analytics Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`min-w-[115px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'orders' ? 'bg-green-600 text-white shadow-green-600/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <Truck className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span className="flex items-center gap-1">
            Orders <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">2</span>
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`min-w-[110px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'products' ? 'bg-green-600 text-white shadow-green-600/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/50'}`}
        >
          <Package className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>Products</span>
        </button>
        <button 
          onClick={() => setActiveTab('ai-coach')}
          className={`min-w-[115px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'ai-coach' ? 'bg-indigo-600 text-white shadow-indigo-600/10' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/50'}`}
        >
          <Sparkles className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>AI Coach</span>
        </button>
        <button 
          onClick={() => setActiveTab('ads')}
          className={`min-w-[115px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'ads' ? 'bg-pink-600 text-white shadow-pink-600/10' : 'bg-pink-50 text-pink-600 hover:bg-pink-100/50'}`}
        >
          <Megaphone className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>Promote</span>
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`min-w-[150px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'security' ? 'bg-slate-800 text-white shadow-slate-800/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200/50'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>Trust & Safety</span>
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp_setup')}
          className={`min-w-[145px] md:min-w-0 md:w-full flex flex-row md:flex-col items-center justify-center text-center gap-1.5 md:gap-1 py-2.5 px-3 md:py-3.5 md:px-1 rounded-xl text-xs sm:text-xs md:text-[11px] lg:text-xs font-black tracking-wide whitespace-nowrap md:whitespace-normal transition-all shadow-sm shrink-0 hover:scale-[1.01] ${activeTab === 'whatsapp_setup' ? 'bg-[#25D366] text-white shadow-[#25D366]/10 animate-pulse' : 'bg-green-50 text-green-700 hover:bg-green-100/50'}`}
        >
          <MessageSquare className="text-[#25D366] fill-[#25D366]/20 w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
          <span>WhatsApp</span>
        </button>
      </div>

      <div className="p-4 w-full">
        {activeTab === 'premium_hub' && (
          <div className="flex flex-col gap-4">
             {/* Dynamic Wallet Balance Card */}
             <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mb-6 pointer-events-none"></div>
                <div className="flex justify-between items-start">
                   <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100 opacity-90">Merchant Digital Wallet</span>
                      <h3 className="text-3xl font-display font-black mt-1 text-white">E {merchantBalance.toFixed(2)}</h3>
                   </div>
                   <button 
                     onClick={() => {
                       setMerchantBalance(prev => prev + 100);
                     }}
                     className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2 rounded-xl border border-white/20 active:scale-95 transition-all shadow-sm"
                   >
                     + E 100 Top Up
                   </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[11px] text-amber-50">
                   <span className="flex items-center gap-1"><Lock size={12} /> Secure ledger payments active</span>
                   <span className="font-mono">ID: TZ-84192</span>
                </div>
             </div>
                          {/* 1. Commission Plan Widget */}
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><DollarSign className="w-5 h-5" /></div>
                <div className="flex-1">
                   <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-gray-800">Marketplace Commission Plan</h4>
                      <span className="text-[10px] text-gray-400 font-bold">Based on Active Tier</span>
                   </div>
                   <p className="text-[11px] text-gray-500 mt-1">Platform commission automatically deducted per transaction.</p>
                   
                   <div className="mt-3 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-1.5">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                         <span className="text-[11px] text-gray-700 font-bold">Active Commission Cut:</span>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        shopTier === 'business' ? "text-amber-700 bg-amber-50 border border-amber-200" : 
                        shopTier === 'premium' ? "text-blue-700 bg-blue-50 border border-blue-200" : 
                        "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      }`}>
                         {shopTier === 'business' ? "1.0% (Business Class)" : 
                          shopTier === 'premium' ? "2.5% (Premium Class)" : 
                          "5.0% (Standard)"}
                      </span>
                   </div>
                </div>
             </div>

             {/* 2. PREMIUM SHOPS - SUBSCRIPTION TIERS */}
             <div id="membership-tiers-card" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                   <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl shrink-0"><Award size={20} /></div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800">2. Shop Membership Tiers</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                         Choose the plan that fits your business scale. Unlock advanced search priority, verified status, and custom store designs!
                      </p>
                   </div>
                </div>

                {/* Plan Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                   {/* Basic Plan */}
                   <div className={`p-3 rounded-2xl border flex flex-col justify-between text-left transition-all relative ${shopTier === 'basic' ? 'bg-emerald-50/40 border-emerald-500 ring-1 ring-emerald-500/20' : 'bg-slate-50/50 border-gray-100'}`}>
                      {shopTier === 'basic' && (
                         <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded-full font-mono">
                            Active
                         </div>
                      )}
                      <div>
                         <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Basic</span>
                         <span className="font-mono text-sm font-black text-slate-800 block mt-1">Free</span>
                         <ul className="text-[8px] text-gray-500 font-medium space-y-1 mt-2.5">
                            <li className="flex items-center gap-1">⏱️ Phone Verified</li>
                            <li className="flex items-center gap-1">📦 Max 3 Listings</li>
                            <li className="flex items-center gap-1">📊 Standard Stats</li>
                         </ul>
                      </div>
                      {shopTier !== 'basic' && (
                         <button 
                           type="button"
                           onClick={() => {
                             updateShopTier('basic');
                             alert("Successfully downgraded to Basic tier. Your features have been adjusted.");
                           }}
                           className="mt-3 w-full bg-white hover:bg-gray-100 text-slate-700 font-bold text-[9px] py-1.5 rounded-lg border border-gray-200 transition-all text-center cursor-pointer"
                         >
                            Switch Free
                         </button>
                      )}
                   </div>

                   {/* Premium Plan */}
                   <div className={`p-3 rounded-2xl border flex flex-col justify-between text-left transition-all relative ${shopTier === 'premium' ? 'bg-blue-50/40 border-blue-500 ring-1 ring-blue-500/20' : 'bg-slate-50/50 border-gray-100'}`}>
                      {shopTier === 'premium' && (
                         <div className="absolute top-2 right-2 bg-blue-500 text-white text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded-full font-mono">
                            Active
                         </div>
                      )}
                      <div>
                         <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wide block">Premium</span>
                         <span className="font-mono text-sm font-black text-slate-800 block mt-1">E 99<span className="text-[8px] text-gray-400 font-normal">/mo</span></span>
                         <ul className="text-[8px] text-gray-500 font-medium space-y-1 mt-2.5 font-sans">
                            <li className="flex items-center gap-1 text-blue-800 font-semibold">💎 Verified Badge</li>
                            <li className="flex items-center gap-1">🎨 Better Storefront Design</li>
                            <li className="flex items-center gap-1">📦 More Product Listings</li>
                            <li className="flex items-center gap-1">📈 Analytics</li>
                            <li className="flex items-center gap-1">🚀 Priority Search Placement</li>
                            <li className="flex items-center gap-1">📄 Custom Business Page</li>
                         </ul>
                      </div>
                      {shopTier !== 'premium' && (
                         <button 
                           type="button"
                           onClick={async () => {
                             if (merchantBalance >= 99) {
                               setMerchantBalance(prev => prev - 99);
                               await updateShopTier('premium');
                               alert("Congratulations! You are now a Premium Seller with Blue Verified Badge & custom storefront features.");
                             } else {
                               alert("Insufficient wallet balance! Please Top Up E 100 first.");
                             }
                           }}
                           className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] py-1.5 rounded-lg transition-all text-center cursor-pointer"
                         >
                            Get Premium
                         </button>
                      )}
                   </div>

                   {/* Business Plan */}
                   <div className={`p-3 rounded-2xl border flex flex-col justify-between text-left transition-all relative ${shopTier === 'business' ? 'bg-amber-50/40 border-amber-500 ring-1 ring-amber-500/20' : 'bg-slate-50/50 border-gray-100'}`}>
                      {shopTier === 'business' && (
                         <div className="absolute top-2 right-2 bg-amber-500 text-white text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded-full font-mono">
                            Active
                         </div>
                      )}
                      <div>
                         <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wide block">Business</span>
                         <span className="font-mono text-sm font-black text-slate-800 block mt-1">E 299<span className="text-[8px] text-gray-400 font-normal">/mo</span></span>
                         <ul className="text-[8px] text-gray-500 font-medium space-y-1 mt-2.5 font-sans">
                            <li className="flex items-center gap-1 text-amber-800 font-semibold">👑 Gold Badge</li>
                            <li className="flex items-center gap-1">🎨 Brand Themes</li>
                            <li className="flex items-center gap-1">📦 Unlimited Items</li>
                            <li className="flex items-center gap-1">🔥 Top Priority</li>
                         </ul>
                      </div>
                      {shopTier !== 'business' && (
                         <button 
                           type="button"
                           onClick={async () => {
                             if (merchantBalance >= 299) {
                               setMerchantBalance(prev => prev - 299);
                               await updateShopTier('business');
                               alert("Incredible! You have unlocked Business Class Shop status. Enjoy maximum priority placement and fully custom storefront layouts!");
                             } else {
                               alert("Insufficient wallet balance! Please Top Up E 300 first.");
                             }
                           }}
                           className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] py-1.5 rounded-lg transition-all text-center cursor-pointer"
                         >
                            Get Business
                         </button>
                      )}
                   </div>

                   {/* Service Provider Plan */}
                   <div className={`p-3 rounded-2xl border flex flex-col justify-between text-left transition-all relative ${shopTier === 'service_pro' ? 'bg-indigo-50/40 border-indigo-500 ring-1 ring-indigo-500/20' : 'bg-slate-50/50 border-gray-100'}`}>
                      {shopTier === 'service_pro' && (
                         <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded-full font-mono">
                            Active
                         </div>
                      )}
                      <div>
                         <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wide block">Service Pro</span>
                         <span className="font-mono text-sm font-black text-slate-800 block mt-1">E 149<span className="text-[8px] text-gray-400 font-normal">/mo</span></span>
                         <ul className="text-[8px] text-gray-500 font-medium space-y-1 mt-2.5 font-sans">
                            <li className="flex items-center gap-1 text-indigo-800 font-semibold">🛠️ Service Badge</li>
                            <li className="flex items-center gap-1">📞 Unlimited Inquiries</li>
                            <li className="flex items-center gap-1">🎯 Local Lead Gen</li>
                            <li className="flex items-center gap-1">⭐ Top Category Rank</li>
                         </ul>
                      </div>
                      {shopTier !== 'service_pro' && (
                         <button 
                           type="button"
                           onClick={async () => {
                             if (merchantBalance >= 149) {
                               setMerchantBalance(prev => prev - 149);
                               await updateShopTier('service_pro');
                               alert("Welcome to the Service Pro network! You will now receive unlimited customer leads directly.");
                             } else {
                               alert("Insufficient wallet balance! Please Top Up E 150 first.");
                             }
                           }}
                           className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] py-1.5 rounded-lg transition-all text-center cursor-pointer"
                         >
                            Get Pro Leads
                         </button>
                      )}
                   </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100/80 text-[10.5px] text-slate-600 leading-relaxed">
                   <span className="font-bold text-slate-800">💡 Tier Benefits Recap:</span> Standard platform fee of <span className="font-bold">5.0%</span> is reduced to <span className="font-semibold text-blue-600">2.5%</span> for Premium sellers, and cut down to just <span className="font-bold text-amber-600">1.0%</span> for Business class! <span className="font-semibold text-indigo-600">Service Pro</span> skips product fees for unlimited lead generation!
                </div>
             </div>

             {/* 3. STOREFRONT DESIGNER & CUSTOM BUSINESS PAGE */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
                {shopTier === 'basic' && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center text-white">
                      <Lock size={32} className="text-amber-400 mb-2 animate-bounce" />
                      <h5 className="font-bold text-sm">Unlock Storefront Designer</h5>
                      <p className="text-[10px] text-slate-200 mt-1 max-w-[260px] leading-relaxed">
                         Upgrade your membership to Premium or Business to unlock custom layouts, announcement tickers, banner styling, social links, and brand colors!
                      </p>
                      <button 
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('membership-tiers-card');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                         Upgrade Now
                      </button>
                   </div>
                )}

                <div className="flex items-start gap-3">
                   <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0"><Palette size={20} /></div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800">3. Brand Storefront Designer</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                         Configure your brand identity, customize storefront color themes, set announcements, and links to social channels.
                      </p>
                   </div>
                </div>

                {/* Customizer Fields */}
                <div className="flex flex-col gap-3.5 mt-2">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Brand Theme Color:</label>
                         <select 
                           value={designerTheme}
                           onChange={(e) => setDesignerTheme(e.target.value)}
                           className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none"
                         >
                            <option value="emerald">🌿 Swazi Emerald</option>
                            <option value="blue">🌊 Royal Blue</option>
                            <option value="pink">🌸 Luxury Rose</option>
                            <option value="amber">👑 Golden Amber</option>
                            <option value="slate">🖤 Midnight Slate</option>
                         </select>
                      </div>

                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Preset Cover Photo:</label>
                         <select 
                           value={designerBanner}
                           onChange={(e) => setDesignerBanner(e.target.value)}
                           className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white outline-none"
                         >
                            <option value="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800">🥬 Organic Vegetables</option>
                            <option value="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800">🍲 Flame Grill / Food</option>
                            <option value="https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=800">🧵 Traditional Crafts</option>
                            <option value="https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?auto=format&fit=crop&q=80&w=800">🛒 Local Marketplace</option>
                            <option value="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800">☕ Modern Cafe Stall</option>
                         </select>
                      </div>
                   </div>

                   <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Store Announcement Ticker:</label>
                      <input 
                        type="text"
                        value={designerAnnouncement}
                        onChange={(e) => setDesignerAnnouncement(e.target.value)}
                        placeholder="e.g. 10% discount on all organic cabbages this Friday!"
                        className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none"
                      />
                   </div>

                   <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Store Bio / Brand Story:</label>
                      <textarea 
                        rows={2}
                        value={designerDesc}
                        onChange={(e) => setDesignerDesc(e.target.value)}
                        placeholder="Describe your organic products..."
                        className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none resize-none leading-relaxed"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-gray-650 font-bold uppercase tracking-wide">Facebook Handle:</label>
                         <input 
                           type="text"
                           value={designerFacebook}
                           onChange={(e) => setDesignerFacebook(e.target.value)}
                           placeholder="e.g. SiphoOrganicSells"
                           className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-gray-650 font-bold uppercase tracking-wide">Instagram Username:</label>
                         <input 
                           type="text"
                           value={designerInstagram}
                           onChange={(e) => setDesignerInstagram(e.target.value)}
                           placeholder="e.g. sipho_harvests"
                           className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none"
                         />
                      </div>
                   </div>

                   {/* Standard Contact updates */}
                   <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 mt-1">
                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide">Store Hours:</label>
                         <input 
                           type="text"
                           value={designerHours}
                           onChange={(e) => setDesignerHours(e.target.value)}
                           placeholder="e.g. 08:00 - 17:00"
                           className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none"
                         />
                      </div>

                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide">Location Stall / Area:</label>
                         <input 
                           type="text"
                           value={designerLocation}
                           onChange={(e) => setDesignerLocation(e.target.value)}
                           placeholder="e.g. stall 14, Manzini"
                           className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none"
                         />
                      </div>
                   </div>

                   <button 
                     type="button"
                     onClick={async () => {
                       try {
                         if (seller && seller.id) {
                           await setDoc(doc(db, 'sellers', seller.id), {
                             ...seller,
                             description: designerDesc,
                             hours: designerHours,
                             location: designerLocation,
                             bannerUrl: designerBanner,
                             themeColor: designerTheme,
                             announcement: designerAnnouncement,
                             facebook: designerFacebook,
                             instagram: designerInstagram
                           });
                           alert("Yebo! Your Premium Brand Storefront has been published successfully and is live for all Swazi buyers!");
                         }
                       } catch (err) {
                         alert("Failed to save. Please try again.");
                       }
                     }}
                     className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer uppercase mt-2 font-mono"
                   >
                      Publish Storefront Design
                   </button>
                </div>
             </div>

             {/* 6. DIGITAL SERVICES - BUSINESS TOOLS FOR TRADERS */}
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                   <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl shrink-0"><Sparkles size={20} /></div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <div>
                            <h4 className="font-bold text-sm text-gray-800">6. Digital Tools for Traders</h4>
                            <p className="text-[10px] text-purple-600 font-bold mt-0.5 flex items-center gap-1">
                               <Coins size={12} /> Tech Bundle • E 49/mo
                            </p>
                         </div>
                         <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDigitalToolsActive ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-gray-100 text-gray-500"}`}>
                            {isDigitalToolsActive ? "Tools Unlocked" : "Locked"}
                         </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                         Gain a technical advantage using automated WhatsApp custom marketing autoresponders, bulk transaction invoice downloaders, and daily restock predictions.
                      </p>
                   </div>
                </div>

                <div className="mt-2 flex gap-2">
                   {isDigitalToolsActive ? (
                      <button 
                        onClick={() => {
                          setIsDigitalToolsActive(false);
                          setSelectedInvoiceOrder(null);
                        }}
                        className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs py-3 rounded-xl transition-all"
                      >
                         Deactivate Digital Services Bundle
                      </button>
                   ) : (
                      <button 
                        onClick={() => {
                          if (merchantBalance >= 49) {
                            setMerchantBalance(prev => prev - 49);
                            setIsDigitalToolsActive(true);
                          } else {
                            alert("Insufficient wallet balance! Please Top Up E 100 first.");
                          }
                        }}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs py-3 rounded-xl active:scale-95 transition-all shadow-md shadow-purple-600/10"
                      >
                         Unlock Trader Tech Bundle (E 49/mo)
                      </button>
                   )}
                </div>

                {/* --- DIGITAL SERVICES ACTIVE UTILITIES (Show only if subscribed) --- */}
                {isDigitalToolsActive && (
                   <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-4 animate-in fade-in slide-in-from-top-1">
                      <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50">
                         <span className="bg-purple-600 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Unlocked Utility</span>
                         <h5 className="font-bold text-xs text-gray-800 mt-2 flex items-center gap-1.5">
                            <MessageSquare size={13} className="text-purple-600" /> WhatsApp Marketing Autoresponder
                         </h5>
                         <p className="text-[10px] text-gray-500 mt-1">Configure automated local texts sent straight to WhatsApp customers placing order inquiries.</p>
                         
                         <div className="mt-3 flex flex-col gap-2">
                            <label className="text-[10px] text-gray-600 font-bold">Pick Template Quick-Fill:</label>
                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                               <button 
                                 onClick={() => setSmsTemplate("Yebo! Thank you for contacting Gugu's Fresh Produce. Your order is noted and our courier driver is currently matching location. Please wait!")}
                                 className="bg-white border border-gray-200 text-gray-700 hover:border-purple-300 rounded px-2.5 py-1 text-[9px] font-medium whitespace-nowrap"
                               >
                                  Order Greeting
                               </button>
                               <button 
                                 onClick={() => setSmsTemplate("Hello dear buyer! Our pricing listing is fully updated of organic cabbages (E20) and farm-fresh tomatoes (E15). Free delivery over Eveni region available this weekend!")}
                                 className="bg-white border border-gray-200 text-gray-700 hover:border-purple-300 rounded px-2.5 py-1 text-[9px] font-medium whitespace-nowrap"
                               >
                                  Price List
                               </button>
                               <button 
                                 onClick={() => setSmsTemplate("Molo! Your shipment driver is dispatching. Estimated receipt within 10-15 minutes near plot. Keep mobile phone open for verification.")}
                                 className="bg-white border border-gray-200 text-gray-700 hover:border-purple-300 rounded px-2.5 py-1 text-[9px] font-medium whitespace-nowrap"
                               >
                                  Transit Warning
                               </button>
                            </div>
                            
                            <textarea 
                              value={smsTemplate}
                              onChange={(e) => setSmsTemplate(e.target.value)}
                              rows={2}
                              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-[11px] focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700 leading-normal"
                            />
                            <div className="flex justify-end">
                               <button 
                                 onClick={() => alert("WhatsApp auto-message saved! Testing messages on incoming contacts.")}
                                 className="text-[9px] font-bold text-white bg-purple-600 px-3 py-1 rounded-lg"
                               >
                                  Apply Responder
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50 flex flex-col gap-2.5">
                         <div>
                            <span className="bg-purple-600 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Unlocked Utility</span>
                            <h5 className="font-bold text-xs text-gray-800 mt-2 flex items-center gap-1.5">
                               <FileText size={13} className="text-purple-600" /> Professional Seller Invoice Generator
                            </h5>
                            <p className="text-[10px] text-gray-500 mt-1">Draft invoices with dynamic itemized breakdowns of tax, platform commission, and transport payouts for tax filings or customer records.</p>
                         </div>

                         <div className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-gray-100">
                            <span className="text-[9px] text-gray-400 font-bold block">Select Active Transaction:</span>
                            <div className="flex flex-col gap-1.5">
                               <button 
                                 onClick={() => setSelectedInvoiceOrder({ id: "1042", client: "Timothy G.", product: "2x Farm Fresh Tomatoes", basePrice: 30, courier: 15 })}
                                 className={`p-2 rounded-lg border text-left flex justify-between items-center transition-colors ${selectedInvoiceOrder?.id === "1042" ? "border-purple-500 bg-purple-50/20" : "border-gray-100 hover:bg-gray-50"}`}
                               >
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-800">Order #1042 (Timothy G.)</p>
                                     <p className="text-[9px] text-gray-500">2x Tomatoes • E 30</p>
                                  </div>
                                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Compile</span>
                               </button>

                               <button 
                                 onClick={() => setSelectedInvoiceOrder({ id: "8410", client: "Zodwa M.", product: "1x Local Cabbages", basePrice: 12, courier: 15 })}
                                 className={`p-2 rounded-lg border text-left flex justify-between items-center transition-colors ${selectedInvoiceOrder?.id === "8410" ? "border-purple-500 bg-purple-50/20" : "border-gray-100 hover:bg-gray-50"}`}
                               >
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-800">Order #8410 (Zodwa M.)</p>
                                     <p className="text-[9px] text-gray-500">1x Cabbage • E 12</p>
                                  </div>
                                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Compile</span>
                               </button>
                            </div>
                         </div>

                         {/* Invoice Details Container (Simulated Popup or Area) */}
                         {selectedInvoiceOrder && (
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[9px] border border-slate-800 flex flex-col gap-1 shadow-inner relative animate-in zoom-in-95">
                               <div className="flex justify-between border-b border-slate-800 pb-2 mb-2 items-center">
                                  <div>
                                     <p className="font-bold text-white text-[10px]">MAKETICONNECT SYSTEM RECEIPT</p>
                                     <p className="text-slate-400">INVOICE #{selectedInvoiceOrder.id}</p>
                                  </div>
                                  <button onClick={() => setSelectedInvoiceOrder(null)} className="text-slate-400 hover:text-white p-0.5">✕</button>
                               </div>

                               <p><span className="text-slate-400">Merchant Store:</span> {seller.name}</p>
                               <p><span className="text-slate-400">Purchaser ID/Name:</span> {selectedInvoiceOrder.client}</p>
                               <p><span className="text-slate-400">System Dispatch Date:</span> June 13, 2026</p>

                               <div className="w-full h-[1px] bg-slate-800 my-1"></div>

                               <div className="flex justify-between font-bold text-white">
                                  <span>Item Purchase</span>
                                  <span>Amount</span>
                               </div>
                               <div className="flex justify-between">
                                  <span>{selectedInvoiceOrder.product}</span>
                                  <span>E {selectedInvoiceOrder.basePrice.toFixed(2)}</span>
                                </div>

                               {/* Dynamic Commission Calculation relative to current subscription status */}
                               {/* Commission is 2.5% for premium merchant and 5% for standard */}
                               {(() => {
                                  const commPercentage = isPremiumMerchant ? 2.5 : 5.0;
                                  const commissionFee = selectedInvoiceOrder.basePrice * (commPercentage / 100);
                                  const logisticsPlatformCut = selectedInvoiceOrder.courier * 0.20; // 5. Delivery model platform logistics cut is 20%
                                  const finalOrderPayout = selectedInvoiceOrder.basePrice - commissionFee;

                                  return (
                                     <>
                                        <div className="w-full h-[1px] bg-slate-800 my-1"></div>
                                        <div className="flex justify-between text-yellow-400">
                                           <span>Commission Deduction ({commPercentage}%):</span>
                                           <span>- E {commissionFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-orange-400">
                                           <span>Logistics Match Fee (Matched Driver Courier):</span>
                                           <span>E {selectedInvoiceOrder.courier.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-orange-500 opacity-85 pl-2">
                                           <span>├─ Driver Payout (80% logistics value):</span>
                                           <span>E {(selectedInvoiceOrder.courier * 0.8).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-orange-500 opacity-85 pl-2">
                                           <span>└─ Platform logistics commission (20%):</span>
                                           <span>E {logisticsPlatformCut.toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="w-full h-[1px] bg-slate-800 my-1"></div>
                                        <div className="flex justify-between font-bold text-white text-[10px] mt-1 pt-1 border-t border-slate-800 border-dashed">
                                           <span>NET MERCHANT SETTLEMENT (Escrow):</span>
                                           <span>E {finalOrderPayout.toFixed(2)}</span>
                                        </div>
                                     </>
                                  );
                               })()}

                               <button 
                                 onClick={() => alert("Downloading invoice receipt as PDF to device downloads folder.")}
                                 className="mt-3 bg-purple-600 font-bold hover:bg-purple-700 text-white py-1.5 rounded-lg text-center"
                               >
                                  Download Official PDF Invoice
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <>
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 w-full mb-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -z-0"></div>
               <img src={seller.logoUrl} className="w-14 h-14 rounded-full object-cover border border-gray-200 z-10" />
               <div className="flex-1 z-10">
                 <h2 className="font-bold text-gray-800 text-sm block mb-1">{seller.name}</h2>
                 <VerificationBadge level={seller.verificationLevel} showText={true} showDetails={true} className="inline-flex bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100" />
               </div>
               <button className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg z-10">Edit</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6 w-full">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <DollarSign size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <p className="font-bold text-gray-800 text-lg">E 1,240</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Package size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="font-bold text-gray-800 text-lg">112</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                  <TrendingUp size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Product Views</p>
                <p className="font-bold text-gray-800 text-lg">3,485</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
                <p className="font-bold text-gray-800 text-lg">3.2%</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 col-span-2">
                 <div className="flex items-center justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                        <MessageSquare size={16} />
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Customer Inquiries</p>
                      <p className="font-bold text-gray-800 text-lg">14</p>
                    </div>
                    <button className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                      View Messages
                    </button>
                 </div>
              </div>
            </div>

            {/* Popular Products */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
               <h3 className="font-bold text-gray-800 text-sm mb-3">Popular Products</h3>
               <div className="flex flex-col gap-3">
                  {products.slice(0, 3).map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3">
                       <span className="font-bold text-gray-400 text-xs w-2">{idx + 1}</span>
                       <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                       <div className="flex-1">
                          <h4 className="font-bold text-xs text-gray-800">{p.name}</h4>
                          <p className="text-[10px] text-gray-500">{124 - idx * 20} views • E {p.price * (14 - idx)} revenue</p>
                       </div>
                       <TrendingUp size={14} className="text-green-500" />
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 text-sm mb-3">AI Shop Assistant</h3>
               <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-xs text-green-800 font-medium">Tip: Adding more photos to "Local Cabbages" could increase your sales by 20%.</p>
                  <button className="mt-2 text-xs font-bold text-green-600 bg-white px-3 py-1 rounded-md shadow-sm">Update Listing</button>
               </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4">
              {/* Regional Logistics Template Configuration */}
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700/60 shadow-xl flex flex-col gap-4 font-sans">
                 <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-green-600/25 border border-green-500 flex items-center justify-center">
                          <Truck size={14} className="text-green-400" />
                       </div>
                       <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">Logistics & Shipping Profiles</h4>
                          <p className="text-[8.5px] text-slate-300">Set active delivery profiles and standard rates</p>
                       </div>
                    </div>
                    <span className="text-[8px] bg-green-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase font-mono tracking-wider">Live template</span>
                 </div>

                 {/* Tab Selector Inside Templates Panel */}
                 <div className="grid grid-cols-3 gap-2 bg-slate-850 p-1 rounded-2xl border border-white/5 text-[9.5px] font-bold font-sans">
                    <button 
                      type="button"
                      onClick={() => setSellerSelectedMethod('self')} 
                      className={`py-2 px-1 rounded-xl text-center transition-all ${sellerSelectedMethod === 'self' ? 'bg-green-600 text-white font-extrabold shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      Self-Delivery
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSellerSelectedMethod('courier')} 
                      className={`py-2 px-1 rounded-xl text-center transition-all ${sellerSelectedMethod === 'courier' ? 'bg-green-600 text-white font-extrabold shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      Courier Delivery
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSellerSelectedMethod('marketplace')} 
                      className={`py-2 px-1 rounded-xl text-center transition-all ${sellerSelectedMethod === 'marketplace' ? 'bg-green-600 text-white font-extrabold shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      Marketplace Riders
                    </button>
                 </div>

                 {/* Self-Delivery Details Config */}
                 {sellerSelectedMethod === 'self' && (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">Self-Delivery Option Status:</span>
                          <span className="text-green-400 font-black">Active ✓</span>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono">My Base Rate (E)</label>
                             <input 
                               type="text" 
                               value={selfDeliveryCost} 
                               onChange={(e) => setSelfDeliveryCost(e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700/85 p-2 rounded-xl text-xs font-bold outline-none text-white font-mono"
                             />
                          </div>
                          <div>
                             <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono">Transport Vehicle</label>
                             <select 
                                value={selfDeliveryVehicle}
                                onChange={(e) => setSelfDeliveryVehicle(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700/85 p-2 rounded-xl text-xs font-bold outline-none text-white"
                             >
                                <option value="Bicycle">Bicycle / Foot</option>
                                <option value="Motorcycle Rider">Motorcycle / Scooter</option>
                                <option value="Own Truck">Own Transit Truck</option>
                             </select>
                          </div>
                       </div>
                       <p className="text-[9.5px] text-slate-400 leading-normal bg-slate-800/35 p-2.5 rounded-xl border border-white/5">
                         ℹ️ <strong>Manual Coordination</strong>: When using manual self-delivery, transit times and GPS coordination are logged manually by you. You receive E{selfDeliveryCost} directly in your finalized mobile money payouts.
                       </p>
                    </div>
                 )}

                 {/* Courier Template Config */}
                 {sellerSelectedMethod === 'courier' && (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-200 font-sans">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">Courier Integration Status:</span>
                          <span className="text-green-400 font-black">Linked ✓</span>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono">Preferred Courier Agency</label>
                             <input 
                               type="text" 
                               value={courierName} 
                               onChange={(e) => setCourierName(e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700/85 p-2 rounded-xl text-xs font-bold outline-none text-white font-sans"
                             />
                          </div>
                          <div>
                             <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono">Courier Standard Rate (E)</label>
                             <input 
                               type="text" 
                               value={courierCostRate} 
                               onChange={(e) => setCourierCostRate(e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700/85 p-2 rounded-xl text-xs font-bold outline-none text-white font-mono font-sans"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono font-sans">Waybill Tracking Reference ID</label>
                          <input 
                             type="text" 
                             value={courierTrackingCode} 
                             onChange={(e) => setCourierTrackingCode(e.target.value)}
                             className="w-full bg-slate-800 border border-slate-700/85 p-2 rounded-xl text-xs font-bold outline-none text-white font-mono"
                          />
                       </div>
                       <p className="text-[9.5px] text-slate-400 leading-normal bg-slate-800/35 p-2.5 rounded-xl border border-white/5 font-sans">
                         📦 <strong>Direct Integration Templates</strong>: Automatically notifies {courierName} of order readiness. Standard tracking URL is generated for buyer's instant mobile tracking.
                       </p>
                    </div>
                 )}

                 {/* Marketplace Driver Partners Config */}
                 {sellerSelectedMethod === 'marketplace' && (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-200 font-sans">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium font-sans">Platform Logistics Sync:</span>
                          <span className="text-indigo-400 font-black flex items-center gap-1 font-sans">
                             <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping font-sans"></span> Matching Riders Live
                          </span>
                       </div>
                       <div className="grid grid-cols-2 gap-3.5">
                          <div>
                             <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono font-sans">Standard Rider Rate</label>
                             <div className="bg-slate-800 border border-slate-700/85 p-2.5 rounded-xl text-xs font-bold font-mono text-white">
                                E {marketplaceCostRate} flat
                             </div>
                          </div>
                          <div>
                             <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 font-mono font-sans">Matched GPS Radius</label>
                             <div className="bg-slate-800 border border-slate-700/85 p-2.5 rounded-xl text-xs font-bold text-white font-sans">
                                5.0 km
                             </div>
                          </div>
                       </div>
                       <p className="text-[9.5px] text-slate-400 leading-normal bg-slate-800/35 p-2.5 rounded-xl border border-white/5">
                         🏍️ <strong>Marketplace Driver Pooling</strong>: Verifies, tracks, and maps dispatch riders automatically using MTN MoMo split payments. Escrow funds stay secure until delivery is fully resolved.
                       </p>
                    </div>
                 )}
              </div>

             {/* Dynamic Escrow Orders from localStorage */}
             {escrowOrders.length > 0 && (
               <div className="flex flex-col gap-3 pb-2 border-b border-gray-200">
                 <h3 className="font-black text-xs uppercase tracking-wider text-gray-500 px-1">🔒 Escrow Payment Orders ({escrowOrders.length})</h3>
                 {escrowOrders.map(order => (
                   <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-200 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg font-mono">
                        Escrow Guarded
                     </div>
                     
                     <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded uppercase ${
                            order.status === 'Locked' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'Delivered' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                            order.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                             {order.status === 'Locked' && '🤝 Funds Secured in Escrow'}
                             {order.status === 'Delivered' && '🏍️ Delivery Completed'}
                             {order.status === 'Paid' && '💸 Paid Out (Released)'}
                             {order.status === 'Refunded' && '↩️ Escrow Reversed (Refunded)'}
                          </span>
                          <h4 className="font-extrabold text-gray-800 text-xs mt-2">{order.item}</h4>
                        </div>
                        <span className="font-black text-teal-600 text-xs font-mono">E {order.amount.toFixed(2)}</span>
                     </div>
                     
                     <p className="text-[10px] text-gray-400 leading-none mb-2">
                       Phone: <span className="font-mono text-gray-600">{order.buyerPhone}</span> · Code: <span className="font-mono text-blue-600 font-bold">{order.id}</span>
                     </p>

                     {order.status === 'Locked' && (
                       <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-100/50 text-[10px] text-amber-900 leading-normal flex items-start gap-2">
                         <Lock size={12} className="text-amber-600 shrink-0 mt-0.5" />
                         <span>Funds are safely locked in eMakethe Escrow Trust. Prepare harvest package and wait for matched rider pick-up.</span>
                       </div>
                     )}

                     {order.status === 'Delivered' && (
                       <div className="bg-indigo-50/70 rounded-xl p-2.5 border border-indigo-100/50 text-[10px] text-indigo-900 leading-normal flex items-start gap-2">
                         <CheckCircle2 size={12} className="text-indigo-600 shrink-0 mt-0.5" />
                         <span>Delivery completed by the moto driver. The buyer will release the funds through their Wallet Escrow Panel shortly!</span>
                       </div>
                     )}

                     {order.status === 'Paid' && (
                       <div className="bg-green-50/70 rounded-xl p-2.5 border border-green-100/50 text-[10px] text-green-900 leading-normal flex items-start gap-2">
                         <CheckCircle2 size={12} className="text-green-600 shrink-0 mt-0.5" />
                         <span>Payout finalized! Net settled funds credited directly to your digital shop balance.</span>
                       </div>
                     )}
                     
                     {order.status === 'Refunded' && (
                       <div className="bg-rose-50/70 rounded-xl p-2.5 border border-rose-100/50 text-[10px] text-rose-900 leading-normal flex items-start gap-2">
                         <X size={12} className="text-rose-600 shrink-0 mt-0.5" />
                         <span>This transaction was fully reversed and refunded back to buyer's mobile wallet.</span>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}

             <h3 className="font-black text-xs uppercase tracking-wider text-gray-500 px-1 mt-1">📦 Cash / Standard Orders</h3>
             {acceptedOrder ? (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Waiting for Driver</span>
                         <h4 className="font-bold text-gray-800 text-sm mt-1">2x Farm Fresh Tomatoes</h4>
                       </div>
                       <span className="font-bold text-gray-800">E 30</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 gap-1 mb-3">
                       <MapPin size={12} /> Deliver to: Eveni, Plot 12
                    </div>
                    <button className="w-full bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-lg">
                       Driver Map & Details
                    </button>
                 </div>
             ) : (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">New Order #1042</span>
                         <h4 className="font-bold text-gray-800 text-sm mt-1">2x Farm Fresh Tomatoes</h4>
                       </div>
                       <span className="font-bold text-gray-800">E 30</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 gap-1 mb-3">
                       <MapPin size={12} /> Deliver to: Eveni, Plot 12
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setShowDeliveryOptions(true)} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                         <CheckCircle2 size={14} /> Accept & Deliver
                       </button>
                       <button className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-lg">
                         Call Buyer
                       </button>
                    </div>
                 </div>
             )}

             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">Out for Delivery</span>
                     <h4 className="font-bold text-gray-800 text-sm mt-1">1x Local Cabbages</h4>
                   </div>
                   <span className="font-bold text-gray-800">E 12</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-1 mb-3">
                   <Truck size={12} /> Driver: Musa (ETA: 10 mins)
                </div>
                <button className="w-full bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-lg">
                   Track Delivery
                </button>
             </div>
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Inventory ({products.length})</h3>
              <button onClick={() => setShowAddProduct(true)} className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <Plus size={12} /> Add Product
              </button>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <img src={p.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{p.name}</h4>
                    <p className="text-green-600 font-bold text-xs mt-0.5">{p.currency}{p.price} {p.unit}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Stock: {p.stock}</p>
                  </div>
                  <button className="text-gray-400 bg-gray-50 px-3 py-1 text-xs font-bold rounded-lg border border-gray-200">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'ai-coach' && (
          <div className="flex flex-col gap-4">
             <div className="bg-indigo-600 text-white p-5 rounded-3xl shadow-md flex items-start gap-4 mb-2">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                 <Sparkles size={24} className="text-white" />
               </div>
               <div>
                  <h3 className="font-display font-bold text-lg mb-1">Coach Sipho</h3>
                  <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">Empowering informal merchants across Eswatini. Tap any of the business pillars below to fetch target advice.</p>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-1.5 p-1 bg-indigo-50/75 rounded-2xl">
                <button 
                  onClick={() => setCoachingTopic('sales')}
                  className={`text-[10px] font-black py-2.5 rounded-xl transition-all ${coachingTopic === 'sales' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:bg-indigo-100/50'}`}
                >
                  📈 Sales
                </button>
                <button 
                  onClick={() => setCoachingTopic('photos')}
                  className={`text-[10px] font-black py-2.5 rounded-xl transition-all ${coachingTopic === 'photos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:bg-indigo-100/50'}`}
                >
                  📸 Photos
                </button>
                <button 
                  onClick={() => setCoachingTopic('inventory')}
                  className={`text-[10px] font-black py-2.5 rounded-xl transition-all ${coachingTopic === 'inventory' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:bg-indigo-100/50'}`}
                >
                  📦 Inven.
                </button>
                <button 
                  onClick={() => setCoachingTopic('service')}
                  className={`text-[10px] font-black py-2.5 rounded-xl transition-all ${coachingTopic === 'service' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:bg-indigo-100/50'}`}
                >
                  🤝 Care
                </button>
             </div>

             {isLoadingCoach ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2">
                   <Sparkles size={28} className="animate-spin text-indigo-500" />
                   <p className="text-xs text-gray-400 font-bold font-mono">Coach Sipho is formulating advices...</p>
                </div>
             ) : (
                coachResponse && (
                   <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-bold px-2.5 py-1 rounded-bl-lg uppercase tracking-wider font-mono">Live Coach</div>
                         <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 mb-2 mr-12 leading-snug">
                           {coachResponse.title}
                         </h4>
                         <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                            {coachResponse.tip}
                         </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150">
                         <h4 className="font-bold text-[10px] text-gray-700 uppercase tracking-wider mb-3 font-mono">
                           📋 Recommended Next Steps
                         </h4>
                         <div className="flex flex-col gap-2.5">
                            {coachResponse.checklist.map((step, idx) => (
                               <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 border border-indigo-100">
                                     {idx + 1}
                                  </div>
                                  <p className="text-xs text-gray-700 leading-normal font-sans">{step}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )
             )}
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200" id="promotional-ad-suite">
            {/* 1. Header Banner */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white p-5 rounded-3xl shadow-sm flex items-start gap-4 mb-2">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                 <Megaphone size={22} className="text-white animate-bounce" />
               </div>
               <div>
                  <h3 className="font-display font-black text-lg mb-1">Trader Promotion & Ads</h3>
                  <p className="text-[11px] text-pink-50 leading-relaxed font-semibold">
                     Expand your business circle across Mbabane & Manzini. Launch campaigns directly funded by your digital wallet.
                  </p>
               </div>
            </div>

            {/* Quick Wallet Context */}
            <div className="bg-white p-4.5 rounded-2.5xl border border-gray-100 shadow-3xs flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-pink-50/10">
               <div>
                 <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Wallet Funding Base</span>
                 <span className="font-mono text-base font-black text-slate-800">E {merchantBalance.toFixed(2)}</span>
               </div>
               <button 
                 onClick={() => {
                   setMerchantBalance(prev => prev + 100);
                   alert("Deposited E 100.00 from linked MTN MoMo wallet! balance is now E " + (merchantBalance + 100).toFixed(2));
                 }}
                 className="bg-green-600 text-white hover:bg-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
               >
                 + MTN MoMo Deposit
               </button>
            </div>

            {/* SUITE ACTIONS TABS */}
            <div className="flex flex-col gap-6">

              {/* SECTION A: FEATURED PRODUCTS */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <div className="p-2 bg-pink-50 text-pink-600 rounded-2xl"><Package size={18} /></div>
                       <div>
                          <h4 className="font-black text-sm text-gray-800 font-display">Featured Listings Slot</h4>
                          <span className="text-[10px] text-pink-600 font-extrabold uppercase tracking-wide">E 20.00 / day &bull; Discounts for Weekly & Monthly</span>
                       </div>
                    </div>
                    <span className="text-[9px] bg-pink-100 text-pink-800 font-black px-2.5 py-0.5 rounded-full uppercase">Top Search Slot</span>
                 </div>

                 <p className="text-[11px] text-gray-500 leading-relaxed">
                    Promote your products to appear at the absolute top of customer search results and category lists. Gain immediate visibility and boost sales volumes—just like Facebook Marketplace & OLX!
                 </p>

                 {/* Selector Form */}
                 <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100/80 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide">Select Product to Promote:</label>
                       <select 
                         value={selectedFeaturedProduct} 
                         onChange={(e) => setSelectedFeaturedProduct(e.target.value)}
                         className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 font-bold outline-none"
                       >
                          {products.map(p => (
                             <option key={`feat-opt-${p.id}`} value={p.id}>E {p.price} • {p.name}</option>
                          ))}
                       </select>
                    </div>

                    {/* Promoted Plan Selection */}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide">Select Promotion Plan:</label>
                       <div className="grid grid-cols-3 gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setFeaturedPlan('daily');
                              setFeaturedMultiplier(1);
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${featuredPlan === 'daily' ? 'bg-pink-50 border-pink-500 shadow-3xs' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                          >
                             <span className="text-[9px] font-black text-pink-600 uppercase tracking-tight">Daily Boost</span>
                             <span className="text-xs font-mono font-black text-slate-800 mt-1">E 20</span>
                             <span className="text-[8px] text-gray-400 font-medium mt-0.5">per day</span>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => {
                              setFeaturedPlan('weekly');
                              setFeaturedMultiplier(1);
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all relative ${featuredPlan === 'weekly' ? 'bg-pink-50 border-pink-500 shadow-3xs' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                          >
                             <div className="absolute top-[-6px] bg-amber-500 text-white text-[7px] font-black uppercase px-1 py-0.2 rounded-full tracking-tighter">
                               SAVE E40
                             </div>
                             <span className="text-[9px] font-black text-pink-600 uppercase tracking-tight mt-0.5">Weekly</span>
                             <span className="text-xs font-mono font-black text-slate-800 mt-1">E 100</span>
                             <span className="text-[8px] text-gray-400 font-medium mt-0.5">per week</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              setFeaturedPlan('monthly');
                              setFeaturedMultiplier(1);
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all relative ${featuredPlan === 'monthly' ? 'bg-pink-50 border-pink-500 shadow-3xs' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                          >
                             <div className="absolute top-[-6px] bg-red-500 text-white text-[7px] font-black uppercase px-1 py-0.2 rounded-full tracking-tighter">
                               SAVE E300
                             </div>
                             <span className="text-[9px] font-black text-pink-600 uppercase tracking-tight mt-0.5">Monthly</span>
                             <span className="text-xs font-mono font-black text-slate-800 mt-1">E 300</span>
                             <span className="text-[8px] text-gray-400 font-medium mt-0.5">per month</span>
                          </button>
                       </div>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                       <div className="flex-1">
                          <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide block mb-1">
                             Campaign Duration:
                          </label>
                          {featuredPlan === 'daily' && (
                             <div className="flex gap-1">
                                {[1, 3, 5, 7].map(val => (
                                   <button 
                                     key={`mult-d-${val}`}
                                     type="button"
                                     onClick={() => setFeaturedMultiplier(val)}
                                     className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex-1 ${featuredMultiplier === val ? 'bg-pink-600 text-white shadow-3xs' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                   >
                                      {val}d
                                   </button>
                                ))}
                             </div>
                          )}
                          {featuredPlan === 'weekly' && (
                             <div className="flex gap-1">
                                {[1, 2, 3, 4].map(val => (
                                   <button 
                                     key={`mult-w-${val}`}
                                     type="button"
                                     onClick={() => setFeaturedMultiplier(val)}
                                     className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex-1 ${featuredMultiplier === val ? 'bg-pink-600 text-white shadow-3xs' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                   >
                                      {val}w
                                   </button>
                                ))}
                             </div>
                          )}
                          {featuredPlan === 'monthly' && (
                             <div className="flex gap-1">
                                {[1, 2, 3].map(val => (
                                   <button 
                                     key={`mult-m-${val}`}
                                     type="button"
                                     onClick={() => setFeaturedMultiplier(val)}
                                     className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex-1 ${featuredMultiplier === val ? 'bg-pink-600 text-white shadow-3xs' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                   >
                                      {val}m
                                   </button>
                                ))}
                             </div>
                          )}
                       </div>
                       <div className="shrink-0 text-right pl-3">
                          <span className="text-[10px] text-gray-400 font-bold block">Total Budget:</span>
                          <span className="font-mono text-sm font-black text-pink-600">
                             E {(() => {
                                if (featuredPlan === 'daily') return featuredMultiplier * 20;
                                if (featuredPlan === 'weekly') return featuredMultiplier * 100;
                                return featuredMultiplier * 300;
                             })().toFixed(2)}
                          </span>
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        const calculatedCost = (() => {
                          if (featuredPlan === 'daily') return featuredMultiplier * 20;
                          if (featuredPlan === 'weekly') return featuredMultiplier * 100;
                          return featuredMultiplier * 300;
                        })();
                        
                        if (merchantBalance < calculatedCost) {
                          alert("Insufficient balance! Please click '+ MTN MoMo Deposit' to add funds.");
                          return;
                        }
                        if (!selectedFeaturedProduct) {
                          alert("Please create or select a product listing first!");
                          return;
                        }
                        if (featuredProducts.includes(selectedFeaturedProduct)) {
                          alert("This product is already featured on eMakethe!");
                          return;
                        }
                        
                        setMerchantBalance(prev => prev - calculatedCost);
                        setFeaturedProducts(prev => [...prev, selectedFeaturedProduct]);
                        setFeaturedCampaignsMeta(prev => ({
                          ...prev,
                          [selectedFeaturedProduct]: {
                            planType: featuredPlan,
                            multiplier: featuredMultiplier,
                            cost: calculatedCost,
                            dateAdded: new Date().toISOString()
                          }
                        }));
                        
                        alert(`Successfully Featured ${products.find(p => p.id === selectedFeaturedProduct)?.name || 'Product'}! E ${calculatedCost.toFixed(2)} has been loaded from your wallet into the campaign secure escrow.`);
                      }}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-xs py-2.5 rounded-xl transition-all active:scale-95 shadow-sm mt-1 uppercase cursor-pointer"
                    >
                       Boost Search Ranking Now
                    </button>
                 </div>

                 {/* ACTIVE FEATURED CAMPAIGNS MONITOR */}
                 {featuredProducts.length > 0 && (
                    <div className="mt-1 border-t border-gray-100 pt-3 flex flex-col gap-2">
                       <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Live Promoted Placements ({featuredProducts.length})</span>
                       <div className="flex flex-col gap-2">
                          {featuredProducts.map(prodId => {
                             const originalProd = PRODUCTS.find(p => p.id === prodId);
                             const meta = featuredCampaignsMeta[prodId];
                             
                             const planLabel = meta ? (meta.planType === 'daily' ? 'Daily Boost' : meta.planType === 'weekly' ? 'Weekly Accel' : 'Monthly Dom') : 'Daily Boost';
                             const durationLabel = meta ? (meta.planType === 'daily' ? `${meta.multiplier}d` : meta.planType === 'weekly' ? `${meta.multiplier}w` : `${meta.multiplier}m`) : '24h';
                             const totalCost = meta ? meta.cost : 15;

                             return (
                                <div key={`act-feat-${prodId}`} className="border border-pink-100 bg-pink-50/10 p-3 rounded-2xl flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom-2">
                                   <div className="flex items-center gap-2">
                                      <img src={originalProd?.images[0]} className="w-8 h-8 rounded-lg object-cover" />
                                      <div>
                                         <h5 className="text-xs font-bold text-gray-800 line-clamp-1">{originalProd?.name || 'My Product'}</h5>
                                         <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded font-mono font-bold uppercase">{planLabel} ({durationLabel})</span>
                                            <span className="text-[9px] text-gray-400 font-bold font-mono">152 views &bull; CTR 7.8%</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="text-right flex flex-col items-end gap-1">
                                      <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                                         ACTIVE: ~{meta?.planType === 'daily' ? '23h' : meta?.planType === 'weekly' ? '6.5d' : '29d'} left
                                      </span>
                                      <button 
                                        onClick={() => {
                                          setFeaturedProducts(p => p.filter(id => id !== prodId));
                                          setMerchantBalance(prev => prev + totalCost); // refund simulated balance
                                          
                                          setFeaturedCampaignsMeta(prev => {
                                            const updated = { ...prev };
                                            delete updated[prodId];
                                            return updated;
                                          });

                                          alert(`Campaign terminated early! Remaining fee (E ${totalCost.toFixed(2)}) returned to your seller wallet.`);
                                        }}
                                        className="text-[9px] font-bold text-red-600 hover:underline cursor-pointer"
                                      >
                                         Stop Ad & Refund
                                      </button>
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>
                 )}
              </div>

              {/* SECTION B: SPONSORED LISTINGS */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <div className="p-2 bg-orange-50 text-orange-600 rounded-2xl"><Award size={18} /></div>
                       <div>
                          <h4 className="font-black text-sm text-gray-800 font-display">Sponsored Listings</h4>
                          <span className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wide">E 25.00 / week</span>
                       </div>
                    </div>
                    <span className="text-[9px] bg-orange-100 text-orange-850 font-black px-2.5 py-0.5 rounded-full uppercase">Feed Highlighting</span>
                 </div>

                 <p className="text-[11px] text-gray-500 leading-relaxed">
                    Insert your product with a prominent "Sponsored" badge directly inside the Community Feed and search lookup pages. Builds local branding.
                 </p>

                 {/* Selector Form */}
                 <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100/80 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide">Select Product to Sponsor:</label>
                       <select 
                         value={selectedSponsoredProduct} 
                         onChange={(e) => setSelectedSponsoredProduct(e.target.value)}
                         className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-850 font-bold outline-none"
                       >
                          {products.map(p => (
                             <option key={`spon-opt-${p.id}`} value={p.id}>E {p.price} • {p.name}</option>
                          ))}
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                       <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide block">Placement:</label>
                          <select 
                            value={sponsoredPlacement} 
                            onChange={(e) => setSponsoredPlacement(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-850 font-bold outline-none"
                          >
                             <option value="all">Homepage + Feed</option>
                             <option value="feed">Community Feed Only</option>
                             <option value="search">Search Keywords Top</option>
                          </select>
                       </div>

                       <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-gray-600 font-extrabold uppercase tracking-wide block">Duration (weeks):</label>
                          <select 
                            value={sponsoredDuration} 
                            onChange={(e) => setSponsoredDuration(parseInt(e.target.value))}
                            className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-850 font-bold font-mono outline-none"
                          >
                             <option value="1">1 Week (E 25)</option>
                             <option value="2">2 Weeks (E 50)</option>
                             <option value="4">4 Weeks (E 100)</option>
                          </select>
                       </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-150 mt-1">
                       <span className="text-[10px] text-gray-500 font-bold uppercase font-sans">Campaign Period Estimate:</span>
                       <span className="font-mono text-xs font-black text-orange-600">E {(sponsoredDuration * 25).toFixed(2)}</span>
                    </div>

                    <button 
                      onClick={() => {
                        const calculatedCost = sponsoredDuration * 25;
                        if (merchantBalance < calculatedCost) {
                          alert("Insufficient balance! Please deposit digital funds in 'Premium & Tools'.");
                          return;
                        }
                        if (!selectedSponsoredProduct) {
                          alert("Please build a product listing first!");
                          return;
                        }
                        if (sponsoredListings.includes(selectedSponsoredProduct)) {
                          alert("This product is already a sponsored listing!");
                          return;
                        }
                        setMerchantBalance(prev => prev - calculatedCost);
                        setSponsoredListings(prev => [...prev, selectedSponsoredProduct]);
                        alert(`Successfully sponsored ${products.find(p => p.id === selectedSponsoredProduct)?.name || 'Listing'}! It is now active on the community marketplace.`);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2.5 rounded-xl transition-all active:scale-95 shadow-sm uppercase font-sans"
                    >
                       Sponsor Listing Now
                    </button>
                 </div>

                 {/* ACTIVE SPONSORED LISTINGS */}
                 {sponsoredListings.length > 0 && (
                    <div className="mt-1 border-t border-gray-100 pt-3 flex flex-col gap-2">
                       <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Live Sponsored Items ({sponsoredListings.length})</span>
                       <div className="flex flex-col gap-2">
                          {sponsoredListings.map(prodId => {
                             const originalProd = PRODUCTS.find(p => p.id === prodId);
                             return (
                                <div key={`act-spon-${prodId}`} className="border border-orange-100 bg-orange-50/10 p-3 rounded-2xl flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom-2">
                                   <div className="flex items-center gap-2">
                                      <img src={originalProd?.images[0]} className="w-8 h-8 rounded-lg object-cover" />
                                      <div>
                                         <h5 className="text-xs font-bold text-gray-800 line-clamp-1">{originalProd?.name || 'My Product'}</h5>
                                         <p className="text-[9px] text-gray-450 font-bold font-mono">Placed: {sponsoredPlacement} • E 25.00/wk</p>
                                      </div>
                                   </div>
                                   <div className="text-right flex flex-col items-end gap-1">
                                      <span className="text-[9.5px] bg-orange-100 text-orange-850 px-2 py-0.5 rounded font-black font-mono">SPONSORED LIVE</span>
                                      <button 
                                        onClick={() => {
                                          setSponsoredListings(p => p.filter(id => id !== prodId));
                                          setMerchantBalance(prev => prev + 25);
                                          alert("Sponsorship deactivated. E25.00 refunded successfully.");
                                        }}
                                        className="text-[9px] font-bold text-red-600 hover:underline"
                                      >
                                         Settle & Terminate
                                      </button>
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>
                 )}
              </div>

              {/* SECTION C: BOOSTED STORES */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                       <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl"><Store size={18} /></div>
                       <div>
                          <h4 className="font-black text-sm text-gray-800 font-display">Boosted Store Profile</h4>
                          <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide">E 40.00 / week</span>
                       </div>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${isStoreBoosted ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                       {isStoreBoosted ? "Active Booster" : "Inactive"}
                    </span>
                 </div>

                 <p className="text-[11px] text-gray-500 leading-relaxed">
                    Draw high traffic to your entire stall list! Boosted stores appear first inside the homepage "Trending Traders" list with elegant golden outlines and an active weekly visibility indicator.
                 </p>

                 <div className="bg-slate-50 p-3 rounded-2xl border border-gray-150 flex items-center justify-between">
                    <div>
                       <span className="text-[8.5px] text-gray-400 font-extrabold uppercase tracking-wider block">Estimated Lift</span>
                       <span className="text-xs font-black text-slate-800">+ 18% customer inquiries</span>
                    </div>
                    <div>
                       {isStoreBoosted ? (
                          <div className="text-right">
                             <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold inline-block mr-1">✓ Active Now</span>
                          </div>
                       ) : (
                          <span className="text-[11px] text-gray-400 font-bold font-mono">Weekly Auto-billing</span>
                       )}
                    </div>
                 </div>

                 <div>
                    {isStoreBoosted ? (
                       <button 
                         onClick={() => {
                           setIsStoreBoosted(false);
                           alert("Stall Boost turned off! Your store will revert to standard listing placement tomorrow.");
                         }}
                         className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black text-xs py-3 rounded-xl transition-all font-sans uppercase"
                       >
                          Deactivate Boosted Store Profile
                       </button>
                    ) : (
                       <button 
                         onClick={() => {
                           if (merchantBalance < 40) {
                             alert("Insufficient balance! Please top up your seller wallet first.");
                             return;
                           }
                           setMerchantBalance(prev => prev - 40);
                           setIsStoreBoosted(true);
                           alert("Your Trader Profile 's1' has been given a booster rocket! Golden highlights are now activated on your homepage shop item.");
                         }}
                         className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-600/10 uppercase"
                       >
                          Boost Entire Store (E 40/week)
                       </button>
                    )}
                 </div>
              </div>

              {/* SECTION D: BANNER ADVERTISEMENTS DESIGN STUDIO */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                       <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl"><ImageIcon size={18} /></div>
                       <div>
                          <h4 className="font-black text-sm text-gray-800 font-display">Banner Ad Design Studio</h4>
                          <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wide">E 100.00 / week</span>
                       </div>
                    </div>
                    <span className="text-[9px] bg-purple-100 text-purple-800 font-black px-2.5 py-0.5 rounded-full uppercase">Hero Spot</span>
                 </div>

                 <p className="text-[11px] text-gray-500 leading-relaxed">
                    Build and publish your own custom horizontal advertisement card right onto the top user dashboards. Choose preset backdrops, write custom slogans, and preview below in real-time.
                 </p>

                 {/* Studio Form Controls */}
                 <div className="bg-gray-50 p-4 rounded-2.5xl border border-gray-150 flex flex-col gap-3">
                    <span className="text-[9px] text-[#128C7E] font-black uppercase tracking-wider block">Ad Copy Parameters</span>

                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-gray-600 font-bold">Stall / Brand Title Call:</label>
                       <input 
                         type="text" 
                         value={bannerTitle} 
                         onChange={(e) => setBannerTitle(e.target.value)}
                         className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 font-bold outline-none"
                         placeholder="e.g. Sipho's Fresh Herbs"
                       />
                    </div>

                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-gray-600 font-bold">In-Ad Message Headline:</label>
                       <input 
                         type="text" 
                         value={bannerHeading} 
                         onChange={(e) => setBannerHeading(e.target.value)}
                         className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 font-semibold outline-none"
                         placeholder="e.g. 20% Off organic parsley"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-gray-600 font-bold">Promo Coupon:</label>
                          <input 
                            type="text" 
                            value={bannerCoupon} 
                            onChange={(e) => setBannerCoupon(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold text-gray-800 outline-none uppercase"
                            placeholder="e.g. SWAZI10"
                          />
                       </div>

                       <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-gray-600 font-bold">Visual Themes:</label>
                          <select 
                            value={bannerTheme} 
                            onChange={(e) => setBannerTheme(e.target.value as any)}
                            className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 font-bold outline-none"
                          >
                             <option value="emerald">Emerald Forest (Agri)</option>
                             <option value="sunset">Sunset Orange (Specials)</option>
                             <option value="indigo">Indigo Midnight (Modern)</option>
                             <option value="midnight">Deep Charcoal (Premium)</option>
                          </select>
                       </div>
                    </div>

                    {/* Image Preset Picker */}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] text-gray-600 font-bold">Pick Advertisement Graphic Presets:</label>
                       <div className="grid grid-cols-4 gap-2">
                          {[
                             { name: "Fresh Harvest", url: "https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=600" },
                             { name: "Vegetables Basket", url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600" },
                             { name: "Farm Roots", url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600" },
                             { name: "Spinach & Cabbages", url: "https://images.unsplash.com/photo-1563458017366-fa3d62351221?auto=format&fit=crop&q=80&w=600" }
                          ].map((item, idx) => (
                             <button
                               key={`img-pre-${idx}`}
                               type="button"
                               onClick={() => setBannerImgPreset(item.url)}
                               className={`h-11 rounded-lg overflow-hidden border-2 relative transition-all ${bannerImgPreset === item.url ? 'border-purple-600 scale-95' : 'border-transparent'}`}
                               title={item.name}
                             >
                                <img src={item.url} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white text-center py-0.5 leading-none font-bold truncate">{item.name}</span>
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Real-Time Live Preview Mockup Card */}
                    <div className="my-2 border-t border-dashed border-gray-300 pt-3 flex flex-col gap-1.5">
                       <span className="text-[9.5px] font-mono text-gray-400 font-black uppercase tracking-wider block">Real-time live client preview:</span>
                       
                       <div className={`p-4 rounded-3xl text-white shadow-md relative overflow-hidden flex items-center justify-between border select-none transition-all duration-300 ${
                          bannerTheme === 'emerald' ? 'bg-gradient-to-r from-green-600 to-emerald-700 border-green-500' :
                          bannerTheme === 'sunset' ? 'bg-gradient-to-r from-orange-400 to-rose-500 border-orange-300' :
                          bannerTheme === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400' :
                          'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700'
                       }`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                          
                          <div className="flex-1 pr-2">
                             <div className="flex items-center gap-1">
                                <span className="text-[7.5px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Promoted Advertiser</span>
                                {bannerCoupon && (
                                   <span className="text-[7.5px] bg-amber-500 text-slate-900 font-black px-1.5 py-0.5 rounded tracking-wide">CODE: {bannerCoupon}</span>
                                )}
                             </div>
                             <h4 className="font-display font-black text-xs text-white mt-1.5">{bannerTitle || "Sipho's Produce Stall"}</h4>
                             <p className="text-[10px] text-white/90 mt-0.5 leading-tight font-medium line-clamp-2">{bannerHeading || 'Fresh cabbage & herbs special!'}</p>
                             <span className="text-[8px] text-white/70 block mt-1">Stall location: Mbabane stalls ({products.length} items online)</span>
                          </div>

                          <div className="shrink-0">
                             <img src={bannerImgPreset} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow" />
                          </div>
                       </div>
                    </div>

                    {/* Pay and Submit */}
                    <button 
                      onClick={async () => {
                        if (merchantBalance < 100) {
                          alert("Insufficient digital money! Please add balance first.");
                          return;
                        }
                        setMerchantBalance(prev => prev - 100);
                        const newBanner = {
                          title: bannerTitle,
                          heading: bannerHeading,
                          coupon: bannerCoupon,
                          theme: bannerTheme,
                          imageUrl: bannerImgPreset,
                          sellerId: 's1'
                        };
                        try {
                           await addDoc(collection(db, 'banners'), newBanner);
                           alert("E100.00 Paid! Your Custom Homepage Banner has been compiled and is now broadcasting live on client feeds!");
                        } catch (e) {
                          console.error(e);
                          alert("Failed to publish banner.");
                        }
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2.5 rounded-xl transition-all active:scale-95 shadow-sm uppercase font-sans tracking-wide"
                    >
                       Pay E100 & Broadcast Banner Ad Live
                    </button>
                 </div>

                 {/* ACTIVE BANNER CAMPAIGNS */}
                 {customBannerAds.length > 0 && (
                    <div className="mt-2 border-t border-gray-100 pt-3 flex flex-col gap-2">
                       <span className="text-[9.5px] text-gray-400 font-extrabold uppercase tracking-wider block">Live Published Banners ({customBannerAds.length})</span>
                       <div className="flex flex-col gap-2.5">
                          {customBannerAds.map(banner => (
                             <div key={banner.id} className="border border-purple-100 bg-purple-50/5 p-3 rounded-2.5xl flex justify-between gap-3 animate-in fade-in duration-200">
                                <div className="flex gap-2 items-center flex-1">
                                   <img src={banner.imageUrl} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                   <div>
                                      <h5 className="text-xs font-extrabold text-gray-800 line-clamp-1">{banner.title}</h5>
                                      <p className="text-[9px] text-gray-500 leading-none mt-0.5">Coupon: <span className="font-mono text-purple-600 font-bold">{banner.coupon}</span> • Theme: {banner.theme}</p>
                                      <p className="text-[9px] text-emerald-600 font-bold mt-1">📊 118 Impressions • 8 Claims (6.7% conv)</p>
                                   </div>
                                </div>
                                <div className="text-right shrink-0 flex flex-col justify-between items-end">
                                   <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black font-sans uppercase">Live Feed Spotlight</span>
                                   <button 
                                     onClick={() => {
                                       setCustomBannerAds(prev => prev.filter(b => b.id !== banner.id));
                                       setMerchantBalance(prev => prev + 100);
                                       alert("Banner advertisement dissolved. E100.00 refunded safely.");
                                     }}
                                     className="text-[9px] font-bold text-red-600 hover:underline mt-1"
                                   >
                                      Stop Banner AD
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

              </div>

            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-4">
             <div className="bg-slate-800 text-white p-5 rounded-3xl shadow-md flex items-start gap-4 mb-2">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                 <ShieldAlert size={24} className="text-white" />
               </div>
               <div>
                  <h3 className="font-display font-bold text-lg mb-1">Trust & Safety</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">Verify your identity to build trust with buyers and unlock premium features. All communications are encrypted.</p>
               </div>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 shrink-0"><Phone size={16} className="fill-gray-100 text-gray-500" /></div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-gray-800">Basic Verification</h4>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">Free</span>
                     </div>
                     <p className="text-[11px] text-gray-500 mt-1 mb-2">Phone verified via SMS OTP for secure logins.</p>
                     <div className="mt-2 text-xs font-bold text-green-700 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-green-600" /> Account Verified
                     </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gray-100 my-1"></div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 shrink-0"><Fingerprint size={16} className="text-blue-500" /></div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-gray-800">Verified Seller</h4>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">E 100</span>
                     </div>
                     <p className="text-[11px] text-gray-500 mt-1 mb-2">One-time fee. Identity verified (National ID) to prevent fraud. Unlocks trust badge.</p>
                     <div className="flex justify-between items-center mt-2">
                       <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Unverified</span>
                       <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform" onClick={() => alert('Proceeding to Verification Payment (E100)...')}>Verify ID & Pay</button>
                     </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gray-100 my-1"></div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-500 shrink-0"><ShieldCheck size={16} className="fill-amber-100 text-amber-500" /></div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-gray-800">Premium Verification</h4>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">E 350</span>
                     </div>
                     <p className="text-[11px] text-gray-500 mt-1 mb-2">One-time fee. Full Business verified. Unlocks top search ranking and increased buyer confidence.</p>
                     <div className="flex justify-between items-center mt-2">
                       <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Unverified</span>
                       <button className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform" onClick={() => alert('Proceeding to Premium Verification Payment (E350)...')}>Submit Documents</button>
                     </div>
                  </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Lock size={16} className="fill-indigo-100" /></div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Encrypted Chat</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">All messages and negotiations are secure.</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><DollarSign size={16} className="fill-green-100" /></div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Secure Payments</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Momo / eMali escrow protection active.</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 col-span-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><ShieldAlert size={16} className="fill-rose-100" /></div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Active Fraud Detection</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">AI monitoring system active. 0 suspicious activities detected.</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'whatsapp_setup' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
             {/* Header card with green color scheme */}
             <div className="bg-[#128C7E] text-white p-5 rounded-3xl shadow-sm flex items-start gap-4 mb-1">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                 <MessageSquare size={24} className="text-white fill-white/10" />
               </div>
               <div>
                 <h3 className="font-display font-bold text-lg mb-0.5 flex items-center gap-1.5">
                    WhatsApp Gateway Setup
                 </h3>
                 <p className="text-[11px] text-teal-100 leading-relaxed font-normal">
                    Link your trader mobile number to receive instant order dispatches, secure escrow confirmations, and one-click customer chats.
                 </p>
               </div>
             </div>

             {/* 1. Configuration Panel */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide">Connected Phone Number</h4>
                  <span className="bg-emerald-100 text-[#128C7E] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Live & Verified
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                  When buyers tap "Contact Seller" or launch direct transactions, your messages will pre-generate and route directly to this WhatsApp destination.
                </p>

                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#128C7E]">📲 WP:</span>
                    <input 
                      type="text" 
                      value={whatsappPhone}
                      disabled={isSavedWhatsapp}
                      onChange={(e) => {
                        setWhatsappPhone(e.target.value);
                        setIsSavedWhatsapp(false);
                      }}
                      className={`w-full bg-slate-50 border ${isSavedWhatsapp ? 'border-gray-200 text-gray-500' : 'border-green-400 text-gray-800 focus:ring-1 focus:ring-green-400'} rounded-xl py-3 pl-14 pr-4 text-xs font-bold font-mono outline-none`} 
                      placeholder="+268 7612 3456"
                    />
                  </div>
                  {isSavedWhatsapp ? (
                     <button 
                       onClick={() => setIsSavedWhatsapp(false)}
                       className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                     >
                       Change
                     </button>
                  ) : (
                     <button 
                       onClick={() => {
                         setIsSavingWhatsapp(true);
                         setTimeout(() => {
                           setIsSavingWhatsapp(false);
                           setIsSavedWhatsapp(true);
                         }, 800);
                       }}
                       disabled={isSavingWhatsapp}
                       className="bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm font-mono"
                     >
                       {isSavingWhatsapp ? 'Saving...' : 'Verify'}
                     </button>
                  )}
                </div>
             </div>

             {/* 2. Toggle Business Capabilities */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/50">
                <h4 className="font-bold text-sm text-gray-800 mb-1 uppercase tracking-wide">Enabled Inquiry Automations</h4>
                <p className="text-[11px] text-gray-500 mb-4">Choose which interactive fast-action buttons will load on your product listings:</p>
                
                <div className="flex flex-col gap-3">
                   <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-green-50/10 transition-colors">
                     <div>
                       <span className="block text-xs font-black text-gray-800">1. Chat Seller (Default)</span>
                       <span className="block text-[10px] text-gray-500 font-medium">Allows buyers with general questions to open instant WhatsApp streams</span>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={waFeatures.oneClickChat}
                       onChange={(e) => setWaFeatures(prev => ({ ...prev, oneClickChat: e.target.checked }))}
                       className="accent-green-600 h-4 w-4 shrink-0 rounded"
                     />
                   </label>

                   <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-green-50/10 transition-colors">
                     <div>
                       <span className="block text-xs font-black text-gray-800">2. Ask About Product</span>
                       <span className="block text-[10px] text-gray-500 font-medium">Auto-formats specific batch harvest details and queries</span>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={waFeatures.priceNegotiation}
                       onChange={(e) => setWaFeatures(prev => ({ ...prev, priceNegotiation: e.target.checked }))}
                       className="accent-green-600 h-4 w-4 shrink-0 rounded"
                     />
                   </label>

                   <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-green-50/10 transition-colors">
                     <div>
                       <span className="block text-xs font-black text-gray-800">3. Negotiate Price</span>
                       <span className="block text-[10px] text-gray-500 font-medium font-normal">Gives the customer custom E-Sotho bulk discount rate options offline</span>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={waFeatures.deliveryRequests}
                       onChange={(e) => setWaFeatures(prev => ({ ...prev, deliveryRequests: e.target.checked }))}
                       className="accent-green-600 h-4 w-4 shrink-0 rounded"
                     />
                   </label>

                   <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-green-50/10 transition-colors">
                     <div>
                       <span className="block text-xs font-black text-gray-800 font-bold">4. Request Delivery</span>
                       <span className="block text-[10px] text-gray-500 font-medium">Pre-formats area location and matches Moto Passenger couriers</span>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={waFeatures.automatedDeliveryAlerts}
                       onChange={(e) => setWaFeatures(prev => ({ ...prev, automatedDeliveryAlerts: e.target.checked }))}
                       className="accent-green-600 h-4 w-4 shrink-0 rounded"
                     />
                   </label>

                   <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-green-50/10 transition-colors">
                     <div>
                       <span className="block text-xs font-black text-gray-800 font-bold">5. Request More Photos</span>
                       <span className="block text-[10px] text-gray-500 font-medium">Prompts standard photo/video evidence streams on your live cell</span>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={waFeatures.photoRequests}
                       onChange={(e) => setWaFeatures(prev => ({ ...prev, photoRequests: e.target.checked }))}
                       className="accent-green-600 h-4 w-4 shrink-0 rounded"
                     />
                   </label>
                </div>
             </div>

             {/* 3. TRANSACTIONAL ALERTS BROADCAST CONTROL */}
             <div className="bg-slate-910 text-white p-5 rounded-2xl shadow-md border border-slate-800 bg-slate-950">
                <h4 className="font-bold text-sm text-yellow-500 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                  📢 WhatsApp Update Center & Alert Dispatcher
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 mb-4 font-medium leading-relaxed">
                  Provide instantaneous transaction, courier matching, and order progress alerts to buyers via automated WhatsApp notifications:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button 
                    onClick={() => handleSimulateNotification('order')}
                    className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-emerald-500/30"
                  >
                    <span>📦</span> Dispatch Order Alert
                  </button>
                  <button 
                    onClick={() => handleSimulateNotification('delivery')}
                    className="bg-orange-600/80 hover:bg-orange-600 text-white text-[11px] font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-orange-500/30"
                  >
                    <span>🏍️</span> Dispatch Delivery Match
                  </button>
                  <button 
                    onClick={() => handleSimulateNotification('payment')}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-blue-500/30"
                  >
                    <span>💵</span> Confirm Payment Receipt
                  </button>
                </div>

                {/* Custom text alert sender */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-[10px] text-slate-400 font-sans font-bold tracking-wider mb-2 uppercase">CUSTOM WHATSAPP BROADCAST MESSAGE</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={notificationMsg}
                      onChange={(e) => setNotificationMsg(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs font-medium text-white px-3 py-2.5 rounded-xl outline-none focus:border-green-500 font-sans"
                      placeholder="Write custom broadcast message for clients..."
                    />
                    <button 
                      onClick={() => handleSimulateNotification('custom')}
                      className="bg-[#25D366] hover:bg-green-600 text-white text-xs font-bold px-4 rounded-xl font-mono tracking-wider"
                    >
                      SEND
                    </button>
                  </div>
                </div>
             </div>

             {/* 4. REAL-TIME EVENT LOG CONTAINER */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/50">
                <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  📱 Outgoing WhatsApp Notification Log ({simulatedNotifications.length})
                </h4>

                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto no-scrollbar">
                   {simulatedNotifications.map((notify) => (
                     <div key={notify.id} className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-50 text-base flex items-center justify-center shrink-0 border border-green-100">
                          {notify.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-0.5">
                              <p className="text-xs font-black text-gray-800">{notify.type}</p>
                              <span className="text-[9px] font-mono font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                {notify.sentStatus}
                              </span>
                           </div>
                           <p className="text-[11px] text-gray-600 mt-1 leading-normal font-mono">{notify.message}</p>
                           <p className="text-[9px] text-gray-400 mt-1">{notify.time} · WhatsApp Secure Gateway API</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex items-end justify-center pointer-events-none p-4 pb-0 w-full h-full max-w-md mx-auto">
           <div className="bg-black/40 fixed inset-0 z-40 pointer-events-auto backdrop-blur-sm" onClick={() => setShowAddProduct(false)}></div>
           <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom h-[85vh] overflow-y-auto pb-32 relative z-50">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 -mt-2">
                 <h3 className="font-bold text-gray-800 text-lg">Add Product</h3>
                 <button onClick={() => setShowAddProduct(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                   <X size={16} />
                 </button>
              </div>

              <div className="flex flex-col gap-5">
                 <div className="bg-gradient-to-br from-indigo-50/75 to-purple-50/75 border border-indigo-150 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-indigo-900">
                       <Sparkles size={18} className="text-indigo-600 animate-pulse" />
                       <span className="font-bold text-xs uppercase tracking-wider font-mono">AI Listing Generator</span>
                    </div>
                    <p className="text-[10.5px] text-indigo-700 leading-tight font-medium">
                       Tell the AI what you are selling (e.g. "large sweet green cabbages from Mbabane farm"). We'll compose the title, description, and give local price recommendations!
                    </p>
                    <div className="flex gap-2">
                       <input 
                          type="text" 
                          value={productAiPrompt}
                          onChange={(e) => setProductAiPrompt(e.target.value)}
                          disabled={generatingAi}
                          placeholder="Describe item briefly..."
                          className="flex-1 border border-indigo-200 bg-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 text-gray-850 disabled:opacity-50 font-medium"
                       />
                       <button 
                          onClick={handleAiGenerate}
                          disabled={generatingAi}
                          className="bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-black px-4 rounded-xl active:scale-95 transition-transform shrink-0 disabled:opacity-50 flex items-center justify-center min-w-24 font-mono"
                       >
                          {generatingAi ? (
                            <Sparkles size={14} className="animate-spin text-white" />
                          ) : (
                            "Generate"
                          )}
                       </button>
                    </div>
                    {pricingAdvice && (
                      <div className="bg-white/95 border border-indigo-120 rounded-xl p-3 shadow-inner">
                        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wide block mb-1 font-mono">💡 Coach Price Analysis:</span>
                        <p className="text-[10.5px] text-indigo-950 leading-relaxed font-semibold">{pricingAdvice}</p>
                      </div>
                    )}
                 </div>

                 <div className="flex gap-2">
                    <div className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                       <ImageIcon size={24} className="mb-1" />
                       <span className="text-[10px] font-bold">Add Photo</span>
                    </div>
                    <div className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                       <ImageIcon size={24} className="mb-1" />
                       <span className="text-[10px] font-bold">Add Photo</span>
                    </div>
                    <div className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                       <ImageIcon size={24} className="mb-1" />
                       <span className="text-[10px] font-bold">Add Photo</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block ml-1">Product Title</label>
                    <input type="text" value={productTitle} onChange={e => setProductTitle(e.target.value)} placeholder="e.g. Fresh Mangoes" className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium" />
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block ml-1">Description</label>
                    <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} placeholder="Describe your product..." rows={3} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none resize-none transition-all font-medium leading-relaxed"></textarea>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="text-xs font-bold text-gray-600 mb-2 block ml-1 font-sans">Category</label>
                       <select 
                         value={newProductCategory} 
                         onChange={e => {
                           const catId = e.target.value;
                           setNewProductCategory(catId);
                           const categoryObj = CATEGORIES.find(c => c.id === catId);
                           if (categoryObj && categoryObj.subcategories.length > 0) {
                             setNewProductSubcategory(categoryObj.subcategories[0]);
                           }
                         }}
                         className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:border-green-500 focus:bg-white outlook-none font-medium appearance-none"
                       >
                         {CATEGORIES.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-600 mb-2 block ml-1 font-sans">Subcategory</label>
                       <select 
                         value={newProductSubcategory} 
                         onChange={e => setNewProductSubcategory(e.target.value)}
                         className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:border-green-500 focus:bg-white outlook-none font-medium appearance-none"
                       >
                         {(CATEGORIES.find(c => c.id === newProductCategory)?.subcategories || []).map(sub => (
                           <option key={sub} value={sub}>{sub}</option>
                         ))}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block ml-1">Price (E)</label>
                        <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="0.00" className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 block ml-1">Unit</label>
                        <select 
                           value={productUnit}
                           onChange={e => setProductUnit(e.target.value)}
                           className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium appearance-none"
                        >
                           <option value="per kg">per kg</option>
                           <option value="per piece">per piece</option>
                           <option value="per bundle">per bundle</option>
                           <option value="per liter">per liter</option>
                        </select>
                    </div>
                 </div>
              </div>

              <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto z-20 pb-safe pb-8">
                 <button onClick={handleSaveProduct} className="w-full bg-green-600 text-white font-bold py-4 rounded-full text-sm shadow-lg shadow-green-600/30 active:scale-[0.98] transition-transform">Save Product</button>
              </div>
           </div>
        </div>
      )}

      {/* Delivery Options Modal */}
      {showDeliveryOptions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 w-full h-full max-w-md mx-auto">
           <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-800 text-lg">Delivery Preference</h3>
                 <button onClick={() => setShowDeliveryOptions(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                   <X size={16} />
                 </button>
              </div>

              <div className="flex flex-col gap-3">
                 <button onClick={() => { setAcceptedOrder(true); setShowDeliveryOptions(false); }} className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3 shrink-0 group-hover:bg-green-100 group-hover:text-green-600">
                       <UserCheck size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-800">I will deliver it myself</p>
                       <p className="text-[10px] text-gray-500 mt-1">You handle the delivery directly to the customer.</p>
                    </div>
                 </button>

                 <button onClick={() => { setAcceptedOrder(true); setShowDeliveryOptions(false); }} className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mr-3 shrink-0 group-hover:bg-green-100 group-hover:text-green-600">
                       <Truck size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-800">Use external Courier</p>
                       <p className="text-[10px] text-gray-500 mt-1">E.g. FedEx, local taxi, or bus service.</p>
                    </div>
                 </button>

                 <button onClick={() => { setAcceptedOrder(true); setShowDeliveryOptions(false); }} className="flex items-center p-4 rounded-xl border border-green-500 bg-green-50 shadow-sm text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">Recommended</div>
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center mr-3 shrink-0 shadow-sm">
                       <Navigation size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-green-800">MaketiConnect Driver</p>
                       <p className="text-[10px] text-green-700 mt-1">Match with a verified platform driver automatically. (E 15 est.)</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
