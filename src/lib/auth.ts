import { supabase } from './supabase';

export async function signUp(email: string, password: string, userData: {
  nome: string
  crm: string
  especialidade?: string
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  if (data.user) {
    try {
      const { error: profileError } = await supabase
        .from('perfis_usuarios')
        .insert({
          user_id: data.user.id,
          nome: userData.nome,
          crm: userData.crm,
          especialidade: userData.especialidade,
          tipo: 'médico',
          ativo_licenca: true,
        })

      if (profileError) {
        console.warn('Profile table not ready yet:', profileError.message)
        await supabase.auth.updateUser({
          data: {
            nome: userData.nome,
            crm: userData.crm,
            especialidade: userData.especialidade,
          }
        })
      }
    } catch (profileError) {
      console.warn('Profile creation failed, database may not be ready:', profileError)
      await supabase.auth.updateUser({
        data: {
          nome: userData.nome,
          crm: userData.crm,
          especialidade: userData.especialidade,
        }
      })
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error, status } = await supabase
    .from('perfis_usuarios')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && status !== 406) throw error
  return data ?? null
}