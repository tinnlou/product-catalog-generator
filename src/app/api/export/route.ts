import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/export - 导出所有数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, products, series

    const data: any = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    // 导出系列
    if (type === 'all' || type === 'series') {
      const series = await prisma.series.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      data.series = series.map(s => ({
        name: s.name,
        code: s.code,
        description: s.description,
        templateId: s.templateId,
        schemaDefinition: s.schemaDefinition,
        layoutConfig: s.layoutConfig,
        sortOrder: s.sortOrder,
      }));
    }

    // 导出产品
    if (type === 'all' || type === 'products') {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          series: { select: { code: true } },
          partNumbers: {
            where: { isActive: true },
            select: {
              partNumber: true,
              variantConfig: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      
      data.products = products.map(p => ({
        name: p.name,
        sku: p.sku,
        description: p.description,
        seriesCode: p.series.code,
        specifications: p.specifications,
        circuitDiagrams: p.circuitDiagrams,
        pinDefinitions: p.pinDefinitions,
        status: p.status,
        partNumbers: p.partNumbers,
      }));
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('导出失败:', error);
    return NextResponse.json(
      { error: '导出失败', success: false },
      { status: 500 }
    );
  }
}

