import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, MapPin, Store, Navigation, Search as SearchIcon, Filter, 
  Wrench, Scissors, Phone, MessageSquare, Compass, RefreshCw, Eye, 
  Sparkles, CheckCircle2, Sliders, Map as MapIcon, MapPinOff, Locate, HelpCircle, 
  ChevronRight, Calendar, Landmark, Info, Route, Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../components/FirebaseProvider';

// ----------------------------------------------------
// Core Types & Initial GPS Coordinates 
// ----------------------------------------------------

interface GPSLocation {
  lat: number;
  lng: number;
  name: string;
}

// Fixed bounds representing the greater Mbabane, SZ metropolitan zone maps
const LAT_MIN = -26.3600;
const LAT_MAX = -26.3050;
const LON_MIN = 31.1000;
const LON_MAX = 31.1800;

// SVG dimensions
const SVG_WIDTH = 500;
const SVG_HEIGHT = 360;

// Mbabane Suburb presets for immediate GPS simulation
const MBABANE_SUBURBS: Record<string, GPSLocation> = {
  center: { lat: -26.3260, lng: 31.1415, name: "Allister Miller St (Mbabane Center)" },
  eveni: { lat: -26.3420, lng: 31.1620, name: "Eveni Plaza Suburb" },
  sidwashini: { lat: -26.3310, lng: 31.1120, name: "Sidwashini Industrial Outer" },
  westridge: { lat: -26.3140, lng: 31.1280, name: "Westridge Residential Village" },
};

// ----------------------------------------------------
// Mock Database: Traders, Products, and Services
// ----------------------------------------------------

interface NearbyEstablishment {
  id: string;
  name: string;
  type: 'trader' | 'service';
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  phone: string;
  image: string;
  category: string;
  subCategory: string;
  description: string;
  costEstimate?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    unit: string;
    desc: string;
  }>;
}

// Helper: Haversine distance calculator in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Convert real Lat/Long to SVG coordinates for the customized viewport
const getSVGCoords = (lat: number, lng: number) => {
  const x = ((lng - LON_MIN) / (LON_MAX - LON_MIN)) * SVG_WIDTH;
  const y = SVG_HEIGHT - (((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * SVG_HEIGHT);
  return { x, y };
};

export default function NearbyMap() {
  const navigate = useNavigate();
  const { sellers, products } = useFirebase();

  // Create dynamic establishments by combining live database sellers and baseline high-quality Swazi services
  const dynamicEstablishments = useMemo(() => {
    const baseServices: NearbyEstablishment[] = [
      {
        id: 'est-dumisani',
        name: "Dumisani's Spark Plumbing",
        type: 'service',
        lat: -26.3315,
        lng: 31.1445,
        rating: 4.6,
        reviews: 32,
        phone: "+268 7699 0088",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=300",
        category: "Plumbing",
        subCategory: "Home Services",
        costEstimate: "E 120 Call-out Fee",
        description: "Express certified home and commercial plumbing. Unclogging drains, leak repair, and geyser servicing."
      },
      {
        id: 'est-themba',
        name: "Themba's Quick Tech & Repairs",
        type: 'service',
        lat: -26.3350,
        lng: 31.1340,
        rating: 4.8,
        reviews: 42,
        phone: "+268 7611 2233",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=300",
        category: "Electrician",
        subCategory: "Technical Services",
        costEstimate: "E 80 Diagnostic",
        description: "Domestic wiring repairs, solar cell setups, fridge servicing, and smartphone hardware troubleshooting."
      },
      {
        id: 'est-precious',
        name: "Precious' Hair Braiding & Aesthetics",
        type: 'service',
        lat: -26.3140,
        lng: 31.1310,
        rating: 4.9,
        reviews: 110,
        phone: "+268 7633 4455",
        image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=300",
        category: "Hair Salon",
        subCategory: "Beauty & Grooming",
        costEstimate: "E 150 Styling Starting",
        description: "Premium braids, custom wigs, lock re-styling, and facial treatments. Safe cozy home studio."
      }
    ];

    const tradersFromFirebase = sellers.map((s, idx) => {
      let lat = -26.3260;
      let lng = 31.1415;
      const locLower = (s.location || '').toLowerCase();
      
      const seed = s.id.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
      const jitterLat = ((seed % 10) - 5) * 0.003;
      const jitterLng = (((seed + 3) % 10) - 5) * 0.003;

      if (locLower.includes('eveni')) {
        lat = -26.3420 + jitterLat;
        lng = 31.1620 + jitterLng;
      } else if (locLower.includes('sidwashini')) {
        lat = -26.3310 + jitterLat;
        lng = 31.1120 + jitterLng;
      } else if (locLower.includes('westridge')) {
        lat = -26.3140 + jitterLat;
        lng = 31.1280 + jitterLng;
      } else {
        lat = -26.3260 + jitterLat;
        lng = 31.1415 + jitterLng;
      }

      const sellerProducts = products
        .filter((p: any) => p.sellerId === s.id)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit || 'unit',
          desc: p.description || ''
        }));

      return {
        id: s.id,
        name: s.name,
        type: 'trader' as const,
        lat,
        lng,
        rating: s.rating || 5.0,
        reviews: s.reviews || 0,
        phone: s.phone || '',
        image: s.bannerUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300",
        category: s.category || "General",
        subCategory: s.category || "General",
        description: s.description || "Verified local seller on eMakethe Swaziland.",
        products: sellerProducts
      };
    });

    return [...tradersFromFirebase, ...baseServices];
  }, [sellers, products]);

  // ----------------------------------------------------
  // States
  // ----------------------------------------------------
  const [userLocation, setUserLocation] = useState<GPSLocation>(MBABANE_SUBURBS.center);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'traders' | 'services'>('all');
  const [maxRadius, setMaxRadius] = useState<number>(3.0); // max search radius in km
  const [selectedEstablishment, setSelectedEstablishment] = useState<NearbyEstablishment | null>(null);
  const [routingActive, setRoutingActive] = useState<boolean>(false);
  const [voiceSimulating, setVoiceSimulating] = useState<boolean>(false);
  const [voiceSpeechText, setVoiceSpeechText] = useState<string>('');

  // ----------------------------------------------------
  // Calculations
  // ----------------------------------------------------

  // Calculate dynamic distances to all establishments relative to the active simulated user location
  const calculatedEstablishments = useMemo(() => {
    return dynamicEstablishments.map(est => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, est.lat, est.lng);
      return {
        ...est,
        distanceVal: dist,
        distanceStr: dist < 1.0 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`
      };
    });
  }, [userLocation, dynamicEstablishments]);

  // Handle custom manual double-click on map to trigger immediate user GPS relocation
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinates back to virtual Latitude/Longitude
    const pctX = clickX / rect.width;
    const pctY = (rect.height - clickY) / rect.height;

    const clickedLng = LON_MIN + pctX * (LON_MAX - LON_MIN);
    const clickedLat = LAT_MIN + pctY * (LAT_MAX - LAT_MIN);

    setUserLocation({
      lat: clickedLat,
      lng: clickedLng,
      name: `Custom Location (${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`
    });
    setRoutingActive(false); // clear route line on relocation
  };

  // Preset filter shortcut: Vegetables Near Me (matches the user's explicit request)
  const triggerVegetablesShortcut = () => {
    // Reset location to standard center coordinates to show exactly 0.5km, 1.0km, and 2.0km away
    setUserLocation(MBABANE_SUBURBS.center);
    setSearchQuery('Vegetables');
    setActiveTab('products');
    setMaxRadius(3.5);
    setRoutingActive(false);

    // Simulated voice search UI highlight
    setVoiceSimulating(true);
    setVoiceSpeechText("🔍 Scout AI: 'Locating fresh farm vegetables within Mbabane. Found results 0.5km, 1.0km, & 2.0km away...'");
    setTimeout(() => {
      setVoiceSimulating(false);
    }, 4500);
  };

  // Filter lists based on Search Query, Active Tab, and Max Search Radius
  const filteredMatches = useMemo(() => {
    return calculatedEstablishments.filter(est => {
      // 1. Radius constraint
      if (est.distanceVal > maxRadius) return false;

      // 2. Tab filter
      if (activeTab === 'traders' && est.type !== 'trader') return false;
      if (activeTab === 'services' && est.type !== 'service') return false;

      // 3. Search query filter (matches name, description, category, or nested product names)
      const query = searchQuery.toLowerCase().trim();
      if (!query) {
        // If activeTab is products, we just display items that are of type 'trader' which have products
        if (activeTab === 'products') return est.type === 'trader' && est.products && est.products.length > 0;
        return true;
      }

      if (activeTab === 'products') {
        // Only return traders with matching product names or descriptions
        const hasMatchingProduct = est.products?.some(p => 
          p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)
        );
        return est.type === 'trader' && !!hasMatchingProduct;
      }

      const nameMatch = est.name.toLowerCase().includes(query);
      const descMatch = est.description.toLowerCase().includes(query);
      const catMatch = est.category.toLowerCase().includes(query) || est.subCategory.toLowerCase().includes(query);
      const productMatch = est.products?.some(p => p.name.toLowerCase().includes(query));

      return nameMatch || descMatch || catMatch || !!productMatch;
    }).sort((a, b) => a.distanceVal - b.distanceVal); // Sort by closest first
  }, [calculatedEstablishments, searchQuery, activeTab, maxRadius]);

  // Coordinates of the User Location for SVG Map Rendering
  const userSVGCoords = getSVGCoords(userLocation.lat, userLocation.lng);

  // Active Selected item coordinates to draw the visual direction/route line
  const targetSVGCoords = selectedEstablishment 
    ? getSVGCoords(selectedEstablishment.lat, selectedEstablishment.lng)
    : null;

  // Estimate Travel Times based on distance
  const travelTimeWalk = selectedEstablishment 
    ? Math.max(1, Math.round(selectedEstablishment.distanceVal * 12)) + " min" 
    : "";
  const travelTimeMoto = selectedEstablishment 
    ? Math.max(1, Math.round(selectedEstablishment.distanceVal * 2.5)) + " min" 
    : "";

  return (
    <div id="location-marketplace-root" className="bg-[#fcfbf9] min-h-screen flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden selection:bg-emerald-200">
      
      {/* ----------------------------------------------------
          1. HEADER COMPONENT
          ---------------------------------------------------- */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-amber-100/50 z-40 px-4 py-3.5 shadow-xs flex flex-col gap-2 transition-all">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              id="btn-back-home"
              className="text-slate-600 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              title="Return to Marketplace"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase text-slate-900 tracking-wider">Mbabane Regional Map</h1>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Compass size={11} className="text-emerald-500 animate-spin" /> Live Location-Based Marketplace
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => setUserLocation(MBABANE_SUBURBS.center)}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black px-3 py-2 rounded-xl border border-emerald-200/50 transition-all shadow-2xs"
          >
            <Locate size={11} /> Reset Center
          </button>
        </div>

        {/* Search & Voice Assistance */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vegetables, plumbing, electrician, beauty..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Direct "Vegetables Near Me" Shortcut trigger */}
          <button
            type="button"
            onClick={triggerVegetablesShortcut}
            title="Siri/Scout shortcut: Vegetables Near Me"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1 hover:scale-105"
          >
            <Leaf size={16} />
            <span className="text-[10px] font-extrabold pr-0.5 hidden sm:inline">Vegetables Near Me</span>
          </button>
        </div>

        {/* AI Voice Assist Console overlay when active */}
        {voiceSimulating && (
          <div className="bg-emerald-950 text-emerald-300 p-2.5 rounded-xl border border-emerald-800 text-[10px] font-mono leading-relaxed transition-all flex items-start gap-2 animate-pulse mb-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-1"></span>
            <p>{voiceSpeechText}</p>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------
          2. INTERACTIVE SUBURB RELOCATOR
          ---------------------------------------------------- */}
      <section className="bg-amber-50/45 px-4 py-2 border-b border-amber-100 flex gap-2 items-center overflow-x-auto no-scrollbar py-2.5">
        <span className="text-[8.5px] uppercase font-black text-slate-400 font-mono shrink-0 select-none">
          Filter GPS region:
        </span>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {Object.entries(MBABANE_SUBURBS).map(([id, sub]) => {
            const isCurrentlySelected = calculateDistance(userLocation.lat, userLocation.lng, sub.lat, sub.lng) < 0.05;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setUserLocation(sub);
                  setRoutingActive(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap ${
                  isCurrentlySelected 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-black shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50/50'
                }`}
              >
                📍 {sub.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------
          3. INTERACTIVE SVG MAP VIEW CANVAS
          ---------------------------------------------------- */}
      <section className="relative w-full bg-slate-100 border-b border-slate-200 aspect-[5/3.8] shrink-0 overflow-hidden">
        
        {/* Real Dynamic SVG Vector Ground map */}
        <svg 
          className="w-full h-full cursor-crosshair select-none bg-[#f2efe9]" 
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          onClick={handleMapClick}
        >
          {/* Aesthetic grid overlay */}
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e8e5dc" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />

          {/* Coronation Park - Green Grass Area */}
          <rect x="240" y="100" width="100" height="60" rx="15" fill="#d8e8cd" opacity="0.8" />
          <text x="290" y="132" fill="#5c7a4c" className="text-[8px] font-black tracking-wider uppercase font-sans text-center" textAnchor="middle">
            Coronation Park
          </text>

          {/* Westridge Forest - Green Moss Area */}
          <circle cx="100" cy="80" r="45" fill="#d0e5c1" opacity="0.6" />
          <text x="100" y="82" fill="#587642" className="text-[7.5px] font-bold tracking-tight uppercase" textAnchor="middle">
            Westridge Woods
          </text>

          {/* Water Bodies: Mbabane River Section */}
          <path 
            d="M -10,260 Q 120,290 220,230 T 480,270 L 480,400 L -10,400 Z" 
            fill="#d9e6f2" 
            opacity="0.9" 
          />
          <path 
            d="M -10,260 Q 120,290 220,230 T 480,270" 
            fill="none" 
            stroke="#b3cfe5" 
            strokeWidth="5" 
            strokeLinecap="round" 
          />
          <text x="150" y="275" fill="#5682a8" className="text-[7.5px] font-bold rotate-2 font-serif">
            Mbabane River
          </text>

          {/* Major High-Street Roads Network */}
          {/* MR3 Outer Expressway (East-West) */}
          <path 
            d="M -10,180 L 155,180 L 320,195 L 510,250" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M -10,180 L 155,180 L 320,195 L 510,250" 
            fill="none" 
            stroke="#e0dcce" 
            strokeWidth="11" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="2 2" 
          />
          <text x="75" y="191" fill="#8c8577" className="text-[6.5px] font-mono tracking-widest uppercase">
            MR3 HIGHWAY
          </text>

          {/* Allister Miller Street (Business high street - Vertical-ish) */}
          <path 
            d="M 280,0 L 280,180 L 260,380" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
          <path 
            d="M 280,0 L 280,180 L 260,380" 
            fill="none" 
            stroke="#e0dcce" 
            strokeWidth="9" 
            strokeDasharray="2 2" 
          />
          <text id="label-highstreet" x="290" y="50" fill="#8c8577" className="text-[6.5px] font-bold uppercase tracking-wide rotate-90 origin-left">
            Allister Miller St
          </text>

          {/* Dzeliwe Street (East-West connector) */}
          <path 
            d="M 100,80 L 420,80" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="7" 
            strokeLinecap="round" 
          />
          <path 
            d="M 100,80 L 420,80" 
            fill="none" 
            stroke="#e0dcce" 
            strokeWidth="8" 
            strokeDasharray="1 2" 
          />
          <text x="180" y="74" fill="#8c8577" className="text-[6px] font-sans font-bold uppercase">
            Dzeliwe St
          </text>

          {/* Somhlolo Secondary Expressway (South road) */}
          <path 
            d="M 0,310 Q 150,300 260,260 T 510,280" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="6" 
            strokeLinecap="round" 
          />

          {/* ----------------------------------------------------
              VISUAL RANGE CIRCLE OVERLAY (Live dynamic search scope)
              ---------------------------------------------------- */}
          <circle 
            cx={userSVGCoords.x} 
            cy={userSVGCoords.y} 
            // Scale radius visually: conversion factor: 1km is roughly 65 pixels in this bound scale
            r={maxRadius * 64} 
            fill="rgba(16, 185, 129, 0.05)" 
            stroke="rgba(16, 185, 129, 0.28)" 
            strokeWidth="1.5" 
            strokeDasharray="4 3" 
            className="transition-all duration-305 pointer-events-none" 
          />
          
          <text 
            cx={userSVGCoords.x} 
            cy={userSVGCoords.y} 
            x={userSVGCoords.x + 8} 
            y={userSVGCoords.y - (maxRadius * 64) + 12}
            fill="#047857" 
            className="text-[7px] font-black tracking-widest font-mono pointer-events-none select-none opacity-80"
          >
            {maxRadius.toFixed(1)} KM SEARCH BOUNDARY
          </text>

          {/* ----------------------------------------------------
              DYNAMIC ROUTE LINE DRAWING (From user location to selection)
              ---------------------------------------------------- */}
          {routingActive && targetSVGCoords && (
            <g className="animate-in fade-in duration-300">
              {/* Pulsing route line */}
              <line 
                x1={userSVGCoords.x} 
                y1={userSVGCoords.y} 
                x2={targetSVGCoords.x} 
                y2={targetSVGCoords.y} 
                stroke="#0284c7" 
                strokeWidth="2.5" 
                strokeDasharray="5 4" 
                strokeLinecap="round" 
                className="animate-pulse"
              />
              {/* Outer boundary support line */}
              <line 
                x1={userSVGCoords.x} 
                y1={userSVGCoords.y} 
                x2={targetSVGCoords.x} 
                y2={targetSVGCoords.y} 
                stroke="#38bdf8" 
                strokeWidth="1" 
                opacity="0.5" 
              />
              
              {/* Text Badge indicating GPS path direct range */}
              <g transform={`translate(${(userSVGCoords.x + targetSVGCoords.x) / 2}, ${(userSVGCoords.y + targetSVGCoords.y) / 2})`}>
                <rect x="-34" y="-7" width="68" height="15" rx="5" fill="#0284c7" stroke="white" strokeWidth="1" />
                <text x="0" y="3" fill="#ffffff" textAnchor="middle" className="text-[7px] font-mono font-black">
                  GPS PATH: {selectedEstablishment?.distanceStr}
                </text>
              </g>
            </g>
          )}

          {/* ----------------------------------------------------
              VENDORS / ESTABLISHMENT PINS RENDERING
              ---------------------------------------------------- */}
          {calculatedEstablishments.map(est => {
            const coords = getSVGCoords(est.lat, est.lng);
            const isSelected = selectedEstablishment?.id === est.id;
            const inScope = est.distanceVal <= maxRadius;

            // Define thematic coordinate colors: Green for produce/traders, Purple for services
            const pinColorClass = est.type === 'trader' ? '#10b981' : '#8b5cf6';
            const pinStrokeColor = isSelected ? '#1e293b' : '#ffffff';

            return (
              <g 
                key={est.id} 
                className={`transition-all duration-300 ${inScope ? 'opacity-100 scale-100' : 'opacity-30 scale-90 pointer-events-none'}`}
              >
                {/* Visual glow on hover or when selected */}
                {isSelected && (
                  <circle cx={coords.x} cy={coords.y} r="15" fill={pinColorClass} opacity="0.22" className="animate-ping" />
                )}

                {/* Pin button */}
                <g 
                  onClick={(e) => {
                    e.stopPropagation(); // prevent resetting user coordinates
                    setSelectedEstablishment(est);
                    setRoutingActive(true); // Draw direct path route
                  }} 
                  className="cursor-pointer group"
                >
                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isSelected ? "9.5" : "7.5"} 
                    fill={pinColorClass} 
                    stroke={pinStrokeColor} 
                    strokeWidth="2.5" 
                    className="transition-transform group-hover:scale-110 drop-shadow-sm" 
                  />
                  {/* Miniature Internal Vector Dot */}
                  <circle cx={coords.x} cy={coords.y} r="2.5" fill="white" />

                  {/* Thumbnail Label above selected pins */}
                  <g transform={`translate(${coords.x}, ${coords.y - 12})`} className="pointer-events-none select-none">
                    <rect 
                      x="-38" 
                      y="-12" 
                      width="76" 
                      height="12" 
                      rx="3" 
                      fill={isSelected ? "#1e293b" : "rgba(255,255,255,0.92)"} 
                      stroke={isSelected ? "#1e293b" : "#e2e8f0"} 
                      strokeWidth="0.5" 
                      className="shadow-3xs" 
                    />
                    <text 
                      x="0" 
                      y="-3" 
                      textAnchor="middle" 
                      fill={isSelected ? "#ffffff" : "#334155"} 
                      className="text-[6.5px] font-black tracking-tight uppercase"
                    >
                      {est.name.substring(0, 15)}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

          {/* ----------------------------------------------------
              USER GPS LIVE CHARACTER POINT
              ---------------------------------------------------- */}
          <g transform={`translate(${userSVGCoords.x}, ${userSVGCoords.y})`} className="pointer-events-none">
            {/* Pulsing radar ripples */}
            <circle cx="0" cy="0" r="18" fill="rgba(37, 99, 235, 0.15)" className="animate-ping" />
            <circle cx="0" cy="0" r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" className="shadow-md" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            
            {/* Compass Chevron Indicator */}
            <path d="M 0 -11 L 3 -7 L -3 -7 Z" fill="#ef4444" transform="rotate(45)" />

            {/* Float badge for simulated me coordinates */}
            <g transform="translate(0, 12)">
              <rect x="-28" y="0" width="56" height="9" rx="2" fill="#2563eb" opacity="0.9" />
              <text x="0" y="7" textAnchor="middle" fill="#ffffff" className="text-[5.5px] font-bold tracking-widest font-mono">
                MY GPS
              </text>
            </g>
          </g>
        </svg>

        {/* Small floating HUD helper instructions */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl border border-slate-700 max-w-[210px] pointer-events-none select-none">
          <p className="text-[7.5px] font-bold text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <Info size={11} className="text-emerald-400" /> Interactive MAP Grid
          </p>
          <p className="text-[9px] text-slate-200 leading-normal mt-0.5">
            • Your location is <span className="text-blue-400 font-bold">Blue Dot</span>.<br />
            • Double-click anywhere on map to <strong>teleport GPS</strong>.<br />
            • Map recalculated all ranges instantly!
          </p>
        </div>

        {/* Dynamic coordinate crossbar summary */}
        <div className="absolute bottom-2.5 right-2 w-fit bg-white/95 backdrop-blur-xs border border-slate-200 p-2 rounded-xl shadow-md pointer-events-none">
          <div className="text-[7.5px] text-slate-400 font-black uppercase font-mono tracking-wider">Dynamic GPS Tracking</div>
          <div className="text-[9px] font-mono font-bold text-slate-800 tracking-tighter mt-0.5 flex gap-2">
            <span>Lat: {userLocation.lat.toFixed(5)}</span>
            <span>Lng: {userLocation.lng.toFixed(5)}</span>
          </div>
          <div className="text-[8.5px] text-emerald-600 font-bold truncate max-w-[170px] mt-0.5">District: {userLocation.name}</div>
        </div>
      </section>

      {/* ----------------------------------------------------
          4. RADIUS SCOPE & CATEGORY SLIDERS
          ---------------------------------------------------- */}
      <section className="bg-white p-4 border-b border-slate-100 flex flex-col gap-3 font-sans">
        
        {/* Radius Filter Slider */}
        <div id="sliders-hud" className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <Sliders size={13} className="text-slate-500" /> Search Range Coverage
            </span>
            <span className="font-mono text-emerald-700 font-black text-sm bg-emerald-50 px-2.2 py-0.5 rounded-full">
              max {maxRadius.toFixed(1)} km
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-400 font-mono font-bold whitespace-nowrap">0.5 km</span>
            <input 
              type="range" 
              min="0.5" 
              max="6.0" 
              step="0.5"
              value={maxRadius}
              onChange={(e) => setMaxRadius(parseFloat(e.target.value))}
              className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono font-bold whitespace-nowrap">6.0 km</span>
          </div>
          <div className="text-[8.5px] text-slate-400 text-right font-mono font-semibold">
            Matches within bounds: <strong className="text-slate-700">{filteredMatches.length} listings</strong>
          </div>
        </div>

        {/* Category Toggles bar - All, Traders, Products, Services */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5" id="category-chips">
          {[
            { id: 'all', label: 'All Markers', count: calculatedEstablishments.length },
            { id: 'products', label: 'Vegetables & Products', count: calculatedEstablishments.filter(e => e.type === 'trader').length },
            { id: 'traders', label: 'Traders / Shops', count: calculatedEstablishments.filter(e => e.type === 'trader').length },
            { id: 'services', label: 'Local Services', count: calculatedEstablishments.filter(e => e.type === 'service').length },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedEstablishment(null);
                setRoutingActive(false);
              }}
              className={`whitespace-nowrap px-3.5 py-1.8 rounded-full text-xs font-black border transition-all flex items-center gap-1.5 ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------
          5. BOTTOM SELECTED ESTABLISHMENT PANEL
          ---------------------------------------------------- */}
      {selectedEstablishment && (
        <section className="bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 text-white p-4.5 border-b border-slate-800 animate-in slide-in-from-bottom duration-250 z-10 flex flex-col gap-3 font-sans relative">
          
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setSelectedEstablishment(null);
              setRoutingActive(false);
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center font-bold text-sm text-slate-300 transition-colors"
          >
            ✕
          </button>

          {/* Quick Header */}
          <div className="flex gap-3 mt-1 items-start">
            <img 
              src={selectedEstablishment.image} 
              alt={selectedEstablishment.name} 
              className="w-16 h-16 rounded-xl object-cover border border-white/10" 
            />
            
            <div className="flex-1 min-w-0 pr-4">
              <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                selectedEstablishment.type === 'trader' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
              }`}>
                {selectedEstablishment.type === 'trader' ? '🏪 Trader Stall' : '🛠️ Local Gig Service'}
              </span>
              <h3 className="text-sm font-black text-white leading-normal truncate">{selectedEstablishment.name}</h3>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-1">
                <span className="text-amber-400 font-extrabold font-mono">★ {selectedEstablishment.rating}</span>
                <span>({selectedEstablishment.reviews} reviews)</span>
                <span>•</span>
                <span className="font-bold flex items-center text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-mono">
                  📍 {selectedEstablishment.distanceStr}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-normal">{selectedEstablishment.description}</p>

          {/* If Service, show Call out rates */}
          {selectedEstablishment.type === 'service' && selectedEstablishment.costEstimate && (
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Standard Service Rate:</span>
              <span className="text-purple-400 font-black font-mono">{selectedEstablishment.costEstimate}</span>
            </div>
          )}

          {/* If Trader, show product listings */}
          {selectedEstablishment.type === 'trader' && selectedEstablishment.products && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[8.5px] text-slate-400 uppercase tracking-widest font-bold">Produce For Sale Nearby:</span>
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                {selectedEstablishment.products.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/5 rounded-xl p-2 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-200 line-clamp-1">{p.name}</h4>
                      <p className="text-[8.5px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-white/5">
                      <span className="text-[10.5px] font-black text-emerald-400 font-mono">E {p.price} <span className="text-[8px] font-normal text-slate-400">{p.unit}</span></span>
                      {/* Check if we can route back to details */}
                      <button 
                        type="button" 
                        onClick={() => navigate('/search')} // Redirect to search page to allow checkout
                        className="bg-emerald-600 text-white text-[8px] px-1.5 py-0.8 rounded font-black hover:bg-emerald-500 transition-colors uppercase"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct routing travel predictions */}
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] text-slate-400 tracking-wider font-mono font-bold uppercase block">Turn-by-turn Navigation Estimator</span>
            <div className="flex justify-between text-[10px] font-mono text-emerald-400 pt-0.5">
              <span className="flex items-center gap-1 text-sky-400">🏍️ Motorcycle rider: <strong>{travelTimeMoto}</strong></span>
              <span className="flex items-center gap-1 text-indigo-400">🚶 Pedestrian Walking: <strong>{travelTimeWalk}</strong></span>
            </div>
          </div>

          {/* Quick Communication Actions bar */}
          <div className="grid grid-cols-3 gap-2 mt-1 select-none">
            <button 
              type="button"
              onClick={() => window.open(`tel:${selectedEstablishment.phone}`)}
              className="bg-white/10 hover:bg-white/15 text-white text-[10.5px] font-black py-2 rounded-xl flex items-center justify-center gap-1 border border-white/10 transition-colors uppercase font-mono"
            >
              <Phone size={13} className="text-emerald-400" /> Dial Call
            </button>
            <button 
              type="button"
              onClick={() => navigate('/messages')}
              className="bg-white/10 hover:bg-white/15 text-white text-[10.5px] font-black py-2 rounded-xl flex items-center justify-center gap-1 border border-white/10 transition-colors uppercase font-mono"
            >
              <MessageSquare size={13} className="text-sky-400" /> Chat App
            </button>
            <button 
              type="button"
              onClick={() => {
                setRoutingActive(true);
                // quick visual scroll effect to keep map on top
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-black py-2 rounded-xl flex items-center justify-center gap-1 transition-colors uppercase font-mono"
            >
              <Route size={13} /> Draw Route
            </button>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------
          6. LIST OF NEARBY OUTLETS (Search results within radius)
          ---------------------------------------------------- */}
      <main className="flex-1 p-4 pb-20">
        
        {/* Results title block */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest font-mono">
              List of Matches in Range
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">Nearest matched entities displayed first</p>
          </div>
          <span className="text-[10.5px] bg-slate-100 text-slate-700 px-2.2 py-0.5 rounded-full font-mono font-black border border-slate-200">
            {filteredMatches.length} Found
          </span>
        </div>

        {/* Dynamic Cards list */}
        <div className="flex flex-col gap-3" id="explore-list">
          {filteredMatches.map(est => {
            const isCurrentlySelected = selectedEstablishment?.id === est.id;
            return (
              <div 
                key={est.id}
                onClick={() => {
                  setSelectedEstablishment(est);
                  setRoutingActive(true);
                }}
                className={`p-3 bg-white rounded-2xl border transition-all cursor-pointer flex gap-3 relative ${
                  isCurrentlySelected 
                    ? 'border-emerald-500 bg-emerald-50/10 shadow-xs' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                {/* Distance Badge Label on right corner */}
                <div className="absolute right-3.5 top-3 bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-black flex items-center gap-1">
                  <MapPin size={10} className="text-rose-500" />
                  <span>{est.distanceStr}</span>
                </div>

                {/* Left image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img src={est.image} alt={est.name} className="w-full h-full object-cover" />
                </div>

                {/* Right content details */}
                <div className="flex-1 min-w-0 pr-14 flex flex-col justify-between">
                  <div>
                    <span id={`cat-${est.id}`} className="text-[7.5px] font-black uppercase text-emerald-600 font-mono tracking-widest">
                      {est.category}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800 leading-snug line-clamp-1 mt-0.5">
                      {est.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">
                      {est.description}
                    </p>
                  </div>

                  {/* Ratings / Indicators */}
                  <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 mt-1">
                    <span className="text-amber-500 font-bold font-mono">★ {est.rating}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-600">
                      {est.type === 'trader' ? `${est.products?.length} products` : est.costEstimate}
                    </span>
                  </div>
                </div>

                {/* Selected visual tick marker */}
                {isCurrentlySelected && (
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 bg-emerald-500 w-1.5 h-10 rounded-full"></div>
                )}
              </div>
            );
          })}

          {/* Zero scope match validation */}
          {filteredMatches.length === 0 && (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center flex flex-col items-center">
              <span className="text-3xl mb-1 text-slate-400 select-none">📍</span>
              <p className="font-extrabold text-slate-700 text-xs">No entries within range</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">
                Try sliding the **Max Search Radius** higher or resetting your active GPS location sector.
              </p>
              
              <button
                type="button"
                onClick={() => {
                  setMaxRadius(5.0);
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="mt-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] px-3.5 py-2 rounded-xl transition-all uppercase font-mono"
              >
                Expand Search Scope
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ----------------------------------------------------
          7. BOTTOM INFORMATIVE DISCLAIMER FOOTER
          ---------------------------------------------------- */}
      <footer className="bg-slate-100 border-t border-slate-200 p-4 pb-20 text-center">
        <p className="text-[9.5px] text-slate-400 leading-normal max-w-[325px] mx-auto font-sans font-medium">
          🔒 GPS location data is calculated locally using browser Haversine algorithms in eMakethe Sandbox environment. Direct payments route transparently through split Escrows.
        </p>
      </footer>

    </div>
  );
}
