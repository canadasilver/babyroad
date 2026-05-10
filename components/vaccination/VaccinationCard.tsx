import Card from '@/components/common/Card'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { VaccinationStatus } from '@/types/child'

interface VaccinationCardProps {
  vaccineName: string
  scheduledDate: string
  status: VaccinationStatus
}

const statusConfig: Record<VaccinationStatus, { label: string; className: string }> = {
  scheduled: { label: '예정', className: 'text-blue-600 bg-blue-50' },
  completed: { label: '완료', className: 'text-green-600 bg-green-50' },
  delayed: { label: '지연', className: 'text-[#D77C5B] bg-[#FFF3E9]' },
  skipped: { label: '건너뜀', className: 'text-slate-600 bg-slate-100' },
  consult_required: { label: '상담 필요', className: 'text-red-600 bg-red-50' },
}

export default function VaccinationCard({
  vaccineName,
  scheduledDate,
  status,
}: VaccinationCardProps) {
  const config = statusConfig[status]

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">{vaccineName}</p>
        <p className="text-xs text-slate-500">{formatDate(scheduledDate)}</p>
      </div>
      <span
        className={cn(
          'rounded-full px-2.5 py-1 text-xs font-medium',
          config.className
        )}
      >
        {config.label}
      </span>
    </Card>
  )
}
