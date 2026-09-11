import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 flex items-center justify-between gap-3 rounded-xl bg-orange-500/90 backdrop-blur-sm px-4 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/20">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 animate-pulse" />
        <span className="leading-tight">Offline Mode — Cached data is being used.</span>
      </div>
    </div>
  );
};
