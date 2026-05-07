import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Auth routes handle their own Supabase interactions.
  // Running getUser() here interferes with the PKCE code verifier cookie.
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
