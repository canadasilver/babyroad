import { createServerClient } from '@supabase/ssr'
import { isAuthApiError, type AuthError } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseServerConfig } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const AUTH_ERROR_CODE_REASON_MAP: Record<string, string> = {
  bad_code_verifier: 'pkce_cookie_missing',
  bad_oauth_callback: 'provider_error',
  bad_oauth_state: 'provider_error',
  flow_state_expired: 'expired_code',
  flow_state_not_found: 'expired_code',
  invalid_credentials: 'invalid_client',
  oauth_provider_not_supported: 'provider_disabled',
  provider_disabled: 'provider_disabled',
  provider_email_needs_verification: 'provider_email_needs_verification',
  request_timeout: 'provider_timeout',
  unexpected_failure: 'provider_error',
}

const REASON_MAP: [string, string][] = [
  ['redirect_uri_mismatch', 'redirect_uri_mismatch'],
  ['access_denied', 'access_denied'],
  ['code verifier', 'pkce_cookie_missing'],
  ['code_verifier', 'pkce_cookie_missing'],
  ['both auth code and code verifier', 'pkce_cookie_missing'],
  ['bad code verifier', 'pkce_cookie_missing'],
  ['flow state', 'expired_code'],
  ['invalid_client', 'invalid_client'],
  ['invalid_grant', 'invalid_client'],
  ['unauthorized_client', 'invalid_client'],
  ['invalid credentials', 'invalid_client'],
  ['provider disabled', 'provider_disabled'],
  ['provider is disabled', 'provider_disabled'],
  ['user email', 'google_scope_missing'],
  ['openid', 'google_scope_missing'],
  ['scope', 'google_scope_missing'],
  ['expired', 'expired_code'],
  ['already used', 'expired_code'],
  ['timeout', 'provider_timeout'],
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

function toSafeReasonFromAuthError(error: AuthError): string {
  if (isAuthApiError(error) && error.code) {
    const reason = AUTH_ERROR_CODE_REASON_MAP[error.code]
    if (reason) return reason
  }

  return toSafeReason(error.name, error.message)
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
    const reason = toSafeReasonFromAuthError(sessionError)
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
