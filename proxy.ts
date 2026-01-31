import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // Public routes yang bisa diakses tanpa login
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes yang butuh autentikasi
  const protectedRoutes = ['/dashboard', '/daftar-pasien', '/tambah-pasien', '/deteksi-stunting', '/input-data', '/kalender', '/pengaturan'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Jika sudah login dan mencoba akses login/register, redirect ke dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika belum login dan mencoba akses protected route, redirect ke login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Konfigurasi route mana saja yang akan diproses proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
