import Card from '@/components/common/Card'
import { formatDateTime } from '@/lib/date'
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

interface FeedingSummaryCardProps {
  records: Tables<'child_feeding_records'>[]
}

export default function FeedingSummaryCard({ records }: FeedingSummaryCardProps) {
  const todayUtc = new Date().toISOString().split('T')[0]
  const todayCount = records.filter((r) => r.recorded_at.slice(0, 10) === todayUtc).length
  const latest = records[0] ?? null

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">오늘 기록 요약</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-orange-50 p-3">
          <p className="text-xs text-slate-500">오늘 기록 수</p>
          <p className="mt-1 text-xl font-bold text-orange-600">{todayCount}회</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">마지막 기록</p>
          {latest ? (
            <>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {FEEDING_TYPE_LABEL[latest.feeding_type] ?? latest.feeding_type}
                {latest.amount !== null &&
                  ` ${latest.amount}${latest.unit ? (UNIT_LABEL[latest.unit] ?? latest.unit) : ''}`}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(latest.recorded_at)}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-400">기록 없음</p>
          )}
        </div>
      </div>
    </Card>
  )
}
