import Card from '@/components/common/Card'
import GrowthRecordItem from '@/components/growth/GrowthRecordItem'
import type { ChildGrowthRecord } from '@/types/child'

interface GrowthRecordListProps {
  records: ChildGrowthRecord[]
  canEdit?: boolean
}

export default function GrowthRecordList({ records, canEdit = true }: GrowthRecordListProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">최근 성장 기록</h2>
        <p className="mt-1 text-sm text-slate-500">최근 기록부터 순서대로 보여드려요.</p>
      </div>

      {records.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <p className="text-sm font-medium text-slate-700">아직 성장 기록이 없어요.</p>
          <p className="mt-1 text-sm text-slate-500">첫 기록을 저장하면 이곳에 표시됩니다.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <GrowthRecordItem key={record.id} record={record} canEdit={canEdit} />
          ))}
        </div>
      )}
    </section>
  )
}
