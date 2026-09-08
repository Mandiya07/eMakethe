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

  // Filter orders relevant to current user (or fallback for demo visitors)
  const userOrders = orders.filter((o) => {
    if (user?.uid && o.customerId === user.uid) return true;
    return true; // Show all marketplace demo orders in sandbox
  });

  // Default mock order if database is fresh
  const defaultDemoOrder: Order = {
    id: 'ORD-DEMO-SWZ-101',
    orderNumber: '894210',
    customerId: user?.uid || 'guest_buyer_1',
    customerName: user?.displayName || 'Sipho Dlamini',
    customerPhone: '+268 7611 2233',
    sellerId: 's1',
    sellerName: 'Mbabane Fresh Produce & Market',
    sellerPhone: '+268 7600 1234',
    items: [
      {
        productId: 'p1',
        name: 'Organic Fresh Cabbages (3 heads)',
        price: 35.00,
        currency: 'SZL',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200',
        unit: 'bundle'
      },
      {
        productId: 'p2',
        name: 'Local Red Onions & Tomatoes',
        price: 25.00,
        currency: 'SZL',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=200',
        unit: 'kg'
      }
    ],
    subtotal: 85.00,
    deliveryFee: 25.00,
    total: 110.00,
    currency: 'SZL',
    paymentMethod: 'MTN_MOMO',
    paymentStatus: 'PAID',
    orderStatus: 'PREPARING',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: 'Plot 104, Hospital Hill Road, Mbabane, Eswatini',
    customerNotes: 'Please call on arrival at the gate',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  const allDisplayOrders = userOrders.length > 0 ? userOrders : [defaultDemoOrder];

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
        {/* Active Order Tracker Component */}
        {activeOrder && (
          <OrderStatusTracker 
            order={activeOrder}
            showAdminSimulationControls={true}
          />
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
