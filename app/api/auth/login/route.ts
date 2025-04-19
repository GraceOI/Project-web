import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import prisma from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // สร้าง secret key สำหรับ JWT 
    // ใช้ NEXTAUTH_SECRET ถ้าไม่มี JWT_SECRET กำหนดไว้แยกต่างหาก
    const jwtSecret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret'
    );
    
    // แสดงคำเตือนถ้าไม่มีการตั้งค่า secret
    if (!process.env.JWT_SECRET && !process.env.NEXTAUTH_SECRET) {
      console.warn('Neither JWT_SECRET nor NEXTAUTH_SECRET is set. Using fallback secret (not secure for production).');
    }

    // สร้าง JWT token
    const token = await new SignJWT({ 
        id: user.id,
        email: user.email,
        role: user.role
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(jwtSecret);

    // บันทึก token ใน cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      sameSite: 'strict'
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}