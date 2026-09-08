import React, { useEffect, useState } from 'react';
import { Smartphone, CheckCircle2, Loader2, X, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { PaymentMethod, Order } from '../../types';

interface PaymentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  paymentMethod: PaymentMethod;
  paymentInstructions?: string;
  redirectUrl?: string;
  pollUrl?: string;
  onPaymentSuccess: () => void;
}

export const PaymentPromptModal: React.FC<PaymentPromptModalProps> = ({
  isOpen,
  onClose,
  order,
  paymentMethod,
  paymentInstructions,
  redirectUrl,
  pollUrl,
  onPaymentSuccess
}) => {
  const [status, setStatus] = useState<'prompt_sent' | 'authorizing' | 'success' | 'failed'>('prompt_sent');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isOpen) return;

    if (paymentMethod === 'CARD' && redirectUrl) {
      // In production, redirects to hosted 3DS session
      return;
    }

    if (paymentMethod === 'WHATSAPP_LINK' && redirectUrl) {
      window.open(redirectUrl, '_blank');
      onPaymentSuccess();
      return;
    }

    // Polling simulation for MoMo USSD prompt verification
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentMethod, redirectUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 relative flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {paymentMethod === 'MTN_MOMO' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-yellow-400 text-slate-900 flex items-center justify-center mb-4 shadow-lg ring-4 ring-yellow-100 animate-pulse">
              <Smartphone size={32} />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
              USSD PUSH SENT
            </span>

            <h3 className="text-lg font-black text-gray-900 mb-1">
              Authorize on Your Phone
            </h3>

            <p className="text-xs text-gray-500 mb-4 px-2 leading-relaxed">
              {paymentInstructions || `A prompt of E ${order.total.toFixed(2)} has been sent to your phone. Enter your private MoMo PIN on your device screen to confirm.`}
            </p>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full mb-4 text-left space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Order Ref:</span>
                <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Amount:</span>
                <span className="font-black text-emerald-700">E {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-semibold text-gray-900">{order.sellerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span>Awaiting provider network clearance ({countdown}s)...</span>
            </div>

            <button
              type="button"
              onClick={onPaymentSuccess}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Simulate Approval (Sandbox / Test Mode)</span>
            </button>
          </>
        )}

        {paymentMethod === 'CARD' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-100">
              <ShieldCheck size={32} />
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1">
              PCI-DSS Secure Gateway
            </h3>

            <p className="text-xs text-gray-500 mb-4 px-2 leading-relaxed">
              You are being connected to the 3-D Secure banking authorization gateway.
            </p>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full mb-4 text-left space-y-1 text-xs">
              <p className="text-gray-600">✅ 256-bit Bank-grade TLS Encryption</p>
              <p className="text-gray-600">✅ Zero card data stored on Emakethe</p>
              <p className="text-gray-600">✅ 3-D Secure OTP verification</p>
            </div>

            <button
              type="button"
              onClick={onPaymentSuccess}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Complete 3-D Secure Test Flow</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
