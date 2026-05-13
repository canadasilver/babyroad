import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date'
import type { VaccinationScheduleItem } from '@/types/child'
import VaccinationCompleteButton from './VaccinationCompleteButton'
import VaccinationUndoButton from './VaccinationUndoButton'

const STATUS_CONFIG = {
  completed: { label: '완료', className: 'text-green-700 bg-green-50' },
  available: { label: '접종 가능', className: 'text-[#D77C5B] bg-[#FFF3E9]' },
  scheduled: { label: '예정', className: 'text-blue-700 bg-blue-50' },
  delayed: { label: '지연 가능성 있음', className: 'text-red-700 bg-red-50' },
} as const

interface VaccinationScheduleListProps {
  items: VaccinationScheduleItem[]
  userId: string
  childId: string
  canEdit?: boolean
}

export default function VaccinationScheduleList({
  items,
  userId,
  childId,
  canEdit = true,
}: VaccinationScheduleListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.35rem] border border-white/70 bg-white/62 p-6 text-center shadow-[0_12px_32px_rgba(79,169,154,0.08)]">
        <p className="text-sm text-slate-500">예방접종 일정 정보가 없습니다.</p>
      </div>
    )
  }

  const pending = items.filter((i) => i.uiStatus !== 'completed')
  const completed = items.filter((i) => i.uiStatus === 'completed')

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">접종 일정</h2>
          <div className="space-y-2">
            {pending.map((item) => (
              <VaccinationScheduleRow
                key={item.scheduleId}
                item={item}
                userId={userId}
                childId={childId}
                canEdit={canEdit}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">완료된 접종</h2>
          <div className="space-y-2">
            {completed.map((item) => (
              <VaccinationScheduleRow
                key={item.scheduleId}
                item={item}
                userId={userId}
                childId={childId}
                canEdit={canEdit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function VaccinationScheduleRow({
  item,
  userId,
  childId,
  canEdit,
}: {
  item: VaccinationScheduleItem
  userId: string
  childId: string
  canEdit?: boolean
}) {
  const config = STATUS_CONFIG[item.uiStatus]

  return (
    <div className="rounded-[1.35rem] border border-[#E8EEE9] bg-white/85 p-4 shadow-[0_14px_38px_rgba(37,52,74,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-900">{item.vaccineName}</p>
            <span className="text-xs text-slate-500">{item.doseLabel}</span>
            {item.isRequired && (
              <span className="rounded-full bg-[#EAF6F2]/80 px-2 py-0.5 text-xs text-[#6B7A90]">
                필수
              </span>
            )}
          </div>
          {item.scheduleDescription && (
            <p className="mt-1 text-xs text-slate-400">{item.scheduleDescription}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            권장 기간: {formatDate(item.scheduledDate)} ~ {formatDate(item.endDate)}
          </p>
          {item.uiStatus === 'completed' && item.vaccinatedDate && (
            <p className="mt-1 text-xs font-medium text-green-600">
              접종일: {formatDate(item.vaccinatedDate)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              config.className
            )}
          >
            {config.label}
          </span>
          {canEdit && (item.uiStatus === 'available' || item.uiStatus === 'delayed') && (
            <VaccinationCompleteButton
              userId={userId}
              childId={childId}
              vaccineId={item.vaccineId}
              scheduleId={item.scheduleId}
              scheduledDate={item.scheduledDate}
            />
          )}
          {canEdit && item.uiStatus === 'completed' && item.recordId && (
            <VaccinationUndoButton recordId={item.recordId} userId={userId} />
          )}
        </div>
      </div>
    </div>
  )
}
