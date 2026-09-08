import React from 'react';
import { Smartphone, CreditCard, Banknote, Store, MessageCircle, ShieldCheck, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { PaymentMethod, DeliveryMethod } from '../../types';

interface Step3PaymentProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  momoPhoneNumber: string;
  setMomoPhoneNumber: (phone: string) => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  onBack: () => void;
}

export const Step3Payment: React.FC<Step3PaymentProps> = ({
  paymentMethod,
  setPaymentMethod,
  momoPhoneNumber,
  setMomoPhoneNumber,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  isSubmitting,
  onSubmitOrder,
  onBack
}) => {
  const paymentOptions: Array<{
    id: PaymentMethod;
    name: string;
    description: string;
    icon: any;
    badge?: string;
    color: string;
  }> = [
    {
      id: 'MTN_MOMO',
      name: 'MTN Mobile Money',
      description: 'USSD prompt will be sent directly to your phone. Authorize on device.',
      icon: Smartphone,
      badge: 'POPULAR IN ESWATINI',
      color: 'bg-yellow-400 text-slate-900'
    },
    {
      id: 'CARD',
      name: 'Debit / Credit Card',
      description: 'Visa / Mastercard via secure PCI-DSS 3-D Secure hosted gateway.',
      icon: CreditCard,
      badge: 'PCI COMPLIANT',
      color: 'bg-slate-900 text-white'
    },
    {
      id: 'COD',
      name: 'Cash on Delivery',
      description: 'Pay cash to the rider or courier upon physical delivery.',
      icon: Banknote,
      color: 'bg-emerald-700 text-white'
    },
    {
      id: 'PAY_ON_COLLECTION',
      name: 'Pay on Collection',
      description: 'Pay when picking up goods directly at the merchant stall.',
      icon: Store,
      color: 'bg-indigo-700 text-white'
    },
    {
      id: 'WHATSAPP_LINK',
      name: 'WhatsApp Direct Pay',
      description: 'Coordinate settlement directly with the seller via WhatsApp.',
      icon: MessageCircle,
      color: 'bg-green-600 text-white'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Payment Selection List */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Payment Method</h3>
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
            <Lock size={10} />
            Encrypted
          </span>
        </div>

        <div className="space-y-2.5">
          {paymentOptions.map((opt) => {
            const isSelected = paymentMethod === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentMethod(opt.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center shrink-0 shadow-sm font-bold text-sm`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{opt.name}</span>
                    {opt.badge && (
                      <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* MTN MoMo specific phone field */}
        {paymentMethod === 'MTN_MOMO' && (
          <div className="mt-3 p-3.5 bg-yellow-50/70 rounded-2xl border border-yellow-200/80 space-y-2">
            <label className="block text-xs font-bold text-yellow-950">
              MTN Mobile Money Registered Number:
            </label>
            <input
              type="tel"
              value={momoPhoneNumber}
              onChange={(e) => setMomoPhoneNumber(e.target.value)}
              placeholder="+268 7611 2233"
              className="w-full text-xs p-3 rounded-xl border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-mono"
            />
            <p className="text-[10px] text-yellow-800">
              🔒 <strong>Security Notice:</strong> You will receive a USSD prompt on this phone. Never share your secret MoMo PIN with anyone online.
            </p>
          </div>
        )}
      </div>

      {/* Itemized Order Breakdown */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Payment Summary</h3>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Items Subtotal:</span>
          <span className="font-semibold text-gray-900">E {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Delivery ({deliveryMethod === 'DELIVERY' ? 'Direct' : 'Self Pickup'}):</span>
          <span className="font-semibold text-gray-900">E {deliveryFee.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="font-extrabold text-sm text-gray-900">Grand Total:</span>
          <span className="font-black text-lg text-emerald-800">E {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs p-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onSubmitOrder}
          disabled={isSubmitting || (paymentMethod === 'MTN_MOMO' && !momoPhoneNumber)}
          className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs p-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing Order...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>Confirm & Place Order (E {total.toFixed(2)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
