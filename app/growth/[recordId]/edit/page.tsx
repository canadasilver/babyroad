import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import GrowthEditForm from '@/components/growth/GrowthEditForm'
import type { ChildGrowthRecord } from '@/types/child'

export const metadata: Metadata = {
  title: '성장 기록 수정 | BabyRoad',
}

interface PageProps {
  params: Promise<{ recordId: string }>
}

export default async function GrowthEditPage({ params }: PageProps) {
  const { recordId } = await params

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()

  const { data: recordData } = await supabase
    .from('child_growth_records')
    .select('id, user_id, child_id, record_date, height, weight, head_circumference, memo, created_at, updated_at, deleted_at')
    .eq('id', recordId)
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!recordData) notFound()

  const record = recordData as ChildGrowthRecord

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="성장 기록 수정" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto w-full max-w-md space-y-5">
          <section>
            <h1 className="babyroad-title">성장 기록 수정</h1>
            <p className="babyroad-subtitle">
              {child.name}의 성장 기록을 수정해요.
            </p>
          </section>

          <GrowthEditForm record={record} />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
