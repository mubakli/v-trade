import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export async function verifyAuth(req: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.sub as string,
      email: payload.email as string,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}
