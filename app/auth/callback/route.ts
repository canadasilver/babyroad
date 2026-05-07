import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  if (oauthError) {
    const reason = toSafeReason(oauthError, oauthErrorDescription)
    console.error('[auth/callback] OAuth provider error:', oauthError, '| reason:', reason)
    return NextResponse.redirect(
      `${origin}/login?error=oauth_provider_error&reason=${reason}`
    )
  }

  if (!code) {
    console.error('[auth/callback] Missing code parameter')
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError) {
    console.error('[auth/callback] exchangeCodeForSession failed:', sessionError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('[auth/callback] getUser failed:', userError?.message ?? 'user is null')
    return NextResponse.redirect(`${origin}/login?error=user_failed`)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (profileError) {
    console.error('[auth/callback] profiles query failed:', profileError.message)
    return NextResponse.redirect(`${origin}/login?error=profile_query_failed`)
  }

  if (!profile) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
