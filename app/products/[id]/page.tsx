import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';

interface ProductDetailProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  
  if (!product) {
    return null;
  }
  
  return product;
}

export async function generateMetadata({ params }: ProductDetailProps) {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  
  return {
    title: `${product.name} - Thai Desserts Online`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <div className="relative h-80 md:h-96 w-full">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                fill
                className="object-cover"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
          
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.name}
            </h1>
            
            <div className="mb-4">
              <span className="text-2xl font-bold text-amber-600">
                ${product.price.toFixed(2)}
              </span>
              {product.inStock ? (
                <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  In Stock
                </span>
              ) : (
                <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Out of Stock
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Description
              </h2>
              <p className="text-gray-700">
                {product.description}
              </p>
            </div>
            
            {product.inStock && (
              <AddToCartButton product={product} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}