'use client';

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

// 样式定义
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#1e40af',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  productSection: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  productSku: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 15,
    lineHeight: 1.5,
  },
  specsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 10,
  },
  specsTable: {
    marginTop: 5,
  },
  specsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 6,
  },
  specsLabel: {
    width: '40%',
    fontSize: 9,
    color: '#6b7280',
  },
  specsValue: {
    width: '60%',
    fontSize: 9,
    color: '#1f2937',
  },
  partNumbersSection: {
    marginTop: 15,
  },
  partNumbersTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  partNumbersTable: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  partNumbersHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  partNumbersRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  partNumberCell: {
    flex: 1,
    fontSize: 8,
  },
  partNumberCellHeader: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
  seriesHeader: {
    backgroundColor: '#eff6ff',
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  seriesName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  seriesCode: {
    fontSize: 9,
    color: '#6b7280',
  },
});

interface ProductData {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  specifications?: Record<string, any>;
  series: {
    name: string;
    code: string;
    schemaDefinition?: {
      fields?: Array<{ key: string; label: string; type: string }>;
    };
  };
  partNumbers?: Array<{
    id: string;
    partNumber: string;
    category?: string | null;
  }>;
}

interface ProductCatalogPDFProps {
  products: ProductData[];
  title?: string;
}

export default function ProductCatalogPDF({ products, title = '产品目录' }: ProductCatalogPDFProps) {
  // 按系列分组
  const productsBySeries = products.reduce((acc, product) => {
    const seriesCode = product.series.code;
    if (!acc[seriesCode]) {
      acc[seriesCode] = {
        series: product.series,
        products: [],
      };
    }
    acc[seriesCode].products.push(product);
    return acc;
  }, {} as Record<string, { series: ProductData['series']; products: ProductData[] }>);

  const seriesGroups = Object.values(productsBySeries);

  return (
    <Document>
      {seriesGroups.map((group, groupIndex) => (
        <Page key={group.series.code} size="A4" style={styles.page}>
          {/* 页眉 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>Product Catalog</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('zh-CN')}
            </Text>
          </View>

          {/* 系列信息 */}
          <View style={styles.seriesHeader}>
            <Text style={styles.seriesName}>{group.series.name}</Text>
            <Text style={styles.seriesCode}>系列代码: {group.series.code}</Text>
          </View>

          {/* 产品列表 */}
          {group.products.map((product, productIndex) => {
            const specs = product.specifications || {};
            const schemaFields = product.series.schemaDefinition?.fields || [];
            
            return (
              <View key={product.id} style={styles.productSection} wrap={false}>
                {/* 产品名称和SKU */}
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>
                
                {/* 产品描述 */}
                {product.description && (
                  <Text style={styles.productDescription}>{product.description}</Text>
                )}

                {/* 规格参数 */}
                {Object.keys(specs).length > 0 && (
                  <View>
                    <Text style={styles.specsTitle}>规格参数</Text>
                    <View style={styles.specsTable}>
                      {schemaFields.length > 0 ? (
                        // 使用schema字段定义来显示
                        schemaFields.map(field => {
                          const value = specs[field.key];
                          if (value === undefined || value === null || value === '') return null;
                          return (
                            <View key={field.key} style={styles.specsRow}>
                              <Text style={styles.specsLabel}>{field.label}</Text>
                              <Text style={styles.specsValue}>{String(value)}</Text>
                            </View>
                          );
                        })
                      ) : (
                        // 直接显示specs对象
                        Object.entries(specs).map(([key, value]) => (
                          <View key={key} style={styles.specsRow}>
                            <Text style={styles.specsLabel}>{key}</Text>
                            <Text style={styles.specsValue}>{String(value)}</Text>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                )}

                {/* 型号列表 */}
                {product.partNumbers && product.partNumbers.length > 0 && (
                  <View style={styles.partNumbersSection}>
                    <Text style={styles.partNumbersTitle}>型号列表</Text>
                    <View style={styles.partNumbersTable}>
                      <View style={styles.partNumbersHeader}>
                        <Text style={styles.partNumberCellHeader}>型号</Text>
                        <Text style={styles.partNumberCellHeader}>类别</Text>
                      </View>
                      {product.partNumbers.map(pn => (
                        <View key={pn.id} style={styles.partNumbersRow}>
                          <Text style={styles.partNumberCell}>{pn.partNumber}</Text>
                          <Text style={styles.partNumberCell}>{pn.category || '-'}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* 页脚 */}
          <View style={styles.footer} fixed>
            <Text>Generated by Product Catalog System</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}

