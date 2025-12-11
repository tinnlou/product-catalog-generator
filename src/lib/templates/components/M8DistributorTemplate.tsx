// ============================================================================
// M8DistributorTemplate - M8分线器PDF模板
// 
// 适用于: M8 Distributor 8/12/16 Ports 系列 (带线缆出线)
// 参考: PDF第28页布局 - 包含线缆颜色编码表
// ============================================================================

import React from 'react';
import { Document, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '../TemplateRegistry';
import { TemplateRegistry } from '../TemplateRegistry';
import {
  baseStyles,
  PageContainer,
  SpecificationTable,
} from './BaseTemplate';

// ============================================================================
// M8 Distributor 专用样式
// ============================================================================

const distributorStyles = StyleSheet.create({
  // 产品标题区域 - 深蓝色渐变风格
  productHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  productImageContainer: {
    width: 180,
    height: 120,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImage: {
    width: 160,
    height: 100,
    objectFit: 'contain',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  productSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  featureTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featureTagText: {
    fontSize: 7,
    color: '#e2e8f0',
  },
  
  // 三栏布局
  threeColumn: {
    flexDirection: 'row',
    marginTop: 10,
  },
  columnLeft: {
    width: '35%',
  },
  columnMiddle: {
    width: '30%',
    paddingHorizontal: 10,
  },
  columnRight: {
    width: '35%',
  },
  
  // 线缆颜色编码表
  wireColorSection: {
    marginTop: 15,
  },
  wireColorTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  wireColorTable: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  wireColorHeader: {
    flexDirection: 'row',
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
  },
  wireColorHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 8,
  },
  wireColorRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    minHeight: 24,
  },
  wireColorCell: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
  },
  wireColorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  // 端口配置说明
  portConfig: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 4,
  },
  portConfigTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 5,
  },
  portConfigText: {
    fontSize: 8,
    color: '#1e40af',
    lineHeight: 1.4,
  },
  
  // 型号选择表
  partNumberSection: {
    marginTop: 15,
  },
  partNumberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  partNumberCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 10,
  },
  partNumberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partNumberCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  partNumberCardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partNumberCardBadgeText: {
    fontSize: 7,
    color: '#ffffff',
  },
  partNumberCardCode: {
    fontSize: 9,
    color: '#1f2937',
    fontFamily: 'Courier',
    backgroundColor: '#f3f4f6',
    padding: 5,
    borderRadius: 2,
  },
});

// ============================================================================
// 线缆颜色映射
// ============================================================================

const WIRE_COLORS: Record<string, string> = {
  'BROWN': '#8B4513',
  'WHITE': '#FFFFFF',
  'BLUE': '#0000FF',
  'BLACK': '#000000',
  'GRAY': '#808080',
  'PINK': '#FFC0CB',
  'RED': '#FF0000',
  'YELLOW': '#FFFF00',
  'GREEN': '#008000',
  'PURPLE': '#800080',
  'GRAY/PINK': '#D8B8C8',
  'RED/BLUE': '#8B008B',
  'WHITE/GREEN': '#90EE90',
  'WHITE/YELLOW': '#FFFACD',
  'WHITE/GRAY': '#D3D3D3',
  'YELLOW/BROWN': '#DAA520',
  'BROWN/GREEN': '#556B2F',
  'GRAY/BROWN': '#A9A9A9',
};

// ============================================================================
// M8 Distributor Template 组件
// ============================================================================

function M8DistributorTemplateComponent({
  product,
  schemaDefinition,
  layoutConfig,
  pageNumber,
}: TemplateProps): React.ReactElement {
  const specs = product.specifications;
  const portCount = specs.port_count ?? '8';
  const cableType = specs.cable_type as string ?? 'PVC';
  
  // 获取产品主图
  const mainImage = product.assets?.find(a => a.usage === 'main_photo')?.asset.fileUrl;
  
  // 获取电路图
  const circuitDiagram = product.assets?.find(a => a.usage === 'circuit_diagram')?.asset.fileUrl;
  
  // 线缆颜色定义 (从产品规格或默认)
  const wireColorDef = specs.wire_colors as Array<{ pin: number; color: string }> ?? [
    { pin: 1, color: 'BLUE' },
    { pin: 2, color: 'BROWN' },
    { pin: 3, color: 'WHITE' },
    { pin: 4, color: 'GREEN' },
    { pin: 5, color: 'YELLOW' },
    { pin: 6, color: 'GRAY' },
    { pin: 7, color: 'PINK' },
    { pin: 8, color: 'RED' },
  ];

  // 按线缆类型分组型号
  const pvcParts = product.partNumbers.filter(
    p => p.variantConfig?.cable_type === 'PVC'
  );
  const purParts = product.partNumbers.filter(
    p => p.variantConfig?.cable_type === 'PUR'
  );

  return (
    <Document>
      <PageContainer
        layoutConfig={layoutConfig}
        pageNumber={pageNumber ?? 1}
        showHeader={true}
        headerTitle={`M8 Distributor ${portCount} Ports`}
      >
        {/* 产品标题区域 */}
        <View style={distributorStyles.productHeader}>
          <View style={distributorStyles.productImageContainer}>
            {mainImage ? (
              <Image src={mainImage} style={distributorStyles.productImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#64748b' }}>产品图片</Text>
            )}
          </View>
          <View style={distributorStyles.productInfo}>
            <Text style={distributorStyles.productName}>{product.name}</Text>
            <Text style={distributorStyles.productSubtitle}>
              M8 Distributor {portCount} Ports, Cable Accessories, Halogen-Free Cable
            </Text>
            <View style={distributorStyles.featureTags}>
              <View style={distributorStyles.featureTag}>
                <Text style={distributorStyles.featureTagText}>IP67</Text>
              </View>
              <View style={distributorStyles.featureTag}>
                <Text style={distributorStyles.featureTagText}>Halogen-Free</Text>
              </View>
              <View style={distributorStyles.featureTag}>
                <Text style={distributorStyles.featureTagText}>{cableType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 三栏布局 */}
        <View style={distributorStyles.threeColumn}>
          {/* 左栏: 规格表 */}
          <View style={distributorStyles.columnLeft}>
            <Text style={baseStyles.sectionTitle}>Specification 规格</Text>
            <SpecificationTable
              specifications={specs}
              visibleFields={[
                'voltage_rating',
                'working_voltage',
                'current_load',
                'total_current',
                'ip_rating',
                'cable_type',
                'cable_spec',
              ]}
              fieldLabels={{
                voltage_rating: '额定电源',
                working_voltage: '工作电压',
                current_load: '电流负载',
                total_current: '总电流',
                ip_rating: '防护等级',
                cable_type: '线缆类型',
                cable_spec: '线缆规格',
              }}
            />
          </View>

          {/* 中栏: 电路图 */}
          <View style={distributorStyles.columnMiddle}>
            <Text style={baseStyles.sectionTitle}>Circuit 电路图</Text>
            {circuitDiagram ? (
              <Image 
                src={circuitDiagram} 
                style={{ width: '100%', height: 150, objectFit: 'contain' }} 
              />
            ) : (
              <View 
                style={{ 
                  width: '100%', 
                  height: 150, 
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 8, color: '#9ca3af' }}>电路图</Text>
              </View>
            )}
          </View>

          {/* 右栏: 端口配置 */}
          <View style={distributorStyles.columnRight}>
            <Text style={baseStyles.sectionTitle}>Insert Arrangement</Text>
            <View style={distributorStyles.portConfig}>
              <Text style={distributorStyles.portConfigTitle}>
                {portCount} ports / Single channel
              </Text>
              <Text style={distributorStyles.portConfigText}>
                Insert arrangement (PCB){'\n'}
                {portCount} ports/Single channel
              </Text>
            </View>
          </View>
        </View>

        {/* 线缆颜色编码表 */}
        <View style={distributorStyles.wireColorSection}>
          <Text style={distributorStyles.wireColorTitle}>
            Wire Color Code 线缆颜色编码
          </Text>
          <View style={distributorStyles.wireColorTable}>
            {/* 表头 */}
            <View style={distributorStyles.wireColorHeader}>
              <Text style={[distributorStyles.wireColorHeaderCell, { width: 50 }]}>Pin</Text>
              <Text style={[distributorStyles.wireColorHeaderCell, { width: 60 }]}>Color</Text>
              <Text style={[distributorStyles.wireColorHeaderCell, { flex: 1 }]}>颜色</Text>
            </View>
            
            {/* 线缆颜色行 */}
            {wireColorDef.slice(0, 8).map((wire, index) => (
              <View 
                key={wire.pin} 
                style={[
                  distributorStyles.wireColorRow,
                  index % 2 === 1 ? { backgroundColor: '#f9fafb' } : {},
                ]}
              >
                <Text style={[distributorStyles.wireColorCell, { width: 50, fontWeight: 'bold' }]}>
                  {wire.pin}
                </Text>
                <View style={[distributorStyles.wireColorCell, { width: 60, flexDirection: 'row', alignItems: 'center' }]}>
                  <View 
                    style={[
                      distributorStyles.wireColorSwatch,
                      { backgroundColor: WIRE_COLORS[wire.color] ?? '#ccc' },
                    ]}
                  />
                </View>
                <Text style={[distributorStyles.wireColorCell, { flex: 1 }]}>
                  {wire.color}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 型号选择 */}
        <View style={distributorStyles.partNumberSection}>
          <Text style={baseStyles.sectionTitle}>Port Number 型号选择</Text>
          <View style={distributorStyles.partNumberGrid}>
            {/* PVC型号 */}
            {pvcParts.length > 0 && (
              <View style={distributorStyles.partNumberCard}>
                <View style={distributorStyles.partNumberCardHeader}>
                  <Text style={distributorStyles.partNumberCardTitle}>PVC Flexible Cable</Text>
                  <View style={[distributorStyles.partNumberCardBadge, { backgroundColor: '#3b82f6' }]}>
                    <Text style={distributorStyles.partNumberCardBadgeText}>PVC</Text>
                  </View>
                </View>
                {pvcParts.map(pn => (
                  <Text key={pn.id} style={distributorStyles.partNumberCardCode}>
                    {pn.partNumber}
                  </Text>
                ))}
              </View>
            )}
            
            {/* PUR型号 */}
            {purParts.length > 0 && (
              <View style={distributorStyles.partNumberCard}>
                <View style={distributorStyles.partNumberCardHeader}>
                  <Text style={distributorStyles.partNumberCardTitle}>PUR Drag Chain Cable</Text>
                  <View style={[distributorStyles.partNumberCardBadge, { backgroundColor: '#10b981' }]}>
                    <Text style={distributorStyles.partNumberCardBadgeText}>PUR</Text>
                  </View>
                </View>
                {purParts.map(pn => (
                  <Text key={pn.id} style={distributorStyles.partNumberCardCode}>
                    {pn.partNumber}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 规格说明 */}
        <View style={[baseStyles.noteBox, { marginTop: 15 }]}>
          <Text style={baseStyles.noteText}>
            ⚠️ 注意: 所有型号均为无卤素(Halogen-Free)线缆，符合RoHS标准。
            {'\n'}
            线缆规格: {String(specs.cable_spec ?? '10×0.25mm²')} | 护套颜色: GRAY 灰色
          </Text>
        </View>
      </PageContainer>
    </Document>
  );
}

// ============================================================================
// 注册模板
// ============================================================================

TemplateRegistry.register(
  {
    id: 'layout-m8-distributor',
    name: 'M8 Distributor Layout',
    description: 'M8分线器系列模板，适用于带线缆出线的8/12/16端口产品',
    applicableTo: ['M8-DISTRIBUTOR-8-12', 'M8-DISTRIBUTOR-16'],
    version: '1.0.0',
    supportsMultiPage: true,
    defaultOrientation: 'portrait',
  },
  M8DistributorTemplateComponent
);

export default M8DistributorTemplateComponent;

