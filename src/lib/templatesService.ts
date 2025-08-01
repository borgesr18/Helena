import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PrescriptionTemplate {
  id: string
  user_id: string
  nome: string
  categoria?: string
  especialidade?: string
  medicamento: string
  posologia: string
  observacoes: string
  ativo: boolean
  uso_count: number
  created_at: Date
  updated_at: Date
}

export interface CreateTemplateData {
  nome: string
  categoria?: string
  especialidade?: string
  medicamento: string
  posologia: string
  observacoes?: string
}

export async function getUserTemplates(userId: string): Promise<PrescriptionTemplate[]> {
  try {
    const templates = await prisma.modeloPrescricao.findMany({
      where: { 
        user_id: userId,
        ativo: true
      },
      orderBy: [
        { uso_count: 'desc' },
        { created_at: 'desc' }
      ]
    })

    return templates as PrescriptionTemplate[]
  } catch (error) {
    console.error('Error fetching templates:', error)
    throw new Error('Falha ao buscar modelos')
  }
}

export async function createTemplate(
  userId: string, 
  templateData: CreateTemplateData
): Promise<PrescriptionTemplate> {
  try {
    const template = await prisma.modeloPrescricao.create({
      data: {
        user_id: userId,
        nome: templateData.nome,
        categoria: templateData.categoria,
        especialidade: templateData.especialidade,
        medicamento: templateData.medicamento,
        posologia: templateData.posologia,
        observacoes: templateData.observacoes || '',
        ativo: true,
        uso_count: 0
      }
    })

    return template as PrescriptionTemplate
  } catch (error) {
    console.error('Error creating template:', error)
    throw new Error('Falha ao criar modelo')
  }
}

export async function updateTemplate(
  userId: string,
  templateId: string,
  updates: Partial<CreateTemplateData>
): Promise<PrescriptionTemplate> {
  try {
    const template = await prisma.modeloPrescricao.update({
      where: { 
        id: templateId,
        user_id: userId
      },
      data: updates
    })

    return template as PrescriptionTemplate
  } catch (error) {
    console.error('Error updating template:', error)
    throw new Error('Falha ao atualizar modelo')
  }
}

export async function deleteTemplate(userId: string, templateId: string): Promise<void> {
  try {
    await prisma.modeloPrescricao.update({
      where: { 
        id: templateId,
        user_id: userId
      },
      data: { ativo: false }
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    throw new Error('Falha ao excluir modelo')
  }
}

export async function incrementTemplateUsage(userId: string, templateId: string): Promise<void> {
  try {
    await prisma.modeloPrescricao.update({
      where: { 
        id: templateId,
        user_id: userId
      },
      data: {
        uso_count: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.error('Error incrementing template usage:', error)
  }
}
