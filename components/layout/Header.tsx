'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-amber-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Thai Desserts Online
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center"
            onClick={toggleMenu}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-amber-200">
              Home
            </Link>
            <Link href="/products" className="hover:text-amber-200">
              Products
            </Link>
            <Link href="/cart" className="hover:text-amber-200">
              Cart
            </Link>
            {session ? (
              <>
                <Link href="/orders" className="hover:text-amber-200">
                  My Orders
                </Link>
                {session.user.role === 'ADMIN' && (
  <Link href="/admin" className="hover:text-amber-200">
    Admin
  </Link>
)}
                <button 
                  onClick={() => signOut()}
                  className="hover:text-amber-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="hover:text-amber-200">
                Login
              </Link>
            )}
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="mt-4 flex flex-col space-y-3 md:hidden">
            <Link 
              href="/" 
              className="hover:text-amber-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className="hover:text-amber-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              href="/cart" 
              className="hover:text-amber-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart
            </Link>
            {session ? (
              <>
                <Link 
                  href="/orders" 
                  className="hover:text-amber-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link 
                    href="/admin/dashboard" 
                    className="hover:text-amber-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="hover:text-amber-200 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="hover:text-amber-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}