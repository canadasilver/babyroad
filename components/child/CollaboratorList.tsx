import Link from 'next/link'
import type { CollaboratorWithProfile } from '@/types/child'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner:  { label: '관리자',      color: 'bg-[#EAF6F2] text-[#2F766E]' },
  editor: { label: '기록 가능',   color: 'bg-[#EFF4FF] text-[#4063B8]' },
  viewer: { label: '보기만 가능', color: 'bg-[#F5F5F5] text-[#6B7A90]' },
}

function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at < 0) return email
  const local = email.slice(0, at)
  const domain = email.slice(at)
  const visible = local.length > 3 ? local.slice(0, 3) : local.slice(0, 1)
  return `${visible}***${domain}`
}

interface Props {
  collaborators: CollaboratorWithProfile[]
  currentUserId: string
  childId: string
}

export default function CollaboratorList({ collaborators, currentUserId, childId }: Props) {
  const isOwner = collaborators.some(
    (c) => c.user_id === currentUserId && c.role === 'owner' && c.status === 'active'
  )

  return (
    <div className="rounded-[1.35rem] border border-[#D9E6DF] bg-white/80 px-4 py-4 shadow-[0_8px_24px_rgba(37,52,74,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#25344A]">공동 보호자</h3>
        {isOwner && (
          <Link
            href={`/mypage/child/${childId}/invite`}
            className="rounded-full bg-[#4FA99A] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#3D9489]"
          >
            초대하기
          </Link>
        )}
      </div>

      {collaborators.length === 0 ? (
        <p className="text-xs text-slate-400">공동 보호자가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {collaborators.map((collab) => {
            const roleInfo = ROLE_LABELS[collab.role] ?? ROLE_LABELS.viewer
            const displayName =
              collab.profile?.nickname ??
              (collab.profile?.email ? maskEmail(collab.profile.email) : '알 수 없음')
            const maskedEmail =
              collab.profile?.email && !collab.profile?.nickname
                ? null
                : collab.profile?.email
                  ? maskEmail(collab.profile.email)
                  : null

            return (
              <li key={collab.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF6F2] text-xs font-black text-[#4FA99A]">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#25344A]">
                    {displayName}
                    {collab.user_id === currentUserId && (
                      <span className="ml-1 text-xs font-normal text-[#9AA8BA]">(나)</span>
                    )}
                  </p>
                  {maskedEmail && (
                    <p className="truncate text-xs text-[#9AA8BA]">{maskedEmail}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                  {collab.status === 'pending' && (
                    <span className="rounded-full bg-[#FFF3E9] px-2 py-0.5 text-xs font-medium text-[#D77C5B]">
                      수락 대기
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
