import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'

export const metadata: Metadata = {
  title: '커뮤니티 | BabyRoad',
}

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="커뮤니티" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">커뮤니티</h1>
            <p className="mt-1 text-sm text-slate-500">
              다른 부모들과 육아 경험을 나눠요.
            </p>
          </div>

          <Card className="py-10 text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-3 text-base font-semibold text-slate-800">준비 중입니다</p>
            <p className="mt-2 text-sm text-slate-500">커뮤니티 기능을 곧 제공할 예정이에요.</p>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
