import Card from '@/components/common/Card'
import { getAgeLabel } from '@/lib/date'
import type { Child } from '@/types/child'

interface ChildProfileCardProps {
  child: Child
}

const genderLabel: Record<string, string> = {
  male: '남아',
  female: '여아',
  unknown: '미정',
}

const childIcon: Record<string, string> = {
  pregnancy: '🤰',
  male: '👦',
  female: '👧',
  unknown: '👶',
}

export default function ChildProfileCard({ child }: ChildProfileCardProps) {
  const ageLabel = getAgeLabel({
    status: child.status,
    birthDate: child.birth_date,
    dueDate: child.due_date,
  })

  const icon =
    child.status === 'pregnancy'
      ? childIcon.pregnancy
      : childIcon[child.gender] ?? childIcon.unknown

  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-slate-900">{child.name}</h2>
        <p className="text-sm text-slate-500">
          {ageLabel}
          {child.status === 'born' && ` · ${genderLabel[child.gender]}`}
        </p>
      </div>
    </Card>
  )
}
