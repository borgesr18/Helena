import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, hasPermission } from '@/lib/rbac';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userContext = await getUserContext();
    if (!userContext || !hasPermission(userContext.role, 'admin')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const clinicas = await prisma.clinica.findMany({
      include: {
        _count: {
          select: {
            usuarios: { where: { ativo: true } },
            pacientes: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const clinicasWithCounts = clinicas.map(clinica => ({
      id: clinica.id,
      nome: clinica.nome,
      plano: clinica.plano,
      usuarios_count: clinica._count.usuarios,
      pacientes_count: clinica._count.pacientes,
      ativo: clinica.ativo,
      max_usuarios: clinica.max_usuarios,
      max_pacientes: clinica.max_pacientes
    }));

    return NextResponse.json(clinicasWithCounts);
  } catch (error) {
    console.error('Error fetching clinicas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getUserContext();
    if (!userContext || !hasPermission(userContext.role, 'admin')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { nome, cnpj, endereco, telefone, email, plano } = await request.json();

    if (!nome) {
      return NextResponse.json({ error: 'Nome da clínica é obrigatório' }, { status: 400 });
    }

    const maxLimits = {
      gratuito: { usuarios: 5, pacientes: 100 },
      basico: { usuarios: 20, pacientes: 500 },
      premium: { usuarios: 100, pacientes: 2000 }
    };

    const limits = maxLimits[plano as keyof typeof maxLimits] || maxLimits.gratuito;

    const clinica = await prisma.clinica.create({
      data: {
        nome,
        cnpj: cnpj || null,
        endereco: endereco || null,
        telefone: telefone || null,
        email: email || null,
        plano: plano || 'gratuito',
        max_usuarios: limits.usuarios,
        max_pacientes: limits.pacientes
      }
    });

    return NextResponse.json(clinica, { status: 201 });
  } catch (error) {
    console.error('Error creating clinica:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
