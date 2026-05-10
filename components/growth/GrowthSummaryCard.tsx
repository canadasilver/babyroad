import Card from '@/components/common/Card'
import { getAgeLabel, formatDate } from '@/lib/date'
import { formatNumber } from '@/lib/utils'
import type { Child, ChildGrowthRecord } from '@/types/child'

interface GrowthSummaryCardProps {
  child: Child
  latestRecord: ChildGrowthRecord | null
}

const GENDER_LABEL: Record<Child['gender'], string> = {
  male: '남아',
  female: '여아',
  unknown: '미정',
}

export default function GrowthSummaryCard({ child, latestRecord }: GrowthSummaryCardProps) {
  const ageLabel = getAgeLabel({
    status: child.status,
    birthDate: child.birth_date,
    dueDate: child.due_date,
  })

  return (
    <Card variant="hero" className="border-white/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#4FA99A]">아이 요약</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">{child.name}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {ageLabel}
            {child.status === 'born' ? ` · ${GENDER_LABEL[child.gender]}` : ''}
          </p>
        </div>
        <div className="rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-[#D77C5B] shadow-sm">
          {child.status === 'pregnancy' ? '임신 중' : '출생 후'}
        </div>
      </div>

      {latestRecord ? (
        <div className="mt-4 rounded-2xl bg-white/78 p-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            최신 기록 · {formatDate(latestRecord.record_date)}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SummaryMetric label="키" value={`${formatNumber(latestRecord.height)} cm`} />
            <SummaryMetric label="몸무게" value={`${formatNumber(latestRecord.weight, 2)} kg`} />
            <SummaryMetric
              label="머리둘레"
              value={
                latestRecord.head_circumference === null
                  ? '-'
                  : `${formatNumber(latestRecord.head_circumference)} cm`
              }
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-3">
          <p className="text-sm text-slate-600">아직 저장된 성장 기록이 없어요.</p>
        </div>
      )}
    </Card>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
