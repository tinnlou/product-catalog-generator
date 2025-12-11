import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 解析CSV
function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.split('\n').filter(line => line.trim() && !line.startsWith('说明'));
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
      // 列: 系列代码, 系列名称, 描述, 模板ID, 排序
      const codeIdx = headers.findIndex(h => h.includes('代码'));
      const nameIdx = headers.findIndex(h => h.includes('名称'));
      const descIdx = headers.findIndex(h => h.includes('描述'));
      const templateIdx = headers.findIndex(h => h.includes('模板'));
      const sortIdx = headers.findIndex(h => h.includes('排序'));

      for (const row of rows) {
        if (row.length < 2) continue;
        
        const code = row[codeIdx] || row[0];
        const name = row[nameIdx] || row[1];
        
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
                  description: row[descIdx] || null,
                  templateId: row[templateIdx] || 'layout-m8-standard',
                  sortOrder: parseInt(row[sortIdx]) || 0,
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
                description: row[descIdx] || null,
                templateId: row[templateIdx] || 'layout-m8-standard',
                schemaDefinition: { fields: [], groups: [] },
                sortOrder: parseInt(row[sortIdx]) || 0,
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
      // 列: SKU, 产品名称, 系列代码, 描述, 状态, 规格参数(JSON)
      const skuIdx = headers.findIndex(h => h.includes('SKU'));
      const nameIdx = headers.findIndex(h => h.includes('产品名称') || h.includes('名称'));
      const seriesIdx = headers.findIndex(h => h.includes('系列代码') || h.includes('系列'));
      const descIdx = headers.findIndex(h => h.includes('描述'));
      const statusIdx = headers.findIndex(h => h.includes('状态'));
      const specsIdx = headers.findIndex(h => h.includes('规格') || h.includes('JSON'));

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

          // 解析规格参数
          let specifications = {};
          const specsStr = row[specsIdx >= 0 ? specsIdx : 5];
          if (specsStr) {
            try {
              specifications = JSON.parse(specsStr);
            } catch {
              // 忽略JSON解析错误
            }
          }

          const existing = await prisma.product.findUnique({ where: { sku } });

          if (existing) {
            if (mode === 'update') {
              await prisma.product.update({
                where: { sku },
                data: {
                  name,
                  seriesId: series.id,
                  description: row[descIdx >= 0 ? descIdx : 3] || null,
                  status: row[statusIdx >= 0 ? statusIdx : 4] || 'DRAFT',
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
                status: row[statusIdx >= 0 ? statusIdx : 4] || 'DRAFT',
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
