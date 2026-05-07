import type { Metadata } from 'next'
import OnboardingForm from '@/components/auth/OnboardingForm'

export const metadata: Metadata = {
  title: '시작하기',
}

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 py-12">
      <div className="mx-auto max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-4xl">🌱</div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">베이비로드 시작하기</h1>
          <p className="mt-1 text-sm text-slate-500">기본 정보를 입력해 주세요</p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  )
}
