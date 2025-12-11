import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/template - 下载导入模板
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'products'; // products, series
    const seriesId = searchParams.get('seriesId'); // 可选，指定系列

    if (type === 'series') {
      // 系列导入模板
      const csv = `系列代码,系列名称,描述,模板ID,排序
M8-COMPACT-4,M8 Compact 4 Ports,4端口M8紧凑型分线盒,layout-m8-standard,1
M8-COMPACT-6,M8 Compact 6 Ports,6端口M8紧凑型分线盒,layout-m8-standard,2`;
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="series-template.csv"',
        },
      });
    }

    // 产品导入模板
    let series = null;
    let schemaFields: { key: string; label: string; type: string }[] = [];

    if (seriesId) {
      // 获取指定系列及其字段定义
      series = await prisma.series.findUnique({
        where: { id: seriesId },
      });
      
      if (series?.schemaDefinition) {
        const schema = series.schemaDefinition as { fields?: { key: string; label: string; type: string }[] };
        schemaFields = schema.fields || [];
      }
    }

    // 如果没有指定系列，获取所有系列供参考
    const allSeries = await prisma.series.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
      take: 10,
    });

    const seriesHint = allSeries.length > 0 
      ? allSeries.map(s => s.code).join(' / ')
      : 'M8-COMPACT-4';

    // 基础列
    const baseHeaders = ['SKU', '产品名称', '系列代码', '描述', '状态'];
    
    // 动态字段列（根据系列schema）
    const fieldHeaders = schemaFields.map(f => f.label);
    
    // 所有列
    const allHeaders = [...baseHeaders, ...fieldHeaders];
    
    // 示例数据行
    const exampleRow = [
      'PROD-001',
      '示例产品名称',
      series?.code || allSeries[0]?.code || 'M8-COMPACT-4',
      '产品描述',
      'DRAFT',
      ...schemaFields.map(f => {
        // 根据字段类型给出示例值
        switch (f.type) {
          case 'number': return '0';
          case 'boolean': return 'true';
          default: return `示例${f.label}`;
        }
      }),
    ];

    // 生成CSV
    const escape = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csv = allHeaders.map(escape).join(',') + '\n';
    csv += exampleRow.map(escape).join(',') + '\n';
    
    // 添加说明
    csv += '\n';
    csv += '# 说明:\n';
    csv += `# 1. SKU必须唯一\n`;
    csv += `# 2. 系列代码必须是已存在的系列，可用: ${seriesHint}\n`;
    csv += '# 3. 状态可选: DRAFT(草稿) / REVIEW(审核中) / APPROVED(已批准) / PUBLISHED(已发布)\n';
    
    if (schemaFields.length > 0) {
      csv += `# 4. 此模板针对系列「${series?.name}」，包含该系列的 ${schemaFields.length} 个自定义字段\n`;
    }

    const filename = series 
      ? `products-template-${series.code}.csv`
      : 'products-template.csv';
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('获取模板失败:', error);
    return NextResponse.json(
      { error: '获取模板失败', success: false },
      { status: 500 }
    );
  }
}
