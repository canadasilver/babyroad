import Card from '@/components/common/Card'
import ChildAvatar from '@/components/child/ChildAvatar'
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

export default function ChildProfileCard({ child }: ChildProfileCardProps) {
  const ageLabel = getAgeLabel({
    status: child.status,
    birthDate: child.birth_date,
    dueDate: child.due_date,
  })

  return (
    <Card className="flex items-center gap-4">
      <ChildAvatar
        photoUrl={child.profile_image_url}
        gender={child.gender}
        status={child.status}
        size="md"
        className="bg-[#EAF6F2] shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold text-[#25344A]">{child.name}</h2>
        <p className="text-sm text-[#6B7A90]">
          {ageLabel}
          {child.status === 'born' && ` · ${genderLabel[child.gender]}`}
        </p>
      </div>
    </Card>
  )
}
