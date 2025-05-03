// middleware.ts (Añadir console.log para depurar sesión)

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth(); // Obtiene sesión
  const { pathname } = request.nextUrl;

  // --- AÑADIR ESTE LOG ---
  // Imprime la ruta solicitada y la sesión que ve el middleware en ESTE momento
  console.log(`Middleware Check: Pathname = ${pathname}, Session = ${JSON.stringify(session)}`);
  // --- FIN DEL LOG ---

  const protectedRoutes = ['/dashboard', '/api/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    console.log(`Middleware Redirect: No session found for protected route ${pathname}. Redirecting to ${loginUrl.toString()}`); // Log de redirección
    return NextResponse.redirect(loginUrl);
  }

  // (Opcional: redirección desde /login si ya está logueado)
  // if (pathname === '/login' && session?.user) { ... }

  return NextResponse.next(); // Permite continuar
}

// Config del matcher (sin cambios)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    // '/login', // Añadir si implementas la redirección opcional de arriba
  ],
};