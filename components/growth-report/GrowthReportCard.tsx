import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import PendingLink from '@/components/ui/PendingLink'
import SectionHeader from '@/components/ui/SectionHeader'
import ChildAvatar from '@/components/child/ChildAvatar'
import { formatDate } from '@/lib/date'
import { formatNumber } from '@/lib/utils'
import { getChildAgeLabelForReport } from '@/lib/growth-report'
import type { Child, ChildGrowthRecord } from '@/types/child'

type GrowthReportCardProps = {
  child: Child
  latestRecord: ChildGrowthRecord | null
}

export default function GrowthReportCard({ child, latestRecord }: GrowthReportCardProps) {
  return (
    <AppCard variant="hero" className="overflow-hidden">
      <SectionHeader
        title="우리 아이 성장 리포트"
        description="키, 몸무게, 머리둘레 기록을 한눈에 확인해요."
      />

      {latestRecord ? (
        <>
          <div className="rounded-[1.2rem] bg-white/72 p-4">
            <div className="flex items-start gap-3">
              <ChildAvatar
                photoUrl={child.profile_image_url}
                gender={child.gender}
                status={child.status}
                size="md"
                className="bg-[#EAF6F2]"
              />
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#4FA99A]">아이</p>
                  <p className="mt-1 text-lg font-black text-[#25344A]">{child.name}</p>
                  <p className="mt-1 text-sm text-[#6B7A90]">{getChildAgeLabelForReport(child)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#D77C5B]">
                  {formatDate(latestRecord.record_date)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ReportMetric label="키" value={`${formatNumber(latestRecord.height)} cm`} />
              <ReportMetric label="몸무게" value={`${formatNumber(latestRecord.weight, 2)} kg`} />
              <ReportMetric
                label="머리둘레"
                value={
                  latestRecord.head_circumference === null
                    ? '-'
                    : `${formatNumber(latestRecord.head_circumference)} cm`
                }
              />
            </div>
          </div>

          <PendingLink
            href="/mypage/growth-report"
            pendingLabel="리포트 여는 중..."
            spinner
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#4FA99A] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(79,169,154,0.24)]"
          >
            자세히 보기
          </PendingLink>
        </>
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="아직 성장 기록이 없어요"
            description="성장 기록을 남기면 리포트가 자동으로 만들어져요."
            className="bg-white/68"
          />
          <PendingLink
            href="/growth"
            pendingLabel="이동 중..."
            spinner
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#4FA99A] px-4 py-3 text-sm font-semibold text-white"
          >
            성장 기록하러 가기
          </PendingLink>
        </div>
      )}
    </AppCard>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#EAF6F2]/72 px-3 py-2">
      <p className="text-xs text-[#6B7A90]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#25344A]">{value}</p>
    </div>
  )
}
