import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/import - 导入数据
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { series, products, mode = 'skip' } = body;
    // mode: 'skip' = 跳过已存在的, 'update' = 更新已存在的

    const results = {
      series: { created: 0, updated: 0, skipped: 0, errors: [] as string[] },
      products: { created: 0, updated: 0, skipped: 0, errors: [] as string[] },
    };

    // 导入系列
    if (series && Array.isArray(series)) {
      for (const s of series) {
        try {
          const existing = await prisma.series.findUnique({
            where: { code: s.code },
          });

          if (existing) {
            if (mode === 'update') {
              await prisma.series.update({
                where: { code: s.code },
                data: {
                  name: s.name,
                  description: s.description,
                  templateId: s.templateId,
                  schemaDefinition: s.schemaDefinition,
                  layoutConfig: s.layoutConfig,
                  sortOrder: s.sortOrder,
                },
              });
              results.series.updated++;
            } else {
              results.series.skipped++;
            }
          } else {
            await prisma.series.create({
              data: {
                name: s.name,
                code: s.code,
                description: s.description,
                templateId: s.templateId,
                schemaDefinition: s.schemaDefinition || { fields: [], groups: [] },
                layoutConfig: s.layoutConfig,
                sortOrder: s.sortOrder || 0,
                isActive: true,
              },
            });
            results.series.created++;
          }
        } catch (err) {
          results.series.errors.push(`系列 ${s.code}: ${err instanceof Error ? err.message : '未知错误'}`);
        }
      }
    }

    // 导入产品
    if (products && Array.isArray(products)) {
      for (const p of products) {
        try {
          // 查找系列
          const seriesRecord = await prisma.series.findUnique({
            where: { code: p.seriesCode },
          });

          if (!seriesRecord) {
            results.products.errors.push(`产品 ${p.sku}: 系列 ${p.seriesCode} 不存在`);
            continue;
          }

          const existing = await prisma.product.findUnique({
            where: { sku: p.sku },
          });

          if (existing) {
            if (mode === 'update') {
              await prisma.product.update({
                where: { sku: p.sku },
                data: {
                  name: p.name,
                  description: p.description,
                  seriesId: seriesRecord.id,
                  specifications: p.specifications || {},
                  circuitDiagrams: p.circuitDiagrams,
                  pinDefinitions: p.pinDefinitions,
                  status: p.status || 'DRAFT',
                },
              });
              results.products.updated++;
            } else {
              results.products.skipped++;
            }
          } else {
            const newProduct = await prisma.product.create({
              data: {
                name: p.name,
                sku: p.sku,
                description: p.description,
                seriesId: seriesRecord.id,
                specifications: p.specifications || {},
                circuitDiagrams: p.circuitDiagrams,
                pinDefinitions: p.pinDefinitions,
                status: p.status || 'DRAFT',
                isActive: true,
              },
            });

            // 导入型号
            if (p.partNumbers && Array.isArray(p.partNumbers)) {
              for (const pn of p.partNumbers) {
                await prisma.partNumber.create({
                  data: {
                    productId: newProduct.id,
                    partNumber: pn.partNumber,
                    variantConfig: pn.variantConfig || {},
                    category: pn.category,
                    isActive: true,
                  },
                });
              }
            }

            results.products.created++;
          }
        } catch (err) {
          results.products.errors.push(`产品 ${p.sku}: ${err instanceof Error ? err.message : '未知错误'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('导入失败:', error);
    return NextResponse.json(
      { error: '导入失败', success: false },
      { status: 500 }
    );
  }
}

