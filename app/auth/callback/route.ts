import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  if (oauthError) {
    console.error('[auth/callback] OAuth provider error:', oauthError, oauthErrorDescription)
    return NextResponse.redirect(`${origin}/login?error=oauth_denied`)
  }

  if (!code) {
    console.error('[auth/callback] Missing code parameter. Full URL:', request.url)
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
