import { createClient } from '@/lib/supabase/server'
import type { CollaboratorRole } from '@/types/child'

export async function getChildRole(
  userId: string,
  childId: string
): Promise<CollaboratorRole | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('child_collaborators')
    .select('role')
    .eq('child_id', childId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()

  if (!data) return null
  return (data as { role: string }).role as CollaboratorRole
}

export function canEditRecords(role: CollaboratorRole | null): boolean {
  return role === 'owner' || role === 'editor'
}

export function canManageChild(role: CollaboratorRole | null): boolean {
  return role === 'owner'
}

export function getRoleLabel(role: CollaboratorRole | null): string {
  if (role === 'owner') return '관리자'
  if (role === 'editor') return '기록 가능'
  if (role === 'viewer') return '보기만 가능'
  return ''
}
