import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Store, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Smartphone, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw,
  PhoneCall,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '../../types';

interface OrderStatusTrackerProps {
  order: Order;
  onClose?: () => void;
  showAdminSimulationControls?: boolean;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order: initialOrder,
  onClose,
  showAdminSimulationControls = true
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Real-time Firestore document listener
  useEffect(() => {
    if (!initialOrder?.id) return;

    setOrder(initialOrder);

    const unsub = onSnapshot(doc(db, 'orders', initialOrder.id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      }
    }, (err) => {
      console.warn('Real-time order snapshot notice:', err);
    });

    return () => unsub();
  }, [initialOrder?.id]);

  // Determine stage progression: 1 (Payment Confirmed) -> 2 (Packaging) -> 3 (Out for Delivery) -> 4 (Delivered)
  const getStageIndex = (status: OrderStatus, paymentStatus: string): number => {
    if (status === 'DELIVERED' || status === 'COMPLETED') return 4;
    if (status === 'OUT_FOR_DELIVERY' || status === 'READY' || status === 'READY_FOR_COLLECTION') return 3;
    if (status === 'PREPARING') return 2;
    if (status === 'ACCEPTED' || paymentStatus === 'PAID') return 1;
    return 1; // PENDING or initial state
  };

  const currentStageIndex = getStageIndex(order.orderStatus, order.paymentStatus);

  const stages = [
    {
      index: 1,
      title: 'Payment Confirmed',
      description: order.paymentStatus === 'PAID' 
        ? 'Verified via MTN MoMo / Bank rail' 
        : 'Order placed & payment authorized',
      icon: ShieldCheck,
      timestamp: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Confirmed'
    },
    {
      index: 2,
      title: 'Packaging & Prep',
      description: `${order.sellerName} is sorting & packing fresh goods`,
      icon: Package,
      timestamp: currentStageIndex >= 2 ? 'In Progress' : 'Pending'
    },
    {
      index: 3,
      title: order.deliveryMethod === 'DELIVERY' ? 'Out for Delivery' : 'Ready for Collection',
      description: order.deliveryMethod === 'DELIVERY' 
        ? 'Courier en route to your dropoff location' 
        : `Ready at stall (${order.pickupLocation || order.sellerName})`,
      icon: order.deliveryMethod === 'DELIVERY' ? Truck : Store,
      timestamp: currentStageIndex >= 3 ? 'Dispatched' : 'Estimated ~25m'
    },
    {
      index: 4,
      title: order.deliveryMethod === 'DELIVERY' ? 'Delivered' : 'Collected',
      description: 'Handed over and verified with customer',
      icon: CheckCircle2,
      timestamp: currentStageIndex >= 4 ? 'Completed' : 'Final Step'
    }
  ];

  // Helper to advance / simulate stage in Firestore and backend
  const handleAdvanceStatus = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      // 1. Update on Express backend
      try {
        await fetch(`/api/orders/${order.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (backendErr) {
        console.warn('Backend order update non-blocking notice:', backendErr);
      }

      // 2. Direct Firestore mutation with error handling
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        paymentStatus: newStatus !== 'PENDING' ? 'PAID' : order.paymentStatus,
        updatedAt: new Date().toISOString()
      });

      setOrder(prev => ({
        ...prev,
        orderStatus: newStatus,
        paymentStatus: newStatus !== 'PENDING' ? 'PAID' : prev.paymentStatus,
        updatedAt: new Date().toISOString()
      }));
    } catch (err: any) {
      console.error('Failed to advance order status:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
      } catch {}
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsAppContact = () => {
    const phone = (order.sellerPhone || '+268 7600 0000').replace(/[^\d]/g, '');
    const msg = encodeURIComponent(
      `Hello ${order.sellerName}! I am tracking Order #${order.orderNumber}. Current status is: ${order.orderStatus.replace(/_/g, ' ')}. Please let me know any delivery updates.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const getProgressPercentage = () => {
    switch (currentStageIndex) {
      case 1: return 20;
      case 2: return 50;
      case 3: return 80;
      case 4: return 100;
      default: return 10;
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden flex flex-col font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                LIVE FIRESTORE SYNC
              </span>
              <span className="text-[10px] font-mono text-emerald-200">
                #{order.orderNumber}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white font-display">
              {stages[currentStageIndex - 1].title}
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Trader: <strong className="text-white">{order.sellerName}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-emerald-200 font-medium block">Total Amount</span>
            <span className="text-lg font-black text-white">E {order.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-[10px] text-emerald-200 font-bold mb-1.5">
            <span>Progress</span>
            <span>{getProgressPercentage()}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-emerald-950/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 4 Real-Time Progression Stages */}
        <div className="space-y-4 relative">
          {/* Vertical connection track line */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-200 -z-0"></div>

          {stages.map((stage) => {
            const isCompleted = currentStageIndex > stage.index;
            const isCurrent = currentStageIndex === stage.index;
            const isUpcoming = currentStageIndex < stage.index;
            const Icon = stage.icon;

            return (
              <div 
                key={stage.index}
                className={`flex items-start gap-3.5 relative z-10 transition-all ${
                  isCurrent ? 'scale-[1.01]' : 'opacity-90'
                }`}
              >
                {/* Step Icon Badge */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' 
                    : isCurrent 
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 animate-pulse font-black' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}>
                  <Icon size={20} />
                </div>

                {/* Stage Info Card */}
                <div className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                  isCurrent 
                    ? 'bg-amber-50/50 border-amber-200 ring-2 ring-amber-500/20 shadow-sm' 
                    : isCompleted 
                    ? 'bg-emerald-50/30 border-emerald-100' 
                    : 'bg-gray-50/60 border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-xs font-black ${
                      isCurrent ? 'text-amber-950' : isCompleted ? 'text-emerald-950' : 'text-gray-500'
                    }`}>
                      {stage.index}. {stage.title}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isCurrent 
                        ? 'bg-amber-200 text-amber-900 animate-pulse' 
                        : isCompleted 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-200/60 text-gray-500'
                    }`}>
                      {stage.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery / Destination Details */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {order.deliveryMethod === 'DELIVERY' ? 'Dropoff Details' : 'Stall Collection Info'}
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
              {order.deliveryMethod === 'DELIVERY' ? 'Doorstep Delivery' : 'Self Collection'}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-gray-700">
            <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">
                {order.deliveryMethod === 'DELIVERY'
                  ? (order.deliveryAddress || 'Delivery Address on file')
                  : (order.pickupLocation || `${order.sellerName} Market Stall, Eswatini`)}
              </p>
              {order.customerNotes && (
                <p className="text-[11px] text-gray-500 mt-1 italic">
                  Note: "{order.customerNotes}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Ordered Items ({order.items?.length || 0})
          </span>
          <div className="space-y-1.5">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                <span className="font-semibold">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-mono font-bold text-gray-900">
                  E {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-100">
                <span>Delivery Fee:</span>
                <span className="font-mono font-bold">E {order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp & Contact CTA Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <MessageCircle size={16} />
            <span>Chat Trader on WhatsApp</span>
          </button>
        </div>

        {/* Interactive Real-Time Stage Simulator for Testing / Demo */}
        {showAdminSimulationControls && (
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2.5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Sparkles size={12} />
                Live Stage Simulator
              </span>
              <span className="text-[9px] text-slate-400">Updates Firestore Instantaneously</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Test transitions across the 4 real-time tracking stages:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus('ACCEPTED')}
                className={`text-[10px] font-bold p-2 rounded-xl transition-all border ${
                  order.orderStatus === 'ACCEPTED' 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                1. Payment Confirmed
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus('PREPARING')}
                className={`text-[10px] font-bold p-2 rounded-xl transition-all border ${
                  order.orderStatus === 'PREPARING' 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                2. Packaging
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus('OUT_FOR_DELIVERY')}
                className={`text-[10px] font-bold p-2 rounded-xl transition-all border ${
                  order.orderStatus === 'OUT_FOR_DELIVERY' 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                3. Out for Delivery
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus('DELIVERED')}
                className={`text-[10px] font-bold p-2 rounded-xl transition-all border ${
                  order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                4. Delivered
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
