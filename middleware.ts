import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = [
  '/admin',
  '/profile',
  '/orders',
  '/checkout',
  '/cart', // Add cart to protected routes
  '/api/orders',
  '/api/products/manage'
];

const adminRoutes = [
  '/admin',
  '/api/products/manage',
  '/api/users'
];

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/auth/login',
  '/auth/register',
  '/',
  '/products',
  '/api/products',
  '/images',
  '/uploads'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  

  if (publicRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  

  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  
  const isAdminRoute = adminRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  
  const authToken = request.cookies.get('auth-token')?.value;
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;
  const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  
  const token = authToken || nextAuthToken || headerToken;

  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // สร้าง secret key จาก environment variables
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret'
    );
    
    // ตรวจสอบ token
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 60 // อนุญาตให้มีความคลาดเคลื่อนของเวลาได้ 60 วินาที
    });
    
    // ตรวจสอบสิทธิ์ admin สำหรับเส้นทางของแอดมิน
    if (isAdminRoute && payload.role !== 'ADMIN') {
      // ถ้าผู้ใช้ไม่ใช่แอดมิน แต่พยายามเข้าถึงหน้าแอดมิน
      if (request.headers.get('content-type')?.includes('application/json')) {
        // ถ้าเป็น API request ให้ส่ง JSON response กลับไป
        return NextResponse.json(
          { message: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      } else {
        // ถ้าเป็นการเข้าถึงหน้าเว็บ ให้ redirect ไปยังหน้าแรก
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // เพิ่มข้อมูลผู้ใช้ใน request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-email', payload.email as string);
    requestHeaders.set('x-user-role', payload.role as string);

    // อนุญาตให้ดำเนินการต่อไป
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // ลบ cookie ที่ไม่ถูกต้อง
    const response = NextResponse.redirect(
      new URL('/login', request.url)
    );
    
    response.cookies.delete('auth-token');
    
    // เพิ่ม query parameter เพื่อแสดงข้อความเตือน
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'InvalidSession');
    
    return NextResponse.redirect(loginUrl);
  }
}

// กำหนดว่า middleware จะทำงานกับ URL pattern ใดบ้าง
export const config = {
  matcher: [
    // เส้นทางหน้าเว็บ
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    // เส้นทาง API (ยกเว้น NextAuth API routes)
    '/api/((?!auth).*)/:path*',
    '/api/orders/:path*',
    '/api/products/manage/:path*',
    '/api/users/:path*',
  ],
};