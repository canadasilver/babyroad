import { createClient } from '@/lib/supabase/server'
import type { Child } from '@/types/child'
import type { Tables } from '@/types/database'

export const CHILD_SELECT_COLUMNS =
  'id, user_id, name, nickname, gender, status, due_date, birth_date, birth_weight, birth_height, birth_head_circumference, profile_image_url, is_premature, memo, created_at, updated_at, deleted_at'

type ProfileWithActiveChild = Pick<Tables<'profiles'>, 'active_child_id'>

export async function getChildrenForUser(userId: string): Promise<Child[]> {
  const supabase = await createClient()
  // RLS policies (children_select_own + children_select_collaborator) filter results:
  // returns both owned children AND children this user is an active collaborator on.
  // The userId param is kept for callers that pass it but is not needed in the query.
  void userId
  const { data } = await supabase
    .from('children')
    .select(CHILD_SELECT_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  return (data ?? []) as Child[]
}

export async function setActiveChild(userId: string, childId: string): Promise<boolean> {
  const supabase = await createClient()
  // RLS (children_select_own + children_select_collaborator) ensures only accessible children are returned.
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .is('deleted_at', null)
    .maybeSingle()

  if (!child) return false

  const { error } = await supabase
    .from('profiles')
    .update({
      active_child_id: childId,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('user_id', userId)
    .is('deleted_at', null)

  return !error
}

export async function getActiveChildContext(
  userId: string,
  profile: ProfileWithActiveChild
): Promise<{ children: Child[]; activeChild: Child | null }> {
  const children = await getChildrenForUser(userId)
  const activeChild =
    children.find((child) => child.id === profile.active_child_id) ?? children[0] ?? null

  if (activeChild && activeChild.id !== profile.active_child_id) {
    await setActiveChild(userId, activeChild.id)
  }

  return { children, activeChild }
}

export async function getActiveChildForUser(
  userId: string,
  profile: ProfileWithActiveChild
): Promise<Child | null> {
  const { activeChild } = await getActiveChildContext(userId, profile)
  return activeChild
}
