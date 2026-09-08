import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Store, Truck } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { Step1OrderSummary } from '../components/checkout/Step1OrderSummary';
import { Step2Delivery } from '../components/checkout/Step2Delivery';
import { Step3Payment } from '../components/checkout/Step3Payment';
import { PaymentPromptModal } from '../components/checkout/PaymentPromptModal';
import { OrderSuccessModal } from '../components/checkout/OrderSuccessModal';
import { PaymentMethod, DeliveryMethod, Order } from '../types';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, sellers, user } = useFirebase();

  const product = products.find((p) => p.id === id);
  const seller = product ? sellers.find((s) => s.id === product.sellerId) : null;

  // Checkout Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [quantity, setQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');

  // Delivery states
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState(customerPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [pollUrl, setPollUrl] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  useEffect(() => {
    if (customerPhone && !momoPhoneNumber) {
      setMomoPhoneNumber(customerPhone);
    }
  }, [customerPhone, momoPhoneNumber]);

  if (!product || !seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <Store size={48} className="text-gray-300 mb-3" />
        <h2 className="text-base font-bold text-gray-800">Product or Seller Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">The item you are attempting to purchase is unavailable.</p>
        <Link to="/" className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const deliveryFee = deliveryMethod === 'DELIVERY' ? 25.0 : 0.0;
  const subtotal = product.price * quantity;
  const total = subtotal + deliveryFee;

  // Handler for placing order via server API
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create order on server
      const orderPayload = {
        customerId: user?.uid || 'guest_customer',
        customerName: customerName || 'Valued Customer',
        customerPhone: customerPhone || '+268 7600 0000',
        sellerId: seller.id,
        sellerName: seller.name,
        sellerPhone: seller.phone,
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images?.[0] || '',
            unit: product.unit || 'unit'
          }
        ],
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress : '',
        pickupLocation: deliveryMethod === 'PICKUP' ? seller.location : '',
        customerNotes,
        paymentMethod
      };

      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order on server');
      }

      const { order } = await orderRes.json();
      setCreatedOrder(order);

      // 2. Initiate payment via provider abstraction
      const paymentRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod,
          customer: {
            id: user?.uid || 'guest',
            name: customerName,
            phone: paymentMethod === 'MTN_MOMO' ? momoPhoneNumber : customerPhone
          },
          seller: {
            id: seller.id,
            name: seller.name,
            phone: seller.phone,
            whatsapp: seller.whatsapp
          }
        })
      });

      const paymentData = await paymentRes.json();

      if (paymentMethod === 'COD' || paymentMethod === 'PAY_ON_COLLECTION') {
        setShowOrderSuccess(true);
      } else if (paymentMethod === 'WHATSAPP_LINK') {
        if (paymentData.redirectUrl) {
          window.open(paymentData.redirectUrl, '_blank');
        }
        setShowOrderSuccess(true);
      } else {
        setPaymentInstructions(paymentData.instructions || '');
        setRedirectUrl(paymentData.redirectUrl || '');
        setPollUrl(paymentData.pollUrl || '');
        setShowPaymentPrompt(true);
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      alert('Could not place order: ' + (err.message || 'Unknown network error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentApproved = async () => {
    if (createdOrder) {
      try {
        await fetch(`/api/orders/${createdOrder.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ACCEPTED' })
        });
      } catch {}
    }
    setShowPaymentPrompt(false);
    setShowOrderSuccess(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Header */}
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <button
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
            } else {
              navigate(-1);
            }
          }}
          className="p-1.5 -ml-1 text-white hover:bg-emerald-700 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-sm tracking-tight">Checkout</h1>
        <div className="flex items-center gap-1 text-[10px] font-bold bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-500/50">
          <ShieldCheck size={12} />
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* 3-Step Progress Indicators */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between relative mb-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-gray-200 -z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-600 -z-0 transition-all duration-300"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
          ></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep >= 1 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className="text-[10px] font-bold text-gray-600">Order</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className="text-[10px] font-bold text-gray-600">Delivery</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 3 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
            <span className="text-[10px] font-bold text-gray-600">Payment</span>
          </div>
        </div>

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1OrderSummary
            product={product}
            seller={seller}
            quantity={quantity}
            setQuantity={setQuantity}
            customerNotes={customerNotes}
            setCustomerNotes={setCustomerNotes}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Delivery
            seller={seller}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            deliveryFee={deliveryFee}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Payment
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            momoPhoneNumber={momoPhoneNumber}
            setMomoPhoneNumber={setMomoPhoneNumber}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            deliveryMethod={deliveryMethod}
            isSubmitting={isSubmitting}
            onSubmitOrder={handlePlaceOrder}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>

      {/* Payment prompt modal (MoMo / Card) */}
      {createdOrder && (
        <PaymentPromptModal
          isOpen={showPaymentPrompt}
          onClose={() => setShowPaymentPrompt(false)}
          order={createdOrder}
          paymentMethod={paymentMethod}
          paymentInstructions={paymentInstructions}
          redirectUrl={redirectUrl}
          pollUrl={pollUrl}
          onPaymentSuccess={handlePaymentApproved}
        />
      )}

      {/* Order success modal */}
      {createdOrder && showOrderSuccess && (
        <OrderSuccessModal
          order={createdOrder}
          onClose={() => setShowOrderSuccess(false)}
        />
      )}
    </div>
  );
}
