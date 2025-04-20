
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect('/auth/login');
  }
  
  if (session.user.role !== 'ADMIN') {
    return redirect('/');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/admin/products"
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow text-center"
        >
          <h2 className="text-xl font-bold mb-2">Manage Products</h2>
          <p>Add, edit, and delete Thai dessert products</p>
        </Link>
        
        <Link 
          href="/admin/orders"
          className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg shadow text-center"
        >
          <h2 className="text-xl font-bold mb-2">Manage Orders</h2>
          <p>View and update customer orders</p>
        </Link>
        
        <Link 
          href="/"
          className="bg-amber-500 hover:bg-amber-600 text-white p-6 rounded-lg shadow text-center"
        >
          <h2 className="text-xl font-bold mb-2">Return to Shop</h2>
          <p>Go back to the main website</p>
        </Link>
      </div>
    </div>
  );
}