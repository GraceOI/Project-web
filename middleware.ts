import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


const protectedRoutes = [
  '/api/orders',
  '/admin'
];

const adminRoutes = [
  '/api/admin',
  '/admin'
];

const methodProtectedRoutes = [
  {
    path: '/api/products',
    protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
  }
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  

  const methodProtectedRoute = methodProtectedRoutes.find(route => pathname.startsWith(route.path));
  const isMethodProtected = methodProtectedRoute && methodProtectedRoute.protectedMethods.includes(method);

  
  if (pathname.startsWith('/api/products') && method === 'GET') {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });

  
  if (!token) {
    
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    

    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  
  if (isAdminRoute && token.role !== 'ADMIN') {
    
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/admin/:path*',
    '/admin/:path*'
  ],
};