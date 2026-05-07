'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AUTH_ERROR_REASON_MAP: [string, string][] = [
  ['access_denied', 'access_denied'],
  ['redirect_uri_mismatch', 'redirect_uri_mismatch'],
  ['code verifier', 'pkce_cookie_missing'],
  ['invalid_client', 'invalid_client'],
  ['invalid_grant', 'invalid_client'],
  ['user email', 'google_scope_missing'],
  ['userinfo.email', 'google_scope_missing'],
  ['expired', 'expired_code'],
]

function getSafeReason(error: unknown) {
  if (!(error instanceof Error)) return 'provider_error'

  const message = error.message.toLowerCase()

  for (const [keyword, reason] of AUTH_ERROR_REASON_MAP) {
    if (message.includes(keyword)) return reason
  }

  return 'provider_error'
}

function replaceToLogin(error: string, reason?: string) {
  const loginUrl = new URL('/login', window.location.origin)
  loginUrl.searchParams.set('error', error)

  if (reason) {
    loginUrl.searchParams.set('reason', reason)
  }

  window.location.replace(loginUrl.toString())
}

export default function AuthCodeRedirect() {
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const oauthError = url.searchParams.get('error')
    const oauthErrorDescription = url.searchParams.get('error_description')

    if (oauthError) {
      replaceToLogin('oauth_provider_error', getSafeReason(new Error(oauthErrorDescription ?? oauthError)))
      return
    }

    if (!code || processing) {
      return
    }

    const authCode = code
    let cancelled = false

    async function exchangeCode() {
      setProcessing(true)

      try {
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(authCode)

        if (cancelled) return

        if (sessionError) {
          replaceToLogin('exchange_failed', getSafeReason(sessionError))
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (cancelled) return

        if (userError || !user) {
          replaceToLogin('user_failed')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle()

        if (cancelled) return

        if (profileError) {
          replaceToLogin('profile_query_failed')
          return
        }

        window.history.replaceState(null, '', window.location.origin)
        window.location.replace(profile ? '/dashboard' : '/onboarding')
      } catch (error) {
        if (!cancelled) {
          replaceToLogin('exchange_failed', getSafeReason(error))
        }
      }
    }

    void exchangeCode()

    return () => {
      cancelled = true
    }
  }, [processing])

  if (!processing) {
    return null
  }

  return (
    <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-sm rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
      Google 로그인 세션을 확인하고 있습니다...
    </div>
  )
}
