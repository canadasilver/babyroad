import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const REASON_MAP: [string, string][] = [
  ['redirect_uri_mismatch', 'redirect_uri_mismatch'],
  ['access_denied',         'access_denied'],
  ['invalid_client',        'invalid_client'],
  ['invalid_grant',         'invalid_client'],
  ['unauthorized_client',   'invalid_client'],
]

function toSafeReason(oauthError: string, description: string | null): string {
  const combined = `${oauthError} ${description ?? ''}`.toLowerCase()
  for (const [keyword, reason] of REASON_MAP) {
    if (combined.includes(keyword)) return reason
  }
  return 'provider_error'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  const loginUrl = new URL('/login', request.url)

  if (oauthError) {
    const reason = toSafeReason(oauthError, oauthErrorDescription)
    console.error('[auth/callback] OAuth provider error:', oauthError, '| reason:', reason)
    loginUrl.searchParams.set('error', 'oauth_provider_error')
    loginUrl.searchParams.set('reason', reason)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    console.error('[auth/callback] Missing code parameter')
    loginUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(loginUrl)
  }

  // Log available cookie names for diagnostics (no values)
  const cookieNames = request.cookies.getAll().map(c => c.name)
  console.log('[auth/callback] Request cookie names:', cookieNames.join(', ') || '(none)')

  // Collect cookies to write onto the final redirect response
  type CookieEntry = { name: string; value: string; options?: Record<string, unknown> }
  const pendingCookies: CookieEntry[] = []

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieEntry[]) {
          cookiesToSet.forEach(c => pendingCookies.push(c))
        },
      },
    }
  )

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError) {
    console.error('[auth/callback] exchangeCodeForSession failed:', sessionError.message)
    loginUrl.searchParams.set('error', 'exchange_failed')
    return NextResponse.redirect(loginUrl)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('[auth/callback] getUser failed:', userError?.message ?? 'user is null')
    loginUrl.searchParams.set('error', 'user_failed')
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (profileError) {
    console.error('[auth/callback] profiles query failed:', profileError.message)
    loginUrl.searchParams.set('error', 'profile_query_failed')
    return NextResponse.redirect(loginUrl)
  }

  const destination = profile ? '/dashboard' : '/onboarding'
  const response = NextResponse.redirect(new URL(destination, request.url))

  // Apply session cookies to the redirect response
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  return response
}
