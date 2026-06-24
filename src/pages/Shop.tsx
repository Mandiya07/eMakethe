import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, MapPin, Star, MoreVertical, Heart, Phone, Truck, Wallet, Clock, CheckCircle2, X, Camera, Image as ImageIcon, Send, Check, ThumbsUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { VerificationBadge } from '../components/VerificationBadge';
import { useFirebase } from '../components/FirebaseProvider';

export default function Shop() {
  const { id } = useParams();
  const { products: PRODUCTS, sellers: SELLERS_LIST } = useFirebase();
  const seller = SELLERS_LIST.find(s => s.id === id);
  const SELLERS = SELLERS_LIST.reduce((acc, s) => ({...acc, [s.id]: s}), {} as Record<string, any>);

  const getThemeClasses = () => {
    if (!seller) {
      return {
        primaryBg: 'bg-green-600 hover:bg-green-700',
        textAccent: 'text-green-600',
        lightBg: 'bg-green-50',
        borderAccent: 'border-green-150',
        badgeBg: 'bg-green-100 text-green-800 border-green-200',
        buttonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
        buttonSecondary: 'bg-green-50 text-green-700 border-green-150 hover:bg-green-100/50'
      };
    }
    const theme = seller.themeColor || 'emerald';
    switch (theme) {
      case 'blue':
        return {
          primaryBg: 'bg-blue-600 hover:bg-blue-700',
          textAccent: 'text-blue-600',
          lightBg: 'bg-blue-50',
          borderAccent: 'border-blue-150',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonSecondary: 'bg-blue-50 text-blue-700 border-blue-150 hover:bg-blue-100/50'
        };
      case 'pink':
        return {
          primaryBg: 'bg-pink-600 hover:bg-pink-700',
          textAccent: 'text-pink-600',
          lightBg: 'bg-pink-50',
          borderAccent: 'border-pink-150',
          badgeBg: 'bg-pink-100 text-pink-800 border-pink-200',
          buttonPrimary: 'bg-pink-600 hover:bg-pink-700 text-white',
          buttonSecondary: 'bg-pink-50 text-pink-700 border-pink-150 hover:bg-pink-100/50'
        };
      case 'amber':
        return {
          primaryBg: 'bg-amber-600 hover:bg-amber-700',
          textAccent: 'text-amber-600',
          lightBg: 'bg-amber-50',
          borderAccent: 'border-amber-150',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          buttonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white',
          buttonSecondary: 'bg-amber-50 text-amber-700 border-amber-150 hover:bg-amber-100/50'
        };
      case 'slate':
        return {
          primaryBg: 'bg-slate-800 hover:bg-slate-900',
          textAccent: 'text-slate-800',
          lightBg: 'bg-slate-100',
          borderAccent: 'border-slate-200',
          badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
          buttonPrimary: 'bg-slate-800 hover:bg-slate-900 text-white',
          buttonSecondary: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/50'
        };
      default: // emerald
        return {
          primaryBg: 'bg-green-600 hover:bg-green-700',
          textAccent: 'text-green-600',
          lightBg: 'bg-green-50',
          borderAccent: 'border-green-150',
          badgeBg: 'bg-green-100 text-green-800 border-green-200',
          buttonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
          buttonSecondary: 'bg-green-50 text-green-700 border-green-150 hover:bg-green-100/50'
        };
    }
  };
  const themeClasses = getThemeClasses();

  // --- LOCAL PERSISTENCE SOCIAL ENGINE ---
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      if (!id) return false;
      const key = 'emakethe_favorited_shops';
      const favorited = localStorage.getItem(key);
      return favorited ? JSON.parse(favorited).includes(id) : false;
    } catch { return false; }
  });

  const [isFollowing, setIsFollowing] = useState(() => {
    try {
      if (!id) return false;
      const key = 'emakethe_followed_sellers';
      const followed = localStorage.getItem(key);
      return followed ? JSON.parse(followed).includes(id) : false;
    } catch { return false; }
  });

  const [isRecommended, setIsRecommended] = useState(() => {
    try {
      if (!id) return false;
      const key = `emakethe_recommended_sellers`;
      const recom = localStorage.getItem(key);
      return recom ? JSON.parse(recom).includes(id) : false;
    } catch { return false; }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);

  // --- REVIEWS & REPUTATION ENGINE ---
  const [shopReviews, setShopReviews] = useState<{
    id: string;
    author: string;
    rating: number;
    text: string;
    photos: string[];
    deliveryFeedback: string;
    timestamp: string;
  }[]>(() => {
    try {
      if (!id) return [];
      const saved = localStorage.getItem(`emakethe_shop_reviews_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [selectedDeliveryFeedback, setSelectedDeliveryFeedback] = useState("Fast & Friendly");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic statistics combining mock data and custom reviews
  const mockReviewsCount = seller?.reviews || 0;
  const mockAvgRating = seller?.rating || 4.7;
  const totalReviewsCount = mockReviewsCount + shopReviews.length;

  // Deduction of mock stars to distribute realistically around the mock rating
  const mock5Star = Math.round(mockReviewsCount * 0.82);
  const mock4Star = Math.round(mockReviewsCount * 0.14);
  const mock3Star = Math.round(mockReviewsCount * 0.04);
  const mock2Star = 0;
  const mock1Star = 0;

  let total5Star = mock5Star;
  let total4Star = mock4Star;
  let total3Star = mock3Star;
  let total2Star = mock1Star;
  let total1Star = mock2Star;

  shopReviews.forEach(r => {
    if (r.rating === 5) total5Star++;
    else if (r.rating === 4) total4Star++;
    else if (r.rating === 3) total3Star++;
    else if (r.rating === 2) total2Star++;
    else if (r.rating === 1) total1Star++;
  });

  const computedAvgRating = totalReviewsCount > 0 
    ? parseFloat(((total5Star*5 + total4Star*4 + total3Star*3 + total2Star*2 + total1Star*1) / totalReviewsCount).toFixed(1))
    : mockAvgRating;

  // Reputation Score is the percentage of reviews that are 4 or 5 stars (positive rating)
  const positiveCount = total5Star + total4Star;
  const reputationScore = totalReviewsCount > 0 
    ? Math.round((positiveCount / totalReviewsCount) * 100)
    : 96;

  // Delivery Feedback percentage
  const positiveDeliveryMockCount = Math.round(mockReviewsCount * 0.95);
  let positiveDeliveryCustomCount = 0;
  shopReviews.forEach(r => {
    if (r.deliveryFeedback === "Fast & Friendly" || r.deliveryFeedback === "On Time") {
      positiveDeliveryCustomCount++;
    }
  });
  const deliveryReputationScore = totalReviewsCount > 0
    ? Math.round(((positiveDeliveryMockCount + positiveDeliveryCustomCount) / totalReviewsCount) * 100)
    : 95;

  if (!seller) return <div className="p-8 text-center font-bold text-gray-500">Shop not found</div>;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleFavoriteShop = () => {
    if (!id) return;
    try {
      const key = 'emakethe_favorited_shops';
      const favorited = localStorage.getItem(key);
      let favoritedArr = favorited ? JSON.parse(favorited) : [];
      if (favoritedArr.includes(id)) {
        favoritedArr = favoritedArr.filter((sid: string) => sid !== id);
        setIsFavorite(false);
        triggerToast("Removed shop from favorites 🤍");
      } else {
        favoritedArr.push(id);
        setIsFavorite(true);
        triggerToast(`Added ${seller.name} to your favorite shops! ❤️`);
      }
      localStorage.setItem(key, JSON.stringify(favoritedArr));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFollow = () => {
    if (!id || !seller) return;
    try {
      const key = 'emakethe_followed_sellers';
      const followed = localStorage.getItem(key);
      let followedArr = followed ? JSON.parse(followed) : [];
      if (followedArr.includes(id)) {
        followedArr = followedArr.filter((sid: string) => sid !== id);
        setIsFollowing(false);
        triggerToast(`Unfollowed ${seller.name}`);
      } else {
        followedArr.push(id);
        setIsFollowing(true);
        triggerToast(`Yebo! You are now following ${seller.name}! 🎉`);
      }
      localStorage.setItem(key, JSON.stringify(followedArr));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRecommend = () => {
    if (!id || !seller) return;
    try {
      const key = `emakethe_recommended_sellers`;
      const recom = localStorage.getItem(key);
      let recomArr = recom ? JSON.parse(recom) : [];
      if (recomArr.includes(id)) {
        recomArr = recomArr.filter((sid: string) => sid !== id);
        setIsRecommended(false);
        triggerToast(`Removed recommendation for ${seller.name}`);
      } else {
        recomArr.push(id);
        setIsRecommended(true);
        triggerToast(`Siyabonga! You recommended ${seller.name}! ✨`);
      }
      localStorage.setItem(key, JSON.stringify(recomArr));
    } catch (e) {
      console.error(e);
    }
  };

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <h2 className="text-xl font-bold mb-2">Shop not found</h2>
        <p className="text-gray-500 mb-6">This shop may have been removed.</p>
        <Link to="/" className="bg-green-600 text-white px-6 py-2 rounded-full font-bold">Go Back</Link>
      </div>
    );
  }

  const sellerProducts = PRODUCTS.filter(p => p.sellerId === seller.id);

  const handleWhatsApp = () => {
    window.location.href = `https://wa.me/${seller.phone}?text=Hello ${seller.name}, I found your shop on MaketiConnect!`;
  };
  
  const handleCall = () => {
    window.location.href = `tel:${seller.phone}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 w-full">
      {/* Dynamic Swazi Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom duration-305 max-w-sm mx-auto">
           <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-green-500/25 text-green-400 flex items-center justify-center shrink-0">
                <Check size={14} className="stroke-[3]" />
              </div>
              <p className="text-xs font-bold leading-normal font-sans">{toastMessage}</p>
           </div>
        </div>
      )}
      <div className="relative h-48 w-full bg-gray-200">
        <Link to="/" className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-md text-white p-2 rounded-full border border-white/30">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md text-white p-2 rounded-full border border-white/30">
          <MoreVertical size={20} />
        </div>
        <img src={seller.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      <div className="px-4 relative -mt-10 pb-6 w-full">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center w-full">
          {seller.logoUrl && seller.logoUrl.length <= 2 ? (
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md -mt-12 bg-emerald-50 flex items-center justify-center text-3.5xl shrink-0 font-sans">
              {seller.logoUrl}
            </div>
          ) : (
            <img src={seller.logoUrl || "🥬"} className="w-20 h-20 rounded-full border-4 border-white shadow-md -mt-12 object-cover bg-white" alt={seller.name} />
          )}
          <h1 className="text-xl font-bold text-gray-800 mt-2 text-center flex items-center justify-center gap-1">
             {seller.name}
             <button onClick={handleToggleFavoriteShop} className="ml-1 text-red-500 hover:scale-110 active:scale-90 transition-transform">
               {isFavorite ? <Heart size={16} className="fill-red-500 text-red-500" /> : <Heart size={16} className="text-gray-400" />}
             </button>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1.5 font-sans">
             <VerificationBadge level={seller.verificationLevel} showText={true} showDetails={true} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100" />
             <div className="flex items-center text-xs text-gray-500 gap-1">
                <MapPin size={12} />
                <span>{seller.location}</span>
             </div>
          </div>

          <div className="flex gap-4 mt-3 w-full justify-center text-sm font-sans">
            <div className="flex flex-col items-center">
              <span className="font-bold text-gray-800 flex items-center gap-0.5" id="dynamic-rating-display">
                <Star size={14} className="fill-yellow-400 text-yellow-400"/> {computedAvgRating}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">{totalReviewsCount} Reviews</span>
            </div>
            <div className="w-[1px] bg-gray-200 h-8"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-indigo-600 text-xs pt-1">{isFollowing ? "57" : "56"}</span>
              <span className="text-[10px] text-gray-500">Followers</span>
            </div>
            <div className="w-[1px] bg-gray-200 h-8"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-green-600 text-center text-xs uppercase pt-1">Open</span>
              <span className="text-[10px] text-gray-500">{seller.hours}</span>
            </div>
          </div>

          {/* Dynamic Seller Reputation Score banner display */}
          <div className="w-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/15 rounded-2xl p-3 flex items-center justify-between mt-3.5 font-sans animate-in fade-in" id="seller-reputation-banner">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <div className="text-left">
                <p className="text-[9.5px] text-emerald-800 uppercase font-black tracking-wider font-mono">Public Reputation Score</p>
                <p className="text-[10.5px] text-slate-500 font-medium font-sans">Verified local Swazi checkout reputation & trust rating</p>
              </div>
            </div>
            <div className="text-right bg-emerald-600 text-white rounded-xl px-2.5 py-1 text-xs font-black shadow-3xs font-mono shrink-0">
              {reputationScore}% Trust
            </div>
          </div>

          <p className="text-xs text-gray-650 mt-3 text-center px-4 leading-relaxed font-sans font-medium">
            {seller.description}
          </p>

          <div className="flex w-full gap-2 mt-4 flex-wrap font-sans">
             <button 
               onClick={handleToggleFollow}
               className={`flex-1 font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs transition-colors border active:scale-95 ${isFollowing ? 'bg-indigo-600 text-white border-transparent' : 'bg-indigo-50 text-indigo-700 border-indigo-150 hover:bg-indigo-100/50'}`}
             >
               {isFollowing ? <Check size={14} className="stroke-[3]" /> : null}
               {isFollowing ? "Following Shop" : "Follow Shop"}
             </button>
             <button 
               onClick={handleToggleRecommend}
               className={`flex-1 font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs transition-colors border active:scale-95 ${isRecommended ? 'bg-[#FF8A00] text-white border-transparent' : 'bg-orange-50 text-orange-700 border-orange-150 hover:bg-orange-100/50'}`}
             >
               {isRecommended ? <Star size={14} className="fill-white text-white" /> : <ThumbsUp size={12} />}
               {isRecommended ? "Recommended" : "Recommend Shop"}
             </button>
             <button 
               onClick={handleWhatsApp}
               className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs active:scale-95 transition-transform"
             >
               <MessageCircle size={14} />
               Chat Now
             </button>
          </div>
        </div>
      </div>

      {seller.announcement && (
        <div className="px-4 mb-4">
           <div className={`p-3.5 rounded-2xl border flex items-center gap-3 animate-pulse ${
             seller.verificationLevel === 'premium' 
               ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
               : 'bg-blue-50/70 border-blue-200 text-blue-900'
           }`}>
              <Sparkles size={16} className={seller.verificationLevel === 'premium' ? 'text-amber-500 shrink-0' : 'text-blue-500 shrink-0'} />
              <div className="text-xs font-bold font-sans">
                 <span className="uppercase text-[9px] tracking-wider block opacity-75 font-mono">Store Announcement</span>
                 {seller.announcement}
              </div>
           </div>
        </div>
      )}

      <div className="px-4 pb-8 w-full">
        <div className="flex bg-white rounded-lg p-1 mb-4 border border-gray-100 shadow-sm relative">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${activeTab === 'products' ? `${themeClasses.primaryBg} text-white shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${activeTab === 'about' ? `${themeClasses.primaryBg} text-white shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${activeTab === 'reviews' ? `${themeClasses.primaryBg} text-white shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="grid grid-cols-2 gap-3 w-full">
            {sellerProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col w-full">
                <div className="h-32 bg-gray-100 relative">
                   <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                  <span className={`font-bold mt-1 block ${themeClasses.textAccent}`}>{product.currency}{product.price} <span className="text-xs font-normal text-gray-500">{product.unit}</span></span>
                </div>
              </Link>
            ))}
            {sellerProducts.length === 0 && (
              <div className="col-span-2 py-8 text-center text-gray-500 text-sm">
                 No products listed yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="flex flex-col gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 text-sm mb-2">About the Store</h3>
               <p className="text-xs text-gray-600 leading-relaxed">{seller.description} We pride ourselves in sourcing the freshest and highest quality goods for our customers.</p>
             </div>

             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Store Information</h3>
                
                <div className="flex flex-col gap-3">
                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                       <MapPin size={16} />
                     </div>
                     <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-semibold text-gray-800">{seller.location}</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                       <Clock size={16} />
                     </div>
                     <div>
                        <p className="text-xs text-gray-500">Business Hours</p>
                        <p className="text-sm font-semibold text-gray-800">{seller.hours}</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                       <Truck size={16} />
                     </div>
                     <div>
                        <p className="text-xs text-gray-500">Delivery Available</p>
                        <p className="text-sm font-semibold text-gray-800 text-green-700">Yes, within 15km</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                       <Wallet size={16} />
                     </div>
                     <div>
                        <p className="text-xs text-gray-500">Payment Methods</p>
                        <p className="text-sm font-semibold text-gray-800">Mobile Money (MTN/eMali), Cash on Delivery</p>
                     </div>
                   </div>

                    {seller.facebook && (
                       <div className="flex items-start gap-3 border-t border-gray-100 pt-2.5">
                         <div className="w-8 h-8 rounded-full bg-blue-50/70 flex items-center justify-center text-blue-600 shrink-0">
                           <span className="text-xs font-black font-sans">f</span>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500">Facebook Page</p>
                            <a href={`https://facebook.com/${seller.facebook}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-750 hover:underline">{seller.facebook}</a>
                         </div>
                       </div>
                    )}

                    {seller.instagram && (
                       <div className="flex items-start gap-3 border-t border-gray-100 pt-2.5">
                         <div className="w-8 h-8 rounded-full bg-pink-50/70 flex items-center justify-center text-pink-600 shrink-0">
                           <span className="text-xs font-black font-sans">📸</span>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500">Instagram Handle</p>
                            <a href={`https://instagram.com/${seller.instagram}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-pink-750 hover:underline">@{seller.instagram}</a>
                         </div>
                       </div>
                    )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-3.5">
             <button
               onClick={() => setShowReviewModal(true)}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm mb-1 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/10"
             >
                <Star size={16} className="fill-white" />
                Leave Public Trust Review
             </button>

             {/* Public Reputation Stat Breakdown Card */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-150/60 flex flex-col gap-4">
                <div className="flex items-center gap-4 animate-in fade-in">
                  <div className="flex-1 text-center border-r border-gray-100 pr-4">
                     <h2 className="text-3xl font-display font-black text-gray-800">{computedAvgRating}</h2>
                     <div className="flex justify-center text-yellow-400 my-1">
                       {Array.from({ length: 5 }).map((_, i) => (
                         <Star 
                           key={i} 
                           size={12} 
                           className={i < Math.round(computedAvgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                         />
                       ))}
                     </div>
                     <p className="text-[10px] text-gray-500 font-medium">{totalReviewsCount} Reviews</p>
                  </div>
                  
                  <div className="flex-[2] flex flex-col gap-1.5">
                     {[5, 4, 3, 2, 1].map((stars) => {
                       const count = stars === 5 ? total5Star : stars === 4 ? total4Star : stars === 3 ? total3Star : stars === 2 ? total2Star : total1Star;
                       const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                       return (
                         <div key={stars} className="flex items-center gap-2">
                           <span className="text-[10px] text-gray-600 font-bold w-2">{stars}</span>
                           <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-yellow-400 mr-auto" style={{ width: `${pct}%` }}></div>
                           </div>
                           <span className="text-[9px] text-gray-400 font-mono w-6 text-right">{Math.round(pct)}%</span>
                         </div>
                       );
                     })}
                  </div>
                </div>

                {/* Reputation Breakdown details and delivery feedback tracker */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-[10px] font-sans">
                  <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                    <CheckCircle2 size={12} className="text-emerald-600 text-[10px]" />
                    <span>On-Time: <strong>{deliveryReputationScore}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg">
                    <Sparkles size={12} className="text-indigo-600 text-[10px]" />
                    <span>Reputation: <strong>{reputationScore}% Positive</strong></span>
                  </div>
                  <span className="text-gray-400 font-mono">ID: {seller.id.toUpperCase()}</span>
                </div>
             </div>

             {/* Dynamic Reviews mapping list */}
             <div className="flex flex-col gap-3 font-sans" id="reviews-feed-container">
               {shopReviews.length === 0 ? (
                 <div className="bg-white p-8 rounded-xl text-center border border-gray-150/60 text-gray-400 text-xs font-semibold">
                   No reviews yet. Be the first to tell others about {seller.name}!
                 </div>
               ) : (
                 shopReviews.map((review) => (
                   <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-150/60 flex flex-col gap-2 text-left">
                     <div className="flex justify-between items-start">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                           {review.author ? review.author[0] : 'C'}
                         </div>
                         <div className="text-left">
                           <p className="text-xs font-bold text-gray-800 leading-snug">{review.author}</p>
                           <p className="text-[9px] text-gray-400 font-medium leading-none">{review.timestamp}</p>
                         </div>
                       </div>
                       
                       <div className="flex text-yellow-400 shrink-0">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <Star 
                             key={i} 
                             size={10} 
                             className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-250 text-gray-200"} 
                           />
                         ))}
                       </div>
                     </div>
                     
                     <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1 text-left">
                       {review.text}
                     </p>

                     {/* Uploaded Photos listing */}
                     {review.photos && review.photos.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-2">
                         {review.photos.map((photo, i) => (
                           <div key={i} className="relative bg-gray-50 h-16 w-16 rounded-lg overflow-hidden border border-gray-100">
                             <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           </div>
                         ))}
                       </div>
                     )}

                     {/* Delivery and service badges */}
                     {review.deliveryFeedback && (
                       <div className="mt-2 flex gap-1.5 flex-wrap">
                         <div className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                           review.deliveryFeedback === 'Fast & Friendly' || review.deliveryFeedback === 'On Time'
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                             : 'bg-amber-50 text-amber-700 border-amber-100'
                         }`}>
                           🚚 {review.deliveryFeedback}
                         </div>
                         <span className="text-[9.5px] text-gray-400 bg-slate-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase font-mono">
                           Verified Trade
                         </span>
                       </div>
                     )}
                   </div>
                 ))
               )}
             </div>
          </div>
        )}
      </div>

      {showReviewModal && (
        <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex items-end justify-center pointer-events-none p-4 pb-0 w-full h-full max-w-md mx-auto">
           <div className="bg-black/65 fixed inset-0 z-40 pointer-events-auto backdrop-blur-xs" onClick={() => setShowReviewModal(false)}></div>
           <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom h-[85vh] overflow-y-auto pb-32 relative z-50">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2 -mt-2 border-b border-gray-100">
                 <h3 className="font-black text-gray-800 text-sm uppercase tracking-wide">Add Verified Trust Feedback</h3>
                 <button onClick={() => setShowReviewModal(false)} className="bg-gray-150 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                   <X size={16} />
                 </button>
              </div>

              <div className="flex flex-col gap-5 text-left">
                 {/* Rating Selection Section */}
                 <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2.5 block text-center">How would you rate this seller?</label>
                    <div className="flex justify-center gap-2.5 font-sans">
                       {[1, 2, 3, 4, 5].map((star) => (
                           <button 
                             key={star} 
                             type="button"
                             onClick={() => setReviewRating(star)}
                             className="p-1.5 focus:outline-none transition-transform hover:scale-125 font-sans"
                           >
                             <Star size={36} className={`${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 text-gray-250'}`} />
                           </button>
                       ))}
                    </div>
                 </div>

                 {/* Author Name input field */}
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">Your Full Name</label>
                    <input 
                      type="text"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder="e.g. Sipho Dlamini"
                      className="w-full bg-slate-50 border border-gray-200 text-xs font-bold py-3 px-4 rounded-xl outline-none focus:border-indigo-600 text-slate-800"
                    />
                 </div>

                 {/* Detailed feedback text */}
                 <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">Write your comment / review</label>
                    <textarea 
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="What did you like or dislike about the fresh produce, price, or courier packaging?" 
                      rows={3} 
                      className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all font-sans leading-relaxed text-gray-800"
                    ></textarea>
                 </div>

                 {/* Delivery feedback selector */}
                 <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono mb-2.5 block">Delivery Feedback</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: "Fast & Friendly", label: "Fast & Friendly", desc: "Arrived swift, rider was polite" },
                         { id: "On Time", label: "On Time", desc: "Matches scheduled window" },
                         { id: "Delayed", label: "Delayed Delivery", desc: "Long transport delays" },
                         { id: "Missing / Issues", label: "Issues / Missing", desc: "Bad items or incorrect" }
                       ].map((opt) => {
                         const current = selectedDeliveryFeedback === opt.id;
                         return (
                           <button
                             type="button"
                             key={opt.id}
                             onClick={() => setSelectedDeliveryFeedback(opt.id)}
                             className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 font-sans ${
                               current 
                                 ? 'border-emerald-600 bg-emerald-50/20 text-emerald-950 font-extrabold shadow-3xs' 
                                 : 'border-gray-150 bg-white hover:bg-slate-50'
                             }`}
                           >
                             <span className="text-xs leading-none font-bold block">{opt.label}</span>
                             <span className="text-[9px] text-gray-400 block leading-tight">{opt.desc}</span>
                           </button>
                         );
                       })}
                    </div>
                 </div>

                 {/* Click + Drag-and-Drop photo upload block */}
                 <div>
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">Upload Fresh Quality Photos</label>
                     <div 
                       onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                       onDragLeave={() => setIsDragging(false)}
                       onDrop={(e) => {
                         e.preventDefault();
                         setIsDragging(false);
                         const files = Array.from(e.dataTransfer.files);
                         if (files.length > 0) {
                           files.forEach((file: File) => {
                             if (!file.type.startsWith('image/')) return;
                             const r = new FileReader();
                             r.onload = () => { if (r.result) setUploadedPhotos(prev => [...prev, r.result as string]); };
                             r.readAsDataURL(file);
                           });
                         }
                       }}
                       className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col justify-center items-center gap-2 cursor-pointer transition-all ${
                         isDragging 
                           ? 'border-indigo-600 bg-indigo-50/30' 
                           : 'border-gray-200 bg-slate-50/50 hover:bg-slate-100/50'
                       }`}
                     >
                        <input 
                          type="file" 
                          id="file-photo-uploader" 
                          className="hidden" 
                          accept="image/*" 
                          multiple 
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []) as File[];
                            files.forEach((file: File) => {
                              if (!file.type.startsWith('image/')) return;
                              const r = new FileReader();
                              r.onload = () => { if (r.result) setUploadedPhotos(prev => [...prev, r.result as string]); };
                              r.readAsDataURL(file);
                            });
                          }}
                        />
                        <label htmlFor="file-photo-uploader" className="cursor-pointer flex flex-col items-center gap-1.5 w-full">
                           <ImageIcon size={22} className="text-indigo-600 animate-pulse animate-bounce" />
                           <span className="text-xs font-extrabold text-[#3a35cc] hover:underline block">
                              Click to browse files
                           </span>
                           <span className="text-[9px] text-gray-400 block">
                              or drag and drop pictures of your fresh package here
                           </span>
                        </label>
                     </div>

                     {/* Preset selection shortcuts for easy visual testing */}
                     <div className="mt-3 flex flex-col gap-1.5">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Test Photo Shortcuts</span>
                       <div className="flex gap-2">
                         {[
                           { name: "🍅 Fresh Tomatoes", url: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=300" },
                           { name: "🥬 Fresh Greens", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=300" },
                           { name: "🍯 Pure Honey", url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300" }
                         ].map(preset => (
                           <button
                             type="button"
                             key={preset.name}
                             onClick={() => {
                               setUploadedPhotos(prev => [...prev, preset.url]);
                               triggerToast("Preset harvest quality photo added! 🍅");
                             }}
                             className="flex-1 bg-white border border-gray-200 py-2 rounded-xl text-[9px] font-bold text-center text-gray-600 hover:border-indigo-650 hover:bg-indigo-50/10 transition-all active:scale-95"
                           >
                             {preset.name}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Thumbnail list of uploaded files */}
                     {uploadedPhotos.length > 0 && (
                       <div className="mt-4 flex flex-wrap gap-2.5">
                         {uploadedPhotos.map((img, index) => (
                           <div key={index} className="relative h-14 w-14 rounded-xl overflow-hidden border border-gray-200 group">
                             <img src={img} className="w-full h-full object-cover text-xs" />
                             <button
                               type="button"
                               onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                               className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all"
                             >
                               Remove
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                 </div>
              </div>

              {/* Submission button tray */}
              <div className="fixed bottom-0 left-0 w-full p-4 bg-white/85 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto z-20 pb-safe pb-8">
                 <button 
                   type="button"
                   onClick={(e) => {
                     e.preventDefault();
                     if (reviewRating === 0) {
                       triggerToast("Please select at least a 1-star rating!");
                       return;
                     }
                     const newRev = {
                       id: Math.random().toString(36).substr(2, 9),
                       author: newReviewAuthor.trim() || "Anonymous Customer",
                       rating: reviewRating,
                       text: newReviewText.trim() || "Outstanding fresh quality and friendly carrier handover!",
                       photos: uploadedPhotos,
                       deliveryFeedback: selectedDeliveryFeedback,
                       timestamp: "Just now"
                     };
                     const updated = [newRev, ...shopReviews];
                     setShopReviews(updated);
                     try {
                       localStorage.setItem(`emakethe_shop_reviews_${id}`, JSON.stringify(updated));
                     } catch (err) {
                       console.warn("Storage warning:", err);
                     }
                     // Reset fields
                     setNewReviewAuthor("");
                     setNewReviewText("");
                     setReviewRating(0);
                     setSelectedDeliveryFeedback("Fast & Friendly");
                     setUploadedPhotos([]);
                     setShowReviewModal(false);
                     triggerToast("Siyabonga! Your trust score feedback and photos are live! 🌟");
                   }} 
                   className={`w-full font-bold py-4 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                     reviewRating > 0 
                       ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 active:scale-98' 
                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                   }`}
                 >
                    <Send size={18} /> Submit Dynamic Review
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
