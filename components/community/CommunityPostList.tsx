import Link from 'next/link'
import { formatDate } from '@/lib/date'
import { COMMUNITY_CATEGORIES_WITH_ALL } from '@/types/community'
import type { Tables } from '@/types/database'

interface CommunityPostListProps {
  posts: Tables<'community_posts'>[]
  selectedCategory: string
  isLoggedIn: boolean
}

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

export default function CommunityPostList({
  posts,
  selectedCategory,
  isLoggedIn,
}: CommunityPostListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">커뮤니티</h1>
        <Link
          href={isLoggedIn ? '/community/write' : '/login'}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white"
        >
          글쓰기
        </Link>
      </div>

      <p className="text-sm text-slate-500">같은 시기의 부모들과 육아 이야기를 나눠요.</p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {COMMUNITY_CATEGORIES_WITH_ALL.map((cat) => (
          <Link
            key={cat}
            href={cat === '전체' ? '/community' : `/community?category=${encodeURIComponent(cat)}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">아직 게시글이 없어요.</p>
          <p className="mt-1 text-xs text-slate-400">첫 번째 글을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({ post }: { post: Tables<'community_posts'> }) {
  const colorClass = CATEGORY_COLOR[post.category] ?? 'bg-slate-100 text-slate-600'

  return (
    <Link href={`/community/${post.id}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-200">
        <div className="flex items-start gap-2">
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
            {post.category}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-900 line-clamp-2">{post.title}</p>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{post.content}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span>{post.author_nickname ?? '익명'}</span>
          <span>{formatDate(post.created_at)}</span>
          <span>💬 {post.comment_count}</span>
          <span>❤️ {post.like_count}</span>
        </div>
      </div>
    </Link>
  )
}
