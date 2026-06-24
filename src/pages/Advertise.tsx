import React, { useState } from 'react';
import { ArrowLeft, Megaphone, MonitorPlay, Tags, BellRing, PackageSearch, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Advertise() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const adPackages = [
    {
      id: 'home_banner',
      title: 'Homepage Banners',
      price: 'E 5,000',
      period: '/ month',
      icon: <MonitorPlay className="text-blue-500" size={24} />,
      color: 'blue',
      description: 'Maximum visibility. Feature your brand on the main homepage carousel seen by every visitor.',
      idealFor: 'Supermarkets, Banks, Mobile Operators'
    },
    {
      id: 'category_sponsor',
      title: 'Category Sponsorships',
      price: 'E 2,000',
      period: '/ month',
      icon: <Tags className="text-purple-500" size={24} />,
      color: 'purple',
      description: 'Own a category. E.g., A hardware store appears first in the "Construction & Building" category.',
      idealFor: 'Hardware stores, Insurances, Niche services'
    },
    {
      id: 'sponsored_product',
      title: 'Sponsored Products',
      price: 'E 500',
      period: '/ week',
      icon: <PackageSearch className="text-amber-500" size={24} />,
      color: 'amber',
      description: 'Boost specific products to the top of search results and local community feeds.',
      idealFor: 'Local sellers, Promoters, Events'
    },
    {
      id: 'push_notif',
      title: 'Push Notifications',
      price: 'E 1,500',
      period: '/ broadcast',
      icon: <BellRing className="text-rose-500" size={24} />,
      color: 'rose',
      description: 'Send a direct SMS/Push notification alert to active buyers in a specific region.',
      idealFor: 'Flash sales, Transport companies, Telecoms'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-12 pb-24 px-5 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="flex items-center gap-3 relative z-10 mb-8">
            <button onClick={() => navigate('/')} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform backdrop-blur-md">
               <ArrowLeft size={18} className="text-white" />
            </button>
            <h1 className="text-lg font-black tracking-tight">Business Advertising</h1>
         </div>

         <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center mb-4">
               <Megaphone size={28} className="text-indigo-300" />
            </div>
            <h2 className="text-3xl font-display font-black leading-tight mb-3">
               Reach thousands of local buyers daily.
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed max-w-md font-medium">
               Connect your local business with ready-to-buy customers across Eswatini. Select from our premium enterprise advertising channels below.
            </p>
         </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-20 flex flex-col gap-4">
         {adPackages.map((pkg) => (
            <div 
               key={pkg.id}
               onClick={() => setSelectedPackage(pkg.id)}
               className={`bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer shadow-sm ${selectedPackage === pkg.id ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.02]' : 'border-gray-100 hover:border-indigo-200'}`}
            >
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-2xl bg-${pkg.color}-50`}>
                        {pkg.icon}
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{pkg.title}</h3>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-0.5">Ideal for: {pkg.idealFor}</p>
                     </div>
                  </div>
               </div>
               
               <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {pkg.description}
               </p>

               <div className="flex justify-between items-end">
                  <div>
                     <span className="text-xl font-black font-mono text-gray-900">{pkg.price}</span>
                     <span className="text-[10px] text-gray-500 font-bold ml-1">{pkg.period}</span>
                  </div>
                  {selectedPackage === pkg.id ? (
                     <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Selected
                     </div>
                  ) : (
                     <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                        Select
                     </div>
                  )}
               </div>
            </div>
         ))}

         <div className="mt-4 bg-indigo-50 p-5 rounded-3xl border border-indigo-100 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
               <CreditCard size={20} className="text-indigo-600" />
            </div>
            <h4 className="font-bold text-indigo-900 mb-1">Corporate Billing Available</h4>
            <p className="text-xs text-indigo-700/70 mb-4 max-w-[260px] leading-relaxed">
               Need a custom enterprise package or multi-category sponsorship?
            </p>
            <button 
               className="bg-white border border-indigo-200 text-indigo-700 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:bg-indigo-50 transition-all active:scale-95"
               onClick={() => alert('Contacting Corporate Sales Team...')}
            >
               Contact Sales Team
            </button>
         </div>
      </div>

      {selectedPackage && (
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-50 animate-in slide-in-from-bottom-4 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="max-w-lg w-full flex items-center gap-4">
               <div className="flex-1">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</span>
                  <span className="block text-lg font-black font-mono text-gray-900">
                     {adPackages.find(p => p.id === selectedPackage)?.price}
                  </span>
               </div>
               <button 
                  onClick={() => {
                     alert(`Proceeding to checkout for ${adPackages.find(p => p.id === selectedPackage)?.title}`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex-1 text-center"
               >
                  Proceed to Payment
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
