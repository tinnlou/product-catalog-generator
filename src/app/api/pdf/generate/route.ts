import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// POST /api/pdf/generate - 获取产品数据用于PDF生成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds, seriesId, type = 'products' } = body;

    type ProductWithRelations = Prisma.ProductGetPayload<{
      include: {
        series: true;
        partNumbers: true;
        assets: {
          include: {
            asset: true;
          };
        };
      };
    }>;

    let products: ProductWithRelations[] = [];

    if (type === 'series' && seriesId) {
      // 获取整个系列的产品
      products = await prisma.product.findMany({
        where: { 
          seriesId,
          isActive: true,
        },
        include: {
          series: true,
          partNumbers: {
            where: { isActive: true },
          },
        assets: {
          include: {
            asset: true,
          },
        },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else if (productIds && productIds.length > 0) {
      // 获取指定的产品
      products = await prisma.product.findMany({
        where: { 
          id: { in: productIds },
          isActive: true,
        },
        include: {
          series: true,
          partNumbers: {
            where: { isActive: true },
          },
        assets: {
          include: {
            asset: true,
          },
        },
        },
      });
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: '没有找到要生成的产品', success: false },
        { status: 400 }
      );
    }

    // 格式化数据
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      specifications: p.specifications,
      circuitDiagrams: p.circuitDiagrams,
      pinDefinitions: p.pinDefinitions,
      status: p.status,
      series: {
        id: p.series.id,
        name: p.series.name,
        code: p.series.code,
        templateId: p.series.templateId,
        schemaDefinition: p.series.schemaDefinition,
        layoutConfig: p.series.layoutConfig,
      },
      partNumbers: p.partNumbers.map(pn => ({
        id: pn.id,
        partNumber: pn.partNumber,
        variantConfig: pn.variantConfig,
        category: pn.category,
      })),
      assets: p.assets.map(pa => ({
        id: pa.id,
        usage: pa.usage,
        sortOrder: pa.sortOrder,
        assetId: pa.assetId,
        asset: pa.asset
          ? {
              id: pa.asset.id,
              type: pa.asset.type,
              url: pa.asset.url,
              metadata: pa.asset.metadata,
              altText: pa.asset.altText,
              description: pa.asset.description,
              tags: pa.asset.tags,
            }
          : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    console.error('获取PDF数据失败:', error);
    return NextResponse.json(
      { error: '获取PDF数据失败', success: false },
      { status: 500 }
    );
  }
}

