import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface UserSettings {
  id: string
  user_id: string
  tema: 'claro' | 'escuro' | 'auto'
  modelo_ia: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3'
  notificacoes_email: boolean
  notificacoes_push: boolean
  backup_automatico: boolean
  created_at: Date
  updated_at: Date
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const settings = await prisma.configuracaoUsuario.findUnique({
      where: { user_id: userId }
    })
    
    if (!settings) {
      return await createDefaultSettings(userId)
    }
    
    return settings as UserSettings
  } catch (error) {
    console.error('Error fetching user settings:', error)
    throw new Error('Falha ao buscar configurações')
  }
}

export async function updateUserSettings(
  userId: string, 
  updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings> {
  try {
    const settings = await prisma.configuracaoUsuario.upsert({
      where: { user_id: userId },
      update: updates,
      create: {
        user_id: userId,
        ...updates
      }
    })
    
    return settings as UserSettings
  } catch (error) {
    console.error('Error updating user settings:', error)
    throw new Error('Falha ao atualizar configurações')
  }
}

async function createDefaultSettings(userId: string): Promise<UserSettings> {
  try {
    const settings = await prisma.configuracaoUsuario.create({
      data: {
        user_id: userId,
        tema: 'claro',
        modelo_ia: 'gpt-3.5-turbo',
        notificacoes_email: true,
        notificacoes_push: true,
        backup_automatico: true
      }
    })
    
    return settings as UserSettings
  } catch (error) {
    console.error('Error creating default settings:', error)
    throw new Error('Falha ao criar configurações padrão')
  }
}
