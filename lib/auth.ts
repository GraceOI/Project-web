// ไฟล์: lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';


export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any; 
}

function getJwtSecret(): Uint8Array {

  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    console.warn('No JWT_SECRET or NEXTAUTH_SECRET found. Using fallback secret (not secure for production).');
    return new TextEncoder().encode('fallback_secret_key_for_development_only');
  }
  
  return new TextEncoder().encode(secret);
}


export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = getJwtSecret();
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .setNotBefore(new Date())
    .sign(secret);
}


export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const secret = getJwtSecret();
    
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 60 
    });
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}


export function getToken(request: Request): string | null {
  
  const cookieStore = cookies();
  
  
  const jwtToken = cookieStore.get('auth-token')?.value;
  const nextAuthToken = cookieStore.get('next-auth.session-token')?.value;
  
  if (jwtToken) return jwtToken;
  if (nextAuthToken) return nextAuthToken;
  

  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

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


export function setTokenCookie(token: string): void {
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, 
    sameSite: 'strict'
  });
}


export function removeTokenCookie(): void {
  cookies().delete('auth-token');
}