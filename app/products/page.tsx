import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';

async function getProducts() {
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        All Thai Desserts
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/products/${product.id}`}>
              <div className="relative h-56 w-full">
                <Image 
                  src={product.imageUrl} 
                  alt={product.name} 
                  fill
                  className="object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {product.name}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600 font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                    In Stock
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            No products available at the moment
          </h2>
          <p className="text-gray-500">
            Please check back later for our delicious Thai desserts!
          </p>
        </div>
      )}
    </div>
  );
}

export function ProductsLoading() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        All Thai Desserts
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-56 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}