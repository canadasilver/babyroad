import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ChildAvatar from '@/components/child/ChildAvatar'
import GrowthTrendChart from '@/components/growth-report/GrowthTrendChart'
import { formatDate } from '@/lib/date'
import {
  GROWTH_STANDARD_SOURCE,
  getGrowthStandardSex,
  getStandardSeriesByMetric,
  getChildAgeLabelForReport,
  toGrowthChartPoints,
  toGrowthStandardSeries,
  type GrowthStandardPercentileRow,
} from '@/lib/growth-report'
import type { Child, ChildGrowthRecord } from '@/types/child'

export const metadata: Metadata = {
  title: '우리 아이 성장 리포트 | BabyRoad',
}

export const dynamic = 'force-dynamic'

export default async function GrowthReportPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const { data: childrenData } = await supabase
    .from('children')
    .select(
      'id, user_id, name, nickname, gender, status, due_date, birth_date, birth_weight, birth_height, birth_head_circumference, profile_image_url, is_premature, memo, created_at, updated_at, deleted_at'
    )
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const children = (childrenData ?? []) as Child[]
  const child = children[0] ?? null
  if (!child) redirect('/onboarding')

  const { data: recordsData } = await supabase
    .from('child_growth_records')
    .select('id, user_id, child_id, record_date, height, weight, head_circumference, memo, created_at, updated_at, deleted_at')
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('record_date', { ascending: true })
    .order('created_at', { ascending: true })

  const records = (recordsData ?? []) as ChildGrowthRecord[]
  const latestRecord = records[records.length - 1] ?? null
  const chartPoints = toGrowthChartPoints(records, child)
  const standardSex = getGrowthStandardSex(child)
  const standardAgeMonths = Array.from(
    new Set(
      chartPoints
        .map((point) => point.ageMonth)
        .filter((ageMonth): ageMonth is number => ageMonth !== null)
    )
  )

  let standardRows: GrowthStandardPercentileRow[] = []
  if (standardSex && child.birth_date && standardAgeMonths.length > 0) {
    const { data: standardData, error: standardError } = await supabase
      .from('growth_standard_percentiles')
      .select('id, standard_source, sex, metric, age_month, p3, p15, p50, p85, p97, l_value, m_value, s_value, created_at')
      .eq('standard_source', GROWTH_STANDARD_SOURCE)
      .eq('sex', standardSex)
      .in('metric', ['height', 'weight', 'head_circumference'])
      .in('age_month', standardAgeMonths)
      .order('age_month', { ascending: true })

    if (standardError) {
      console.warn('[growth-report] growth standard query failed', {
        code: standardError.code,
        standardSource: GROWTH_STANDARD_SOURCE,
        standardSex,
        ageMonths: standardAgeMonths,
      })
    }

    standardRows = (standardData ?? []) as GrowthStandardPercentileRow[]
  }

  const standardSeries = toGrowthStandardSeries(standardRows)
  const heightStandardSeries = getStandardSeriesByMetric(standardSeries, 'height')
  const weightStandardSeries = getStandardSeriesByMetric(standardSeries, 'weight')
  const headStandardSeries = getStandardSeriesByMetric(standardSeries, 'head_circumference')
  const hasStandardSeries = standardSeries.some((series) =>
    series.points.some((point) => point.p50 !== null)
  )

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="성장 리포트" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <section>
            <h1 className="babyroad-title">우리 아이 성장 리포트</h1>
            <p className="babyroad-subtitle">
              입력한 성장 기록을 바탕으로 키, 몸무게, 머리둘레 변화를 확인해요.
            </p>
          </section>

          <AppCard variant="hero">
            <div className="flex items-center gap-4">
              <ChildAvatar
                photoUrl={child.profile_image_url}
                gender={child.gender}
                status={child.status}
                size="md"
                className="bg-white/72 shadow-[0_10px_24px_rgba(37,52,74,0.10)]"
              />
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#4FA99A]">리포트 대상</p>
                  <h2 className="mt-1 text-xl font-black text-[#25344A]">{child.name}</h2>
                  <p className="mt-1 text-sm text-[#6B7A90]">{getChildAgeLabelForReport(child)}</p>
                </div>
                {latestRecord ? (
                  <span className="shrink-0 rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#D77C5B]">
                    최근 {formatDate(latestRecord.record_date)}
                  </span>
                ) : null}
              </div>
            </div>
          </AppCard>

          {records.length === 0 ? (
            <EmptyState
              title="아직 성장 기록이 없어요"
              description="성장 기록을 저장하면 키, 몸무게, 머리둘레 추이가 이곳에 표시됩니다."
            />
          ) : (
            <>
              <GrowthTrendChart
                title="키 추이"
                description="기록된 키 변화를 날짜 또는 개월 수 기준으로 확인해요."
                unit="cm"
                color="#4FA99A"
                points={chartPoints}
                valueKey="height"
                standardSeries={heightStandardSeries}
              />
              <GrowthTrendChart
                title="몸무게 추이"
                description="기록된 몸무게 변화를 부드럽게 이어서 보여드려요."
                unit="kg"
                color="#F6B092"
                points={chartPoints}
                valueKey="weight"
                standardSeries={weightStandardSeries}
              />
              <GrowthTrendChart
                title="머리둘레 추이"
                description="선택 입력한 머리둘레 기록이 있을 때 표시됩니다."
                unit="cm"
                color="#25344A"
                points={chartPoints}
                valueKey="headCircumference"
                standardSeries={headStandardSeries}
              />
            </>
          )}

          <AppCard variant="soft">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-[#1F2D3D]">또래 성장 기준선 비교</h3>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  hasStandardSeries
                    ? 'bg-[#EAF6F2] text-[#2F8F84]'
                    : 'bg-[#FFF3E9] text-[#D77C5B]'
                }`}
              >
                {hasStandardSeries ? '기준선 표시 중' : '업데이트 예정'}
              </span>
            </div>
            <p className="text-sm leading-6 text-[#6B7A90]">
              {hasStandardSeries
                ? '입력된 성장 기록과 또래 기준 50백분위 참고선을 함께 확인할 수 있어요.'
                : '지금은 입력된 기록을 바탕으로 우리 아이의 성장 변화를 보여드려요. 향후 성장 기준 데이터를 연결해 또래 기준선과 함께 확인할 수 있도록 준비하고 있습니다.'}
            </p>
          </AppCard>

          <AppCard className="border-[#F6D6C4] bg-[#FFF7DF]/78 shadow-[0_10px_26px_rgba(246,176,146,0.10)]">
            <p className="text-xs leading-relaxed text-[#9A6A38]">
              성장 그래프는 입력된 기록을 바탕으로 한 참고 정보입니다. 아이의 성장 상태,
              질병, 발달 지연 여부는 반드시 전문 의료진과 상담해주세요.
            </p>
          </AppCard>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
