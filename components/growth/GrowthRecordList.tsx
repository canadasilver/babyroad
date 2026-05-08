import Card from '@/components/common/Card'
import { formatDate } from '@/lib/date'
import { formatNumber } from '@/lib/utils'
import type { ChildGrowthRecord } from '@/types/child'

interface GrowthRecordListProps {
  records: ChildGrowthRecord[]
}

export default function GrowthRecordList({ records }: GrowthRecordListProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">최근 성장 기록</h2>
        <p className="mt-1 text-sm text-slate-500">최근 기록부터 순서대로 보여드려요.</p>
      </div>

      {records.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <p className="text-sm font-medium text-slate-700">아직 성장 기록이 없어요.</p>
          <p className="mt-1 text-sm text-slate-500">첫 기록을 저장하면 이곳에 표시됩니다.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(record.record_date)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    저장일 {formatDate(record.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric label="키" value={`${formatNumber(record.height)} cm`} />
                <Metric label="몸무게" value={`${formatNumber(record.weight, 2)} kg`} />
                <Metric
                  label="머리둘레"
                  value={
                    record.head_circumference === null
                      ? '-'
                      : `${formatNumber(record.head_circumference)} cm`
                  }
                />
              </div>

              {record.memo ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                  {record.memo}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
