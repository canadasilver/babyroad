import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseServerConfig } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type CookieEntry = {
  name: string
  value: string
  options?: Parameters<NextResponse['cookies']['set']>[2]
}

const GOOGLE_OAUTH_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

function redirectToLogin(request: NextRequest, error: string) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('error', error)
  return NextResponse.redirect(loginUrl)
}

export async function GET(request: NextRequest) {
  const pendingCookies: CookieEntry[] = []
  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig()

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieEntry[]) {
        pendingCookies.push(...cookiesToSet)
      },
    },
  })

  const origin = request.nextUrl.origin
  const redirectTo = origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      scopes: GOOGLE_OAUTH_SCOPES,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error || !data.url) {
    return redirectToLogin(request, 'auth_failed')
  }

  const response = NextResponse.redirect(data.url)

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
