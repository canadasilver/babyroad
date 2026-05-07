'use client'

import Script from 'next/script'
import { isAuthApiError, type AuthError } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleButtonOptions = {
  type: 'standard'
  theme: 'outline'
  size: 'large'
  text: 'continue_with'
  shape: 'rectangular'
  logo_alignment: 'center'
  width: number
}

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    ux_mode: 'popup'
  }) => void
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function SocialLoginButtons() {
  const [loading, setLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [scriptFailed, setScriptFailed] = useState(false)
  const [googleButtonReady, setGoogleButtonReady] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const handleGoogleOAuthRedirect = async () => {
    if (loading) return
    setLoading(true)

    try {
      window.location.assign('/auth/google')
    } catch {
      window.location.href = `${window.location.origin}/login?error=auth_failed`
      setLoading(false)
    }
  }

  const redirectToLoginError = useCallback((error: string, reason?: string) => {
    const loginUrl = new URL('/login', window.location.origin)
    loginUrl.searchParams.set('error', error)

    if (reason) {
      loginUrl.searchParams.set('reason', reason)
    }

    window.location.replace(loginUrl.toString())
  }, [])

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (loading) return

      const credential = response.credential

      if (!credential) {
        redirectToLoginError('id_token_failed', 'google_id_token_missing')
        return
      }

      setLoading(true)

      try {
        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: credential,
        })

        if (signInError) {
          redirectToLoginError('id_token_failed', getSafeAuthReason(signInError))
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          redirectToLoginError('user_failed')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle()

        if (profileError) {
          redirectToLoginError('profile_query_failed')
          return
        }

        window.location.replace(profile ? '/dashboard' : '/onboarding')
      } catch {
        redirectToLoginError('auth_failed')
      }
    },
    [loading, redirectToLoginError]
  )

  useEffect(() => {
    if (!scriptReady || !googleClientId || !googleButtonRef.current || googleButtonReady) {
      return
    }

    let cancelled = false

    async function renderGoogleButton() {
      try {
        const google = window.google

        if (!google || !googleButtonRef.current || !googleClientId) {
          return
        }

        if (cancelled) {
          return
        }

        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
        })

        const buttonWidth = Math.min(
          384,
          Math.max(280, googleButtonRef.current.clientWidth || 320)
        )

        google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: buttonWidth,
        })

        setGoogleButtonReady(true)
      } catch {
        setScriptFailed(true)
      }
    }

    void renderGoogleButton()

    return () => {
      cancelled = true
    }
  }, [handleCredentialResponse, googleButtonReady, scriptReady])

  return (
    <div className="flex flex-col gap-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptFailed(true)}
      />

      {/* Google — ID Token 방식. Supabase OAuth client secret 교환 실패를 피하기 위한 기본 로그인 경로다. */}
      {googleClientId && !scriptFailed ? (
        <div className="relative flex min-h-[46px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white px-1 py-1">
          <div ref={googleButtonRef} className="flex w-full items-center justify-center" />
          {(!googleButtonReady || loading) && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white text-sm font-medium text-slate-700">
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              ) : (
                <GoogleIcon />
              )}
              {loading ? '로그인 중...' : 'Google로 계속하기'}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGoogleOAuthRedirect}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? '로그인 중...' : 'Google로 계속하기'}
        </button>
      )}

      {/* Kakao — 준비중 */}
      <div className="relative">
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-yellow-300 bg-yellow-100 px-4 py-3 text-sm font-medium text-yellow-700 opacity-60"
        >
          <KakaoIcon />
          Kakao로 계속하기
        </button>
        <ComingSoonBadge />
      </div>

      {/* Naver — 준비중 */}
      <div className="relative">
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-green-300 bg-green-100 px-4 py-3 text-sm font-medium text-green-700 opacity-60"
        >
          <NaverIcon />
          Naver로 계속하기
        </button>
        <ComingSoonBadge />
      </div>
    </div>
  )
}

function getSafeAuthReason(error: AuthError): string {
  if (isAuthApiError(error)) {
    if (error.code === 'provider_disabled') return 'provider_disabled'
    if (error.code === 'validation_failed') return 'google_client_mismatch'
    if (error.code === 'invalid_credentials') return 'google_client_mismatch'
  }

  const message = `${error.name} ${error.message}`.toLowerCase()

  if (message.includes('audience') || message.includes('aud')) {
    return 'google_client_mismatch'
  }

  if (message.includes('provider')) {
    return 'provider_error'
  }

  return 'provider_error'
}

function ComingSoonBadge() {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
      준비중
    </span>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.74 1.5 5.15 3.78 6.63L4.9 20.5a.5.5 0 0 0 .73.54l4.37-2.9c.64.1 1.3.16 1.98.16 5.52 0 10-3.48 10-7.8C22 6.48 17.52 3 12 3z" />
    </svg>
  )
}

function NaverIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.27 12.85 7.37 0H0v24h7.73V11.15L16.63 24H24V0h-7.73z" />
    </svg>
  )
}
