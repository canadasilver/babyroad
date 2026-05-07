import type { Metadata } from 'next'
import Card from '@/components/common/Card'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: '홈',
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="BabyRoad" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">

          {/* 아이 프로필 카드 */}
          <Card className="flex items-center gap-4 border-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
              👶
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">우리 아이</p>
              <h2 className="text-lg font-bold">아이 이름</h2>
              <p className="text-sm text-white/80">6개월 · 남아</p>
            </div>
          </Card>

          {/* 오늘 할 일 */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">오늘 할 일</h3>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
              <p className="text-sm text-slate-500">오늘 예정된 일정이 없습니다.</p>
            </div>
          </Card>

          {/* 다음 예방접종 */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">다음 예방접종</h3>
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">DTaP 3차</p>
                <p className="text-xs text-slate-500">2025년 6월 15일</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-600">
                예정
              </span>
            </div>
          </Card>

          {/* 최근 성장 기록 */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">최근 성장 기록</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '키', value: '65.5 cm' },
                { label: '몸무게', value: '7.2 kg' },
                { label: '머리둘레', value: '42.3 cm' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 빠른 기록 */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">빠른 기록</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '📏', label: '성장' },
                { icon: '🍼', label: '수유' },
                { icon: '😴', label: '수면' },
                { icon: '🌡️', label: '건강' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </button>
              ))}
            </div>
          </Card>

        </div>
      </main>

      <BottomNav />
    </div>
  )
}
