import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseServerConfig } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const REASON_MAP: [string, string][] = [
  ['redirect_uri_mismatch', 'redirect_uri_mismatch'],
  ['access_denied', 'access_denied'],
  ['code verifier', 'pkce_cookie_missing'],
  ['code_verifier', 'pkce_cookie_missing'],
  ['both auth code and code verifier', 'pkce_cookie_missing'],
  ['invalid_client', 'invalid_client'],
  ['invalid_grant', 'invalid_client'],
  ['unauthorized_client', 'invalid_client'],
  ['expired', 'expired_code'],
  ['already used', 'expired_code'],
]

type CookieEntry = {
  name: string
  value: string
  options?: Parameters<NextResponse['cookies']['set']>[2]
}

function toSafeReason(oauthError: string, description: string | null): string {
  const combined = `${oauthError} ${description ?? ''}`.toLowerCase()

  for (const [keyword, reason] of REASON_MAP) {
    if (combined.includes(keyword)) return reason
  }

  return 'provider_error'
}

function redirectToLogin(request: NextRequest, error: string, reason?: string) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('error', error)

  if (reason) {
    loginUrl.searchParams.set('reason', reason)
  }

  return NextResponse.redirect(loginUrl)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  if (oauthError) {
    const reason = toSafeReason(oauthError, oauthErrorDescription)
    return redirectToLogin(request, 'oauth_provider_error', reason)
  }

  if (!code) {
    return redirectToLogin(request, 'missing_code')
  }

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

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError) {
    const reason = toSafeReason('exchange_failed', sessionError.message)
    return redirectToLogin(request, 'exchange_failed', reason)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return redirectToLogin(request, 'user_failed')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (profileError) {
    return redirectToLogin(request, 'profile_query_failed')
  }

  const destination = profile ? '/dashboard' : '/onboarding'
  const response = NextResponse.redirect(new URL(destination, request.url))

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
