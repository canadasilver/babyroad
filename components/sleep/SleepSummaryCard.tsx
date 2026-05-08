import Card from '@/components/common/Card'
import { formatSleepMinutes } from '@/lib/date'
import type { Tables } from '@/types/database'

interface SleepSummaryCardProps {
  records: Tables<'child_sleep_records'>[]
}

export default function SleepSummaryCard({ records }: SleepSummaryCardProps) {
  const todayUtc = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter((r) => r.sleep_start.slice(0, 10) === todayUtc)

  const totalMinutes = todayRecords.reduce((acc, r) => {
    if (!r.sleep_end) return acc
    const diff = new Date(r.sleep_end).getTime() - new Date(r.sleep_start).getTime()
    return acc + Math.max(0, Math.floor(diff / 60000))
  }, 0)

  const napCount = todayRecords.filter((r) => r.sleep_type === 'day_sleep').length

  const nightMinutes = todayRecords
    .filter((r) => r.sleep_type === 'night_sleep')
    .reduce((acc, r) => {
      if (!r.sleep_end) return acc
      const diff = new Date(r.sleep_end).getTime() - new Date(r.sleep_start).getTime()
      return acc + Math.max(0, Math.floor(diff / 60000))
    }, 0)

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">오늘 수면 요약</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-indigo-50 p-3">
          <p className="text-xs text-slate-500">총 수면</p>
          <p className="mt-1 text-sm font-bold text-indigo-700">
            {totalMinutes > 0 ? formatSleepMinutes(totalMinutes) : '-'}
          </p>
        </div>
        <div className="rounded-xl bg-sky-50 p-3">
          <p className="text-xs text-slate-500">낮잠 횟수</p>
          <p className="mt-1 text-sm font-bold text-sky-700">{napCount}회</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">밤잠 시간</p>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {nightMinutes > 0 ? formatSleepMinutes(nightMinutes) : '-'}
          </p>
        </div>
      </div>
    </Card>
  )
}
