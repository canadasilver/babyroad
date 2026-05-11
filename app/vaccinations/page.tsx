import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import VaccinationStatusCard from '@/components/vaccination/VaccinationStatusCard'
import VaccinationScheduleList from '@/components/vaccination/VaccinationScheduleList'
import {
  calculateVaccinationUiStatus,
  getVaccinationScheduledDate,
  getVaccinationEndDate,
  formatDate,
} from '@/lib/date'
import type { VaccinationScheduleItem } from '@/types/child'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '예방접종 | BabyRoad',
}

export default async function VaccinationsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()

  if (child.status === 'pregnancy') {
    return (
      <div className="babyroad-page flex min-h-screen flex-col">
        <Header title="예방접종" />
        <main className="flex-1 px-4 py-6 pb-28">
          <div className="mx-auto max-w-md space-y-4">
            <div>
              <h1 className="babyroad-title">예방접종</h1>
              <p className="babyroad-subtitle">
                아이의 출생일을 기준으로 예방접종 일정을 확인하고 완료 기록을 남겨요.
              </p>
            </div>
            <ChildSummaryCard child={child} />
            <Card className="py-8 text-center">
              <p className="text-4xl">🤰</p>
              <p className="mt-3 text-base font-semibold text-slate-800">
                출생 후 이용 가능합니다
              </p>
              <p className="mt-2 text-sm text-slate-500">
                아이가 태어난 후 예방접종 일정을 확인하고 완료 기록을 남길 수 있어요.
              </p>
            </Card>
            <MedicalDisclaimer />
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!child.birth_date) {
    return (
      <div className="babyroad-page flex min-h-screen flex-col">
        <Header title="예방접종" />
        <main className="flex-1 px-4 py-6 pb-28">
          <div className="mx-auto max-w-md space-y-4">
            <ChildSummaryCard child={child} />
            <Card className="py-6 text-center">
              <p className="text-sm text-slate-500">
                아이의 출생일 정보가 없어 예방접종 일정을 계산할 수 없습니다.
              </p>
            </Card>
            <MedicalDisclaimer />
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const [{ data: vaccinesData }, { data: schedulesData }, { data: recordsData }] =
    await Promise.all([
      supabase.from('vaccines').select('*').is('deleted_at', null).order('name'),
      supabase
        .from('vaccine_schedules')
        .select('*')
        .is('deleted_at', null)
        .order('start_month'),
      supabase
        .from('child_vaccination_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('child_id', child.id)
        .is('deleted_at', null),
    ])

  const vaccines = (vaccinesData ?? []) as Tables<'vaccines'>[]
  const schedules = (schedulesData ?? []) as Tables<'vaccine_schedules'>[]
  const records = (recordsData ?? []) as Tables<'child_vaccination_records'>[]

  const vaccineMap = new Map(vaccines.map((v) => [v.id, v]))

  const scheduleItems: VaccinationScheduleItem[] = schedules
    .flatMap((schedule) => {
      const vaccine = vaccineMap.get(schedule.vaccine_id)
      if (!vaccine) return []

      const completedRecord = records.find(
        (r) => r.vaccine_schedule_id === schedule.id && r.status === 'completed'
      )
      const isCompleted = !!completedRecord
      const scheduledDate = getVaccinationScheduledDate(child.birth_date!, schedule.start_month)
      const endDate = getVaccinationEndDate(child.birth_date!, schedule.end_month)
      const uiStatus = calculateVaccinationUiStatus(
        child.birth_date!,
        schedule.start_month,
        schedule.end_month,
        isCompleted
      )

      const item: VaccinationScheduleItem = {
        vaccineId: vaccine.id,
        vaccineName: vaccine.name,
        vaccineDescription: vaccine.description,
        isRequired: vaccine.is_required,
        scheduleId: schedule.id,
        doseLabel: schedule.dose_label,
        scheduleDescription: schedule.description,
        startMonth: schedule.start_month,
        endMonth: schedule.end_month,
        scheduledDate,
        endDate,
        uiStatus,
        vaccinatedDate: completedRecord?.vaccinated_date ?? null,
        recordId: completedRecord?.id ?? null,
      }
      return [item]
    })
    .sort((a, b) => a.startMonth - b.startMonth)

  const counts = {
    total: scheduleItems.length,
    completed: scheduleItems.filter((i) => i.uiStatus === 'completed').length,
    available: scheduleItems.filter((i) => i.uiStatus === 'available').length,
    scheduled: scheduleItems.filter((i) => i.uiStatus === 'scheduled').length,
    delayed: scheduleItems.filter((i) => i.uiStatus === 'delayed').length,
  }

  const nextVaccination = scheduleItems.find(
    (i) => i.uiStatus === 'available' || i.uiStatus === 'scheduled'
  )

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="예방접종" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">예방접종</h1>
            <p className="babyroad-subtitle">
              아이의 출생일을 기준으로 예방접종 일정을 확인하고 완료 기록을 남겨요.
            </p>
          </div>

          <ChildSummaryCard child={child} />

          {nextVaccination && (
            <Card>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">다음 예방접종</h2>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {nextVaccination.vaccineName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{nextVaccination.doseLabel}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(nextVaccination.scheduledDate)} ~{' '}
                    {formatDate(nextVaccination.endDate)}
                  </p>
                </div>
                <span
                  className={
                    nextVaccination.uiStatus === 'available'
                      ? 'shrink-0 rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#D77C5B]'
                      : 'shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'
                  }
                >
                  {nextVaccination.uiStatus === 'available' ? '접종 가능' : '예정'}
                </span>
              </div>
            </Card>
          )}

          {scheduleItems.length > 0 && <VaccinationStatusCard counts={counts} />}

          <VaccinationScheduleList
            items={scheduleItems}
            userId={user.id}
            childId={child.id}
          />

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
