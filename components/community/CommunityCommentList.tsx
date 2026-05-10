import CommunityCommentItem from '@/components/community/CommunityCommentItem'
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
        <div className="rounded-[1.25rem] border border-white/70 bg-white/62 py-6 text-center">
          <p className="text-sm text-slate-500">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommunityCommentItem key={comment.id} comment={comment} userId={userId} />
          ))}
        </div>
      )}
    </div>
  )
}
