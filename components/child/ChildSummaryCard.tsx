import Card from '@/components/common/Card'
import { getAgeLabel } from '@/lib/date'
import type { Child } from '@/types/child'

interface ChildSummaryCardProps {
  child: Child
}

const GENDER_LABEL: Record<string, string> = {
  male: '남아',
  female: '여아',
  unknown: '미정',
}

const CHILD_ICON: Record<string, string> = {
  pregnancy: '🤰',
  male: '👦',
  female: '👧',
  unknown: '👶',
}

export default function ChildSummaryCard({ child }: ChildSummaryCardProps) {
  const ageLabel = getAgeLabel({
    status: child.status,
    birthDate: child.birth_date,
    dueDate: child.due_date,
  })

  const icon =
    child.status === 'pregnancy'
      ? CHILD_ICON.pregnancy
      : (CHILD_ICON[child.gender] ?? CHILD_ICON.unknown)

  return (
    <Card className="flex items-center gap-4 border-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white/70">우리 아이</p>
        <h2 className="truncate text-lg font-bold">{child.name}</h2>
        <p className="text-sm text-white/80">
          {ageLabel}
          {child.status === 'born' && ` · ${GENDER_LABEL[child.gender] ?? '미정'}`}
        </p>
      </div>
    </Card>
  )
}
