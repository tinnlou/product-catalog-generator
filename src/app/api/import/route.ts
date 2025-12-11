import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

// 解析CSV
function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.split('\n').filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('说明'));
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  
  return { headers, rows };
}

// POST /api/import - 导入数据
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'products';
    const mode = formData.get('mode') as string || 'skip';

    if (!file) {
      return NextResponse.json({ error: '请上传文件', success: false }, { status: 400 });
    }

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    if (type === 'series') {
      // 导入系列
      const codeIdx = headers.findIndex(h => h.includes('代码'));
      const nameIdx = headers.findIndex(h => h.includes('名称'));
      const descIdx = headers.findIndex(h => h.includes('描述'));
      const templateIdx = headers.findIndex(h => h.includes('模板'));
      const sortIdx = headers.findIndex(h => h.includes('排序'));

      for (const row of rows) {
        if (row.length < 2) continue;
        
        const code = row[codeIdx >= 0 ? codeIdx : 0];
        const name = row[nameIdx >= 0 ? nameIdx : 1];
        
        if (!code || !name) {
          results.errors.push(`跳过空行`);
          continue;
        }

        try {
          const existing = await prisma.series.findUnique({ where: { code } });

          if (existing) {
            if (mode === 'update') {
              await prisma.series.update({
                where: { code },
                data: {
                  name,
                  description: row[descIdx >= 0 ? descIdx : 2] || null,
                  templateId: row[templateIdx >= 0 ? templateIdx : 3] || 'layout-m8-standard',
                  sortOrder: parseInt(row[sortIdx >= 0 ? sortIdx : 4]) || 0,
                },
              });
              results.updated++;
            } else {
              results.skipped++;
            }
          } else {
            await prisma.series.create({
              data: {
                code,
                name,
                description: row[descIdx >= 0 ? descIdx : 2] || null,
                templateId: row[templateIdx >= 0 ? templateIdx : 3] || 'layout-m8-standard',
                schemaDefinition: { fields: [], groups: [] },
                sortOrder: parseInt(row[sortIdx >= 0 ? sortIdx : 4]) || 0,
                isActive: true,
              },
            });
            results.created++;
          }
        } catch (err) {
          results.errors.push(`系列 ${code}: ${err instanceof Error ? err.message : '未知错误'}`);
        }
      }
    } else {
      // 导入产品
      // 基础列: SKU, 产品名称, 系列代码, 描述, 状态
      // 之后的列都是动态规格字段
      const skuIdx = headers.findIndex(h => h === 'SKU' || h.includes('SKU'));
      const nameIdx = headers.findIndex(h => h === '产品名称' || h.includes('产品名称'));
      const seriesIdx = headers.findIndex(h => h === '系列代码' || h.includes('系列'));
      const descIdx = headers.findIndex(h => h === '描述');
      const statusIdx = headers.findIndex(h => h === '状态');

      // 基础列索引（用于识别动态字段）
      const baseColumnIndices = new Set([skuIdx, nameIdx, seriesIdx, descIdx, statusIdx].filter(i => i >= 0));

      for (const row of rows) {
        if (row.length < 3) continue;
        
        const sku = row[skuIdx >= 0 ? skuIdx : 0];
        const name = row[nameIdx >= 0 ? nameIdx : 1];
        const seriesCode = row[seriesIdx >= 0 ? seriesIdx : 2];
        
        if (!sku || !name || !seriesCode) {
          results.errors.push(`跳过: SKU=${sku || '空'}, 名称=${name || '空'}`);
          continue;
        }

        try {
          // 查找系列
          const series = await prisma.series.findUnique({ where: { code: seriesCode } });
          if (!series) {
            results.errors.push(`产品 ${sku}: 系列 ${seriesCode} 不存在`);
            continue;
          }

          // 获取系列的字段定义
          const schemaFields = (series.schemaDefinition as { fields?: { key: string; label: string; type: string }[] })?.fields || [];
          
          // 构建字段标签到key的映射
          const labelToKey: Record<string, { key: string; type: string }> = {};
          for (const field of schemaFields) {
            labelToKey[field.label] = { key: field.key, type: field.type };
          }

          // 解析规格参数 - 从动态列中读取
          const specifications: Record<string, any> = {};
          
          for (let i = 0; i < headers.length; i++) {
            if (baseColumnIndices.has(i)) continue; // 跳过基础列
            
            const header = headers[i];
            const value = row[i];
            
            if (!header || !value) continue;
            
            // 查找对应的字段定义
            const fieldDef = labelToKey[header];
            if (fieldDef) {
              // 使用字段key作为键
              if (fieldDef.type === 'number') {
                specifications[fieldDef.key] = parseFloat(value) || 0;
              } else if (fieldDef.type === 'boolean') {
                specifications[fieldDef.key] = value.toLowerCase() === 'true' || value === '是' || value === '1';
              } else {
                specifications[fieldDef.key] = value;
              }
            } else {
              // 如果没有找到字段定义，使用列名作为键（转为下划线格式）
              const key = header.replace(/\s+/g, '_').toLowerCase();
              specifications[key] = value;
            }
          }

          // 解析状态
          const statusStr = row[statusIdx >= 0 ? statusIdx : 4]?.toUpperCase() || 'DRAFT';
          const validStatuses = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'];
          const status: ProductStatus = validStatuses.includes(statusStr) 
            ? (statusStr as ProductStatus) 
            : ProductStatus.DRAFT;

          const existing = await prisma.product.findUnique({ where: { sku } });

          if (existing) {
            if (mode === 'update') {
              await prisma.product.update({
                where: { sku },
                data: {
                  name,
                  seriesId: series.id,
                  description: row[descIdx >= 0 ? descIdx : 3] || null,
                  status,
                  specifications,
                },
              });
              results.updated++;
            } else {
              results.skipped++;
            }
          } else {
            await prisma.product.create({
              data: {
                sku,
                name,
                seriesId: series.id,
                description: row[descIdx >= 0 ? descIdx : 3] || null,
                status,
                specifications,
                isActive: true,
              },
            });
            results.created++;
          }
        } catch (err) {
          results.errors.push(`产品 ${sku}: ${err instanceof Error ? err.message : '未知错误'}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('导入失败:', error);
    return NextResponse.json(
      { error: '导入失败: ' + (error instanceof Error ? error.message : '未知错误'), success: false },
      { status: 500 }
    );
  }
}
