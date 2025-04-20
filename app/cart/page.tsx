'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [items, router, orderComplete]);
  
  const handleShowQrCode = () => {
    if (!session) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    
    setShowQrModal(true);
  };
  
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      
    
      
      // Clear the cart after successful order
      clearCart();
      setOrderComplete(true);
      setShowQrModal(false);
      
      // Redirect to products page instead of home page
      router.push('/products');
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      alert('There was a problem processing your order. Please try again.');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-16 h-16 relative mr-4">
                        <Image 
                          src={item.imageUrl} 
                          alt={item.name} 
                          fill
                          className="object-cover rounded"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between text-xl font-bold mb-2">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
            
            <div className="text-center">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Pay with QR Code:</p>
                <p className="text-amber-600 font-medium text-lg mb-4">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleShowQrCode}
              className="w-full px-6 py-3 mt-4 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors"
            >
              Pay with QR Code
            </button>
            
            <p className="text-center mt-4 text-sm text-gray-600">
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </p>
            
            <div className="mt-6 text-center">
              <Link 
                href="/cart" 
                className="text-amber-600 hover:text-amber-800"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Scan QR Code to Pay</h3>
            
            <div className="text-center mb-6">
            <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
  {/* Using standard img tag instead of next/image */}
  <img 
    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ThaiDessertShopPayment"
    alt="Payment QR Code" 
    width={200}
    height={200}
    className="mx-auto"
  />
</div>
              
              <p className="text-amber-600 font-medium">
                Amount: ${totalPrice.toFixed(2)}
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Payment Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}