import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/series - 获取所有系列
export async function GET() {
  try {
    const series = await prisma.series.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // 转换数据格式
    const data = series.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      description: s.description,
      templateId: s.templateId,
      schemaDefinition: s.schemaDefinition,
      layoutConfig: s.layoutConfig,
      productCount: s._count.products,
      fieldCount: (s.schemaDefinition as any)?.fields?.length ?? 0,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('获取系列失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `获取系列失败: ${errorMessage}`, success: false },
      { status: 500 }
    );
  }
}

// POST /api/series - 创建新系列
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, templateId, schemaDefinition } = body;

    const series = await prisma.series.create({
      data: {
        name,
        code,
        description,
        templateId,
        schemaDefinition: schemaDefinition ?? { fields: [], groups: [] },
        isActive: true,
      },
    });

    return NextResponse.json({ data: series, success: true });
  } catch (error) {
    console.error('创建系列失败:', error);
    return NextResponse.json(
      { error: '创建系列失败', success: false },
      { status: 500 }
    );
  }
}

