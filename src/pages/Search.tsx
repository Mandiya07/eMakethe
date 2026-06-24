import { useState } from 'react';
import { Search as SearchIcon, Filter, ArrowLeft, Heart, ShoppingBag, Map, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../components/FirebaseProvider';

export default function Search() {
  const { products: PRODUCTS, sellers: SELLERS_LIST } = useFirebase();
  const SELLERS = SELLERS_LIST.reduce((acc, s) => ({...acc, [s.id]: s}), {} as Record<string, any>);
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceNotification, setVoiceNotification] = useState('');
  const [featuredProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('emakethe_featured_products');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const handleVoiceSearch = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setVoiceNotification('');
      return;
    }

    setIsVoiceActive(true);
    setVoiceNotification('Listening for speech...');

    // Try HTML5 Speech Recognition API
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setQuery(speechToText);
        setVoiceNotification(`Found: "${speechToText}"`);
        setIsVoiceActive(false);
        setTimeout(() => setVoiceNotification(''), 2000);
      };

      recognition.onerror = () => {
        runSimulation();
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      try {
        recognition.start();
      } catch (e) {
        runSimulation();
      }
    } else {
      runSimulation();
    }
  };

  const runSimulation = () => {
    const simulatedPhrases = ['Fresh Tomato', 'Local Tailor Check', 'Maize', 'Vegetables', 'Mbabane Stall'];
    const picked = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
    
    setVoiceNotification('Simulating Voice: "Listening..."');
    setTimeout(() => {
      setVoiceNotification(`Simulating Voice: "${picked}"`);
      setQuery(picked);
      setIsVoiceActive(false);
      setTimeout(() => setVoiceNotification(''), 2000);
    }, 1500);
  };
  
  const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));

  // Prioritize featured products to appear at the absolute top, followed by Business and Premium seller tiers
  const sortedResults = [...results].sort((a, b) => {
    // 1. Advertised/Featured listings get absolute top priority
    const aFeatured = featuredProductIds.includes(a.id);
    const bFeatured = featuredProductIds.includes(b.id);
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;

    // 2. Rank based on merchant tier verification levels (Priority search placement)
    const aSeller = SELLERS[a.sellerId];
    const bSeller = SELLERS[b.sellerId];
    const aLevel = aSeller?.verificationLevel || 'basic';
    const bLevel = bSeller?.verificationLevel || 'basic';

    if (aLevel === 'premium' && bLevel !== 'premium') return -1;
    if (aLevel !== 'premium' && bLevel === 'premium') return 1;

    if (aLevel === 'verified' && bLevel === 'basic') return -1;
    if (aLevel === 'basic' && bLevel === 'verified') return 1;

    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full relative pb-20">
      <div className="bg-white px-4 py-4 pt-6 shadow-sm border-b border-gray-100 sticky top-0 z-10 w-full flex items-center gap-3">
        <Link to="/" className="p-2 text-gray-600 active:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-4 py-2.5 relative">
          <SearchIcon size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search fresh produce, tailors..." 
            className="flex-1 bg-transparent outline-none text-gray-800 text-sm font-medium w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button 
            className={`absolute right-1.5 p-1.5 rounded-full transition-all min-w-[32px] min-h-[32px] flex items-center justify-center ${isVoiceActive ? 'bg-red-500 text-white animate-pulse scale-105' : 'bg-white text-gray-500 shadow-sm hover:bg-gray-100'}`}
            onClick={handleVoiceSearch}
            aria-label="Start voice search"
          >
             <Mic size={16} />
          </button>
        </div>
        <button className="bg-gray-100 p-2.5 rounded-xl text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Filter size={20} />
        </button>
      </div>

      {voiceNotification && (
        <div className="mx-4 mt-3 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center gap-2.5 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
          <p className="text-xs font-bold text-indigo-700 font-display">{voiceNotification}</p>
        </div>
      )}

      <div className="px-4 py-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-800">
            {query ? `Results for "${query}"` : "Suggested for you"}
          </h2>
          <span className="text-xs text-gray-500 font-medium">{sortedResults.length} items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedResults.map(product => {
            const seller = SELLERS[product.sellerId];
            if (!seller) return null;
            const isFeatured = featuredProductIds.includes(product.id);
            return (
              <Link 
                to={`/product/${product.id}`} 
                key={product.id} 
                className={`p-3 rounded-2xl shadow-sm border flex gap-3 transition-all relative overflow-hidden ${isFeatured ? 'bg-white border-pink-200/80 shadow-xs ring-1 ring-pink-100/30' : 'bg-white border-gray-100'}`}
              >
                <div className="relative shrink-0">
                  <img src={product.images[0]} className="w-24 h-24 rounded-xl object-cover" />
                  {isFeatured && (
                    <span className="absolute top-1 left-1 bg-pink-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider font-mono">
                       🔥 Promoted
                    </span>
                  )}
                </div>
                <div className="flex-1 py-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                    <button className="text-gray-300 hover:text-red-500" onClick={(e) => { e.preventDefault(); }}>
                      <Heart size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{seller.name} • {product.distance}</p>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="font-bold text-green-600 text-sm">{product.currency}{product.price}</span>
                      <span className="text-[10px] text-gray-500 ml-1">{product.unit}</span>
                    </div>
                    <button className="bg-green-50 text-green-600 p-1.5 rounded-lg" onClick={(e) => { e.preventDefault(); }}>
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
          
          {results.length === 0 && (
            <div className="text-center py-10">
              <SearchIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No items found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <Link 
        to="/map"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white font-bold text-[11px] px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-gray-700/50 hover:bg-black transition-colors z-20 whitespace-nowrap"
      >
        <Map size={14} /> View on Map
      </Link>
    </div>
  );
}
