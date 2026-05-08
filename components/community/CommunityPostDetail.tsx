import { formatDateTime } from '@/lib/date'
import CommunityLikeButton from '@/components/community/CommunityLikeButton'
import CommunityReportButton from '@/components/community/CommunityReportButton'
import CommunityDeleteButton from '@/components/community/CommunityDeleteButton'
import type { Tables } from '@/types/database'

const CATEGORY_COLOR: Record<string, string> = {
  임신: 'bg-pink-50 text-pink-700',
  신생아: 'bg-sky-50 text-sky-700',
  이유식: 'bg-orange-50 text-orange-700',
  수면: 'bg-indigo-50 text-indigo-700',
  건강: 'bg-red-50 text-red-700',
  예방접종: 'bg-teal-50 text-teal-700',
  육아질문: 'bg-yellow-50 text-yellow-700',
  육아용품: 'bg-lime-50 text-lime-700',
  자유게시판: 'bg-slate-100 text-slate-600',
}

interface CommunityPostDetailProps {
  post: Tables<'community_posts'>
  userId: string | null
  likeCount: number
  isLiked: boolean
}

export default function CommunityPostDetail({
  post,
  userId,
  likeCount,
  isLiked,
}: CommunityPostDetailProps) {
  const colorClass = CATEGORY_COLOR[post.category] ?? 'bg-slate-100 text-slate-600'
  const isAuthor = !!userId && userId === post.user_id

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
          {post.category}
        </span>
      </div>

      <h2 className="mt-3 text-lg font-bold text-slate-900">{post.title}</h2>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <span>{post.author_nickname ?? '익명'}</span>
        <span>·</span>
        <span>{formatDateTime(post.created_at)}</span>
        <span>·</span>
        <span>조회 {post.view_count}</span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
        {post.content}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <CommunityLikeButton
            postId={post.id}
            userId={userId}
            initialLikeCount={likeCount}
            initialIsLiked={isLiked}
          />
          {isAuthor && (
            <CommunityDeleteButton postId={post.id} userId={userId} />
          )}
        </div>
        <CommunityReportButton postId={post.id} userId={userId} />
      </div>
    </div>
  )
}
