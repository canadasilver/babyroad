'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type AuthConfirmClientProps = {
  code: string | null
}

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

function toSafeReason(message: string | null | undefined) {
  const lowerMessage = (message ?? '').toLowerCase()

  for (const [keyword, reason] of REASON_MAP) {
    if (lowerMessage.includes(keyword)) {
      return reason
    }
  }

  return 'provider_error'
}

function redirectToLogin(error: string, reason?: string) {
  const loginUrl = new URL('/login', window.location.origin)
  loginUrl.searchParams.set('error', error)

  if (reason) {
    loginUrl.searchParams.set('reason', reason)
  }

  window.location.replace(loginUrl.toString())
}

export default function AuthConfirmClient({ code }: AuthConfirmClientProps) {
  const didRunRef = useRef(false)

  useEffect(() => {
    if (didRunRef.current) return
    didRunRef.current = true

    async function confirmLogin() {
      if (!code) {
        redirectToLogin('missing_code')
        return
      }

      const supabase = createClient()
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        redirectToLogin('exchange_failed', toSafeReason(sessionError.message))
        return
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        redirectToLogin('user_failed')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle()

      if (profileError) {
        redirectToLogin('profile_query_failed')
        return
      }

      window.location.replace(profile ? '/dashboard' : '/onboarding')
    }

    void confirmLogin()
  }, [code])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
        <h1 className="mt-5 text-lg font-bold text-slate-900">로그인을 확인하고 있습니다</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          잠시만 기다려 주세요. 안전하게 세션을 생성하고 있습니다.
        </p>
      </div>
    </main>
  )
}
