'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    setIsAdding(true);
    
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    };
    
    addItem(cartItem);
    
    setTimeout(() => {
      setIsAdding(false);
      // Reset quantity after adding to cart
      setQuantity(1);
    }, 500);
  };
  
  const handleBuyNow = () => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    };
    
    addItem(cartItem);
    router.push('/cart');
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <span className="mr-4 text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={handleDecrement}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-1">{quantity}</span>
          <button
            onClick={handleIncrement}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flex-1 px-6 py-3 bg-amber-600 text-white font-semibold rounded-md 
            ${isAdding ? 'bg-amber-400' : 'hover:bg-amber-700'} 
            transition-colors`}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
        
        <button
          onClick={handleBuyNow}
          className="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition-colors"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}