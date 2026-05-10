import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import FeedingEditForm from '@/components/feeding/FeedingEditForm'
import type { Child } from '@/types/child'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '수유/식사 기록 수정 | BabyRoad',
}

interface PageProps {
  params: Promise<{ recordId: string }>
}

export default async function FeedingEditPage({ params }: PageProps) {
  const { recordId } = await params

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

  const child = ((children ?? []) as Child[])[0] ?? null
  if (!child) redirect('/onboarding')

  const { data: recordData } = await supabase
    .from('child_feeding_records')
    .select('id, user_id, child_id, recorded_at, feeding_type, amount, unit, food_name, reaction, memo, created_at, updated_at, deleted_at')
    .eq('id', recordId)
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!recordData) notFound()

  const record = recordData as Tables<'child_feeding_records'>

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="수유/식사 기록 수정" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-5">
          <section>
            <h1 className="babyroad-title">수유/식사 기록 수정</h1>
            <p className="babyroad-subtitle">
              {child.name}의 수유/식사 기록을 수정해요.
            </p>
          </section>

          <FeedingEditForm record={record} />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
