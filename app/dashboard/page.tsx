import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import {
  formatDate,
  formatDateTime,
  formatSleepDuration,
  calculateVaccinationUiStatus,
  getVaccinationScheduledDate,
} from '@/lib/date'
import { formatNumber } from '@/lib/utils'
import type { Child, ChildGrowthRecord } from '@/types/child'
import type { Tables } from '@/types/database'

const FEEDING_TYPE_LABEL: Record<string, string> = {
  breast_milk: '모유',
  formula: '분유',
  baby_food: '이유식',
  solid_food: '유아식',
  snack: '간식',
  water: '물',
}

const UNIT_LABEL: Record<string, string> = {
  ml: 'ml',
  g: 'g',
  count: '회',
  spoon: '숟가락',
  other: '',
}

const SLEEP_TYPE_LABEL: Record<string, string> = {
  day_sleep: '낮잠',
  night_sleep: '밤잠',
}

export const metadata: Metadata = {
  title: '대시보드',
}

const QUICK_RECORDS = [
  { icon: '📏', label: '성장', href: '/growth' },
  { icon: '🍼', label: '수유', href: '/feeding' },
  { icon: '🌙', label: '수면', href: '/sleep' },
  { icon: '🩺', label: '건강', href: '/health' },
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

  const childList = (children ?? []) as Child[]
  const child = childList[0] ?? null

  let latestGrowthRecord: ChildGrowthRecord | null = null
  let latestFeedingRecord: Tables<'child_feeding_records'> | null = null
  let latestSleepRecord: Tables<'child_sleep_records'> | null = null
  let latestHealthRecord: Tables<'child_health_records'> | null = null
  let nextVaccination: {
    name: string
    doseLabel: string
    scheduledDate: string
    uiStatus: 'available' | 'scheduled'
  } | null = null

  if (child) {
    const [growthResult, feedingResult, sleepResult, healthResult, vaccineResult, scheduleResult, recordResult] =
      await Promise.all([
        supabase
          .from('child_growth_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('child_id', child.id)
          .is('deleted_at', null)
          .order('record_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('child_feeding_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('child_id', child.id)
          .is('deleted_at', null)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('child_sleep_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('child_id', child.id)
          .is('deleted_at', null)
          .order('sleep_start', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('child_health_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('child_id', child.id)
          .is('deleted_at', null)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        child.status === 'born' && child.birth_date
          ? supabase
              .from('vaccines')
              .select('id, name')
              .is('deleted_at', null)
          : Promise.resolve({ data: null }),
        child.status === 'born' && child.birth_date
          ? supabase
              .from('vaccine_schedules')
              .select('id, vaccine_id, start_month, end_month, dose_label')
              .is('deleted_at', null)
              .order('start_month')
          : Promise.resolve({ data: null }),
        child.status === 'born' && child.birth_date
          ? supabase
              .from('child_vaccination_records')
              .select('vaccine_schedule_id, status')
              .eq('user_id', user.id)
              .eq('child_id', child.id)
              .is('deleted_at', null)
          : Promise.resolve({ data: null }),
      ])

    latestGrowthRecord = growthResult.data as ChildGrowthRecord | null
    latestFeedingRecord = feedingResult.data as Tables<'child_feeding_records'> | null
    latestSleepRecord = sleepResult.data as Tables<'child_sleep_records'> | null
    latestHealthRecord = healthResult.data as Tables<'child_health_records'> | null

    if (
      child.status === 'born' &&
      child.birth_date &&
      vaccineResult.data &&
      scheduleResult.data
    ) {
      const vaccines = vaccineResult.data as Pick<Tables<'vaccines'>, 'id' | 'name'>[]
      const schedules = scheduleResult.data as Pick<
        Tables<'vaccine_schedules'>,
        'id' | 'vaccine_id' | 'start_month' | 'end_month' | 'dose_label'
      >[]
      const records = (recordResult.data ?? []) as Pick<
        Tables<'child_vaccination_records'>,
        'vaccine_schedule_id' | 'status'
      >[]

      const completedIds = new Set(
        records
          .filter((r) => r.status === 'completed')
          .map((r) => r.vaccine_schedule_id)
          .filter(Boolean)
      )
      const vaccineMap = new Map(vaccines.map((v) => [v.id, v.name]))

      for (const schedule of schedules) {
        if (completedIds.has(schedule.id)) continue

        const uiStatus = calculateVaccinationUiStatus(
          child.birth_date,
          schedule.start_month,
          schedule.end_month,
          false
        )

        if (uiStatus === 'available' || uiStatus === 'scheduled') {
          nextVaccination = {
            name: vaccineMap.get(schedule.vaccine_id) ?? '',
            doseLabel: schedule.dose_label,
            scheduledDate: getVaccinationScheduledDate(child.birth_date, schedule.start_month),
            uiStatus,
          }
          break
        }
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="BabyRoad" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">
          <p className="text-sm text-slate-500">
            안녕하세요,{' '}
            <span className="font-semibold text-slate-800">{profile.nickname}</span>님
          </p>

          {child ? (
            <ChildSummaryCard child={child} />
          ) : (
            <Card className="border-dashed py-6 text-center">
              <p className="text-sm text-slate-500">아직 등록된 아이 정보가 없어요.</p>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white"
              >
                아이 정보 등록하기
              </Link>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">오늘 할 일</h3>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
              <p className="text-sm text-slate-500">오늘 예정된 일정이 없어요.</p>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">다음 예방접종</h3>
              <Link href="/vaccinations" className="text-xs font-medium text-orange-600">
                모두 보기
              </Link>
            </div>

            {nextVaccination ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{nextVaccination.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{nextVaccination.doseLabel}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(nextVaccination.scheduledDate)} 이후
                  </p>
                </div>
                <span
                  className={
                    nextVaccination.uiStatus === 'available'
                      ? 'shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700'
                      : 'shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'
                  }
                >
                  {nextVaccination.uiStatus === 'available' ? '접종 가능' : '예정'}
                </span>
              </div>
            ) : child?.status === 'pregnancy' ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">출생 후 예방접종 일정을 확인할 수 있어요.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">모든 예방접종이 완료되었습니다. 🎉</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">최근 성장 기록</h3>
              <Link href="/growth" className="text-xs font-medium text-orange-600">
                기록하기
              </Link>
            </div>

            {latestGrowthRecord ? (
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(latestGrowthRecord.record_date)}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <DashboardMetric
                    label="키"
                    value={`${formatNumber(latestGrowthRecord.height)} cm`}
                  />
                  <DashboardMetric
                    label="몸무게"
                    value={`${formatNumber(latestGrowthRecord.weight, 2)} kg`}
                  />
                  <DashboardMetric
                    label="머리둘레"
                    value={
                      latestGrowthRecord.head_circumference === null
                        ? '-'
                        : `${formatNumber(latestGrowthRecord.head_circumference)} cm`
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">아직 등록된 성장 기록이 없어요.</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">최근 수유/식사</h3>
              <Link href="/feeding" className="text-xs font-medium text-orange-600">
                기록하기
              </Link>
            </div>

            {latestFeedingRecord ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {FEEDING_TYPE_LABEL[latestFeedingRecord.feeding_type] ??
                      latestFeedingRecord.feeding_type}
                  </p>
                  {latestFeedingRecord.food_name && (
                    <p className="mt-0.5 text-xs text-slate-500">{latestFeedingRecord.food_name}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(latestFeedingRecord.recorded_at)}
                  </p>
                </div>
                {latestFeedingRecord.amount !== null && (
                  <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                    {latestFeedingRecord.amount}
                    {latestFeedingRecord.unit
                      ? (UNIT_LABEL[latestFeedingRecord.unit] ?? latestFeedingRecord.unit)
                      : ''}
                  </span>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">아직 등록된 기록이 없어요.</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">최근 수면</h3>
              <Link href="/sleep" className="text-xs font-medium text-orange-600">
                기록하기
              </Link>
            </div>

            {latestSleepRecord ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        latestSleepRecord.sleep_type === 'night_sleep'
                          ? 'rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700'
                          : 'rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700'
                      }
                    >
                      {SLEEP_TYPE_LABEL[latestSleepRecord.sleep_type] ?? latestSleepRecord.sleep_type}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatSleepDuration(latestSleepRecord.sleep_start, latestSleepRecord.sleep_end)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(latestSleepRecord.sleep_start)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">아직 등록된 기록이 없어요.</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">최근 건강</h3>
              <Link href="/health" className="text-xs font-medium text-orange-600">
                기록하기
              </Link>
            </div>

            {latestHealthRecord ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  {latestHealthRecord.symptoms && (
                    <p className="text-sm font-semibold text-slate-900">
                      {latestHealthRecord.symptoms}
                    </p>
                  )}
                  {latestHealthRecord.hospital_name && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      병원: {latestHealthRecord.hospital_name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(latestHealthRecord.recorded_at)}
                  </p>
                </div>
                {latestHealthRecord.temperature !== null && (
                  <span
                    className={
                      latestHealthRecord.temperature >= 37.5
                        ? 'shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700'
                        : 'shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700'
                    }
                  >
                    {latestHealthRecord.temperature}℃
                  </span>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">아직 등록된 기록이 없어요.</p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">빠른 기록</h3>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_RECORDS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 p-3 text-center transition-colors hover:bg-slate-100"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </Link>
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

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
