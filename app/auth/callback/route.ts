import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const supabase = await createClient()

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!profile) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
