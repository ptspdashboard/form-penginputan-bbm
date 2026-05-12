import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ambil session cookie
  const userRole = request.cookies.get('user_role')?.value;
  
  // Halaman yang butuh login admin
  const isAdminPath = pathname.startsWith('/admin');
  
  // Halaman yang butuh login petugas atau admin
  const isPetugasPath = pathname.startsWith('/petugas');

  // Jika belum login dan mencoba akses rute terproteksi
  if (!userRole && (isAdminPath || isPetugasPath)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika bukan admin tapi mencoba akses halaman admin
  if (isAdminPath && userRole !== 'admin') {
    // Arahkan ke halaman utama atau petugas
    if (userRole === 'petugas_bon') {
      return NextResponse.redirect(new URL('/petugas/permintaan-solar', request.url));
    }
    if (userRole === 'petugas_pengisian') {
      return NextResponse.redirect(new URL('/petugas/pengisian', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika sudah login dan mencoba akses halaman login
  if (pathname === '/login' && userRole) {
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/bbm', request.url));
    if (userRole === 'petugas_bon') return NextResponse.redirect(new URL('/petugas/permintaan-solar', request.url));
    if (userRole === 'petugas_pengisian') return NextResponse.redirect(new URL('/petugas/pengisian', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi path mana saja yang akan dilewati middleware ini
export const config = {
  matcher: ['/admin/:path*', '/petugas/:path*', '/login'],
};
