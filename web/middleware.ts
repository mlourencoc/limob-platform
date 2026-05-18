import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('sb-daxmtuidnrxcgnfonwtc-auth-token')?.value

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isRootPath = request.nextUrl.pathname === '/'

  // Se tem token (está autenticado)
  if (authToken) {
    // Se está na página de login, redireciona para properties
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/properties', request.url))
    }
    return NextResponse.next()
  }

  // Se NÃO tem token (não autenticado)
  // Permite acessar /auth/* sem redirecionar
  if (isAuthPage) {
    return NextResponse.next()
  }

  // Se tenta acessar qualquer outra página sem autenticação, redireciona para login
  if (!isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
