import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  ShieldAlert, 
  BarChart3, 
  Tag, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  Award, 
  ShieldCheck, 
  Smartphone, 
  Landmark, 
  Save, 
  Activity, 
  Clock, 
  ShoppingCart,
  Layers,
  Lock
} from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, userProfile, sellers, products, orders, categories } = useFirebase();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = Boolean(
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.role === 'FINANCE_ADMIN' ||
    user?.email === 'siphom.yati@gmail.com'
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
          <Lock size={32} />
        </div>
        <h2 className="text-lg font-bold mb-1">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          This portal is restricted to platform administrators and authorized operations staff. Log in with an administrator account ({process.env.SUPER_ADMIN_EMAIL || 'siphom.yati@gmail.com'}) to access governance controls.
        </p>
      </div>
    );
  }

  // Calculate platform operational metrics
  const totalVolume = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const paidVolume = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');

  const handleUpdateSellerVerification = async (sellerId: string, level: 'basic' | 'verified' | 'premium') => {
    try {
      await updateDoc(doc(db, 'sellers', sellerId), {
        verificationLevel: level,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert('Failed to update seller verification: ' + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      alert(`Order #${orderId} status updated to ${status}`);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen pb-24 font-sans">
      {/* Admin Header */}
      <div className="bg-slate-950 p-5 border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white">eMakethe Admin Center</h1>
              <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                LIVE RBAC
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Authenticated: {user?.email || 'Super Admin'}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['overview', 'orders', 'sellers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <p className="text-xl font-black text-white">{orders.length}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{pendingOrders.length} pending action</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GMV Gross Volume</span>
                <p className="text-xl font-black text-emerald-400">E {totalVolume.toFixed(2)}</p>
                <span className="text-[10px] text-slate-500">All payment rails</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Traders</span>
                <p className="text-xl font-black text-white">{sellers.length}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{products.length} live listings</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Volume</span>
                <p className="text-xl font-black text-white">E {paidVolume.toFixed(2)}</p>
                <span className="text-[10px] text-emerald-400">{paidOrders.length} paid</span>
              </div>
            </div>

            {/* Recent Marketplace Activity */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Marketplace Orders</h3>
              
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No orders registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">#{order.orderNumber}</span>
                          <span className="text-slate-300 font-semibold">{order.customerName}</span>
                          <span className="text-slate-500">→ {order.sellerName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')} • {order.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">E {order.total.toFixed(2)}</span>
                        <div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Customer Orders ({orders.length})</h3>

            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-400 text-sm">#{o.orderNumber}</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                          {o.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Customer: {o.customerName} ({o.customerPhone})</p>
                      <p className="text-xs text-slate-400">Seller: {o.sellerName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-white">E {o.total.toFixed(2)}</span>
                      <p className="text-[10px] text-slate-400">{o.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Items: {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </span>
                    <div className="flex gap-1.5">
                      {o.orderStatus === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg"
                        >
                          Accept Order
                        </button>
                      )}
                      {o.orderStatus === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'READY')}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg"
                        >
                          Mark Ready
                        </button>
                      )}
                      {o.orderStatus === 'READY' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'COMPLETED')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg"
                        >
                          Complete Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELLERS TAB */}
        {activeTab === 'sellers' && (
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Traders & Verification Badges</h3>

            <div className="space-y-3">
              {sellers.map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold overflow-hidden">
                      {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" /> : <Store size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{s.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          s.verificationLevel === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                          s.verificationLevel === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {s.verificationLevel || 'basic'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{s.location} • {s.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateSellerVerification(s.id, 'verified')}
                      className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleUpdateSellerVerification(s.id, 'premium')}
                      className="bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-slate-900 border border-yellow-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Upgrade Premium
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
