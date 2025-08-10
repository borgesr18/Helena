import { cookies } from 'next/headers'

export async function getCurrentUserServer() {
  const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  return user
}