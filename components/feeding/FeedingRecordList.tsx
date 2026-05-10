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

const TYPE_COLOR: Record<string, string> = {
  breast_milk: 'bg-pink-50 text-pink-700',
  formula: 'bg-blue-50 text-blue-700',
  baby_food: 'bg-green-50 text-green-700',
  solid_food: 'bg-[#FFF3E9] text-[#D77C5B]',
  snack: 'bg-yellow-50 text-yellow-700',
  water: 'bg-sky-50 text-sky-700',
}

interface FeedingRecordListProps {
  records: Tables<'child_feeding_records'>[]
}

export default function FeedingRecordList({ records }: FeedingRecordListProps) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-700">최근 기록</h2>
      {records.length === 0 ? (
        <div className="rounded-[1.35rem] border border-white/70 bg-white/62 p-6 text-center shadow-[0_12px_32px_rgba(79,169,154,0.08)]">
          <p className="text-sm text-slate-500">아직 등록된 기록이 없어요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <FeedingRecordRow key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

function FeedingRecordRow({ record }: { record: Tables<'child_feeding_records'> }) {
  const typeLabel = FEEDING_TYPE_LABEL[record.feeding_type] ?? record.feeding_type
  const colorClass = TYPE_COLOR[record.feeding_type] ?? 'bg-slate-50 text-slate-700'
  const unitLabel = record.unit ? (UNIT_LABEL[record.unit] ?? record.unit) : ''

  return (
    <div className="rounded-[1.35rem] border border-[#E8EEE9] bg-white/85 p-4 shadow-[0_14px_38px_rgba(37,52,74,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
              {typeLabel}
            </span>
            {record.food_name && (
              <span className="text-xs text-slate-600">{record.food_name}</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{formatDateTime(record.recorded_at)}</p>
          {record.reaction && (
            <p className="mt-1 text-xs text-amber-700">반응: {record.reaction}</p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>
        {record.amount !== null && (
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-slate-900">
              {record.amount}
              {unitLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
