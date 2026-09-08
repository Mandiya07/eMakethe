import React from 'react';
import { ShoppingBag, Store, ShieldCheck, ChevronRight } from 'lucide-react';
import { Product, Seller } from '../../types';

interface Step1OrderSummaryProps {
  product: Product;
  seller: Seller;
  quantity: number;
  setQuantity: (q: number) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  onNext: () => void;
}

export const Step1OrderSummary: React.FC<Step1OrderSummaryProps> = ({
  product,
  seller,
  quantity,
  setQuantity,
  customerNotes,
  setCustomerNotes,
  onNext
}) => {
  const subtotal = product.price * quantity;

  return (
    <div className="space-y-4">
      {/* Seller info card */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold overflow-hidden border border-emerald-100">
            {seller.logoUrl ? (
              <img src={seller.logoUrl} alt={seller.name} className="w-full h-full object-cover" />
            ) : (
              <Store size={22} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-900">{seller.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                Verified Trader
              </span>
            </div>
            <p className="text-[11px] text-gray-500">{seller.location}</p>
          </div>
        </div>
      </div>

      {/* Item details */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Item Details</h3>
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
            <img 
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-extrabold text-emerald-700 text-base">
                E {product.price.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ {product.unit || 'unit'}</span>
              </span>
              
              {/* Quantity selector */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 py-1 font-bold text-xs text-gray-800 bg-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer notes */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Special instructions or size notes:
          </label>
          <input
            type="text"
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="e.g. Please pick ripe tomatoes, or call on arrival"
            className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Subtotal Card */}
      <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-3xl flex justify-between items-center">
        <div>
          <span className="text-xs text-emerald-800 font-medium">Subtotal ({quantity} items)</span>
          <p className="text-lg font-black text-emerald-950">E {subtotal.toFixed(2)}</p>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span>Continue to Delivery</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
