import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    const { pathname } = request.nextUrl;

    // 🔒 CASE 1: พยายามเข้า Dashboard (พื้นที่หวงห้าม)
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 🔄 CASE 2: มี Token แล้ว แต่พยายามเข้าหน้า Login หรือหน้าแรก (Optional)
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};