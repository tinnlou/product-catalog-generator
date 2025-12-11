import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[id] - 获取单个产品
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        series: {
          select: {
            id: true,
            name: true,
            code: true,
            templateId: true,
            schemaDefinition: true,
          },
        },
        partNumbers: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        assets: {
          include: {
            asset: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '产品不存在', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: product, success: true });
  } catch (error) {
    console.error('获取产品失败:', error);
    return NextResponse.json(
      { error: '获取产品失败', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - 更新产品
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, sku, description, specifications, status } = body;

    // 获取旧数据用于审计
    const oldProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(sku && { sku }),
        ...(description !== undefined && { description }),
        ...(specifications && { specifications }),
        ...(status && { status }),
        version: { increment: 1 },
      },
    });

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        entityType: 'Product',
        entityId: product.id,
        action: 'UPDATE',
        summary: `更新产品: ${product.name}`,
        previousValue: oldProduct?.specifications as any ?? undefined,
        newValue: specifications as any ?? undefined,
      },
    });

    return NextResponse.json({ data: product, success: true });
  } catch (error) {
    console.error('更新产品失败:', error);
    return NextResponse.json(
      { error: '更新产品失败', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - 删除产品
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 软删除
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        entityType: 'Product',
        entityId: product.id,
        action: 'DELETE',
        summary: `删除产品: ${product.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除产品失败:', error);
    return NextResponse.json(
      { error: '删除产品失败', success: false },
      { status: 500 }
    );
  }
}

