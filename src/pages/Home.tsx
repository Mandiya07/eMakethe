import { useState, useEffect } from 'react';
import { Bell, MapPin, Store, Leaf, Pizza, Shirt, Wrench, Scissors, Car, Palette, Hammer, Home as HomeIcon, Smartphone, MoreHorizontal, X, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { Link } from 'react-router-dom';
import { VerificationBadge } from '../components/VerificationBadge';
import { useFirebase } from '../components/FirebaseProvider';

const IconMap: Record<string, any> = {
  Leaf, Pizza, Shirt, Wrench, Scissors, Car, Palette, Hammer, HomeIcon, Smartphone, MoreHorizontal
};

export default function Home() {
  const { sellers, products, banners } = useFirebase();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Reconstruct mocked Selllers record for component compatibility
  const SELLERS = sellers.reduce((acc, s) => ({...acc, [s.id]: s}), {} as Record<string, any>);
  const PRODUCTS = products;
  
  const [lowDataMode, setLowDataMode] = useState(() => {
    try {
      return localStorage.getItem('emakethe_low_data') === 'true';
    } catch { return false; }
  });

  useEffect(() => {
    const handleChanged = () => {
      try {
        setLowDataMode(localStorage.getItem('emakethe_low_data') === 'true');
      } catch {}
    };
    window.addEventListener('emakethe_low_data_changed', handleChanged);
    return () => window.removeEventListener('emakethe_low_data_changed', handleChanged);
  }, []);

  const handleToggleLowData = () => {
    const next = !lowDataMode;
    setLowDataMode(next);
    try {
      localStorage.setItem('emakethe_low_data', String(next));
      window.dispatchEvent(new Event('emakethe_low_data_changed'));
    } catch {}
  };

  // Load advertiser campaigns from localStorage
  const customBanners = banners;
  const [featuredProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_featured_products');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [sponsoredProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_sponsored_listings');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isS1Boosted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('emakethe_store_boosted_s1') === 'true';
    } catch { return false; }
  });

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  const filteredProducts = PRODUCTS.filter(product => {
    if (selectedCategory && product.categoryId !== selectedCategory) return false;
    if (selectedSubcategory) {
      const sub = selectedSubcategory.toLowerCase();
      const titleMatch = product.name.toLowerCase().includes(sub);
      const descMatch = product.description.toLowerCase().includes(sub);
      return titleMatch || descMatch || (product as any).subCategoryId?.toLowerCase() === sub;
    }
    return true;
  });

  // Sort logic prioritises active Seller promotions (Featured or Sponsored) to the top of the Feed
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    const aPromo = featuredProductIds.includes(a.id) || sponsoredProductIds.includes(a.id);
    const bPromo = featuredProductIds.includes(b.id) || sponsoredProductIds.includes(b.id);
    if (aPromo && !bPromo) return -1;
    if (!aPromo && bPromo) return 1;
    return 0;
  });

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      // Toggle off
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(catId);
      setSelectedSubcategory(null); // Reset subcategory when category changes
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      {/* App Bar */}
      <div className="bg-emerald-600 text-white rounded-b-[2rem] shadow-lg sticky top-0 z-30 w-full mb-4 relative overflow-hidden pb-4">
        {/* Decorative African Kente Ribbon */}
        <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#F59E0B,#F59E0B_8px,#10B981_8px,#10B981_16px,#EF4444_16px,#EF4444_24px,#3B82F6_24px,#3B82F6_32px)] opacity-95"></div>
        
        <div className="px-4 pt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] tracking-widest font-black uppercase text-amber-300">Swaziland Express</span>
              <span className="text-xl font-black tracking-tight font-display text-white">eMakethe</span>
              <div className="flex items-center gap-2 mt-1">
                 <Link to="/map" className="flex items-center gap-1 bg-white/15 hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors">
                   <MapPin size={11} className="text-amber-400" />
                   <span className="font-extrabold text-[10px] text-gray-100">Mbabane, SZ &nbsp;›</span>
                 </Link>
                 <button 
                   onClick={handleToggleLowData}
                   className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all active:scale-95 border ${
                     lowDataMode 
                       ? 'bg-amber-500 border-amber-300 text-slate-900 font-extrabold animate-pulse' 
                       : 'bg-black/25 border-transparent text-gray-300 hover:bg-black/35'
                   }`}
                   title={lowDataMode ? "Low Data Mode: On" : "Low Data Mode: Off"}
                 >
                   <span className="font-black text-[9px] tracking-tight uppercase">
                     {lowDataMode ? '● Low Data Active' : 'Low Data Mode'}
                   </span>
                 </button>
              </div>
            </div>
            
            <button className="bg-white/10 hover:bg-white/15 p-2.5 rounded-full relative active:scale-95 transition-transform flex items-center justify-center">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-emerald-600"></span>
            </button>
          </div>
          <Link to="/search" className="bg-white rounded-2xl flex items-center px-4 py-3 shadow-inner border border-gray-100 text-gray-550 hover:text-gray-700 transition-colors">
            <span className="flex-1 text-xs font-semibold">Search Mbabane fresh produce, tailors...</span>
            <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2500/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-end mb-3 px-1">
           <h2 className="text-sm font-bold text-gray-800">Explore Categories</h2>
           {(selectedCategory || selectedSubcategory) ? (
             <button 
               onClick={() => {
                 setSelectedCategory(null);
                 setSelectedSubcategory(null);
               }}
               className="text-red-600 text-[11px] font-bold flex items-center gap-1"
             >
               Reset Filters <X size={12} />
             </button>
           ) : (
             <span className="text-green-600 text-[11px] font-bold">Tap to Browse</span>
           )}
        </div>
        
        <div className="grid grid-cols-5 gap-y-4 gap-x-2">
          {CATEGORIES.map(cat => {
            const IconComponent = IconMap[cat.icon];
            const isSelected = selectedCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex flex-col items-center justify-center bg-transparent group outline-none active:scale-95 transition-transform`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 shadow-sm border transition-all ${
                  isSelected 
                    ? 'ring-4 ring-green-600/30 scale-105 border-green-600 bg-green-600 text-white' 
                    : `border-gray-100 h-12 w-12 hover:scale-105 ${cat.color}`
                }`}>
                  {IconComponent ? <IconComponent size={20} /> : <span className="font-bold text-center text-xs">{cat.name.substring(0, 2)}</span>}
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight px-1 line-clamp-1 transition-colors ${
                  isSelected ? 'text-green-700 font-bold' : 'text-gray-700'
                }`}>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Subcategory Selector */}
        {activeCategoryObj && (
          <div className="mt-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex gap-1 items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {activeCategoryObj.name} Subcategories
              </span>
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-mono font-bold">
                {activeCategoryObj.subcategories.length} available
              </span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubcategory === null
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All {activeCategoryObj.name}
              </button>
              {activeCategoryObj.subcategories.map(sub => {
                const isSubSelected = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      if (selectedSubcategory === sub) {
                        setSelectedSubcategory(null);
                      } else {
                        setSelectedSubcategory(sub);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      isSubSelected
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Become a Seller Banner */}
      <div className="px-4 mb-6 flex flex-col gap-3">
        <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-2xl p-4 shadow-md text-white flex items-center justify-between">
           <div>
             <h3 className="font-display font-bold text-lg mb-0.5 mt-0">Are you a trader?</h3>
             <p className="text-xs text-green-100">Sell online in minutes for free.</p>
           </div>
           <Link to="/register-seller" className="bg-white text-green-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm whitespace-nowrap">
             Start Selling
           </Link>
        </div>
      </div>

      {/* Promotions */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-800">Promotions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
          {PRODUCTS.slice(0, 2).map((product, idx) => (
            <Link to={`/product/${product.id}`} key={`promo-${product.id}`} className={`w-full rounded-2xl p-4 text-white flex justify-between items-center shadow-md transition-all hover:scale-[1.01] hover:shadow-lg ${idx === 0 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}>
               <div className="flex-1 min-w-0 pr-1">
                  <span className="bg-white/25 text-[10px] font-black px-2 py-0.5 rounded-full mb-1 inline-block tracking-wider">20% OFF</span>
                  <h3 className="font-black text-sm sm:text-base line-clamp-1 mt-1">{product.name}</h3>
                  <p className="text-[11px] font-medium text-white/90 mt-1">Free Delivery nearby</p>
               </div>
               <img src={product.images?.[0] || ""} className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-sm ml-2 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Traders */}
      <div className="px-0 mb-6">
        <div className="flex justify-between items-end mb-3 px-5">
          <h2 className="text-sm font-bold text-gray-800">Trending Traders</h2>
          <span className="text-green-600 text-[11px] font-bold">See All</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
           {(Object.values(SELLERS) as any[]).map(seller => {
             const isBoosted = seller.id === 's1' && isS1Boosted;
             return (
               <Link 
                 to={`/shop/${seller.id}`} 
                 key={seller.id} 
                 className={`min-w-[124px] rounded-2xl p-3 border shadow-sm flex flex-col items-center shrink-0 transition-all ${
                   isBoosted 
                     ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/10 border-amber-300 ring-2 ring-amber-400/20 scale-105 shadow-md' 
                     : 'bg-white border-gray-100'
                 }`}
               >
                 <div className="relative">
                   <img 
                     src={seller.logoUrl} 
                     className={`w-14 h-14 rounded-full object-cover mb-2 border ${
                       isBoosted ? 'border-amber-400 ring-2 ring-amber-400/20 animate-pulse' : 'border-gray-100'
                     }`} 
                   />
                   {isBoosted && (
                     <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 border border-white text-[7px] px-1 font-black rounded-full uppercase tracking-tighter shadow-sm">BOOSTED</span>
                   )}
                 </div>
                 <div className="flex items-center gap-1 justify-center w-full">
                   <h3 className="font-bold text-xs text-gray-800 text-center line-clamp-1">{seller.name}</h3>
                   <VerificationBadge level={seller.verificationLevel} showText={true} showDetails={true} />
                 </div>
                 <p className="text-[10px] text-gray-500 mt-0.5">{seller.category} • {seller.location}</p>
               </Link>
             );
           })}
        </div>
      </div>

      {/* Local Business Sponsored Ads */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-800">Local Sponsored Banners</h2>
          <span className="text-pink-600 text-[10px] font-bold uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded">Ad Slot</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {/* Active custom merchant broadcasts published from Dashboard */}
          {customBanners.map(banner => (
             <div 
               key={banner.id}
               className={`p-4 rounded-3xl text-white shadow-md relative overflow-hidden flex items-center justify-between border transition-all duration-300 ${
                  banner.theme === 'emerald' ? 'bg-gradient-to-r from-green-600 to-emerald-700 border-green-500' :
                  banner.theme === 'sunset' ? 'bg-gradient-to-r from-orange-400 to-rose-500 border-orange-300' :
                  banner.theme === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400' :
                  'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700'
               }`}
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex-1 pr-2">
                   <div className="flex items-center gap-1">
                      <span className="text-[7.5px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Promoted Partner</span>
                      {banner.coupon && (
                         <span className="text-[7.5px] bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded font-mono">CODE: {banner.coupon}</span>
                      )}
                   </div>
                   <h3 className="font-display font-black text-xs text-white mt-1.5">{banner.title}</h3>
                   <p className="text-[10px] text-white/95 mt-0.5 leading-normal max-w-[210px] font-medium line-clamp-2">{banner.heading}</p>
                   <div className="mt-2.5 flex items-center gap-1">
                      <span className="bg-emerald-400 w-1.5 h-1.5 rounded-full animate-ping"></span>
                      <span className="text-[9px] text-white/80 font-bold">100% Verified Local Stall</span>
                   </div>
                </div>
                <div className="shrink-0">
                   <img src={banner.imageUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/25 shadow-sm" />
                </div>
             </div>
          ))}

          {/* Standard system ad as fallback/secondary */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-4 rounded-3xl text-white shadow-md relative overflow-hidden flex items-center justify-between border border-indigo-800">
             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
             <div className="flex-1">
                <span className="text-[8px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Promoted Advertiser</span>
                <h3 className="font-display font-black text-sm mt-1.5 text-white">Simunye Farmers & Spares</h3>
                <p className="text-[10px] text-slate-300 mt-1 leading-normal max-w-[200px]">30% off high-grade fertilizer & cabbage seeds this week only! Visit our store in Eveni Plaza.</p>
                <div className="mt-2.5 flex items-center gap-1">
                   <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full"></span>
                   <span className="text-[9px] text-slate-300 font-medium">Located 1.2 km away</span>
                </div>
             </div>
             <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-1 font-mono hover:scale-105 transition-transform font-bold">
                <span className="text-pink-400 font-black text-xs">30%</span>
                <span className="text-[7px] text-slate-300 text-center leading-none mt-0.5">OFF SPARES</span>
             </div>
          </div>
        </div>
      </div>

      {/* Community Feed section */}
      <div className="px-4">
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-800">Community Marketplace Feed</h2>
          <Link to="/feed" className="text-green-600 text-[11px] font-black hover:underline">See Interactive Feed →</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {sortedAndFilteredProducts.map((product, idx) => {
            const seller = SELLERS[product.sellerId];
            if (!seller) return null;
            
            const isFeatured = featuredProductIds.includes(product.id);
            const isSponsored = sponsoredProductIds.includes(product.id);
            const isStoreBoostedMerchant = seller.id === 's1' && isS1Boosted;
            
            return (
              <div 
                key={product.id} 
                className={`rounded-[2rem] overflow-hidden flex flex-col w-full mb-3 pb-3 transition-all ${
                  isFeatured ? 'bg-gradient-to-b from-rose-50/20 via-white to-white border-2 border-rose-300 shadow-sm' :
                  isSponsored ? 'bg-gradient-to-b from-amber-50/25 via-white to-white border-2 border-amber-300 shadow-sm' :
                  'bg-white border border-gray-150 shadow-3xs hover:border-emerald-300'
                }`}
              >
                
                {/* Header: Seller Info */}
                <div className="flex justify-between items-center p-4">
                  <Link to={`/shop/${seller.id}`} className="flex items-center gap-2.5">
                    <div className="relative">
                      {seller.logoUrl && seller.logoUrl.length <= 2 ? (
                        <div className="w-10 h-10 rounded-full border border-gray-100 bg-emerald-50 flex items-center justify-center text-lg shrink-0">
                          {seller.logoUrl}
                        </div>
                      ) : (
                        <img src={seller.logoUrl || "🥬"} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                      )}
                      {isStoreBoostedMerchant && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full border border-white flex items-center justify-center text-[8px] text-slate-900 font-black shadow-3xs">⚡</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold text-xs text-gray-900">{seller.name}</span>
                        <VerificationBadge level={seller.verificationLevel} showText={false} showDetails={false} />
                        {isFeatured && (
                           <span className="bg-gradient-to-r from-rose-500 to-orange-500 text-white font-extrabold text-[7px] px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">⭐ Featured</span>
                        )}
                        {isSponsored && (
                           <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-extrabold text-[7px] px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">Sponsored</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">{product.distance} • {idx === 0 ? 'Just now' : `${idx + 1}h ago`} in <span className="text-gray-600 font-bold">{seller.location}</span></p>
                    </div>
                  </Link>
                  <a 
                    href={`https://wa.me/${seller.phone}?text=${encodeURIComponent(`Hello! I saw your "${product.name}" (priced at E ${product.price}) on eMakethe Swaziland. Is it currently in stock?`)}`}
                    className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.1 1.448 4.743 1.449 5.48 0 9.932-4.456 9.935-9.942a9.23 9.23 0 0 0-2.93-6.967 9.18 9.18 0 0 0-6.945-2.93C5.974 1.764 1.52 6.218 1.517 11.7a9.204 9.204 0 0 0 1.485 4.96l-.979 3.57 3.662-.96z"/>
                    </svg>
                    <span>Chat Trader</span>
                  </a>
                </div>
 
                 {/* Product Text/Title */}
                 <div className="px-4 pb-3 flex justify-between items-start">
                    <div className="flex-1 pr-3">
                      <h3 className="font-extrabold text-sm text-gray-900 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-xl block">{product.currency}{product.price}</span>
                      <span className="text-[9px] font-black text-gray-400 block uppercase mt-1 tracking-wider">{product.unit}</span>
                    </div>
                 </div>
 
                 {/* Main Product Image (Large & Prominent) */}
                 <Link to={`/product/${product.id}`} className="h-64 bg-gray-100 w-full relative block overflow-hidden border-y border-gray-100">
                   <img 
                     src={product.images[0]} 
                     alt={product.name} 
                     className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" 
                     loading="lazy"
                   />
                   <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                     <span className="bg-black/45 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full">
                       {product.subCategoryId || 'Marketplace'}
                     </span>
                     {product.hasVideo && (
                       <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                         📹 Video proof
                       </span>
                     )}
                   </div>
                   <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg">
                     📦 {product.stock} Available
                   </div>
                 </Link>
                 
                 {/* Social Stats */}
                 <div className="flex justify-between items-center px-4 py-2 text-[10px] text-gray-500 border-b border-gray-50 font-medium">
                    <span className="flex items-center gap-1">👍 {24 + idx * 7} Likes</span>
                    <span>{3 + idx * 2} Comments • {Math.max(1, 5 - idx)} Shares</span>
                 </div>
 
                 {/* Social Actions */}
                 <div className="flex justify-between items-center px-2 pt-2">
                   <button className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 py-1.5 px-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
                     <span>👍</span> Like
                   </button>
                   <Link to={`/product/${product.id}`} className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 py-1.5 px-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
                     <span>💬</span> Comment
                   </Link>
                   <button className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 py-1.5 px-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
                     <span>↗️</span> Share
                   </button>
                 </div>
              </div>
            )
          })}
 
          {sortedAndFilteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center">
              <span className="text-3xl mb-2">🥬</span>
              <p className="font-bold text-gray-800 text-sm">No listings found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">Be the first to list items in {selectedSubcategory || activeCategoryObj?.name || 'this category'} on MaketiConnect!</p>
              <Link to="/register-seller" className="mt-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs px-4 py-2 rounded-full transition-colors">
                List a Product
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 mb-20 text-center">
        <Link to="/admin" className="text-[10px] text-gray-400 font-medium pb-4 hover:underline">
          Admin Portal Login
        </Link>
      </div>

    </div>
  );
}
