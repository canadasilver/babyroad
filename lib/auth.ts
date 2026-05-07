import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getProfile(userId: string): Promise<Tables<'profiles'> | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()
  return data
}
