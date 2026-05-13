import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { getChildRole, canEditRecords } from '@/lib/collaborator'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import SleepSummaryCard from '@/components/sleep/SleepSummaryCard'
import SleepRecordForm from '@/components/sleep/SleepRecordForm'
import SleepRecordList from '@/components/sleep/SleepRecordList'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '수면 기록 | BabyRoad',
}

export default async function SleepPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()
  const role = await getChildRole(user.id, child.id)
  const canEdit = canEditRecords(role)

  const { data: recordsData } = await supabase
    .from('child_sleep_records')
    .select('*')
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('sleep_start', { ascending: false })
    .limit(20)

  const records = (recordsData ?? []) as Tables<'child_sleep_records'>[]

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="수면 기록" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">수면 기록</h1>
            <p className="babyroad-subtitle">
              낮잠과 밤잠을 기록하고 아이의 수면 패턴을 확인해요.
            </p>
          </div>

          <ChildSummaryCard child={child} />
          <SleepSummaryCard records={records} />
          {canEdit ? (
            <SleepRecordForm userId={user.id} childId={child.id} />
          ) : (
            <p className="rounded-2xl border border-[#CFE3D8] bg-[#EAF6F2]/60 px-4 py-3 text-center text-sm text-[#4FA99A]">
              보기만 가능한 보호자입니다. 기록 입력은 제한됩니다.
            </p>
          )}
          <SleepRecordList records={records} canEdit={canEdit} />
          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
