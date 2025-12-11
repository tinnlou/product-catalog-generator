import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 将数据转换为CSV格式
function toCSV(headers: string[], rows: string[][]): string {
  const escape = (str: string) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  
  const headerLine = headers.map(escape).join(',');
  const dataLines = rows.map(row => row.map(escape).join(','));
  return [headerLine, ...dataLines].join('\n');
}

// GET /api/export - 导出数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'products'; // products, series
    const format = searchParams.get('format') || 'csv'; // csv, json

    if (type === 'series') {
      const series = await prisma.series.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      if (format === 'csv') {
        const headers = ['系列代码', '系列名称', '描述', '模板ID', '排序'];
        const rows = series.map(s => [
          s.code,
          s.name,
          s.description || '',
          s.templateId,
          String(s.sortOrder),
        ]);
        const csv = toCSV(headers, rows);
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="series-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
      }

      return NextResponse.json({ success: true, data: series });
    }

    // 导出产品
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        series: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (format === 'csv') {
      const headers = ['SKU', '产品名称', '系列代码', '系列名称', '描述', '状态', '规格参数(JSON)'];
      const rows = products.map(p => [
        p.sku,
        p.name,
        p.series.code,
        p.series.name,
        p.description || '',
        p.status,
        JSON.stringify(p.specifications || {}),
      ]);
      const csv = toCSV(headers, rows);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('导出失败:', error);
    return NextResponse.json(
      { error: '导出失败', success: false },
      { status: 500 }
    );
  }
}
