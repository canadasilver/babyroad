import Link from 'next/link'
import Card from '@/components/common/Card'
import { formatDate } from '@/lib/date'
import { truncate } from '@/lib/utils'

interface CommunityCardProps {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  likeCount: number
  commentCount: number
}

export default function CommunityCard({
  id,
  title,
  content,
  category,
  createdAt,
  likeCount,
  commentCount,
}: CommunityCardProps) {
  return (
    <Link href={`/community/${id}`}>
      <Card className="transition-colors hover:border-slate-300">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
            {category}
          </span>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{truncate(content, 60)}</p>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span>{formatDate(createdAt)}</span>
          <span>❤️ {likeCount}</span>
          <span>💬 {commentCount}</span>
        </div>
      </Card>
    </Link>
  )
}
