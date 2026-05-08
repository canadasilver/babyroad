import { formatDateTime } from '@/lib/date'
import CommunityReportButton from '@/components/community/CommunityReportButton'
import type { Tables } from '@/types/database'

interface CommunityCommentListProps {
  comments: Tables<'community_comments'>[]
  userId: string | null
}

export default function CommunityCommentList({ comments, userId }: CommunityCommentListProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        댓글 {comments.length > 0 ? `${comments.length}개` : ''}
      </h3>
      {comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-6 text-center">
          <p className="text-sm text-slate-500">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} userId={userId} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentRow({
  comment,
  userId,
}: {
  comment: Tables<'community_comments'>
  userId: string | null
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">
              {comment.author_nickname ?? '익명'}
            </span>
            <span className="text-xs text-slate-400">{formatDateTime(comment.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{comment.content}</p>
        </div>
        <CommunityReportButton commentId={comment.id} userId={userId} />
      </div>
    </div>
  )
}
