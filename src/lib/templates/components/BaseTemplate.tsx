// ============================================================================
// BaseTemplate - PDF模板基础组件
// 
// 提供所有模板共用的:
// 1. 页面结构 (Page, Document)
// 2. 通用样式
// 3. 可复用的UI组件 (表格、规格表等)
// ============================================================================

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { LayoutConfig, ProductWithRelations, ProductSpecifications } from '@/types/schema';

// ============================================================================
// 字体注册 (如需要中文支持)
// ============================================================================

// 注意: 实际使用时需要提供字体文件路径
// Font.register({
//   family: 'NotoSansSC',
//   src: '/fonts/NotoSansSC-Regular.ttf',
// });

// ============================================================================
// 基础样式定义
// ============================================================================

export const baseStyles = StyleSheet.create({
  // 页面
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
  },
  
  // 页眉
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  headerLogo: {
    width: 100,
    height: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  
  // 页脚
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6b7280',
  },
  
  // 标题
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 15,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  // 产品标题区域
  productHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  productImage: {
    width: 150,
    height: 120,
    marginRight: 20,
    objectFit: 'contain',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  productSku: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  
  // 表格
  table: {
    width: '100%',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    borderBottomWidth: 0,
  },
  tableHeaderCell: {
    padding: 6,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
    color: '#374151',
  },
  tableCellLabel: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    width: '40%',
  },
  tableCellValue: {
    width: '60%',
  },
  
  // 规格表格 (两列布局)
  specTable: {
    width: '100%',
  },
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 24,
  },
  specLabel: {
    width: '45%',
    padding: 5,
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#374151',
  },
  specValue: {
    width: '55%',
    padding: 5,
    fontSize: 9,
    color: '#1f2937',
  },
  
  // 型号表格
  partNumberTable: {
    width: '100%',
    marginTop: 10,
  },
  partNumberRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  // 电路图区域
  diagramSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  diagramBox: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  diagramTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#374151',
  },
  diagramImage: {
    width: '100%',
    height: 100,
    objectFit: 'contain',
  },
  
  // 引脚定义表
  pinTable: {
    marginTop: 10,
  },
  pinRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    minHeight: 22,
  },
  pinNumber: {
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  pinColor: {
    width: 60,
    padding: 4,
    textAlign: 'center',
  },
  pinFunction: {
    flex: 1,
    padding: 4,
  },
  
  // 两列布局
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  
  // 警告/提示框
  noteBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  noteText: {
    fontSize: 8,
    color: '#92400e',
  },
});

// ============================================================================
// 可复用组件: 规格表
// ============================================================================

interface SpecificationTableProps {
  specifications: ProductSpecifications;
  fieldLabels?: Record<string, string>;
  visibleFields?: string[];
}

export function SpecificationTable({ 
  specifications, 
  fieldLabels = {},
  visibleFields,
}: SpecificationTableProps) {
  const defaultLabels: Record<string, string> = {
    voltage_rating: '额定电源',
    working_voltage: '额定工作电压',
    current_load: '电流负载能力',
    total_current: '总电流',
    port_count: '端口数量',
    ip_rating: '防护等级',
    channel_type: '通道类型',
    connector_type: '连接器类型',
    cable_type: '线缆类型',
    cable_length: '线缆长度',
  };
  
  const labels = { ...defaultLabels, ...fieldLabels };
  
  const fields = visibleFields ?? Object.keys(specifications);
  
  return (
    <View style={baseStyles.specTable}>
      {fields.map((key) => {
        const value = specifications[key];
        if (value === undefined || value === null || key === 'led_indicator') return null;
        
        let displayValue = String(value);
        if (typeof value === 'number') {
          displayValue = `${value}A`;
        }
        if (key === 'channel_type') {
          displayValue = value === 'single' ? '单通道' : '双通道';
        }
        
        return (
          <View key={key} style={baseStyles.specRow}>
            <Text style={baseStyles.specLabel}>{labels[key] ?? key}</Text>
            <Text style={baseStyles.specValue}>{displayValue}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ============================================================================
// 可复用组件: 型号表格
// ============================================================================

interface PartNumberTableProps {
  partNumbers: ProductWithRelations['partNumbers'];
  columns?: {
    key: string;
    label: string;
    width: string;
  }[];
}

export function PartNumberTable({ partNumbers, columns }: PartNumberTableProps) {
  const defaultColumns = [
    { key: 'category', label: '类型', width: '20%' },
    { key: 'partNumber', label: '型号', width: '80%' },
  ];
  
  const cols = columns ?? defaultColumns;
  
  return (
    <View style={baseStyles.partNumberTable}>
      {/* 表头 */}
      <View style={baseStyles.tableHeaderRow}>
        {cols.map((col) => (
          <Text 
            key={col.key} 
            style={[baseStyles.tableHeaderCell, { width: col.width }]}
          >
            {col.label}
          </Text>
        ))}
      </View>
      
      {/* 数据行 */}
      {partNumbers.map((pn, index) => (
        <View 
          key={pn.id} 
          style={[
            baseStyles.partNumberRow,
            index % 2 === 1 && { backgroundColor: '#f9fafb' },
          ]}
        >
          {cols.map((col) => {
            let value = '';
            if (col.key === 'category') {
              value = pn.category ?? '-';
            } else if (col.key === 'partNumber') {
              value = pn.partNumber;
            } else {
              value = String(pn.variantConfig[col.key] ?? '-');
            }
            
            return (
              <Text 
                key={col.key} 
                style={[baseStyles.tableCell, { width: col.width }]}
              >
                {value}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// 可复用组件: 页面容器
// ============================================================================

interface PageContainerProps {
  children: React.ReactNode;
  layoutConfig?: LayoutConfig;
  pageNumber?: number;
  totalPages?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  headerTitle?: string;
  logoUrl?: string;
}

export function PageContainer({
  children,
  layoutConfig,
  pageNumber,
  totalPages,
  showHeader = true,
  showFooter = true,
  headerTitle,
  logoUrl,
}: PageContainerProps) {
  const pageSize = layoutConfig?.pageSize ?? 'A4';
  const orientation = layoutConfig?.orientation ?? 'portrait';
  const margins = layoutConfig?.margins ?? { top: 30, right: 30, bottom: 40, left: 30 };
  
  return (
    <Page
      size={pageSize}
      orientation={orientation}
      style={[
        baseStyles.page,
        {
          paddingTop: margins.top,
          paddingRight: margins.right,
          paddingBottom: margins.bottom,
          paddingLeft: margins.left,
        },
      ]}
    >
      {/* 页眉 */}
      {showHeader && (
        <View style={baseStyles.header}>
          {logoUrl && <Image src={logoUrl} style={baseStyles.headerLogo} />}
          {headerTitle && <Text style={baseStyles.headerTitle}>{headerTitle}</Text>}
        </View>
      )}
      
      {/* 内容区域 */}
      <View style={{ flex: 1 }}>{children}</View>
      
      {/* 页脚 */}
      {showFooter && (
        <View style={baseStyles.footer}>
          <Text>© 2024 Industrial Connectors Co.</Text>
          {pageNumber && totalPages && (
            <Text>
              Page {pageNumber} / {totalPages}
            </Text>
          )}
        </View>
      )}
    </Page>
  );
}

// ============================================================================
// 可复用组件: 电路图展示
// ============================================================================

interface CircuitDiagramDisplayProps {
  title: string;
  imageUrl?: string;
  description?: string;
}

export function CircuitDiagramDisplay({ 
  title, 
  imageUrl, 
  description 
}: CircuitDiagramDisplayProps) {
  return (
    <View style={baseStyles.diagramBox}>
      <Text style={baseStyles.diagramTitle}>{title}</Text>
      {imageUrl ? (
        <Image src={imageUrl} style={baseStyles.diagramImage} />
      ) : (
        <View 
          style={[
            baseStyles.diagramImage, 
            { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }
          ]}
        >
          <Text style={{ color: '#9ca3af', fontSize: 8 }}>图片未上传</Text>
        </View>
      )}
      {description && (
        <Text style={{ fontSize: 7, color: '#6b7280', marginTop: 5, textAlign: 'center' }}>
          {description}
        </Text>
      )}
    </View>
  );
}

// ============================================================================
// 导出
// ============================================================================

export { Document, Page, View, Text, Image, StyleSheet };

