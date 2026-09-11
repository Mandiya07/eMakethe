import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Store, 
  MapPin, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../components/FirebaseProvider';
import { OrderStatusTracker } from '../components/orders/OrderStatusTracker';
import { Order, OrderStatus } from '../types';

export default function BuyerDashboard() {
  const { user, orders, sellers } = useFirebase();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeOrderIdFromUrl = searchParams.get('id');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(activeOrderIdFromUrl);
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders relevant to current user
  const userOrders = orders.filter((o) => {
    if (user?.uid && o.customerId === user.uid) return true;
    return true; // Return all orders if no specific filter
  });

  const allDisplayOrders = userOrders;

  const activeOrder = allDisplayOrders.find(o => o.id === selectedOrderId) || allDisplayOrders[0];

  const isOrderActive = (status: OrderStatus) => {
    return !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(status);
  };

  const filteredOrders = allDisplayOrders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = order.orderNumber?.toLowerCase().includes(q);
      const sellerMatch = order.sellerName?.toLowerCase().includes(q);
      if (!numMatch && !sellerMatch) return false;
    }

    if (filterTab === 'active') return isOrderActive(order.orderStatus);
    if (filterTab === 'completed') return !isOrderActive(order.orderStatus);
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* Top Header */}
      <div className="bg-emerald-700 text-white px-5 pt-6 pb-8 rounded-b-[36px] shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1 text-white hover:bg-emerald-800/60 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
                BUYER PORTAL
              </span>
              <h1 className="text-xl font-black tracking-tight text-white font-display">
                Real-Time Order Tracking
              </h1>
            </div>
          </div>

          <Link
            to="/"
            className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
          >
            <ShoppingBag size={14} />
            <span>Shop</span>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 text-xs font-bold pt-1">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <Truck size={13} />
            <span>Active Deliveries ({allDisplayOrders.filter(o => isOrderActive(o.orderStatus)).length})</span>
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              filterTab === 'completed'
                ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Completed</span>
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              filterTab === 'all'
                ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <span>All ({allDisplayOrders.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-5 relative z-10">
        {/* Empty State when no orders exist */}
        {allDisplayOrders.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Package size={32} />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">No Orders Placed Yet</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-xs leading-relaxed">
              Explore local produce, goods, and services from market traders across Eswatini!
            </p>
            <Link
              to="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Active Order Tracker Component */}
            {activeOrder && (
              <OrderStatusTracker 
                order={activeOrder}
                showAdminSimulationControls={false}
              />
            )}
          </>
        )}

        {/* List of Other Orders if multiple */}
        {allDisplayOrders.length > 1 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Select Another Order to Track
            </h3>

            <div className="space-y-2">
              {filteredOrders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    ord.id === activeOrder?.id
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-gray-900">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        {ord.sellerName}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {ord.items?.length || 0} items • E {ord.total?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      ord.orderStatus === 'DELIVERED' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
