import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import GrowthRecordForm from '@/components/growth/GrowthRecordForm'
import GrowthRecordList from '@/components/growth/GrowthRecordList'
import GrowthSummaryCard from '@/components/growth/GrowthSummaryCard'

export const metadata: Metadata = {
  title: '성장 기록',
}

export default async function GrowthPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()

  const { data: records } = await supabase
    .from('child_growth_records')
    .select('id, user_id, child_id, record_date, height, weight, head_circumference, memo, created_at, updated_at, deleted_at')
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  const growthRecords = records ?? []
  const latestRecord = growthRecords[0] ?? null

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="성장 기록" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto w-full max-w-md space-y-5">
          <section>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="babyroad-title">성장 기록</h1>
                <p className="babyroad-subtitle">
                  키, 몸무게, 머리둘레를 기록하고 성장 변화를 확인해요.
                </p>
              </div>
              {child.birth_date && (
                <Link
                  href="/growth/backfill"
                  className="shrink-0 rounded-full bg-[#EAF6F2] px-3 py-1 text-xs font-semibold text-[#2F8F84] hover:bg-[#D4EDE6] transition-colors"
                >
                  이전 기록
                </Link>
              )}
            </div>
          </section>

          <GrowthSummaryCard child={child} latestRecord={latestRecord} />

          <GrowthRecordForm userId={user.id} childId={child.id} />

          {growthRecords.length === 0 && child.birth_date && (
            <div className="rounded-[1.25rem] border border-[#CFE3D8] bg-[#EAF6F2]/60 px-4 py-4 text-center">
              <p className="text-sm font-medium text-[#2F766E]">이전에 기록된 성장 데이터가 있나요?</p>
              <p className="mt-1 text-xs text-[#6B9E95]">출생 시부터 지금까지 키와 몸무게를 한번에 입력할 수 있어요.</p>
              <Link
                href="/growth/backfill"
                className="mt-3 inline-block rounded-full bg-[#4FA99A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3D9489] transition-colors"
              >
                이전 기록 추가하기
              </Link>
            </div>
          )}

          <GrowthRecordList records={growthRecords} />

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
