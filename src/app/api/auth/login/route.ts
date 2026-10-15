import { NextResponse } from 'next/server';
import { authenticateUser, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier) {
      return NextResponse.json({ error: 'Email or User ID is required' }, { status: 400 });
    }

    const user = await authenticateUser(identifier);
    if (!user) {
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
    }

    // Generate secure session
    const session = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      session,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('lj_bos_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
