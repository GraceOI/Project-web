import Link from 'next/link'; 
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

async function getTopProducts() {
  const products = await prisma.product.findMany({
    take: 4,
    where: {
      inStock: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return products;
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const topProducts = await getTopProducts();
  
  return (
    <div>
 {/* Hero Section */}
<section className="bg-amber-50 rounded-lg overflow-hidden shadow-lg mb-10">
  <div className="container mx-auto px-4 py-12">
    <div className="flex flex-col-reverse lg:flex-row items-center gap-8">
      {/* Text Content */}
      <div className="lg:w-1/2">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-4">
          Authentic Thai Desserts Delivered to Your Door
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          Experience the rich and unique flavors of traditional Thai desserts, handcrafted with care and delivered fresh to your doorstep.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors"
          >
            Shop Now
          </Link>
          {!session && (
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-md border border-amber-600 hover:bg-amber-50 transition-colors"
            >
              Register
            </Link>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="lg:w-1/2">
        <img
          src="https://sawasdee.thaiairways.com/wp-content/uploads/2024/02/TH8-1-1160x775.jpg"
          alt="Thai Dessert"
          className="rounded-lg shadow-md object-cover w-full max-h-[400px]"
        />
      </div>
    </div>
  </div>
</section>

      {/* Featured Products */}
      {session && (
        <section className="mb-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Featured Thai Desserts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-600 font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 inline-block transition-colors"
              >
                View All Desserts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="bg-amber-50 py-12 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Thai Dessert Story
            </h2>
            <p className="text-gray-700 mb-4">
              We partner with skilled Thai dessert artisans who use traditional
              recipes passed down through generations. Each dessert is
              handcrafted with authentic ingredients and techniques to deliver
              genuine Thai flavors.
            </p>
            <p className="text-gray-700 mb-4">
              Our desserts are made fresh daily and carefully packaged to
              maintain their quality during delivery. We believe in preserving
              the rich culinary heritage of Thailand while making these
              delicacies accessible to everyone.
            </p>
            <Link
              href="/auth/register"
              className="inline-block text-amber-600 font-semibold hover:text-amber-800"
            >
              Discover our selection →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
