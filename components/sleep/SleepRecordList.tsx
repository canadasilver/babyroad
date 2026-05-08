import { formatDateTime, formatSleepDuration } from '@/lib/date'
import type { Tables } from '@/types/database'

const SLEEP_TYPE_LABEL: Record<string, string> = {
  day_sleep: '낮잠',
  night_sleep: '밤잠',
}

const SLEEP_TYPE_COLOR: Record<string, string> = {
  day_sleep: 'bg-sky-50 text-sky-700',
  night_sleep: 'bg-indigo-50 text-indigo-700',
}

interface SleepRecordListProps {
  records: Tables<'child_sleep_records'>[]
}

export default function SleepRecordList({ records }: SleepRecordListProps) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-700">최근 기록</h2>
      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm text-slate-500">아직 등록된 기록이 없어요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <SleepRecordRow key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

function SleepRecordRow({ record }: { record: Tables<'child_sleep_records'> }) {
  const typeLabel = SLEEP_TYPE_LABEL[record.sleep_type] ?? record.sleep_type
  const colorClass = SLEEP_TYPE_COLOR[record.sleep_type] ?? 'bg-slate-50 text-slate-700'
  const duration = formatSleepDuration(record.sleep_start, record.sleep_end)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
              {typeLabel}
            </span>
            <span className="text-sm font-semibold text-slate-900">{duration}</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {formatDateTime(record.sleep_start)}
            {record.sleep_end && ` ~ ${formatDateTime(record.sleep_end)}`}
          </p>
          {record.wake_count > 0 && (
            <p className="mt-1 text-xs text-amber-700">중간에 {record.wake_count}회 깸</p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>
      </div>
    </div>
  )
}
