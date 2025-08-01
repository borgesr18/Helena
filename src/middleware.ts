import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)
  
  if (isPublicRoute) {
    return res
  }
  
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
