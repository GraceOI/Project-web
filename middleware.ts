// middleware.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ระบุเส้นทางที่ต้องการป้องกัน
const protectedRoutes = [
  '/api/products',
  '/api/orders'
];

const adminRoutes = [
  '/api/admin'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ตรวจสอบว่าเป็นเส้นทางที่ต้องการป้องกันหรือไม่
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // แยก token จาก header
  const token = authHeader.split(' ')[1];

  try {
    // ตรวจสอบ token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secretKey);

    // ตรวจสอบสิทธิ์สำหรับ admin routes
    if (isAdminRoute && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}

// ระบุว่าใช้ middleware กับเส้นทางไหนบ้าง
export const config = {
  matcher: [
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/admin/:path*'
  ],
};