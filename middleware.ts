import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Supabase is configured to return OAuth users to the site origin.
  // Move the callback query to the server route so PKCE cookies are read
  // from the same server-side cookie store that created them.
  if (
    request.nextUrl.pathname === '/' &&
    (request.nextUrl.searchParams.has('code') || request.nextUrl.searchParams.has('error'))
  ) {
    const callbackUrl = request.nextUrl.clone()
    callbackUrl.pathname = '/auth/callback'
    return NextResponse.redirect(callbackUrl)
  }

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
