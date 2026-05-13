import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { getChildRole, canEditRecords } from '@/lib/collaborator'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import Card from '@/components/common/Card'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import DiaperRecordForm from '@/components/diaper/DiaperRecordForm'
import DiaperRecordList from '@/components/diaper/DiaperRecordList'
import type { Tables } from '@/types/database'
import { formatDateTime } from '@/lib/date'

export const metadata: Metadata = {
  title: '배변 기록 | BabyRoad',
}

function getKSTTodayStart(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const todayStr = kstNow.toISOString().split('T')[0]
  return `${todayStr}T00:00:00+09:00`
}

export default async function DiaperPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()
  const role = await getChildRole(user.id, child.id)
  const canEdit = canEditRecords(role)

  const todayStart = getKSTTodayStart()

  const [recordsResult, todayResult] = await Promise.all([
    supabase
      .from('child_diaper_records')
      .select('*')
      .eq('child_id', child.id)
      .is('deleted_at', null)
      .order('recorded_at', { ascending: false })
      .limit(30),
    supabase
      .from('child_diaper_records')
      .select('id, diaper_type, recorded_at')
      .eq('child_id', child.id)
      .is('deleted_at', null)
      .gte('recorded_at', todayStart)
      .order('recorded_at', { ascending: false }),
  ])

  const records = (recordsResult.data ?? []) as Tables<'child_diaper_records'>[]
  const todayRecords = (todayResult.data ?? []) as Pick<Tables<'child_diaper_records'>, 'id' | 'diaper_type' | 'recorded_at'>[]

  const todayUrine = todayRecords.filter((r) => r.diaper_type === 'urine' || r.diaper_type === 'both').length
  const todayStool = todayRecords.filter((r) => r.diaper_type === 'stool' || r.diaper_type === 'both').length
  const latestTodayRecord = todayRecords[0] ?? null

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="배변 기록" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">배변 기록</h1>
            <p className="babyroad-subtitle">
              소변, 대변 기록으로 아이의 배변 패턴을 확인해요.
            </p>
          </div>

          <ChildSummaryCard child={child} />

          {/* 오늘 배변 요약 */}
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">오늘 배변</h2>
              {latestTodayRecord && (
                <span className="text-xs text-slate-400">
                  최근 {formatDateTime(latestTodayRecord.recorded_at)}
                </span>
              )}
            </div>
            {todayUrine === 0 && todayStool === 0 ? (
              <p className="mt-2 text-sm text-slate-400">오늘 기록이 없어요.</p>
            ) : (
              <div className="mt-3 flex gap-3">
                {todayUrine > 0 && (
                  <div className="flex-1 rounded-2xl bg-sky-50 px-3 py-2.5 text-center">
                    <p className="text-xs text-sky-600">소변</p>
                    <p className="mt-1 text-xl font-black text-sky-700">{todayUrine}<span className="text-sm font-semibold">회</span></p>
                  </div>
                )}
                {todayStool > 0 && (
                  <div className="flex-1 rounded-2xl bg-[#FFF3E9] px-3 py-2.5 text-center">
                    <p className="text-xs text-[#D77C5B]">대변</p>
                    <p className="mt-1 text-xl font-black text-[#D77C5B]">{todayStool}<span className="text-sm font-semibold">회</span></p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {canEdit ? (
            <DiaperRecordForm userId={user.id} childId={child.id} />
          ) : (
            <p className="rounded-2xl border border-[#CFE3D8] bg-[#EAF6F2]/60 px-4 py-3 text-center text-sm text-[#4FA99A]">
              보기만 가능한 보호자입니다. 기록 입력은 제한됩니다.
            </p>
          )}

          <DiaperRecordList records={records} canEdit={canEdit} />

          <Card className="border-[#EAF6F2] bg-[#EAF6F2]/40">
            <p className="text-xs leading-5 text-[#6B7A90]">
              배변 기록은 아이의 생활 패턴을 확인하기 위한 참고 정보입니다. 색상, 양, 상태가 걱정되거나 평소와 다른 변화가 계속되면 소아청소년과 또는 의료진과 상담해주세요.
            </p>
          </Card>

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
