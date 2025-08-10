import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type UserRole = 'admin' | 'medico' | 'secretaria';

export interface UserContext {
  userId: string;
  clinicaId: string;
  role: UserRole;
  clinica: {
    id: string;
    nome: string;
    plano: string;
    max_usuarios: number;
    max_pacientes: number;
  };
}

export async function getUserContext(): Promise<UserContext | null> {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;
    
    const usuarioClinica = await prisma.usuarioClinica.findFirst({
      where: { 
        user_id: session.user.id,
        ativo: true 
      },
      include: {
        clinica: true
      }
    });
    
    if (!usuarioClinica) {
      const defaultClinica = await prisma.clinica.findFirst({
        where: { nome: 'Clínica Padrão' }
      });
      
      if (!defaultClinica) {
        const newClinica = await prisma.clinica.create({
          data: {
            nome: 'Clínica Padrão',
            plano: 'gratuito'
          }
        });
        
        await prisma.usuarioClinica.create({
          data: {
            user_id: session.user.id,
            clinica_id: newClinica.id,
            role: 'admin'
          }
        });
        
        return {
          userId: session.user.id,
          clinicaId: newClinica.id,
          role: 'admin',
          clinica: {
            id: newClinica.id,
            nome: newClinica.nome,
            plano: newClinica.plano,
            max_usuarios: newClinica.max_usuarios,
            max_pacientes: newClinica.max_pacientes
          }
        };
      }
    }
    
    if (!usuarioClinica) return null;
    
    return {
      userId: session.user.id,
      clinicaId: usuarioClinica.clinica_id,
      role: usuarioClinica.role as UserRole,
      clinica: {
        id: usuarioClinica.clinica.id,
        nome: usuarioClinica.clinica.nome,
        plano: usuarioClinica.clinica.plano,
        max_usuarios: usuarioClinica.clinica.max_usuarios,
        max_pacientes: usuarioClinica.clinica.max_pacientes
      }
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = { admin: 3, medico: 2, secretaria: 1 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export async function checkClinicLimits(clinicaId: string, type: 'usuarios' | 'pacientes'): Promise<boolean> {
  try {
    const clinica = await prisma.clinica.findUnique({
      where: { id: clinicaId }
    });
    
    if (!clinica) return false;
    
    if (type === 'usuarios') {
      const usuariosCount = await prisma.usuarioClinica.count({
        where: { clinica_id: clinicaId, ativo: true }
      });
      return usuariosCount < clinica.max_usuarios;
    } else {
      const pacientesCount = await prisma.paciente.count({
        where: { clinica_id: clinicaId }
      });
      return pacientesCount < clinica.max_pacientes;
    }
  } catch (error) {
    console.error('Error checking clinic limits:', error);
    return false;
  }
}
