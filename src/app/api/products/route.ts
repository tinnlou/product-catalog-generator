import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - 获取所有产品
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = { isActive: true };
    
    if (seriesId) {
      where.seriesId = seriesId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        series: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: { partNumbers: true },
        },
      },
    });

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      seriesId: p.seriesId,
      seriesName: p.series.name,
      specifications: p.specifications,
      status: p.status,
      version: p.version,
      partNumberCount: p._count.partNumbers,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('获取产品失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `获取产品失败: ${errorMessage}`, success: false },
      { status: 500 }
    );
  }
}

// POST /api/products - 创建新产品
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sku, description, seriesId, specifications } = body;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        seriesId,
        specifications: specifications ?? {},
        status: 'DRAFT',
        isActive: true,
      },
      include: {
        series: {
          select: { name: true },
        },
      },
    });

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        entityType: 'Product',
        entityId: product.id,
        action: 'CREATE',
        summary: `创建产品: ${product.name}`,
        newValue: { name, sku, seriesId },
      },
    });

    return NextResponse.json({ data: product, success: true });
  } catch (error) {
    console.error('创建产品失败:', error);
    return NextResponse.json(
      { error: '创建产品失败', success: false },
      { status: 500 }
    );
  }
}

