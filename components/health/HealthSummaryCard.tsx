import Card from '@/components/common/Card'
import { formatDateTime, toISODateString } from '@/lib/date'
import type { Tables } from '@/types/database'

interface HealthSummaryCardProps {
  records: Tables<'child_health_records'>[]
}

export default function HealthSummaryCard({ records }: HealthSummaryCardProps) {
  const todayUtc = toISODateString()
  const todayRecords = records.filter((r) => r.recorded_at.slice(0, 10) === todayUtc)

  const maxTemp = todayRecords.reduce<number | null>((max, r) => {
    if (r.temperature === null) return max
    return max === null || r.temperature > max ? r.temperature : max
  }, null)

  const latestRecord = records[0] ?? null

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">오늘 건강 요약</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-red-50 p-3">
          <p className="text-xs text-slate-500">오늘 기록 수</p>
          <p className="mt-1 text-xl font-bold text-red-600">{todayRecords.length}건</p>
        </div>
        <div className="rounded-2xl bg-[#FFF3E9]/82 p-3">
          <p className="text-xs text-slate-500">오늘 최고 체온</p>
          <p className="mt-1 text-xl font-bold text-[#D77C5B]">
            {maxTemp !== null ? `${maxTemp}℃` : '-'}
          </p>
        </div>
      </div>
      {latestRecord?.symptoms && (
        <div className="mt-3 rounded-2xl bg-white/58 px-3 py-2">
          <p className="text-xs text-slate-500">최근 증상</p>
          <p className="mt-0.5 text-sm text-slate-700">{latestRecord.symptoms}</p>
          <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(latestRecord.recorded_at)}</p>
        </div>
      )}
    </Card>
  )
}
