import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/series/[id] - 获取单个系列
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: '系列不存在', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...series,
        productCount: series._count.products,
      },
      success: true,
    });
  } catch (error) {
    console.error('获取系列失败:', error);
    return NextResponse.json(
      { error: '获取系列失败', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/series/[id] - 更新系列
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, code, description, templateId, schemaDefinition, isActive } = body;

    const series = await prisma.series.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(templateId && { templateId }),
        ...(schemaDefinition && { schemaDefinition }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ data: series, success: true });
  } catch (error) {
    console.error('更新系列失败:', error);
    return NextResponse.json(
      { error: '更新系列失败', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/series/[id] - 删除系列
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 检查是否有产品关联
    const productCount = await prisma.product.count({
      where: { seriesId: params.id, isActive: true },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `该系列下还有 ${productCount} 个产品，请先删除或移动这些产品`, success: false },
        { status: 400 }
      );
    }

    // 软删除
    await prisma.series.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除系列失败:', error);
    return NextResponse.json(
      { error: '删除系列失败', success: false },
      { status: 500 }
    );
  }
}

