import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Search, 
  Tag, 
  Plus, 
  Star, 
  Compass, 
  SlidersHorizontal, 
  Zap, 
  Check, 
  ShoppingBag, 
  Bell,
  ArrowLeft,
  X,
  FileText,
  ThumbsUp,
  Award
} from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Seller } from '../types';
import { useFirebase } from '../components/FirebaseProvider';

export default function Feed() {
  const navigate = useNavigate();
  const { sellers: SELLERS_LIST, products: PRODUCTS } = useFirebase();
  const SELLERS = SELLERS_LIST.reduce((acc, s) => ({...acc, [s.id]: s}), {} as Record<string, any>);
  
  // States
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'promos' | 'trending' | 'nearby'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(3); // km slider
  const [showFilters, setShowFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local Storage Likes Engine
  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_liked_products');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Local Storage Followers
  const [followedSellers, setFollowedSellers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_followed_sellers');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Local Storage Claimed Promos
  const [claimedPromos, setClaimedPromos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_claimed_promos');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Local Storage Custom Feed Reviews/Comments
  const [feedComments, setFeedComments] = useState<Record<string, {author: string, text: string, time: string}[]>>(() => {
    try {
      const saved = localStorage.getItem('emakethe_feed_comments');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Store new comment content
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Toast Function
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('emakethe_liked_products', JSON.stringify(likedProducts));
  }, [likedProducts]);

  useEffect(() => {
    localStorage.setItem('emakethe_followed_sellers', JSON.stringify(followedSellers));
  }, [followedSellers]);

  useEffect(() => {
    localStorage.setItem('emakethe_claimed_promos', JSON.stringify(claimedPromos));
  }, [claimedPromos]);

  useEffect(() => {
    localStorage.setItem('emakethe_feed_comments', JSON.stringify(feedComments));
  }, [feedComments]);

  // Actions
  const handleLikeProduct = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (likedProducts.includes(id)) {
      setLikedProducts(prev => prev.filter(pId => pId !== id));
      triggerToast('Removed from liked feed items 💔');
    } else {
      setLikedProducts(prev => [...prev, id]);
      triggerToast('Liked this product in the community feed! ❤️');
    }
  };

  const handleFollowSeller = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (followedSellers.includes(id)) {
      setFollowedSellers(prev => prev.filter(sId => sId !== id));
      triggerToast(`Unfollowed ${SELLERS[id]?.name || 'trader'}`);
    } else {
      setFollowedSellers(prev => [...prev, id]);
      triggerToast(`Now following ${SELLERS[id]?.name || 'trader'}! 🎉`);
    }
  };

  const handleClaimPromo = (prodId: string, promoCode: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (claimedPromos.includes(prodId)) {
      triggerToast('You already claimed this promo code! 🎟️');
    } else {
      setClaimedPromos(prev => [...prev, prodId]);
      triggerToast(`Promo code "${promoCode}" copied & claimed successfully! 🎁`);
    }
  };

  const handleAddComment = (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !newCommentText.trim()) {
      triggerToast('Please provide your name and message! ✍️');
      return;
    }
    const newComm = {
      author: authorName,
      text: newCommentText,
      time: 'Just now'
    };
    const currentList = feedComments[productId] || [];
    const updated = {
      ...feedComments,
      [productId]: [newComm, ...currentList]
    };
    setFeedComments(updated);
    setNewCommentText('');
    setActiveCommentId(null);
    triggerToast('Comment posted onto marketplace feed listing! 💬');
  };

  const handleShare = (product: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    const shareText = `Check out "${product.name}" (E ${product.price}) from ${SELLERS[product.sellerId]?.name} on eMakethe, Eswatini!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      triggerToast('Marketplace listing link copied to clipboard! 🔗');
    } else {
      triggerToast('Sharing: ' + shareText);
    }
  };

  // Parsing distance helper
  const getDistanceNumber = (distStr: string): number => {
    return parseFloat(distStr.replace(/[^\d.]/g, '')) || 1.0;
  };

  // Filter and sort products
  const getFilteredProducts = (): Product[] => {
    let list = [...PRODUCTS];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Category
    if (selectedCategory) {
      list = list.filter(p => p.categoryId === selectedCategory);
    }

    // Tab Filtering
    if (activeTab === 'new') {
      // Simulate ages by custom sorting sequence
      // Note: we can preserve list directly or order them. Cabbages and Tomatoes get placed first or are marked premium.
      // Let's reverse list to display latest first
      list.reverse();
    } else if (activeTab === 'promos') {
      // Products with low prices or index divisible by 2 or 3 are treated as Promos
      list = list.filter((p, idx) => idx % 2 === 0 || p.price < 50);
    } else if (activeTab === 'nearby') {
      list = list.filter(p => getDistanceNumber(p.distance) <= maxDistance);
      list.sort((a,b) => getDistanceNumber(a.distance) - getDistanceNumber(b.distance));
    }

    return list;
  };

  const filteredProducts = getFilteredProducts();

  // Get active promotion tag for product indices
  const getPromoDetails = (product: Product, index: number) => {
    const promoTypes = [
      { tag: 'MTN MoMo Exclusive', pct: '15% Off', code: 'MOMO15', desc: 'Pay via MTN MoMo for discount' },
      { tag: 'Swazi Farmer Special', pct: '20% Off', code: 'SWAZI20', desc: 'Direct harvest campaign coupon' },
      { tag: 'Ezulwini Weekend Special', pct: 'Buy 1 Get 1 Same Price', code: 'EZUBOGO', desc: 'Buy one and request extra during chat' },
      { tag: 'Manzini Street Fair Deal', pct: '10% Off', code: 'FAIR10', desc: 'Settle on pickup at Manzini plaza Kiosk 12' }
    ];
    // deterministically pick one
    return promoTypes[index % promoTypes.length];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24 w-full" id="marketplace-feed-view">
      
      {/* 1. HEADER APP BAR */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 pt-4 pb-5 rounded-b-[2rem] shadow-md sticky top-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Link to="/" className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Back home">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-base font-black font-display tracking-tight flex items-center gap-1.5">
                <Compass className="animate-spin duration-300 w-5 h-5" /> eMakethe Feed
              </h1>
              <p className="text-[10px] text-green-100 font-bold uppercase tracking-wide">Swazi Community Marketplace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/map')}
              className="bg-white/15 hover:bg-white/25 p-2 rounded-full cursor-pointer transition-colors relative"
              title="Filter by Distance Map"
            >
              <MapPin size={18} />
            </button>
            <button 
              onClick={() => triggerToast("Feed notices are perfectly synchronized! 🔔")}
              className="bg-white/15 hover:bg-white/25 p-2 rounded-full cursor-pointer transition-colors relative"
              title="Feed Alerts"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Search Bar inside Feed */}
        <div className="flex gap-2">
          <div className="bg-white text-gray-800 rounded-full flex-1 flex items-center px-4 py-2 border border-gray-100 shadow-inner">
            <Search size={16} className="text-gray-400 shrink-0 mr-1.5" />
            <input 
              type="text" 
              placeholder="Search feed listings, traders, deals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none bg-transparent text-xs text-gray-800 w-full placeholder:text-gray-400 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-full border transition-all active:scale-95 ${showFilters ? 'bg-white text-green-700 border-white' : 'bg-white/10 text-white border-white/20'}`}
            title="Toggle Filter Panel"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Distance Range Filter Popout */}
        {showFilters && (
          <div className="mt-3 bg-white text-gray-800 p-3.5 rounded-2xl border border-gray-100 shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-700 uppercase tracking-wider font-mono">Distance Radius</span>
              <span className="bg-green-100 text-green-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Within {maxDistance} km
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full accent-green-600 bg-gray-200 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
              <span>0.5 km (Close Stall)</span>
              <span>2.5 km (Midpoint)</span>
              <span>5.0 km (Full Circle)</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUB-TABS (CORE FEED MODES) */}
      <div className="bg-white border-b border-gray-100 sticky top-[132px] z-10 w-full py-2.5 px-4 overflow-x-auto no-scrollbar flex gap-2">
        <button 
          onClick={() => { setActiveTab('all'); setSelectedCategory(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
          }`}
        >
          <Compass size={14} /> Swazi Feed
        </button>

        <button 
          onClick={() => { setActiveTab('new'); setSelectedCategory(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'new' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
          }`}
        >
          <Sparkles size={14} className="text-teal-400" /> New Products
        </button>

        <button 
          onClick={() => { setActiveTab('promos'); setSelectedCategory(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'promos' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
          }`}
        >
          <Tag size={14} /> Promotions
        </button>

        <button 
          onClick={() => { setActiveTab('trending'); setSelectedCategory(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'trending' ? 'bg-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
          }`}
        >
          <TrendingUp size={14} /> Trending Traders
        </button>

        <button 
          onClick={() => { setActiveTab('nearby'); setSelectedCategory(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'nearby' ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
          }`}
        >
          <MapPin size={14} /> Nearby Deals
        </button>
      </div>

      {/* 3. DYNAMIC BANNER INFORMATION BASED ON THE FEED TAB */}
      <div className="p-4 w-full">
        {activeTab === 'new' && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 p-4 rounded-2xl flex items-center gap-3.5 mb-1 shadow-sm">
            <span className="text-2xl shrink-0">🆕</span>
            <div>
              <h4 className="font-black text-xs text-indigo-900 font-display">Freshly Listed Commodities</h4>
              <p className="text-[10px] text-indigo-700 font-medium leading-relaxed mt-0.5">
                Browse latest additions uploaded by local Swazi growers during the past 24 hours. Connect immediately via WhatsApp!
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'promos' && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/50 p-4 rounded-2xl flex items-center gap-3.5 mb-1 shadow-sm animate-pulse-slow">
            <span className="text-2xl shrink-0">🎟️</span>
            <div>
              <h4 className="font-black text-xs text-amber-900 font-display">Claim Marketplace Promo Coupons</h4>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed mt-0.5">
                Click "Claim & Copy Code" on the promo tags below to lock in discount pricing during MoMo payment or local pickup.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200/50 p-4 rounded-2xl flex items-center gap-3.5 mb-1 shadow-sm">
            <span className="text-2xl shrink-0">👑</span>
            <div>
              <h4 className="font-black text-xs text-pink-900 font-display">Trending Verified Traders</h4>
              <p className="text-[10px] text-pink-700 font-medium leading-relaxed mt-0.5">
                Showcasing local shops with high ratings, low response duration, premium badges, and active community following.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200/50 p-4 rounded-2xl flex items-center gap-3.5 mb-1 shadow-sm">
            <span className="text-2xl shrink-0">📍</span>
            <div>
              <h4 className="font-black text-xs text-teal-900 font-display">Nearby Domestic Deals (<span className="font-mono">{maxDistance}km</span>)</h4>
              <p className="text-[10px] text-teal-700 font-medium leading-relaxed mt-0.5">
                Save time and fuel! Sourcing agricultural produce or service personnel situated near Mbabane or Manzini stalls.
              </p>
            </div>
          </div>
        )}

        {/* 4. MAIN FEED POSTS RENDERING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 w-full mt-2">
          
          {/* SPECIAL RENDERING FOR "TRENDING TRADERS" TAB */}
          {activeTab === 'trending' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {(Object.values(SELLERS) as any[]).map((sel) => {
                const trProducts = PRODUCTS.filter(p => p.sellerId === sel.id);
                const isFollowed = followedSellers.includes(sel.id);
                return (
                  <div key={sel.id} className="bg-white rounded-2.5xl p-4.5 border border-gray-100 shadow-sm flex flex-col gap-3.5 animate-in fade-in duration-300">
                    <div className="flex justify-between items-start gap-3">
                      <Link to={`/shop/${sel.id}`} className="flex gap-3 items-center">
                        <img src={sel.logoUrl} className="w-12 h-12 rounded-full border border-gray-100 shadow-sm object-cover shrink-0" alt={sel.name} />
                        <div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-black text-sm text-gray-800 font-display leading-tight">{sel.name}</span>
                            <VerificationBadge level={sel.verificationLevel} showText={true} showDetails={true} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold">{sel.category} • {sel.location}</p>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="flex items-center text-xs font-bold text-yellow-500 font-mono">
                              <Star size={11} className="fill-yellow-500 mr-0.5" />
                              {sel.rating}
                            </span>
                            <span className="text-[10px] text-gray-400">({sel.reviews} reviews)</span>
                            <span className="text-[10px] bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded font-bold font-sans">
                              {isFollowed ? '1 follower' : '0 followers'}
                            </span>
                          </div>
                        </div>
                      </Link>

                      <button 
                        onClick={(e) => handleFollowSeller(sel.id, e)}
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
                          isFollowed 
                            ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                            : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        }`}
                      >
                        {isFollowed ? '✓ Following' : '+ Follow'}
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 leading-normal font-medium">{sel.description}</p>

                    {/* Horizontal products slider */}
                    <div className="flex flex-col gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/60">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Available Harvest Stalls ({trProducts.length})</span>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                        {trProducts.map(p => (
                          <Link to={`/product/${p.id}`} key={`tr-prod-${p.id}`} className="min-w-[150px] bg-white p-2 rounded-lg border border-gray-100 shadow-3xs hover:scale-102 transition-transform shrink-0">
                            <img src={p.images[0]} className="w-full h-24 object-cover rounded-md mb-1.5" />
                            <h5 className="text-[11px] font-black text-gray-800 line-clamp-1 leading-tight">{p.name}</h5>
                            <span className="text-[11px] font-bold text-green-600 font-mono">E {p.price}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // STANDARD PRODUCT CARDS OR PROMOS CARDS
            <>
              {filteredProducts.map((product, idx) => {
                const seller = SELLERS[product.sellerId] || {
                  name: 'Swazi Market Stall',
                  logoUrl: 'https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=200',
                  verificationLevel: 'basic',
                  location: 'SZ'
                };
                
                const isLiked = likedProducts.includes(product.id);
                const isPromo = activeTab === 'promos' || idx % 2 === 0;
                const promo = isPromo ? getPromoDetails(product, idx) : null;
                const claimed = claimedPromos.includes(product.id);
                const commentList = feedComments[product.id] || [];
                const isCommentBoxActive = activeCommentId === product.id;

                return (
                  <div key={product.id} className="bg-white rounded-2.5xl overflow-hidden shadow-sm border border-gray-100 flex flex-col w-full animate-in fade-in duration-300 pb-2">
                    
                    {/* Header: Seller Info with Follow Option */}
                    <div className="flex justify-between items-center p-3.5 border-b border-gray-50">
                      <Link to={`/shop/${product.sellerId}`} className="flex items-center gap-2.5">
                        <img src={seller.logoUrl} className="w-9 h-9 rounded-full border border-gray-100 object-cover shrink-0" alt={seller.name} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-xs text-gray-800 font-display leading-tight">{seller.name}</h4>
                            <VerificationBadge level={seller.verificationLevel} showText={true} showDetails={true} />
                          </div>
                          <div className="flex items-center text-[9px] text-gray-400 font-semibold gap-1.5 mt-0.5">
                            <span className="flex items-center text-green-600 mr-1"><MapPin size={8} className="mr-0.5 text-orange-500" /> {product.distance} ({seller.location})</span>
                            <span>•</span>
                            <span>{idx === 0 ? 'Just now' : `${idx + 1} hours ago`}</span>
                          </div>
                        </div>
                      </Link>

                      <button 
                        onClick={(e) => handleFollowSeller(product.sellerId, e)}
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-all ${
                          followedSellers.includes(product.sellerId)
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}
                      >
                        {followedSellers.includes(product.sellerId) ? 'Following' : '+ Follow'}
                      </button>
                    </div>

                    {/* Promo Banner inside the card if dynamic promo condition is satisfied */}
                    {promo && (
                      <div className="bg-amber-500/10 border-y border-amber-500/15 py-1.5 px-3.5 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-amber-600 animate-pulse" />
                          <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider leading-none">
                            {promo.tag} : <span className="text-red-600 font-black">{promo.pct}</span>
                          </span>
                        </div>
                        <button 
                          onClick={(e) => handleClaimPromo(product.id, promo.code, e)}
                          className={`text-[8px] font-black px-2 py-0.5 rounded transition-all active:scale-95 ${
                            claimed 
                              ? 'bg-green-600 text-white' 
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-3xs'
                          }`}
                        >
                          {claimed ? 'Claimed ✓' : `Claim Code (${promo.code})`}
                        </button>
                      </div>
                    )}

                    {/* Product Name & Description */}
                    <div className="p-3.5 flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-black text-sm text-gray-800 leading-tight font-display">{product.name}</h3>
                        <p className="text-xs text-gray-650 mt-1.5 line-clamp-3 leading-relaxed font-semibold">{product.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-black text-green-600 text-base block font-mono">
                          {product.currency} {product.price}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide block font-sans">
                          {product.unit}
                        </span>
                      </div>
                    </div>

                    {/* Main Image Banner linked to detail screen */}
                    <Link to={`/product/${product.id}`} className="h-60 bg-gray-100 w-full relative block overflow-hidden group">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      
                      {/* Distance Location overlay indicator */}
                      <span className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                        <MapPin size={9} className="text-[#FF8A00]" /> {product.distance} away from Mbabane
                      </span>

                      {/* Video indicator badge */}
                      {product.hasVideo && (
                        <span className="absolute top-3 right-3 bg-red-600/90 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 shadow">
                          <Zap size={9} className="fill-white" /> Visual Clip
                        </span>
                      )}
                    </Link>

                    {/* Interations Statistics Line */}
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-50 text-[10px] text-gray-400 font-bold font-sans">
                      <span className="flex items-center gap-1 text-slate-700">
                        <ThumbsUp size={11} className="text-indigo-600 fill-indigo-200" />
                        {isLiked ? 1 : 0} Likes
                      </span>
                      <span>
                        {commentsAndPredefinedCount(product.id, idx)} Comments • 0 Shares
                      </span>
                    </div>

                    {/* Feed Row Interaction Triggers */}
                    <div className="grid grid-cols-3 items-center py-1 border-b border-gray-50 px-1">
                      <button 
                        onClick={(e) => handleLikeProduct(product.id, e)}
                        className={`flex items-center justify-center gap-1 text-xs font-black py-2 rounded-xl active:scale-95 transition-all ${
                          isLiked ? 'text-red-500 bg-red-50/20' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                      </button>

                      <button 
                        onClick={() => {
                          setActiveCommentId(isCommentBoxActive ? null : product.id);
                        }}
                        className={`flex items-center justify-center gap-1 text-xs font-black py-2 rounded-xl active:scale-95 transition-all ${
                          isCommentBoxActive ? 'bg-indigo-50/20 text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <MessageCircle size={14} />
                        <span>Comment</span>
                      </button>

                      <button 
                        onClick={(e) => handleShare(product, e)}
                        className="flex items-center justify-center gap-1 text-xs font-black text-gray-500 py-2 rounded-xl active:scale-95 transition-all hover:text-gray-800"
                      >
                        <Share2 size={14} />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* COMMENTS BLOCK EXPANSION */}
                    {(isCommentBoxActive || commentList.length > 0) && (
                      <div className="px-3 py-2 bg-gray-50/50 rounded-b-2xl border-t border-gray-100 flex flex-col gap-2">
                        
                        {/* Custom comments loop */}
                        {commentList.map((comm, cIdx) => (
                          <div key={cIdx} className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-3xs flex gap-2 animate-in fade-in duration-200">
                            <div className="w-6.5 h-6.5 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black font-display uppercase">
                              {comm.author.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-black text-gray-800">{comm.author}</span>
                                <span className="text-[8px] text-gray-400">{comm.time}</span>
                              </div>
                              <p className="text-[10px] text-gray-600 leading-normal font-semibold">{comm.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Pre-cached Default Demo Comment for Authenticity (REMOVED) */}
                        {/* Interactive Form to post comment */}
                        {isCommentBoxActive && (
                          <form onSubmit={(e) => handleAddComment(product.id, e)} className="mt-1 flex flex-col gap-2 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-200">
                            <div className="flex gap-1.5">
                              <input 
                                type="text" 
                                required
                                placeholder="Your name (e.g. Nomsa)"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-[10px] w-2/5 outline-none focus:border-green-600 font-semibold text-gray-800"
                              />
                              <input 
                                type="text" 
                                required
                                placeholder="Type your comment..."
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] flex-1 outline-none focus:border-green-600 font-semibold text-gray-800"
                              />
                              <button 
                                type="submit" 
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm outline-none"
                              >
                                Post
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* EMPTY STATE */}
          {filteredProducts.length === 0 && activeTab !== 'trending' && (
            <div className="bg-white rounded-3xl p-8.5 text-center shadow-xs border border-gray-100 flex flex-col items-center gap-1.5">
              <span className="text-3xl">🏜️</span>
              <p className="font-black text-sm text-gray-800 font-display mt-2">No Feed Items Found</p>
              <p className="text-xs text-gray-400 max-w-[240px]">
                We couldn't locate active listings matching those specific metrics. Try increasing distance or removing selectors.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setMaxDistance(3);
                  setActiveTab('all');
                }}
                className="mt-3 bg-green-50 hover:bg-green-150 text-green-700 text-xs font-black px-4.5 py-2 rounded-full transition-all active:scale-95"
              >
                Reset Marketplace View
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 5. FLOATING SELL BUTTON (SIMILAR TO FACEBOOK MARKETPLACE) */}
      <Link 
        to="/register-seller" 
        className="fixed bottom-20 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black px-4.5 py-3 rounded-full flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform z-30 border border-green-500 hover:scale-105"
        title="Create Marketplace Listing"
      >
        <Plus size={16} className="stroke-[3]" />
        <span className="text-xs uppercase tracking-wider font-mono">Create Listing</span>
      </Link>

      {/* 6. TOAST OVERLAYS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-gray-900/95 backdrop-blur-md text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm pointer-events-auto border border-white/10">
              <span className="text-green-400">✓</span>
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Comments Count Calculator Helper
function commentsAndPredefinedCount(id: string, idx: number): number {
  try {
    const saved = localStorage.getItem('emakethe_feed_comments');
    if (saved) {
      const parsed = JSON.parse(saved);
      const customArray = parsed[id] || [];
      return customArray.length;
    }
  } catch {}
  return 0;
}
