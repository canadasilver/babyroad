'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleIdConfiguration = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  nonce?: string
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  ux_mode?: 'popup' | 'redirect'
  use_fedcm_for_prompt?: boolean
}

type GoogleButtonConfiguration = {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number
  locale?: string
}

type GoogleSetupErrorReason = 'missing_client_id' | 'google_script_failed'

type SocialLoginButtonsProps = {
  googleClientId: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void
          renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
          cancel: () => void
        }
      }
    }
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function detectBlockedInAppBrowser(userAgent: string) {
  const lowerUserAgent = userAgent.toLowerCase()

  if (lowerUserAgent.includes('naver')) return '네이버 앱'
  if (lowerUserAgent.includes('kakaotalk')) return '카카오톡'
  if (lowerUserAgent.includes('instagram')) return '인스타그램'
  if (lowerUserAgent.includes('fban') || lowerUserAgent.includes('fbav')) return '페이스북'
  if (lowerUserAgent.includes('line/')) return '라인'
  if (lowerUserAgent.includes('; wv)')) return '앱 내장 브라우저'

  return null
}

function openCurrentPageInExternalBrowser() {
  const currentUrl = window.location.href

  if (/Android/i.test(window.navigator.userAgent)) {
    const url = new URL(currentUrl)
    const scheme = url.protocol.replace(':', '')
    const fallbackUrl = encodeURIComponent(currentUrl)

    window.location.href = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallbackUrl};end`
    return
  }

  window.open(currentUrl, '_blank', 'noopener,noreferrer')
}

function redirectToLoginError(error: string, reason?: string) {
  const loginUrl = new URL('/login', window.location.origin)
  loginUrl.searchParams.set('error', error)

  if (reason) {
    loginUrl.searchParams.set('reason', reason)
  }

  window.location.replace(loginUrl.toString())
}

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('google_script_failed')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('google_script_failed'))
    document.head.appendChild(script)
  })
}

function createRandomNonce() {
  const randomValues = new Uint8Array(32)
  window.crypto.getRandomValues(randomValues)

  return btoa(String.fromCharCode(...randomValues))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function sha256Hex(value: string) {
  const encoder = new TextEncoder()
  const digest = await window.crypto.subtle.digest('SHA-256', encoder.encode(value))
  const bytes = Array.from(new Uint8Array(digest))

  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export default function SocialLoginButtons({ googleClientId }: SocialLoginButtonsProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const nonceRef = useRef<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const [googleSetupError, setGoogleSetupError] = useState<GoogleSetupErrorReason | null>(null)
  const [setupRetryCount, setSetupRetryCount] = useState(0)
  const [blockedInAppBrowserName, setBlockedInAppBrowserName] = useState<string | null>(null)

  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    if (isLoading) return

    if (!response.credential) {
      redirectToLoginError('id_token_failed', 'google_id_token_missing')
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
      nonce: nonceRef.current ?? undefined,
    })

    if (signInError) {
      redirectToLoginError('id_token_failed', 'provider_error')
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
  }, [isLoading])

  useEffect(() => {
    let isMounted = true

    async function setupGoogleButton() {
      const normalizedGoogleClientId = googleClientId.trim()
      const inAppBrowserName = detectBlockedInAppBrowser(window.navigator.userAgent)

      if (inAppBrowserName) {
        setBlockedInAppBrowserName(inAppBrowserName)
        setGoogleSetupError(null)
        setIsGoogleReady(false)
        return
      }

      setBlockedInAppBrowserName(null)

      if (!normalizedGoogleClientId) {
        setGoogleSetupError('missing_client_id')
        return
      }

      try {
        setGoogleSetupError(null)
        setIsGoogleReady(false)

        const nonce = createRandomNonce()
        nonceRef.current = nonce
        const hashedNonce = await sha256Hex(nonce)

        await loadGoogleIdentityScript()

        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
          return
        }

        window.google.accounts.id.initialize({
          client_id: normalizedGoogleClientId,
          callback: handleGoogleCredential,
          nonce: hashedNonce,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
        })

        buttonRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.min(buttonRef.current.clientWidth || 384, 384),
          locale: 'ko',
        })

        setIsGoogleReady(true)
      } catch {
        if (isMounted) {
          setGoogleSetupError('google_script_failed')
        }
      }
    }

    void setupGoogleButton()

    return () => {
      isMounted = false
      window.google?.accounts?.id.cancel()
    }
  }, [googleClientId, handleGoogleCredential, setupRetryCount])

  function handleGoogleSetupRetry() {
    if (googleSetupError === 'missing_client_id') {
      redirectToLoginError('auth_failed', 'google_client_mismatch')
      return
    }

    setSetupRetryCount((count) => count + 1)
  }

  return (
    <div className="flex flex-col gap-3">
      {blockedInAppBrowserName && (
        <div className="rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF3E9]/82 px-4 py-4 text-sm text-[#9A6A38] shadow-[0_12px_30px_rgba(246,176,146,0.12)]">
          <p className="font-semibold">Google 로그인은 외부 브라우저에서 진행해 주세요.</p>
          <p className="mt-2 leading-relaxed">
            현재 {blockedInAppBrowserName} 안에서 접속 중입니다. Google 보안 정책 때문에 앱 내장 브라우저에서는 로그인이 차단될 수 있어요.
          </p>
          <button
            type="button"
            onClick={openCurrentPageInExternalBrowser}
            className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#4FA99A] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(79,169,154,0.22)] transition-colors hover:bg-[#428F84]"
          >
            외부 브라우저에서 열기
          </button>
          <p className="mt-2 text-xs leading-relaxed text-[#9A6A38]">
            버튼이 동작하지 않으면 오른쪽 아래 메뉴에서 브라우저로 열기 또는 Chrome으로 열기를 선택해 주세요.
          </p>
        </div>
      )}

      {!blockedInAppBrowserName && (
        <div className="relative min-h-[52px] overflow-hidden rounded-2xl border border-[#D9E6DF] bg-white/86 shadow-[0_12px_30px_rgba(37,52,74,0.08)] transition-colors hover:border-[#4FA99A]">
          {googleSetupError ? (
            <button
              type="button"
              onClick={handleGoogleSetupRetry}
              className="flex h-12 w-full items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-[#25344A]"
            >
              <GoogleIcon />
              {googleSetupError === 'missing_client_id' ? 'Google 설정 확인 필요' : 'Google 로그인 다시 시도'}
            </button>
          ) : (
            <>
              <div
                ref={buttonRef}
                className={`absolute inset-0 z-20 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl ${
                  isGoogleReady ? 'opacity-[0.01]' : 'pointer-events-none opacity-0'
                }`}
              />

              <div className="pointer-events-none relative z-10 flex h-12 w-full items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-[#25344A]">
                {isGoogleReady ? (
                  <>
                    <GoogleIcon />
                    Google로 계속하기
                  </>
                ) : (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#CFE3D8] border-t-[#4FA99A]" />
                    Google 로그인 준비 중...
                  </>
                )}
              </div>

              {isLoading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center gap-3 bg-white/95 px-4 py-3 text-sm font-semibold text-[#25344A]">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#CFE3D8] border-t-[#4FA99A]" />
                  Google 세션 생성 중...
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Kakao는 MVP 확장 단계에서 연결합니다. */}
      <div className="relative">
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-[#F6D6A8] bg-[#FFF7DF]/82 px-4 py-3 text-sm font-semibold text-[#B88645] opacity-70"
        >
          <KakaoIcon />
          Kakao로 계속하기
        </button>
        <ComingSoonBadge />
      </div>

      {/* Naver는 MVP 확장 단계에서 연결합니다. */}
      <div className="relative">
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-[#CFE3D8] bg-[#EAF6F2]/85 px-4 py-3 text-sm font-semibold text-[#4FA99A] opacity-75"
        >
          <NaverIcon />
          Naver로 계속하기
        </button>
        <ComingSoonBadge />
      </div>
    </div>
  )
}

function ComingSoonBadge() {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/75 px-2.5 py-0.5 text-xs font-semibold text-[#8FA0B5] shadow-sm">
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
