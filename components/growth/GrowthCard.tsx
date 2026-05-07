import Card from '@/components/common/Card'
import { formatDate } from '@/lib/date'
import type { ChildGrowthRecord } from '@/types/child'

interface GrowthCardProps {
  record: ChildGrowthRecord
}

export default function GrowthCard({ record }: GrowthCardProps) {
  const items = [
    { label: '키', value: record.height, unit: 'cm' },
    { label: '몸무게', value: record.weight, unit: 'kg' },
    { label: '머리둘레', value: record.head_circumference, unit: 'cm' },
  ].filter((item) => item.value !== null)

  return (
    <Card>
      <p className="text-xs text-slate-500">{formatDate(record.record_date)}</p>
      <div className="mt-2 flex gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-sm font-semibold text-slate-900">
              {item.value} {item.unit}
            </p>
          </div>
        ))}
      </div>
      {record.memo ? (
        <p className="mt-2 text-xs text-slate-600">{record.memo}</p>
      ) : null}
    </Card>
  )
}
