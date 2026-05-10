'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BabyRoadLogo from '@/components/brand/BabyRoadLogo'

export type IntroDestination = '/login' | '/onboarding' | '/dashboard'

type IntroScreenProps = {
  durationMs?: number
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function resolveIntroDestination(): Promise<IntroDestination> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return '/login'
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  return profile ? '/dashboard' : '/onboarding'
}

export default function IntroScreen({ durationMs = 2700 }: IntroScreenProps) {
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    async function prepareNextScreen() {
      const [destination] = await Promise.all([
        resolveIntroDestination(),
        wait(durationMs),
      ])

      if (!isMounted) return

      router.prefetch(destination)
      router.replace(destination)
    }

    void prepareNextScreen()

    return () => {
      isMounted = false
    }
  }, [durationMs, router])

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#fffaf2] px-5 py-8 text-slate-800">
      <div className="intro-soft-blob intro-soft-blob-peach" />
      <div className="intro-soft-blob intro-soft-blob-mint" />
      <div className="intro-soft-blob intro-soft-blob-cream" />

      <section
        aria-label="BabyRoad 인트로"
        className="intro-fade-in relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-between rounded-[2rem] border border-white/80 bg-white/45 px-5 py-8 text-center shadow-[0_24px_80px_rgba(47,79,79,0.10)] backdrop-blur-sm sm:min-h-[780px]"
      >
        <div className="flex w-full flex-col items-center">
          <div className="intro-float flex flex-col items-center">
            <BabyRoadLogo size="lg" align="center" className="flex-col" />
          </div>

          <div className="mt-5 flex items-center gap-3 text-[#f2a88f]" aria-hidden="true">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#f2c7b8]" />
            <span className="text-lg">♥</span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#f2c7b8]" />
          </div>

          <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
            우리 아이의 성장 여정을
            <br />
            함께 기록해요
          </p>
          <p className="mt-2 text-sm text-slate-400">Growing with your little one</p>
        </div>

        <div className="relative my-8 w-full">
          <DecorativeSky />
          <StrollerIllustration />
        </div>

        <div className="w-full pb-3">
          <p className="text-sm font-medium text-slate-500">소중한 기록을 준비하고 있어요</p>
          <div className="mx-auto mt-5 flex w-full max-w-[230px] items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={index}
                className="intro-progress-segment h-1.5 flex-1 rounded-full bg-[#dce5e9]"
                style={{ animationDelay: `${index * 110}ms` }}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            인트로 화면을 표시한 뒤 다음 화면으로 이동합니다.
          </p>
        </div>
      </section>
    </main>
  )
}

function DecorativeSky() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1 h-28" aria-hidden="true">
      <div className="intro-float-slow absolute left-2 top-7 h-9 w-24 rounded-full bg-white/75 shadow-[18px_4px_0_rgba(255,255,255,0.68),-10px_10px_0_rgba(255,255,255,0.55)]" />
      <div className="intro-float absolute right-12 top-0 h-14 w-14 rounded-full bg-[#ffd88f] opacity-80 [clip-path:circle(50%_at_35%_50%)]" />
      <span className="absolute right-6 top-16 text-sm text-[#f5bc8e]">✦</span>
      <span className="absolute left-10 top-24 text-base text-[#f6b49d]">★</span>
      <span className="absolute right-24 top-24 text-sm text-[#f4a995]">♥</span>
    </div>
  )
}

function StrollerIllustration() {
  return (
    <svg
      className="intro-float-slow mx-auto h-auto w-full max-w-[330px]"
      viewBox="0 0 360 330"
      role="img"
      aria-label="잠든 아기가 있는 유모차 일러스트"
    >
      <defs>
        <linearGradient id="strollerBody" x1="70" x2="300" y1="130" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d8e6d6" />
          <stop offset="1" stopColor="#8fb3a1" />
        </linearGradient>
        <linearGradient id="blanket" x1="185" x2="292" y1="136" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bfe5dc" />
          <stop offset="1" stopColor="#8ccfc5" />
        </linearGradient>
        <radialGradient id="skin" cx="0" cy="0" r="1" gradientTransform="matrix(58 0 0 58 179 128)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd7bd" />
          <stop offset="1" stopColor="#f2a985" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#45605a" floodOpacity="0.18" />
        </filter>
      </defs>

      <g opacity="0.55">
        <path d="M28 243c11-22 11-44 1-66" fill="none" stroke="#f2c7b8" strokeWidth="3" strokeDasharray="7 9" />
        <path d="M322 188c-19 14-29 31-29 53" fill="none" stroke="#f2c7b8" strokeWidth="3" strokeDasharray="7 9" />
        <path d="M33 280c11-33 24-50 40-55" fill="none" stroke="#a5c5ae" strokeWidth="7" strokeLinecap="round" />
        <path d="M62 282c-6-25-1-45 14-60" fill="none" stroke="#a5c5ae" strokeWidth="7" strokeLinecap="round" />
        <path d="M304 277c3-30 14-52 31-66" fill="none" stroke="#a5c5ae" strokeWidth="7" strokeLinecap="round" />
        <path d="M273 281c-10-34-5-59 15-75" fill="none" stroke="#f3b29d" strokeWidth="7" strokeLinecap="round" />
        <path d="M17 206l7 13 13-7-7 13 13 7-15 2-2 15-7-13-13 7 7-13-13-7 15-2z" fill="#f6b49d" />
        <path d="M331 249l6 10 10-6-5 11 10 5-12 2-2 12-6-10-10 6 5-11-10-5 12-2z" fill="#f6b49d" />
      </g>

      <ellipse cx="178" cy="291" rx="121" ry="18" fill="#eadfd1" opacity="0.62" />

      <g filter="url(#softShadow)">
        <path
          d="M68 139c0-53 43-96 96-96h14c16 0 29 13 29 29v85H68z"
          fill="url(#strollerBody)"
        />
        <path d="M89 147c0-42 33-76 75-76h20v85H89z" fill="#7d9e8f" opacity="0.25" />
        <path
          d="M57 154h226c4 0 7 3 7 7 0 53-43 96-96 96H115c-36 0-65-29-65-65v-31c0-4 3-7 7-7z"
          fill="url(#strollerBody)"
        />
        <path d="M62 161h224" stroke="#f3e5d7" strokeWidth="9" strokeLinecap="round" />
        <circle cx="124" cy="164" r="12" fill="#f5eadf" />
        <circle cx="124" cy="164" r="5" fill="#9bb1a6" />

        <circle cx="176" cy="118" r="44" fill="url(#skin)" />
        <path d="M151 91c16-17 43-17 58 2" fill="none" stroke="#c7835f" strokeWidth="4" strokeLinecap="round" opacity="0.48" />
        <path d="M178 83c6 7 4 14-6 19" fill="none" stroke="#c7835f" strokeWidth="4" strokeLinecap="round" opacity="0.46" />
        <path d="M161 126c7 6 14 6 21 0" fill="none" stroke="#a66f56" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        <path d="M201 126c7 6 14 6 21 0" fill="none" stroke="#a66f56" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        <path d="M192 147c8 5 18 5 25 0" fill="none" stroke="#cc7d62" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        <circle cx="144" cy="129" r="8" fill="#f5a98e" opacity="0.33" />
        <circle cx="222" cy="129" r="8" fill="#f5a98e" opacity="0.33" />

        <path
          d="M139 151c23-30 89-31 125-3l-17 58H138c-16 0-28-13-28-28 0-16 13-28 29-27z"
          fill="url(#blanket)"
        />
        <path d="M116 174c10-16 31-24 52-19" fill="none" stroke="#fdf7ed" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <path d="M225 154c17 0 27 11 31 25" fill="none" stroke="#6cb9ac" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        <path d="M236 157c-3 11-8 18-18 22" fill="none" stroke="#6cb9ac" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </g>

      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M118 225l56 59" stroke="#d8c8b6" strokeWidth="8" />
        <path d="M246 225l-74 59" stroke="#d8c8b6" strokeWidth="8" />
        <path d="M206 224l84-91c10-11 29-6 31 10" stroke="#c6a487" strokeWidth="10" />
        <path d="M289 132c11-6 24-2 31 8" stroke="#a77f60" strokeWidth="9" />
        <path d="M87 283h198" stroke="#9eb6aa" strokeWidth="10" />
      </g>

      <g>
        <circle cx="79" cy="286" r="28" fill="#30373a" />
        <circle cx="79" cy="286" r="20" fill="#f0dfc7" />
        <circle cx="79" cy="286" r="7" fill="#6b7773" />
        <circle cx="182" cy="286" r="28" fill="#3b4142" />
        <circle cx="182" cy="286" r="20" fill="#f0dfc7" />
        <circle cx="182" cy="286" r="7" fill="#6b7773" />
        <circle cx="282" cy="286" r="28" fill="#3b4142" />
        <circle cx="282" cy="286" r="20" fill="#f0dfc7" />
        <circle cx="282" cy="286" r="7" fill="#6b7773" />
      </g>

      <g fill="#f2a88f" opacity="0.85">
        <path d="M174 221c4-8 16-6 17 4 2-10 14-11 17-2 4 12-16 24-17 24s-22-12-17-26z" />
        <path d="M35 102c3-6 11-5 12 3 2-8 11-8 13-1 3 9-12 18-13 18s-16-9-12-20z" opacity="0.7" />
        <path d="M329 118c2-5 9-4 10 2 2-6 9-6 10 0 3 8-10 15-10 15s-13-7-10-17z" opacity="0.62" />
      </g>
    </svg>
  )
}
