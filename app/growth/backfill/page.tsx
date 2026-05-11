import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import BackfillForm, { type BackfillSectionConfig } from '@/components/growth/BackfillForm'
import { getVaccinationScheduledDate, toISODateString } from '@/lib/date'

export const metadata: Metadata = {
  title: '이전 성장 기록 추가 | BabyRoad',
}

export default async function GrowthBackfillPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')
  if (!child.birth_date) redirect('/growth')

  const birthDate = child.birth_date
  const month6Date = getVaccinationScheduledDate(birthDate, 6)
  const month12Date = getVaccinationScheduledDate(birthDate, 12)
  const today = toISODateString()

  const sections: BackfillSectionConfig[] = [
    { key: 'birth', label: '출생 시', initialDate: birthDate },
    { key: 'month6', label: '6개월', initialDate: month6Date },
    { key: 'month12', label: '12개월', initialDate: month12Date },
    { key: 'recent', label: '최근', initialDate: today },
  ]

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="이전 성장 기록 추가" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto w-full max-w-md space-y-5">
          <section>
            <h1 className="babyroad-title">이전 성장 기록 추가</h1>
            <p className="babyroad-subtitle">
              출생 시부터 최근까지 기억나는 성장 기록을 한번에 입력해요. 날짜는 수정할 수 있어요.
            </p>
          </section>

          <BackfillForm userId={user.id} childId={child.id} sections={sections} />

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
