import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/template - 下载导入模板
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'products'; // products, series

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

    // 产品导入模板 - 获取现有系列作为参考
    const series = await prisma.series.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
      take: 5,
    });

    const seriesHint = series.length > 0 
      ? series.map(s => s.code).join('/')
      : 'M8-COMPACT-4';

    const csv = `SKU,产品名称,系列代码,描述,状态,规格参数(JSON)
PROD-001,示例产品1,${series[0]?.code || 'M8-COMPACT-4'},这是示例产品描述,DRAFT,"{""voltage_rating"":""250V AC/DC"",""current_load"":4}"
PROD-002,示例产品2,${series[0]?.code || 'M8-COMPACT-4'},另一个产品描述,DRAFT,"{}"

说明:
1. SKU必须唯一
2. 系列代码必须是已存在的系列（当前可用: ${seriesHint}）
3. 状态可选: DRAFT(草稿)/REVIEW(审核中)/APPROVED(已批准)/PUBLISHED(已发布)
4. 规格参数为JSON格式，需用双引号包裹`;
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products-template.csv"',
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

