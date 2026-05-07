import type { Metadata } from 'next'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

export const metadata: Metadata = {
  title: '로그인',
}

type SearchParams = Promise<{ error?: string }>

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { error } = await searchParams
  const hasError = error === 'auth_failed'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="mb-10 text-center">
          <div className="text-5xl">🌱</div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">베이비로드</h1>
          <p className="mt-0.5 text-xs font-medium tracking-widest text-slate-400">BabyRoad</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            임신부터 7세까지, 우리 아이 성장 로드맵
          </p>
        </div>

        {/* 오류 메시지 */}
        {hasError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <span className="mt-0.5 flex-shrink-0">⚠️</span>
            <span>로그인 중 문제가 발생했습니다. 다시 시도해 주세요.</span>
          </div>
        )}

        {/* 소셜 로그인 */}
        <section aria-label="소셜 로그인">
          <h2 className="mb-5 text-center text-sm font-semibold text-slate-700">
            소셜 계정으로 시작하기
          </h2>
          <SocialLoginButtons />
        </section>

        {/* 의료 정보 안내 */}
        <div className="mt-8 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
          본 앱에서 제공하는 성장, 발달, 예방접종, 건강 정보는 일반적인 참고 정보입니다.
          아이의 건강 상태, 질병, 발달 지연, 접종 가능 여부는 반드시 전문 의료진과 상담해 주세요.
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>

      </div>
    </main>
  )
}
