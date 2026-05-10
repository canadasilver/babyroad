import { formatDateTime } from '@/lib/date'
import type { Tables } from '@/types/database'

interface HealthRecordListProps {
  records: Tables<'child_health_records'>[]
}

export default function HealthRecordList({ records }: HealthRecordListProps) {
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
            <HealthRecordRow key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

function HealthRecordRow({ record }: { record: Tables<'child_health_records'> }) {
  return (
    <div className="rounded-[1.35rem] border border-[#E8EEE9] bg-white/85 p-4 shadow-[0_14px_38px_rgba(37,52,74,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">{formatDateTime(record.recorded_at)}</p>
          {record.temperature !== null && (
            <p className="mt-1 text-sm font-semibold text-slate-900">
              체온{' '}
              <span
                className={
                  record.temperature >= 37.5 ? 'text-red-600' : 'text-slate-900'
                }
              >
                {record.temperature}℃
              </span>
            </p>
          )}
          {record.symptoms && (
            <p className="mt-1 text-sm text-slate-800">증상: {record.symptoms}</p>
          )}
          {record.medicine && (
            <p className="mt-1 text-xs text-slate-600">약 복용: {record.medicine}</p>
          )}
          {record.hospital_name && (
            <p className="mt-1 text-xs text-slate-600">병원: {record.hospital_name}</p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>
        {record.temperature !== null && record.temperature >= 37.5 && (
          <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
            발열
          </span>
        )}
      </div>
    </div>
  )
}
