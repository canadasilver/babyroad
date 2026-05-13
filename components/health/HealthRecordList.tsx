import HealthRecordItem from '@/components/health/HealthRecordItem'
import type { Tables } from '@/types/database'

interface HealthRecordListProps {
  records: Tables<'child_health_records'>[]
  canEdit?: boolean
}

export default function HealthRecordList({ records, canEdit = true }: HealthRecordListProps) {
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
            <HealthRecordItem key={record.id} record={record} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  )
}
