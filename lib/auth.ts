// ไฟล์: lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

// อินเตอร์เฟซสำหรับข้อมูลผู้ใช้ที่จะเก็บใน JWT token
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any; // อนุญาตให้เพิ่ม property อื่นๆ ได้
}

// ฟังก์ชันเพื่อรับค่า secret key สำหรับ JWT
function getJwtSecret(): Uint8Array {
  // ใช้ JWT_SECRET ถ้ามี ถ้าไม่มีให้ใช้ NEXTAUTH_SECRET
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    console.warn('No JWT_SECRET or NEXTAUTH_SECRET found. Using fallback secret (not secure for production).');
    return new TextEncoder().encode('fallback_secret_key_for_development_only');
  }
  
  return new TextEncoder().encode(secret);
}

// ฟังก์ชันสำหรับสร้าง JWT token
export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = getJwtSecret();
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .setNotBefore(new Date())
    .sign(secret);
}

// ฟังก์ชันสำหรับตรวจสอบและถอดรหัส JWT token
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const secret = getJwtSecret();
    
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 60 // อนุญาตให้มีความคลาดเคลื่อนของเวลาได้ 60 วินาที
    });
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

// ฟังก์ชันสำหรับดึง token จาก cookie หรือ Authorization header
export function getToken(request: Request): string | null {
  // ดึงจาก cookie ก่อน
  const cookieStore = cookies();
  
  // ตรวจสอบทั้ง auth-token (custom JWT) และ next-auth.session-token (NextAuth)
  const jwtToken = cookieStore.get('auth-token')?.value;
  const nextAuthToken = cookieStore.get('next-auth.session-token')?.value;
  
  if (jwtToken) return jwtToken;
  if (nextAuthToken) return nextAuthToken;
  
  // ถ้าไม่มีใน cookie ให้ลองดึงจาก Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ปัจจุบันจาก token
export async function getCurrentUser(request: Request): Promise<JWTPayload | null> {
  const token = getToken(request);
  
  if (!token) {
    return null;
  }
  
  try {
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

// ฟังก์ชันสำหรับตั้งค่า token ใน cookie
export function setTokenCookie(token: string): void {
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 วัน (หน่วยเป็นวินาที)
    sameSite: 'strict'
  });
}

// ฟังก์ชันสำหรับลบ token ออกจาก cookie (ใช้เวลา logout)
export function removeTokenCookie(): void {
  cookies().delete('auth-token');
}