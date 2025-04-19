// ไฟล์: middleware.ts (วางในรูทโฟลเดอร์ของโปรเจค)
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// กำหนดเส้นทางที่ต้องมีการยืนยันตัวตน
const protectedRoutes = [
  '/admin',
  '/profile',
  '/orders',
  '/checkout',
  '/api/orders',
  '/api/products/manage'
  // เพิ่มเส้นทางอื่นๆ ตามต้องการ
];

// กำหนดเส้นทางที่ต้องการสิทธิ์แอดมิน
const adminRoutes = [
  '/admin',
  '/api/products/manage',
  '/api/users'
  // เพิ่มเส้นทางอื่นๆ ตามต้องการ
];

// เส้นทางสาธารณะที่ไม่ต้องมีการยืนยันตัวตน
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/login',
  '/register',
  '/',
  '/products',
  '/api/products'
  // เพิ่มเส้นทางอื่นๆ ตามต้องการ
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // ข้ามการตรวจสอบสำหรับเส้นทางสาธารณะ
  if (publicRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // ข้ามการตรวจสอบสำหรับ NextAuth API routes
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // ตรวจสอบว่าเป็นเส้นทางที่ต้องยืนยันตัวตนหรือไม่
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // ตรวจสอบว่าเป็นเส้นทางที่ต้องมีสิทธิ์แอดมินหรือไม่
  const isAdminRoute = adminRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // ถ้าไม่ใช่เส้นทางที่ต้องปกป้อง ให้ผ่านไปได้เลย
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // ดึง token จาก cookie
  const authToken = request.cookies.get('auth-token')?.value;
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;
  const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // ใช้ token จากแหล่งใดแหล่งหนึ่ง โดยเรียงลำดับความสำคัญ
  const token = authToken || nextAuthToken || headerToken;

  // ถ้าไม่มี token ให้เปลี่ยนเส้นทางไปยังหน้า login
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
  ],
};