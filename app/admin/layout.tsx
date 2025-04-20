import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  
  if (!session) {
    // Redirect to login page with returnUrl
    redirect('/auth/login?returnUrl=/admin/dashboard');
    return null; // This return is not strictly necessary but added for clarity
  }
  
  if (session.user.role !== 'ADMIN') {
    // Redirect non-admin users to the home page
    redirect('/');
    return null; // This return is not strictly necessary but added for clarity
  }
  
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-full md:w-64 p-6 min-h-screen">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        
        <nav className="space-y-2">
          <Link
            href="/admin/dashboard"
            className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Orders
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-600">
            <Link
              href="/"
              className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Return to Site
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}