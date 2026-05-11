import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import FeedingSummaryCard from '@/components/feeding/FeedingSummaryCard'
import FeedingRecordForm from '@/components/feeding/FeedingRecordForm'
import FeedingRecordList from '@/components/feeding/FeedingRecordList'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '수유/식사 기록 | BabyRoad',
}

export default async function FeedingPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()

  const { data: recordsData } = await supabase
    .from('child_feeding_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('recorded_at', { ascending: false })
    .limit(20)

  const records = (recordsData ?? []) as Tables<'child_feeding_records'>[]

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="수유/식사 기록" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">수유/식사 기록</h1>
            <p className="babyroad-subtitle">
              모유, 분유, 이유식, 유아식 기록을 남겨 아이의 식사 패턴을 확인해요.
            </p>
          </div>

          <ChildSummaryCard child={child} />
          <FeedingSummaryCard records={records} />
          <FeedingRecordForm userId={user.id} childId={child.id} />
          <FeedingRecordList records={records} />
          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
