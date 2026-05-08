import Card from '@/components/common/Card'

interface StatusCounts {
  total: number
  completed: number
  available: number
  scheduled: number
  delayed: number
}

interface VaccinationStatusCardProps {
  counts: StatusCounts
}

export default function VaccinationStatusCard({ counts }: VaccinationStatusCardProps) {
  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">접종 현황</h2>
      <div className="grid grid-cols-4 gap-2">
        <StatusItem label="완료" value={counts.completed} colorClass="text-green-700 bg-green-50" />
        <StatusItem label="접종 가능" value={counts.available} colorClass="text-orange-700 bg-orange-50" />
        <StatusItem label="예정" value={counts.scheduled} colorClass="text-blue-700 bg-blue-50" />
        <StatusItem label="지연 가능" value={counts.delayed} colorClass="text-red-700 bg-red-50" />
      </div>
      <p className="mt-2 text-right text-xs text-slate-400">전체 {counts.total}건</p>
    </Card>
  )
}

function StatusItem({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${colorClass}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
    </div>
  )
}
