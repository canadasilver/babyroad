import Card from '@/components/common/Card'
import ChildAvatar from '@/components/child/ChildAvatar'
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

export default function ChildSummaryCard({ child }: ChildSummaryCardProps) {
  const ageLabel = getAgeLabel({
    status: child.status,
    birthDate: child.birth_date,
    dueDate: child.due_date,
  })

  return (
    <Card
      variant="hero"
      className="relative overflow-hidden border-white/70"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#CFE3D8]/55" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-[#F6B092]/20" />
      <div className="relative flex items-center gap-4">
        <ChildAvatar
          photoUrl={child.profile_image_url}
          gender={child.gender}
          status={child.status}
          size="md"
          className="bg-white/72 shadow-[0_10px_24px_rgba(37,52,74,0.10)]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#4FA99A]">우리 아이</p>
          <h2 className="truncate text-xl font-black text-[#25344A]">{child.name}</h2>
          <p className="text-sm font-medium text-[#6B7A90]">
            {ageLabel}
            {child.status === 'born' && ` · ${GENDER_LABEL[child.gender] ?? '미정'}`}
          </p>
        </div>
      </div>
    </Card>
  )
}
