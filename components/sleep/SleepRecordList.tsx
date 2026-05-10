import SleepRecordItem from '@/components/sleep/SleepRecordItem'
import type { Tables } from '@/types/database'

interface SleepRecordListProps {
  records: Tables<'child_sleep_records'>[]
}

export default function SleepRecordList({ records }: SleepRecordListProps) {
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
            <SleepRecordItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}
