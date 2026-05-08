import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'

export const metadata: Metadata = {
  title: '홈',
}

const QUICK_RECORDS = [
  { icon: '📏', label: '성장' },
  { icon: '🍼', label: '수유' },
  { icon: '😴', label: '수면' },
  { icon: '🌡️', label: '건강' },
] as const

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const child = children?.[0] ?? null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="BabyRoad" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">

          <p className="text-sm text-slate-500">
            안녕하세요,{' '}
            <span className="font-semibold text-slate-800">{profile.nickname}</span>님 👋
          </p>

          {/* 아이 프로필 카드 */}
          {child ? (
            <ChildSummaryCard child={child} />
          ) : (
            <Card className="border-dashed py-6 text-center">
              <p className="text-sm text-slate-500">아직 등록된 아이 정보가 없습니다.</p>
            </Card>
          )}

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
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
              <p className="text-sm text-slate-500">예방접종 일정이 없습니다.</p>
            </div>
          </Card>

          {/* 최근 성장 기록 */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">최근 성장 기록</h3>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
              <p className="text-sm text-slate-500">아직 등록된 성장 기록이 없습니다.</p>
            </div>
          </Card>

          {/* 빠른 기록 */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">빠른 기록</h3>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_RECORDS.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <MedicalDisclaimer />

        </div>
      </main>

      <BottomNav />
    </div>
  )
}
