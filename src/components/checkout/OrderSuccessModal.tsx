import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Store, Truck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    const phone = (order.sellerPhone || '+268 7600 0000').replace(/[^\d]/g, '');
    const itemsList = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const msg = encodeURIComponent(
      `Hello ${order.sellerName}! I have placed Order #${order.orderNumber} for: ${itemsList} (Total: E ${order.total.toFixed(2)}). Delivery Method: ${order.deliveryMethod === 'DELIVERY' ? 'Delivery to: ' + order.deliveryAddress : 'Self Collection at stall'}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleTrackLive = () => {
    onClose();
    navigate(`/orders?id=${order.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[36px] shadow-2xl p-6 relative flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-xl ring-4 ring-emerald-100">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
          ORDER CONFIRMED
        </span>

        <h3 className="text-xl font-black text-gray-900 mb-1">
          Thank You for Supporting Local!
        </h3>

        <p className="text-xs text-gray-500 mb-4 px-2">
          Your order has been placed with <strong>{order.sellerName}</strong>.
        </p>

        {/* Order Details Card */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full mb-4 text-left space-y-2 text-xs">
          <div className="flex justify-between pb-1.5 border-b border-gray-200/60">
            <span className="text-gray-500">Order Number:</span>
            <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Items:</span>
            <span className="font-semibold text-gray-900 text-right">
              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Amount:</span>
            <span className="font-black text-emerald-800 text-sm">E {order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment:</span>
            <span className="font-semibold text-gray-900">{order.paymentMethod.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery:</span>
            <span className="font-semibold text-gray-900">
              {order.deliveryMethod === 'DELIVERY' ? 'Direct Delivery' : 'Stall Pickup'}
            </span>
          </div>
        </div>

        {/* Real-Time Tracking Action */}
        <button
          type="button"
          onClick={handleTrackLive}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
        >
          <Truck size={16} />
          <span>Track Live Status & Delivery</span>
        </button>

        {/* WhatsApp direct contact */}
        <button
          type="button"
          onClick={handleWhatsAppContact}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs p-3 rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
        >
          <MessageCircle size={16} />
          <span>Chat with Seller on WhatsApp</span>
        </button>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/');
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs p-2.5 rounded-2xl transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
