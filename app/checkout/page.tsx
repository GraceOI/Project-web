'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [items, router, orderComplete]);
  
  const handlePlaceOrder = async () => {
    if (!session) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          totalAmount: totalPrice,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const order = await response.json();
      
      // Clear the cart after successful order
      clearCart();
      setOrderComplete(true);
      
      // Wait for animation
      setTimeout(() => {
        router.push(`/orders/${order.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      alert('There was a problem processing your order. Please try again.');
    }
  };
  
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Successful!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order. Redirecting to order details...</p>
        </div>
      </div>
    );
  }
  
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
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="qr"
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={() => setPaymentMethod('qr')}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="qr" className="ml-3 block text-gray-700">
                    QR Code Payment
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="credit"
                    type="radio"
                    name="payment"
                    value="credit"
                    checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="credit" className="ml-3 block text-gray-700">
                    Credit Card
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
            
            {paymentMethod === 'qr' ? (
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">Scan this QR code to pay:</p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block">
                    {/* Mock QR code - in a real app you'd generate a proper one */}
                    <Image 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ThaiDessertShopPayment"
                      alt="Payment QR Code" 
                      width={150}
                      height={150}
                      className="mx-auto"
                    />
                  </div>
                </div>
                <p className="text-amber-600 font-medium text-lg mb-4">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardNumber">
                    Card Number
                  </label>
                  <input 
                    id="cardNumber"
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expDate">
                      Expiration
                    </label>
                    <input 
                      id="expDate"
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cvv">
                      CVV
                    </label>
                    <input 
                      id="cvv"
                      type="text" 
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className={`w-full px-6 py-3 mt-4 bg-amber-600 text-white font-semibold rounded-md 
                ${isProcessing ? 'bg-amber-400' : 'hover:bg-amber-700'} 
                transition-colors`}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
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
    </div>
  );
}