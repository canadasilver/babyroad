import { formatDateShort } from '@/lib/date'
import type { Database } from '@/types/database'
import type { Child, ChildGrowthRecord } from '@/types/child'

export type GrowthMetricKey = 'height' | 'weight' | 'head_circumference'
export type GrowthStandardSex = 'male' | 'female'

export type GrowthChartPoint = {
  id: string
  recordDate: string
  dateLabel: string
  ageMonth: number | null
  height: number | null
  weight: number | null
  headCircumference: number | null
}

export type GrowthStandardPoint = {
  ageMonth: number
  p3: number | null
  p15: number | null
  p50: number | null
  p85: number | null
  p97: number | null
}

export type GrowthStandardSeries = {
  metric: GrowthMetricKey
  sourceName: string
  points: GrowthStandardPoint[]
}

export type GrowthStandardPercentileRow =
  Database['public']['Tables']['growth_standard_percentiles']['Row']

export const EMPTY_GROWTH_STANDARD_SERIES: GrowthStandardSeries[] = []
export const GROWTH_STANDARD_SOURCE = 'nhis_infant_growth_percentile_2017'


export function getAgeInMonthsAtDate(birthDate: string, targetDate: string): number {
  const birth = new Date(birthDate)
  const target = new Date(targetDate)
  const yearDiff = target.getFullYear() - birth.getFullYear()
  const monthDiff = target.getMonth() - birth.getMonth()
  const beforeBirthDayInMonth = target.getDate() < birth.getDate() ? 1 : 0

  return Math.max(0, yearDiff * 12 + monthDiff - beforeBirthDayInMonth)
}

export function getChildAgeLabelForReport(child: Child): string {
  if (child.status === 'pregnancy') return '임신 중'
  if (!child.birth_date) return '개월 수 미입력'

  const months = getAgeInMonthsAtDate(child.birth_date, new Date().toISOString())
  if (months < 12) return `${months}개월`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  return remainingMonths === 0 ? `${years}세` : `${years}세 ${remainingMonths}개월`
}

export function toGrowthChartPoints(
  records: ChildGrowthRecord[],
  child: Pick<Child, 'birth_date'>
): GrowthChartPoint[] {
  return records.map((record) => ({
    id: record.id,
    recordDate: record.record_date,
    dateLabel: formatDateShort(record.record_date),
    ageMonth: child.birth_date
      ? getAgeInMonthsAtDate(child.birth_date, record.record_date)
      : null,
    height: record.height,
    weight: record.weight,
    headCircumference: record.head_circumference,
  }))
}

export function getGrowthStandardSex(child: Pick<Child, 'gender'>): GrowthStandardSex | null {
  if (child.gender === 'male' || child.gender === 'female') return child.gender
  return null
}

export function toGrowthStandardSeries(
  rows: GrowthStandardPercentileRow[]
): GrowthStandardSeries[] {
  const seriesByMetric = new Map<GrowthMetricKey, GrowthStandardSeries>()

  for (const row of rows) {
    const metric = row.metric

    if (!seriesByMetric.has(metric)) {
      seriesByMetric.set(metric, {
        metric,
        sourceName: row.standard_source,
        points: [],
      })
    }

    seriesByMetric.get(metric)?.points.push({
      ageMonth: row.age_month,
      p3: row.p3,
      p15: row.p15,
      p50: row.p50,
      p85: row.p85,
      p97: row.p97,
    })
  }

  return Array.from(seriesByMetric.values()).map((series) => ({
    ...series,
    points: series.points.sort((a, b) => a.ageMonth - b.ageMonth),
  }))
}

export function getStandardSeriesByMetric(
  series: GrowthStandardSeries[],
  metric: GrowthMetricKey
): GrowthStandardSeries | null {
  return series.find((item) => item.metric === metric) ?? null
}
