'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const handleCheckout = () => {
    if (!session) {
      router.push('/auth/login?redirect=/cart');
      return;
    }
    
    // Navigate to the checkout page
    router.push('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link 
            href="/products" 
            className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Cart Items ({items.length})
              </h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="p-4 flex flex-col sm:flex-row">
                  <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0 mr-4 relative">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill
                      className="object-cover rounded"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-amber-600 font-medium mb-2">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right font-semibold text-gray-800 mt-4 sm:mt-0 sm:ml-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-700">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-md 
                ${isCheckingOut ? 'bg-amber-400' : 'hover:bg-amber-700'} 
                transition-colors`}
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
            
            {!session && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                You'll need to login before checkout.
              </p>
            )}
            
            <div className="mt-6 text-center">
              <Link 
                href="/products" 
                className="text-amber-600 hover:text-amber-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}