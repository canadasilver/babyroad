import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BabyRoad | 베이비로드',
  description: '임신부터 학교가기 전까지, 우리 아이 성장 로드맵',
}

const features = [
  {
    icon: '📏',
    title: '성장 기록',
    description: '키, 몸무게, 머리둘레를 기록하고 그래프로 확인해요',
  },
  {
    icon: '💉',
    title: '예방접종 관리',
    description: '출생일 기준 접종 일정을 자동으로 안내드려요',
  },
  {
    icon: '🧠',
    title: '발달 정보',
    description: '개월별 발달 정보와 체크리스트를 확인해요',
  },
  {
    icon: '🍼',
    title: '수유 / 수면 기록',
    description: '수유, 식사, 수면 패턴을 간편하게 기록해요',
  },
  {
    icon: '💬',
    title: '커뮤니티',
    description: '같은 시기 부모들과 육아 이야기를 나눠요',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="mx-auto max-w-md px-4 py-12">
        {/* Hero */}
        <section className="text-center">
          <div className="text-5xl">🌱</div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">베이비로드</h1>
          <p className="mt-1 text-sm font-medium text-orange-500">BabyRoad</p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            임신부터 학교가기 전까지,
            <br />
            우리 아이 성장 로드맵
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block w-full rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
          >
            시작하기
          </Link>
        </section>

        {/* Features */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-slate-900">주요 기능</h2>
          <div className="flex flex-col gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-slate-400">
          <p>© 2025 BabyRoad. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
