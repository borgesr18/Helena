import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth-server';
import { analyticsService } from '@/lib/analyticsService';
import { generatePDFReport } from '@/lib/reportGenerator';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { type, dateRange } = await request.json();

    if (!type || !dateRange) {
      return NextResponse.json(
        { error: 'Tipo de relatório e período são obrigatórios' },
        { status: 400 }
      );
    }

    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const reportData = await analyticsService.generateReport(
      type,
      { start: startDate, end: endDate },
      user.id
    );

    const pdfBuffer = await generatePDFReport(reportData);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="helena-${type}-report.pdf"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
