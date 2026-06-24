import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, FileText, DollarSign, ShieldAlert, AlertTriangle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'pending' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onMarkAllAsRead?: () => void;
  triggerColor?: string;
  dotColor?: string;
}

export function NotificationsPopover({ notifications, onMarkAllAsRead, triggerColor = "text-gray-600", dotColor = "bg-red-500" }: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'info': return <FileText size={16} className="text-blue-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'payment': return <DollarSign size={16} className="text-emerald-600" />;
      case 'security': return <ShieldAlert size={16} className="text-red-600" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50';
      case 'error': return 'bg-red-50';
      case 'pending': return 'bg-amber-50';
      case 'info': return 'bg-blue-50';
      case 'warning': return 'bg-orange-50';
      case 'payment': return 'bg-emerald-50';
      case 'security': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${triggerColor} relative active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full hover:bg-black/5`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={`absolute top-1 right-1 w-2.5 h-2.5 ${dotColor} rounded-full border-2 border-white`}></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} new</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={onMarkAllAsRead}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto no-scrollbar">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notif, index) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 flex gap-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-indigo-50/20' : ''} ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className={`text-xs font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                        <span className="text-[9px] text-gray-400 font-medium shrink-0 ml-2">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                <Bell size={24} className="mb-2 opacity-20" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-50 text-center bg-gray-50">
             <button className="text-[10px] text-gray-500 font-bold hover:text-gray-800 w-full py-1">View All</button>
          </div>
        </div>
      )}
    </div>
  );
}
