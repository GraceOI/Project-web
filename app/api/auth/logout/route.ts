// ไฟล์: app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // ลบ cookie สำหรับ custom JWT
    cookies().delete('auth-token');
    
    // ลบ cookie สำหรับ NextAuth (ถ้ามี)
    cookies().delete('next-auth.session-token');
    cookies().delete('next-auth.csrf-token');
    cookies().delete('next-auth.callback-url');
    
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}