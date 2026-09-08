import React from 'react';
import { Truck, Store, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { Seller, DeliveryMethod } from '../../types';

interface Step2DeliveryProps {
  seller: Seller;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  deliveryFee: number;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Delivery: React.FC<Step2DeliveryProps> = ({
  seller,
  deliveryMethod,
  setDeliveryMethod,
  deliveryAddress,
  setDeliveryAddress,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryFee,
  onNext,
  onBack
}) => {
  const isDelivery = deliveryMethod === 'DELIVERY';

  return (
    <div className="space-y-4">
      {/* Delivery Mode Choice */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Choose Delivery Mode</h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Option A: Delivery */}
          <button
            type="button"
            onClick={() => setDeliveryMethod('DELIVERY')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              isDelivery
                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Truck size={20} className={isDelivery ? 'text-emerald-700' : 'text-gray-400'} />
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isDelivery ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-100 text-gray-600'
              }`}>
                +E {deliveryFee.toFixed(2)}
              </span>
            </div>
            <h4 className="font-bold text-xs text-gray-900">Direct Delivery</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Dispatched to your home, office, or landmark.</p>
          </button>

          {/* Option B: Pickup */}
          <button
            type="button"
            onClick={() => setDeliveryMethod('PICKUP')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              !isDelivery
                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Store size={20} className={!isDelivery ? 'text-emerald-700' : 'text-gray-400'} />
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                FREE (E 0.00)
              </span>
            </div>
            <h4 className="font-bold text-xs text-gray-900">Self Collection</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Collect at trader's stall in {seller.location}.</p>
          </button>
        </div>
      </div>

      {/* Recipient Details */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Recipient Contact</h3>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name:</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Sipho Dlamini"
            className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone / WhatsApp:</label>
          <input
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+268 7611 2233"
            className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-mono"
          />
        </div>

        {isDelivery ? (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Delivery Address & Notable Landmark:
            </label>
            <textarea
              required
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Plot 414, Mbabane Central near Market Bus Rank, next to Engen Garage"
              className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>
        ) : (
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-700" />
              <span>Stall Collection Location:</span>
            </div>
            <p>{seller.name} — {seller.location}</p>
            {seller.hours && <p className="text-amber-700">Opening Hours: {seller.hours}</p>}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs p-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!customerName || !customerPhone || (isDelivery && !deliveryAddress)}
          className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs p-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>Continue to Payment</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
