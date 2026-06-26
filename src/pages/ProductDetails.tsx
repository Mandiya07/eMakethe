import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  MapPin, 
  Building, 
  Truck,
  ShieldCheck, 
  Heart, 
  Share2, 
  Play, 
  Image as ImageIcon, 
  DollarSign, 
  Locate, 
  X, 
  Star, 
  Lock, 
  Minus, 
  Plus,
  Volume2,
  VolumeX,
  CircleDot,
  CheckCircle,
  Clock,
  Send,
  Check,
  CheckCircle2,
  ThumbsUp,
  Copy,
  Sparkles
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { VerificationBadge } from '../components/VerificationBadge';
import { useFirebase } from '../components/FirebaseProvider';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, sellers } = useFirebase();
  const product = products.find(p => p.id === id);
  const seller = product ? sellers.find(s => s.id === product.sellerId) : null;

  if (!product || !seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <h2 className="text-xl font-bold mb-2">Item not found</h2>
        <p className="text-gray-500 mb-6">This item or its seller may have been removed.</p>
        <button onClick={() => navigate(-1)} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  // Synced merchant reviews and reputation calculator
  const shopReviews = (() => {
    try {
      if (!product) return [];
      const saved = localStorage.getItem(`emakethe_shop_reviews_${product.sellerId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  })();

  const mockReviewsCount = seller?.reviews || 0;
  const mock5Star = Math.round(mockReviewsCount * 0.82);
  const mock4Star = Math.round(mockReviewsCount * 0.14);
  const sellerReputationScore = (() => {
    const total5 = mock5Star + shopReviews.filter((r: any) => r.rating === 5).length;
    const total4 = mock4Star + shopReviews.filter((r: any) => r.rating === 4).length;
    const totalAll = mockReviewsCount + shopReviews.length;
    return totalAll > 0 ? Math.round(((total5 + total4) / totalAll) * 100) : 96;
  })();

  // --- LOCAL PERSISTENCE SOCIAL ENGINE ---
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const liked = localStorage.getItem('emakethe_liked_products');
      return liked && id ? JSON.parse(liked).includes(id) : false;
    } catch { return false; }
  });

  const [isFollowing, setIsFollowing] = useState(() => {
    try {
      if (!product) return false;
      const key = 'emakethe_followed_sellers';
      const followed = localStorage.getItem(key);
      return followed ? JSON.parse(followed).includes(product.sellerId) : false;
    } catch { return false; }
  });

  const [isRecommended, setIsRecommended] = useState(() => {
    try {
      if (!product) return false;
      const key = `emakethe_recommended_sellers`;
      const recom = localStorage.getItem(key);
      return recom ? JSON.parse(recom).includes(product.sellerId) : false;
    } catch { return false; }
  });

  // Local storage for custom written product reviews
  const [customReviews, setCustomReviews] = useState<{author: string, text: string, rating: number, timeStr: string, photos?: string[], deliveryFeedback?: string}[]>(() => {
    try {
      const key = `emakethe_product_reviews_${id}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  
  // Custom review states
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedDeliveryFeedback, setSelectedDeliveryFeedback] = useState<string>('Fast & Friendly');
  const [isDragging, setIsDragging] = useState(false);

  const [showWaMenu, setShowWaMenu] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(15);
  const [quantity, setQuantity] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<'courier' | 'trader' | 'pickup'>('courier');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleFavorite = () => {
    if (!id) return;
    try {
      const liked = localStorage.getItem('emakethe_liked_products');
      let likedArr = liked ? JSON.parse(liked) : [];
      if (likedArr.includes(id)) {
        likedArr = likedArr.filter((pid: string) => pid !== id);
        setIsFavorite(false);
        triggerToast("Removed from liked products 💔");
      } else {
        likedArr.push(id);
        setIsFavorite(true);
        triggerToast("Added to liked products! ❤️");
      }
      localStorage.setItem('emakethe_liked_products', JSON.stringify(likedArr));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFollow = () => {
    if (!product || !seller) return;
    try {
      const key = 'emakethe_followed_sellers';
      const followed = localStorage.getItem(key);
      let followedArr = followed ? JSON.parse(followed) : [];
      if (followedArr.includes(product.sellerId)) {
        followedArr = followedArr.filter((sid: string) => sid !== product.sellerId);
        setIsFollowing(false);
        triggerToast(`Unfollowed ${seller.name}`);
      } else {
        followedArr.push(product.sellerId);
        setIsFollowing(true);
        triggerToast(`Yebo! You are now following ${seller.name}! 🎉`);
      }
      localStorage.setItem(key, JSON.stringify(followedArr));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRecommend = () => {
    if (!product || !seller) return;
    try {
      const key = `emakethe_recommended_sellers`;
      const recom = localStorage.getItem(key);
      let recomArr = recom ? JSON.parse(recom) : [];
      if (recomArr.includes(product.sellerId)) {
        recomArr = recomArr.filter((sid: string) => sid !== product.sellerId);
        setIsRecommended(false);
        triggerToast(`Recommendation removed for ${seller.name}`);
      } else {
        recomArr.push(product.sellerId);
        setIsRecommended(true);
        triggerToast(`Siyabonga! You recommended ${seller.name}! ✨`);
      }
      localStorage.setItem(key, JSON.stringify(recomArr));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) {
      triggerToast("Please input your name and some comment reviews!");
      return;
    }
    const newEntry = {
      author: newReviewAuthor,
      text: newReviewText,
      rating: newReviewRating,
      photos: uploadedPhotos,
      deliveryFeedback: selectedDeliveryFeedback,
      timeStr: 'Just now'
    };
    const updated = [newEntry, ...customReviews];
    setCustomReviews(updated);
    try {
      localStorage.setItem(`emakethe_product_reviews_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    
    setNewReviewAuthor('');
    setNewReviewText('');
    setNewReviewRating(5);
    setUploadedPhotos([]);
    setSelectedDeliveryFeedback('Fast & Friendly');
    setShowReviewModal(false);
    triggerToast("Your quality product review is live! Siyabonga! 💬");
  };

  const handleCopyLink = () => {
    setCopyingLink(true);
    navigator.clipboard.writeText(window.location.href);
    triggerToast("eMakethe Product link copied in clipboard! Siyabonga! 📋");
    setTimeout(() => setCopyingLink(false), 2000);
  };

  const handleShareSocial = (platform: "whatsapp" | "facebook") => {
    if (!seller || !product) return;
    const shareText = `Checkout "${product.name}" (priced at E ${product.price}) from ${seller.name} on eMakethe, Eswatini! ${window.location.href}`;
    let shareUrl = "";
    if (platform === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    } else {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    }
    window.open(shareUrl, "_blank");
    triggerToast(`Siyabonga! Opening ${platform === "whatsapp" ? "WhatsApp" : "Facebook"} to share!`);
    setShowShareModal(false);
  };

  // Simulated video playback timeline
  useEffect(() => {
    let timer: any;
    if (showVideoPlayer && isVideoPlaying) {
      timer = setInterval(() => {
        setVideoProgress(p => {
          if (p >= 100) return 0;
          return p + 3;
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [showVideoPlayer, isVideoPlaying]);

  const handleWhatsApp = (type: 'chat' | 'product' | 'price' | 'delivery' | 'photos') => {
    let msg = `Hello, I saw your ${product.name} on MaketiConnect. Are they still available?`;
    if (type === 'product') {
      msg = `Hello, I saw your ${product.name} on MaketiConnect. I have a question about the product specifications, harvest freshness, and current batch size.`;
    } else if (type === 'price') {
      msg = `Hello, I saw your ${product.name} on MaketiConnect. I would like to order ${quantity} kg and negotiate the price from E${product.price} per kg.`;
    } else if (type === 'delivery') {
      msg = `Hello! I would like to purchase ${quantity} kg of your ${product.name} on MaketiConnect. I would like to request delivery options to my location.`;
    } else if (type === 'photos') {
      msg = `Hello! I saw your ${product.name} on MaketiConnect. Could you please send me some more photos or videos of the current harvest batch?`;
    }
    
    window.location.href = `https://wa.me/${seller.phone}?text=${encodeURIComponent(msg)}`;
    setShowWaMenu(false);
  };

  const getCaptionText = () => {
    if (videoProgress < 25) return "📍 Harvesting fresh tomatoes earlier this morning...";
    if (videoProgress < 55) return "✨ Notice the clean skin & organic field texture!";
    if (videoProgress < 80) return "📦 Standard sorted packs (1kg & 5kg bundles)";
    return "💯 Premium grade guaranteed! Click Share to order on WhatsApp!";
  };

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const totalPrice = product.price * quantity;
  const deliveryFee = selectedDelivery === 'courier' ? 50 : selectedDelivery === 'trader' ? 15 : 0;
  const grandTotal = totalPrice + deliveryFee;

  return (
    <div className="bg-gray-50 min-h-screen pb-28 relative w-full animate-in fade-in duration-300">
      
      {/* 1. PRODUCT PHOTOS CAROUSEL & MEDIA HEADER */}
      <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
        {/* Back and Utility Buttons */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-10 bg-slate-950/40 backdrop-blur-md text-white p-2.5 rounded-full border border-white/20 active:scale-90 transition-transform"
          id="product-back-btn"
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="absolute top-4 right-4 flex gap-2 z-10">
           <button 
             className="bg-slate-950/40 backdrop-blur-md p-2.5 rounded-full text-white border border-white/20 active:scale-90 transition-transform shadow-sm flex items-center justify-center hover:bg-slate-900/60"
             onClick={() => setShowShareModal(true)}
             title="Share Product"
           >
              <Share2 size={18} />
           </button>
           <button 
             onClick={handleToggleFavorite}
             className="bg-white text-slate-800 shadow-md p-2.5 rounded-full active:scale-95 transition-transform flex items-center justify-center hover:bg-gray-50"
             id="product-fav-btn"
           >
              <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500 stroke-red-500' : 'text-slate-400'} />
           </button>
        </div>

        {/* Main Image viewer */}
        <img 
          src={product.images[activeImgIdx]} 
          alt={`${product.name} view ${activeImgIdx + 1}`} 
          className="w-full h-full object-cover transition-all duration-300 transform scale-100 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* Bottom thumbnail row & Interactive video triggers */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
          <div className="flex gap-1.5 bg-black/35 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
             {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all duration-150 ${idx === activeImgIdx ? 'border-green-500 scale-105' : 'border-transparent opacity-75 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
             ))}
             
             {product.hasVideo && (
                <button 
                  onClick={() => setShowVideoPlayer(true)}
                  className="w-10 h-10 rounded-lg bg-[#25D366]/20 border border-[#25D366]/60 flex items-center justify-center relative backdrop-blur-md text-white group animate-pulse active:scale-95 transition-transform"
                  title="Play product live video proof"
                >
                  <Play size={14} className="fill-[#25D366] text-[#25D366]" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
                  </span>
                </button>
             )}
          </div>

          <div className="bg-black/45 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 font-mono">
            {activeImgIdx + 1} / {product.images.length}
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="px-4 py-4 w-full flex flex-col gap-4">
        
        {/* Core Product Title card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 w-full relative">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Fresh Farm Produce
                </span>
                <button 
                  onClick={handleToggleFavorite}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full transition-colors active:scale-95"
                  title="Like Product"
                >
                  <Heart size={10} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-red-500'} />
                  <span>{isFavorite ? "Liked" : "Like"} ({isFavorite ? 25 : 24})</span>
                </button>
              </div>
              <h1 className="text-xl font-black text-gray-800 font-display mt-2 leading-tight">{product.name}</h1>
              
              {/* Distance and Location tags */}
              <div className="flex flex-wrap items-center text-xs text-gray-500 font-medium mt-2 gap-2">
                 <span className="flex items-center gap-1 text-green-700 bg-green-100/50 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                   <CircleDot size={10} className="text-green-600 animate-pulse" /> 
                   Qty Available: {product.stock}kg
                 </span>
                 <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg text-[11px]">
                   <MapPin size={10} className="text-orange-500" /> {seller.location} ({product.distance})
                 </span>
              </div>
            </div>

            <div className="text-right ml-2 bg-green-50/75 px-3 py-2 rounded-2xl border border-green-100/60 shrink-0">
              <span className="text-xl font-black text-green-700 font-display block leading-none">{product.currency}{product.price}</span>
              <span className="text-[9px] text-green-600 uppercase font-black tracking-wider block mt-1">{product.unit}</span>
            </div>
          </div>
          
          <div className="w-full h-[1px] bg-gray-100 my-4"></div>

          {/* Interactive Quantity Selector */}
          <div className="flex justify-between items-center w-full">
             <div>
                <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Required Quantity</span>
                <span className="text-xs text-gray-600 font-bold">Adjust how much to order</span>
             </div>
             <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl gap-3 border border-gray-200/50">
                <button 
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200 active:scale-95 disabled:opacity-40 transition-all font-bold"
                >
                  <Minus size={14} />
                </button>
                <div className="w-10 text-center">
                  <span className="text-sm font-black text-gray-800 font-mono">{quantity}</span>
                  <span className="block text-[9px] text-gray-500 font-bold -mt-0.5">kg</span>
                </div>
                <button 
                  onClick={incrementQty}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200 active:scale-95 disabled:opacity-40 transition-all font-bold"
                >
                  <Plus size={14} />
                </button>
             </div>
          </div>

          <div className="w-full h-[1px] bg-gray-100 my-4"></div>

          {/* Order Summary Preview */}
          <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
            <div className="text-gray-500 font-medium">Subtotal ({quantity} kg)</div>
            <div className="text-right">
              <span className="text-sm font-black text-gray-800">{product.currency}{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <button 
            onClick={() => setShowWaMenu(true)} 
            className="bg-[#25D366] text-white py-4 px-3 rounded-2xl font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/10 text-xs uppercase tracking-wider hover:bg-[#20bd5a] transition-all active:scale-[0.97]"
            id="whatsapp-trigger"
          >
            <MessageCircle size={18} />
            Contact Seller
          </button>
          
          <Link 
            to={`/checkout/${product.id}?qty=${quantity}&del=${selectedDelivery}`} 
            className="bg-green-600 text-white py-4 px-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-green-600/10 flex items-center justify-center gap-1 hover:bg-green-700 transition-all active:scale-[0.97]"
          >
            Buy Now E{grandTotal.toFixed(2)}
          </Link>
        </div>

        <div className="flex flex-col gap-1 items-center justify-center pt-0.5">
           <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium">
             <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500 font-bold" /> Buyer Protection</span>
             <span className="flex items-center gap-1"><Lock size={12} className="text-blue-500 font-bold" /> Secure Escrow Lock</span>
           </div>
        </div>

        {/* 3. PRODUCT DESCRIPTION */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 w-full relative">
          <h3 className="font-bold text-gray-800 mb-2.5 text-sm uppercase tracking-wide flex items-center gap-1.5">
             📋 Product Description
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            {product.description}
          </p>
          {product.hasVideo && (
            <div className="mt-3.5 flex items-center gap-2 p-2.5 bg-green-50 rounded-xl border border-green-100">
               <span className="text-sm">📹</span>
               <div className="flex-1">
                 <p className="text-[10px] font-bold text-green-800">Video Demonstration Included</p>
                 <p className="text-[9px] text-green-600">The seller provided live visual evidence of this harvest batch. Tap the Play button on the photo carousel above to check.</p>
               </div>
            </div>
          )}
        </div>

        {/* 4. DYNAMIC DELIVERY OPTIONS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 w-full">
          <div className="flex justify-between items-center mb-3">
             <div>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                   🏍️ Delivery & Handover Options
                </h3>
                <p className="text-[10px] text-gray-500 font-medium">Configure how you will receive your goods</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setSelectedDelivery('courier')}
              className={`p-3 rounded-2xl border text-left transition-all flex justify-between items-center ${selectedDelivery === 'courier' ? 'border-green-600 bg-green-50/25 shadow-sm' : 'border-gray-100 bg-slate-50/50 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedDelivery === 'courier' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck size={14} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">Match Local Moto Rider</p>
                  <p className="text-[9px] text-gray-500 leading-normal">Fast escrowed booking with live tracking in {seller.location}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-mono font-black text-green-700">E 15.00</span>
                <span className="text-[8px] font-bold text-gray-400 block uppercase">15-30 mins</span>
              </div>
            </button>

            <button 
              onClick={() => setSelectedDelivery('trader')}
              className={`p-3 rounded-2xl border text-left transition-all flex justify-between items-center ${selectedDelivery === 'trader' ? 'border-green-600 bg-green-50/25 shadow-sm' : 'border-gray-100 bg-slate-50/50 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedDelivery === 'trader' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Building size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">Trader Direct Run</p>
                  <p className="text-[9px] text-gray-500 leading-normal">Bulk stock dropped off directly by Store's farm team</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-mono font-black text-green-700">E 8.00</span>
                <span className="text-[8px] font-bold text-gray-400 block uppercase">Same Day</span>
              </div>
            </button>

            <button 
              onClick={() => setSelectedDelivery('pickup')}
              className={`p-3 rounded-2xl border text-left transition-all flex justify-between items-center ${selectedDelivery === 'pickup' ? 'border-green-600 bg-green-50/25 shadow-sm' : 'border-gray-100 bg-slate-50/50 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedDelivery === 'pickup' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">In-Person Market Handover</p>
                  <p className="text-[9px] text-gray-500 leading-normal">Collect at the trader's central stall in {seller.location}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-gray-500 uppercase">Free</span>
                <span className="text-[8px] font-bold text-gray-400 block uppercase">No Fee</span>
              </div>
            </button>
          </div>
        </div>

      {/* C. TOAST SUCCESS NOTIFICATIONS */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom duration-300 max-w-sm mx-auto">
           <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-green-500/25 text-green-400 flex items-center justify-center shrink-0">
                <Check size={14} className="stroke-[3]" />
              </div>
              <p className="text-xs font-bold leading-normal font-sans">{toastMessage}</p>
           </div>
        </div>
      )}

      {/* D. SOCIAL SHARING SELECTION MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 w-full h-full max-w-md mx-auto">
           <div className="bg-white w-full rounded-t-[36px] rounded-b-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
              <div className="flex justify-between items-center mb-5">
                 <div>
                    <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-base font-display">
                       <Share2 className="text-indigo-600 animate-pulse" /> Share Fresh Produce
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide font-mono mt-0.5">Community Commerce Options</p>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setShowShareModal(false)} 
                   className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                 >
                    <X size={16} />
                 </button>
              </div>

              <div className="flex flex-col gap-3.5 mb-2">
                 {/* Copy Link button */}
                 <button 
                   type="button"
                   onClick={handleCopyLink} 
                   className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-indigo-50/45 rounded-2xl text-left border border-gray-100 transition-all active:scale-[0.98] group"
                 >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                       <Copy size={16} />
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                         Copy Marketplace Link
                         {copyingLink && <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full uppercase">Copied ✓</span>}
                       </p>
                       <p className="text-[10px] text-gray-550 leading-tight">Copy this product link to paste inside chats or statuses.</p>
                    </div>
                 </button>

                 {/* WhatsApp Group Share */}
                 <button 
                   type="button"
                   onClick={() => handleShareSocial("whatsapp")} 
                   className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-green-50/45 rounded-2xl text-left border border-gray-100 transition-all active:scale-[0.98] group"
                 >
                    <div className="w-10 h-10 rounded-xl bg-green-50 group-hover:bg-green-100 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                       <MessageCircle size={16} className="text-[#25D366]" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Share to WhatsApp Status / Group</p>
                       <p className="text-[10px] text-gray-550 leading-tight">Post this Swazi harvest directly to your local family status feed.</p>
                    </div>
                 </button>

                 {/* Facebook Community Groups */}
                 <button 
                   type="button"
                   onClick={() => handleShareSocial("facebook")} 
                   className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-blue-50/45 rounded-2xl text-left border border-gray-100 transition-all active:scale-[0.98] group"
                 >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                       <ThumbsUp size={16} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Share to Facebook Marketplace</p>
                       <p className="text-[10px] text-gray-550 leading-tight">Publish standard listing template into domestic buying forums.</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* E. PRODUCT COMMENT & REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-xs p-4 w-full h-full max-w-md mx-auto">
           <form 
              onSubmit={handleSubmitReview}
              className="bg-white w-full rounded-t-[36px] rounded-b-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto flex flex-col w-full pb-10"
           >
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-1 -mt-1 border-b border-gray-100">
                 <div>
                    <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-base font-display">
                       <Sparkles size={18} className="text-indigo-600 animate-pulse" /> Leave a Review / Comment
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide font-mono">Let others know about quality</p>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setShowReviewModal(false)} 
                   className="bg-gray-150 p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                 >
                    <X size={16} />
                 </button>
              </div>

              <div className="flex flex-col gap-4 text-left">
                 <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 font-mono">Commenter Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Nomsa Dlamini"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-xs focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-800 transition-all font-sans"
                    />
                 </div>

                 <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2 font-mono">Assigned Star Rating</label>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 focus:outline-none hover:scale-125 active:scale-95 transition-transform"
                          >
                             <Star size={28} className={star <= newReviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-black text-gray-550 uppercase tracking-widest block mb-2 font-mono">Your Harvest Comment</label>
                    <textarea 
                      required
                      placeholder="Mention crop quality, packaging size, or trader hand-off speed..."
                      rows={3}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 text-xs focus:border-indigo-500 focus:bg-white outline-none resize-none transition-all font-semibold leading-relaxed text-gray-800 font-sans"
                    />
                 </div>

                 {/* Delivery options */}
                 <div>
                    <label className="text-xs font-black text-gray-550 uppercase tracking-widest block mb-2 font-mono">Delivery Feedback</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: "Fast & Friendly", label: "Fast & Friendly" },
                         { id: "On Time", label: "On Time" },
                         { id: "Delayed", label: "Delayed" },
                         { id: "Missing / Issues", label: "Issues / Missing" }
                       ].map((opt) => {
                         const current = selectedDeliveryFeedback === opt.id;
                         return (
                           <button
                             type="button"
                             key={opt.id}
                             onClick={() => setSelectedDeliveryFeedback(opt.id)}
                             className={`p-3 rounded-2xl border text-left transition-all ${
                               current 
                                 ? 'border-emerald-600 bg-emerald-50/20 text-emerald-950 font-extrabold' 
                                 : 'border-gray-150 bg-white hover:bg-slate-50'
                             }`}
                           >
                             <span className="text-xs font-bold block">{opt.label}</span>
                           </button>
                         );
                       })}
                    </div>
                 </div>

                 {/* Drag and Drop Uploader */}
                 <div>
                    <label className="text-xs font-black text-gray-550 uppercase tracking-widest block mb-2 font-mono">Produce Photos</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const files = Array.from(e.dataTransfer.files) as File[];
                        files.forEach((file: File) => {
                          if (!file.type.startsWith('image/')) return;
                          const r = new FileReader();
                          r.onload = () => { if (r.result) setUploadedPhotos(prev => [...prev, r.result as string]); };
                          r.readAsDataURL(file);
                        });
                      }}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isDragging ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-200 bg-slate-50 hover:bg-slate-100/50'
                      }`}
                    >
                       <input 
                         type="file" 
                         id="product-photo-uploader" 
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
                       <label htmlFor="product-photo-uploader" className="cursor-pointer flex flex-col items-center gap-1">
                          <ImageIcon size={18} className="text-indigo-600 animate-bounce" />
                          <span className="text-xs font-bold text-indigo-700 hover:underline">Click to upload harvest photos</span>
                          <span className="text-[9px] text-gray-400">or drop them here</span>
                       </label>
                    </div>

                    {/* Presets */}
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPhotos(prev => [...prev, "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=300"]);
                          triggerToast("🍅 Tomato quality card loaded!");
                        }}
                        className="bg-white border border-gray-150 px-2 py-1.5 rounded-lg text-[9px] font-bold text-gray-500 hover:border-indigo-600 transition-all font-sans"
                      >
                        🍅 Tomatoes Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPhotos(prev => [...prev, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=300"]);
                          triggerToast("🥬 Spinaches/Greens quality card loaded!");
                        }}
                        className="bg-white border border-gray-150 px-2 py-1.5 rounded-lg text-[9px] font-bold text-gray-500 hover:border-indigo-600 transition-all font-sans"
                      >
                        🥬 Greens Preset
                      </button>
                    </div>

                    {uploadedPhotos.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {uploadedPhotos.map((img, index) => (
                          <div key={index} className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                            <img src={img} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-semibold opacity-0 hover:opacity-100 transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all mt-2 font-mono flex items-center justify-center gap-1.5"
                 >
                    <Send size={14} /> Submit Product Review
                 </button>
              </div>
           </form>
        </div>
      )}

        {/* 5. SELLER DETAILS CARD */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3.5 w-full">
           <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
              🧑‍🌾 Seller Information
           </h3>
           <Link to={`/shop/${seller.id}`} className="flex items-center justify-between w-full hover:bg-slate-50 p-2.5 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-3">
              <img src={seller.logoUrl} className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-black text-sm text-gray-800">{seller.name}</p>
                  <VerificationBadge level={seller.verificationLevel} showText={true} showDetails={true} />
                </div>
                <div className="flex items-center text-[11px] text-gray-500 gap-1 mt-0.5">
                  <MapPin size={10} className="text-orange-500" /> {seller.location}
                </div>
                <div className="flex items-center text-[11px] font-bold text-yellow-600 gap-1.5 mt-0.5 font-mono flex-wrap">
                  <span className="flex items-center gap-0.5">
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    {seller.rating}
                  </span>
                  <span className="text-gray-400 font-normal">({isRecommended ? seller.reviews + 1 : seller.reviews} reviews)</span>
                  <span className="text-gray-350">·</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold font-sans">
                    🛡️ {sellerReputationScore}% Trust
                  </span>
                  <span className="text-gray-350">·</span>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md font-bold lowercase tracking-normal font-sans">
                    {isFollowing ? "57 followers" : "56 followers"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0">
              View Shop
            </div>
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-1">
             <button 
               onClick={handleToggleFollow}
               className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${isFollowing ? 'bg-indigo-600 text-white border-transparent shadow-sm' : 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border-indigo-100/50'}`}
             >
                {isFollowing ? <Check size={14} className="stroke-[3]" /> : null}
                {isFollowing ? "Following" : "Follow Seller"}
             </button>
             <button 
               onClick={handleToggleRecommend}
               className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${isRecommended ? 'bg-[#FF8A00] text-white border-transparent shadow-sm' : 'bg-orange-50 hover:bg-orange-100/80 text-orange-700 border-orange-100/50'}`}
             >
                {isRecommended ? <Star size={14} className="fill-white text-white" /> : <ThumbsUp size={12} />}
                {isRecommended ? "Recommended" : `Recommend ${seller.name.split("'")[0]}`}
             </button>
          </div>
        </div>

        {/* 6. PRODUCT REVIEWS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              Product Reviews & Comments ({12 + customReviews.length})
            </h3>
            <span className="text-green-600 text-[10px] font-black uppercase">Recent Feedback</span>
          </div>
          
          <div className="flex flex-col gap-3.5 mb-3 max-h-[350px] overflow-y-auto pr-1">
             {/* Render Custom dynamic reviews uploaded locally */}
             {customReviews.map((rev, idx) => (
                <div key={`custom-${idx}`} className="flex flex-col gap-2.5 p-3 bg-indigo-50/20 rounded-2xl border border-indigo-500/10 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                   <div className="flex gap-2.5 items-start">
                     <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 font-display">
                        {rev.author.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                              {rev.author}
                              <span className="bg-indigo-50 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Commenter</span>
                           </span>
                           <span className="text-[9px] text-gray-400 font-bold">{rev.timeStr}</span>
                        </div>
                        <div className="flex items-center text-yellow-400 my-0.5">
                           {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={10} 
                                className={`${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                              />
                           ))}
                        </div>
                        <p className="text-xs text-gray-700 mt-0.5 leading-relaxed font-semibold">{rev.text}</p>
                     </div>
                   </div>

                   {/* Attached Photos */}
                   {rev.photos && rev.photos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-10">
                        {rev.photos.map((img, photoIdx) => (
                          <div key={photoIdx} className="bg-gray-50 h-12 w-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                   )}

                   {/* Delivery feedback tag */}
                   {rev.deliveryFeedback && (
                      <div className="pl-10 flex gap-1 items-center">
                         <span className="text-[8px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-extrabold uppercase border border-emerald-100/50">
                           🚚 {rev.deliveryFeedback}
                         </span>
                      </div>
                   )}
                </div>
             ))}

             <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">S</div>
                <div className="flex-1">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">John</span>
                      <span className="text-[10px] text-gray-500">· 2h ago</span>
                   </div>
                   <div className="flex items-center text-yellow-400 my-0.5">
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                   </div>
                   <p className="text-xs text-gray-600 mt-0.5">Are these still fresh? Looking to buy bulk. Fast delivery last time!</p>
                </div>
             </div>
             
             <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 font-sans">N</div>
                <div className="flex-1">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">Nandi</span>
                      <span className="text-[10px] text-gray-500">· 1d ago</span>
                   </div>
                   <div className="flex items-center text-yellow-400 my-0.5 font-sans">
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="fill-yellow-400 text-yellow-400" />
                     <Star size={10} className="text-gray-300" />
                   </div>
                   <p className="text-xs text-gray-600 mt-0.5">Bought some yesterday, very good quality!</p>
                </div>
             </div>
          </div>
          
          <button 
            onClick={() => setShowReviewModal(true)}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold mt-2 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <MessageCircle size={14} /> Write Product Review or Comment
          </button>
        </div>

      </div>

      {/* A. PRODUCT VIDEO PLAYER MODAL */}
      {showVideoPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 w-full h-full max-w-md mx-auto">
          <div className="bg-slate-950 w-full rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col h-[75vh]">
             {/* Header */}
             <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-white">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <p className="text-[10px] font-bold uppercase tracking-wider font-mono">Live Batch Stream</p>
                </div>
                <button 
                  onClick={() => setShowVideoPlayer(false)}
                  className="bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/10"
                >
                  <X size={16} />
                </button>
             </div>

             {/* Dynamic Video View (Simulated Live Cam Stream) */}
             <div className="flex-1 w-full bg-gradient-to-tr from-green-950/40 via-emerald-950/20 to-lime-950/25 relative flex items-center justify-center overflow-hidden">
                
                {/* Background Unsplash Harvest Image with visual effect to mimic shaky handcam */}
                <img 
                  src={product.images[0]} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${isVideoPlaying ? 'scale-105 animate-pulse' : 'scale-100 opacity-80'}`} 
                  alt="Video frame" 
                />
                
                {/* Visual filter overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 pointer-events-none"></div>

                {/* Cam grid lines overlay helper */}
                <div className="absolute inset-4 border border-white/5 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between text-[9px] text-white/40 font-mono">
                    <span>RAW 9:16</span>
                    <span>1080P 30FPS</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-white/40 font-mono">
                    <span>MOMOBILE ISO 100</span>
                    <span>BAT 98%</span>
                  </div>
                </div>

                {/* Big play indicator */}
                {!isVideoPlaying && (
                  <button 
                    onClick={() => setIsVideoPlaying(true)} 
                    className="absolute bg-green-500/90 text-white p-6 rounded-full shadow-2xl hover:scale-105 transition-transform"
                  >
                    <Play size={28} className="fill-white" />
                  </button>
                )}

                {/* Closed caption message scrolling at bottom */}
                <div className="absolute bottom-16 left-4 right-4 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                   <div className="flex items-center gap-1.5 mb-1 bg-green-500/20 text-green-300 w-fit px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                     <CheckCircle size={10} /> Trader Verified Proof
                   </div>
                   <p className="text-xs text-white font-bold leading-normal">{getCaptionText()}</p>
                </div>
             </div>

             {/* Video Controls Bar */}
             <div className="p-4 bg-slate-950 border-t border-white/5 shrink-0 flex flex-col gap-3">
                {/* Progress bar */}
                <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${videoProgress}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => setIsVideoPlaying(!isVideoPlaying)} 
                       className="text-white hover:text-green-400 font-bold text-xs"
                     >
                       {isVideoPlaying ? "PAUSE" : "PLAY"}
                     </button>
                     <button 
                       onClick={() => setIsVideoMuted(!isVideoMuted)} 
                       className="text-white hover:text-green-400"
                     >
                       {isVideoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                     </button>
                  </div>
                  <button 
                    onClick={() => {
                      setShowVideoPlayer(false);
                      handleWhatsApp('photos');
                    }}
                    className="bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md hover:bg-[#20bd5a]"
                  >
                    <MessageCircle size={12} /> Share & Chat on WP
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* B. WHATSAPP ACTIONS BOTTOM SHEET */}
      {showWaMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 w-full h-full max-w-md mx-auto">
           <div className="bg-white w-full rounded-t-[36px] rounded-b-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <div>
                    <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-base">
                       <MessageCircle className="text-[#25D366] fill-[#25D366]/10" /> Ask Trader (WhatsApp)
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium">Inquiry templates customized for {quantity} kg order</p>
                 </div>
                 <button onClick={() => setShowWaMenu(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-500 transition-colors">
                   <X size={16} />
                 </button>
              </div>
              
              <div className="flex flex-col gap-2">
                 <button onClick={() => handleWhatsApp('chat')} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-2xl text-left border border-gray-200/40 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center shrink-0">
                       <MessageCircle size={16} className="text-[#25D366]" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Chat Seller</p>
                       <p className="text-[10px] text-gray-500">"Hello, I saw your tomatoes on MaketiConnect. Are they still available?"</p>
                    </div>
                 </button>

                 <button onClick={() => handleWhatsApp('product')} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-2xl text-left border border-gray-200/40 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center shrink-0">
                       <CircleDot size={16} className="text-teal-600" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Ask About Product</p>
                       <p className="text-[10px] text-gray-500">Inquire about quality, harvest freshness, and spec sheets.</p>
                    </div>
                 </button>

                 <button onClick={() => handleWhatsApp('price')} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-2xl text-left border border-gray-200/40 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0">
                       <DollarSign size={16} className="text-blue-500" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Negotiate Price</p>
                       <p className="text-[10px] text-gray-500">"I would like to purchase {quantity} kg and negotiate the price..."</p>
                    </div>
                 </button>

                 <button onClick={() => handleWhatsApp('delivery')} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-2xl text-left border border-gray-200/40 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center shrink-0">
                       <Truck size={16} className="text-orange-500" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Request Delivery</p>
                       <p className="text-[10px] text-gray-500">Inquire about direct dispatch routes or local moto rider fees.</p>
                    </div>
                 </button>

                 <button onClick={() => handleWhatsApp('photos')} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-2xl text-left border border-gray-200/40 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center shrink-0">
                       <ImageIcon size={16} className="text-purple-500" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-800">Request More Photos</p>
                       <p className="text-[10px] text-gray-500">Ask the trader for live photos or video proofs of current field crops.</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
