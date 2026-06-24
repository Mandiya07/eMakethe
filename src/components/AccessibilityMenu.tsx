import { useState, useEffect } from 'react';
import { Accessibility, BatteryLow, X, Mic, HandMetal, Download } from 'lucide-react';

export default function AccessibilityMenu({ 
  lowDataMode, 
  setLowDataMode 
}: { 
  lowDataMode: boolean, 
  setLowDataMode: (v: boolean) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true);
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowInstallGuide(true);
      }
    };
    window.addEventListener('emakethe_trigger_download', handleTrigger);
    return () => window.removeEventListener('emakethe_trigger_download', handleTrigger);
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 left-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg border border-blue-500/20 transition-transform active:scale-95 md:bottom-20 md:left-6"
        aria-label="Accessibility Settings"
      >
        <Accessibility size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[36px] shadow-2xl flex flex-col p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                <Accessibility size={20} className="text-blue-600" />
                Accessibility
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-gray-100 text-gray-500 hover:text-gray-900 p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* ALWAYS VISIBLE PWA INSTALL OPTION */}
              <button 
                onClick={handleInstallClick}
                className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group active:scale-95 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <Download size={20} className="text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">Install eMakethe App</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {deferredPrompt ? 'Direct 1-tap fast installation' : 'Download for offline access & launch screen.'}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                  {deferredPrompt ? 'Instal' : 'Download'}
                </div>
              </button>

              {/* Install Guide Modal / Dropdown */}
              {showInstallGuide && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 animate-in fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">How to install:</span>
                    <button 
                      onClick={() => setShowInstallGuide(false)} 
                      className="text-xs text-slate-400 hover:text-slate-800 font-bold"
                    >
                      Hide Guide
                    </button>
                  </div>
                  
                  <div className="text-[11px] text-gray-750 flex flex-col gap-2.5">
                    <div>
                      <strong className="text-gray-900 block font-bold">📱 Android / Google Chrome:</strong>
                      <span className="text-gray-600">Tap the three-dot menu <strong className="text-slate-800 font-bold">⋮</strong> in your browser at top-right, then choose <strong className="text-indigo-600">"Add to Home screen"</strong> or <strong className="text-indigo-600">"Install app"</strong>.</span>
                    </div>
                    
                    <div>
                      <strong className="text-gray-900 block font-bold">🍏 iPhone (iOS) / Safari:</strong>
                      <span className="text-gray-600">Tap the Safari Share button <strong className="text-slate-800 font-bold">⎗</strong> at the bottom browser rail, scroll down, and select <strong className="text-indigo-600">"Add to Home Screen"</strong>.</span>
                    </div>

                    <div>
                      <strong className="text-gray-900 block font-bold">💻 Desktop Chrome / Edge:</strong>
                      <span className="text-gray-600">Look for the install button <strong className="text-slate-800 font-bold">⊕</strong> in your browser's web address url bar at top-right, or click <strong className="text-slate-800 font-bold">"..."</strong> {" → "} "Save and Share" {" → "} "Install eMakethe".</span>
                    </div>
                  </div>

                  <div className="bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 text-center">
                    <button 
                      onClick={() => {
                        alert("eMakethe PWA Simulation: Desktop configuration initialized! In a standard production browser window (not inside an AI Studio preview iframe), the native 1-tap system install dialog will open instantly.");
                        setShowInstallGuide(false);
                      }}
                      className="text-[10px] font-black text-emerald-800 uppercase tracking-widest hover:underline"
                    >
                      ✨ Try Test Installation Simulation
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <BatteryLow size={20} className="text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">Low-Data Mode</h4>
                    <p className="text-xs text-gray-500 mt-1">Saves data by showing low-res images.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setLowDataMode(!lowDataMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors min-w-[48px] min-h-[48px] ${lowDataMode ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${lowDataMode ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <Mic size={20} className="text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">Voice Navigation</h4>
                    <p className="text-xs text-gray-500 mt-1">Use text-to-speech for search and AI.</p>
                  </div>
                </div>
                <div className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg">Active</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <HandMetal size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">Large Touch Targets</h4>
                    <p className="text-xs text-gray-500 mt-1">44px+ minimum size for easy tapping.</p>
                  </div>
                </div>
                <div className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">Active</div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-sm min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
