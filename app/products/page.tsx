import Link from 'next/link';
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
        {products.map((product, index) => {
          const imageUrls = [
            "https://thairice.org/wp-content/uploads/2020/06/%E0%B8%82%E0%B8%99%E0%B8%A1%E0%B8%84%E0%B8%A3%E0%B8%81-1.jpg",
            "https://s.isanook.com/ns/0/ui/1638/8194030/2562020__4_200625_0002_1593068174.jpg",
            "https://bakery-lover.com/wp-content/uploads/2023/08/1.png",
            "https://sawasdee.thaiairways.com/wp-content/uploads/2024/02/TH8-7-e1706873939817.jpg",
            "https://img.wongnai.com/p/1920x0/2018/09/26/34d85aac99404b6e9864e63f571193c8.jpg",
            "https://sawasdee.thaiairways.com/wp-content/uploads/2024/02/TH8-2.jpg",
            
          ];
          // Assign a random image to the product
          const imageUrl = imageUrls[index % imageUrls.length]; // loop through the image array
          return (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <Link href={`/products/${product.id}`}>
                <div>
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
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
          );
        })}
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
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
