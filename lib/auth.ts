import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function getUserId() {
  const user = await getUser()
  return user?.id || null
}