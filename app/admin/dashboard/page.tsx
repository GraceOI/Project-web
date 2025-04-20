import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Link from 'next/link';

async function getStats() {
  const [totalUsers, totalProducts, totalOrders, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);
  
  // Calculate total revenue
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
  });
  
  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Total Users
          </h2>
          <p className="text-3xl font-bold text-amber-600">
            {stats.totalUsers}
          </p>
        </div>
        
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Total Products
          </h2>
          <p className="text-3xl font-bold text-amber-600">
            {stats.totalProducts}
          </p>
          <Link 
            href="/admin/products" 
            className="text-sm text-amber-600 hover:text-amber-800 mt-2 inline-block"
          >
            Manage Products →
          </Link>
        </div>
        
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Total Orders
          </h2>
          <p className="text-3xl font-bold text-amber-600">
            {stats.totalOrders}
          </p>
          <Link 
            href="/admin/orders" 
            className="text-sm text-amber-600 hover:text-amber-800 mt-2 inline-block"
          >
            View All Orders →
          </Link>
        </div>
        
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Total Revenue
          </h2>
          <p className="text-3xl font-bold text-amber-600">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Orders
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}
                    >
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
              
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {stats.totalOrders > 5 && (
          <div className="px-6 py-4 border-t">
            <Link 
              href="/admin/orders" 
              className="text-amber-600 hover:text-amber-800"
            >
              View all orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}