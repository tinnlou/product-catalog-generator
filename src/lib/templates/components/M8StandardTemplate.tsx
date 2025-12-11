// ============================================================================
// M8StandardTemplate - M8系列标准PDF模板
// 
// 适用于: M8 Compact 4/6/8/10 Ports 系列
// 参考: PDF第7页布局
// ============================================================================

import React from 'react';
import { Document, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '../TemplateRegistry';
import { 
  TemplateRegistry, 
  registerTemplate,
} from '../TemplateRegistry';
import {
  baseStyles,
  PageContainer,
  SpecificationTable,
  PartNumberTable,
  CircuitDiagramDisplay,
} from './BaseTemplate';

// ============================================================================
// M8专用样式
// ============================================================================

const m8Styles = StyleSheet.create({
  // 产品标题区域 - 蓝色主题
  productHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  productImageContainer: {
    width: 140,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImage: {
    width: 120,
    height: 80,
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
    color: '#93c5fd',
    marginBottom: 3,
  },
  productBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  productBadgeText: {
    fontSize: 8,
    color: '#ffffff',
  },
  
  // 两列规格布局
  specSection: {
    flexDirection: 'row',
    marginTop: 10,
  },
  specColumn: {
    width: '48%',
  },
  specColumnDivider: {
    width: '4%',
  },
  
  // 连接器图示
  connectorSection: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
    gap: 20,
  },
  connectorBox: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    width: 120,
  },
  connectorImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  connectorLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  connectorType: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // LED指示说明
  ledSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 4,
  },
  ledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ledIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  ledText: {
    fontSize: 9,
    color: '#374151',
  },
  
  // 型号表头
  partNumberHeader: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  partNumberHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

// ============================================================================
// M8 Standard Template 组件
// ============================================================================

function M8StandardTemplateComponent({
  product,
  schemaDefinition,
  layoutConfig,
  isPreview,
  pageNumber,
}: TemplateProps): React.ReactElement {
  const specs = product.specifications;
  const portCount = specs.port_count ?? '4';
  
  // 获取产品主图
  const mainImage = product.assets?.find(a => a.usage === 'main_photo')?.asset.fileUrl;
  
  // 获取连接器图
  const m8ConnectorImage = product.assets?.find(a => a.usage === 'connector_m8')?.asset.fileUrl;
  const m12ConnectorImage = product.assets?.find(a => a.usage === 'connector_m12')?.asset.fileUrl;
  
  // 获取电路图
  const npnDiagram = product.assets?.find(a => a.usage === 'circuit_diagram_npn')?.asset.fileUrl;
  const pnpDiagram = product.assets?.find(a => a.usage === 'circuit_diagram_pnp')?.asset.fileUrl;

  // 按类型分组型号
  const npnParts = product.partNumbers.filter(p => p.category === 'NPN');
  const pnpParts = product.partNumbers.filter(p => p.category === 'PNP');
  const noLedParts = product.partNumbers.filter(p => p.category === 'NO_LED' || !p.category);

  return (
    <Document>
      <PageContainer
        layoutConfig={layoutConfig}
        pageNumber={pageNumber ?? 1}
        showHeader={true}
        headerTitle={`M8 Compact ${portCount} Ports`}
      >
        {/* 产品标题区域 */}
        <View style={m8Styles.productHeader}>
          <View style={m8Styles.productImageContainer}>
            {mainImage ? (
              <Image src={mainImage} style={m8Styles.productImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#9ca3af' }}>产品图片</Text>
            )}
          </View>
          <View style={m8Styles.productInfo}>
            <Text style={m8Styles.productName}>{product.name}</Text>
            <Text style={m8Styles.productSubtitle}>
              M8 Compact {portCount} Ports, M12 Pre-Assembled Plug
            </Text>
            <View style={m8Styles.productBadge}>
              <Text style={m8Styles.productBadgeText}>IP67</Text>
            </View>
          </View>
        </View>

        {/* 两列布局: 规格 & 连接器 */}
        <View style={m8Styles.specSection}>
          {/* 左列: 规格表 */}
          <View style={m8Styles.specColumn}>
            <Text style={baseStyles.sectionTitle}>Specification 规格参数</Text>
            <SpecificationTable
              specifications={specs}
              visibleFields={[
                'voltage_rating',
                'working_voltage', 
                'current_load',
                'total_current',
                'ip_rating',
              ]}
              fieldLabels={{
                voltage_rating: '额定电源 Ue',
                working_voltage: '额定工作电压 Ue',
                current_load: '电流负载能力',
                total_current: '总电流',
                ip_rating: '外壳防护等级',
              }}
            />
            
            {/* LED指示说明 */}
            <View style={m8Styles.ledSection}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#166534' }}>
                LED Display LED显示
              </Text>
              <View style={m8Styles.ledRow}>
                <View style={[m8Styles.ledIndicator, { backgroundColor: '#22c55e' }]} />
                <Text style={m8Styles.ledText}>Power 电源 (Green 绿色)</Text>
              </View>
              <View style={m8Styles.ledRow}>
                <View style={[m8Styles.ledIndicator, { backgroundColor: '#eab308' }]} />
                <Text style={m8Styles.ledText}>Signal S1 信号 (Yellow 黄色)</Text>
              </View>
            </View>
          </View>

          <View style={m8Styles.specColumnDivider} />

          {/* 右列: 连接器排列 */}
          <View style={m8Styles.specColumn}>
            <Text style={baseStyles.sectionTitle}>Insert Arrangement 插入排列</Text>
            <View style={m8Styles.connectorSection}>
              <View style={m8Styles.connectorBox}>
                {m8ConnectorImage ? (
                  <Image src={m8ConnectorImage} style={m8Styles.connectorImage} />
                ) : (
                  <View style={[m8Styles.connectorImage, { backgroundColor: '#f3f4f6' }]} />
                )}
                <Text style={m8Styles.connectorLabel}>M8 Female</Text>
                <Text style={m8Styles.connectorType}>3-pin</Text>
              </View>
              <View style={m8Styles.connectorBox}>
                {m12ConnectorImage ? (
                  <Image src={m12ConnectorImage} style={m8Styles.connectorImage} />
                ) : (
                  <View style={[m8Styles.connectorImage, { backgroundColor: '#f3f4f6' }]} />
                )}
                <Text style={m8Styles.connectorLabel}>M12 Male</Text>
                <Text style={m8Styles.connectorType}>8-pin</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 电路图区域 */}
        <Text style={baseStyles.sectionTitle}>Circuit Diagram 电路图</Text>
        <View style={baseStyles.diagramSection}>
          <CircuitDiagramDisplay
            title="NPN"
            imageUrl={npnDiagram}
            description="Pin 1: +V | Pin 3: -V | Pin 4: ISO"
          />
          <CircuitDiagramDisplay
            title="PNP"
            imageUrl={pnpDiagram}
            description="Pin 1: +V | Pin 3: -V | Pin 4: ISO"
          />
        </View>

        {/* 型号表格 */}
        <Text style={baseStyles.sectionTitle}>Port Number 端口编号</Text>
        
        {/* NPN型号 */}
        {npnParts.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <View style={[m8Styles.partNumberHeader, { backgroundColor: '#059669' }]}>
              <Text style={m8Styles.partNumberHeaderText}>NPN</Text>
            </View>
            <PartNumberTable 
              partNumbers={npnParts}
              columns={[
                { key: 'partNumber', label: '型号 Part Number', width: '100%' },
              ]}
            />
          </View>
        )}
        
        {/* PNP型号 */}
        {pnpParts.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <View style={[m8Styles.partNumberHeader, { backgroundColor: '#dc2626' }]}>
              <Text style={m8Styles.partNumberHeaderText}>PNP</Text>
            </View>
            <PartNumberTable 
              partNumbers={pnpParts}
              columns={[
                { key: 'partNumber', label: '型号 Part Number', width: '100%' },
              ]}
            />
          </View>
        )}
        
        {/* 无LED型号 */}
        {noLedParts.length > 0 && (
          <View>
            <View style={[m8Styles.partNumberHeader, { backgroundColor: '#6b7280' }]}>
              <Text style={m8Styles.partNumberHeaderText}>Without Component 无组件</Text>
            </View>
            <PartNumberTable 
              partNumbers={noLedParts}
              columns={[
                { key: 'partNumber', label: '型号 Part Number', width: '100%' },
              ]}
            />
          </View>
        )}
      </PageContainer>
    </Document>
  );
}

// ============================================================================
// 注册模板
// ============================================================================

TemplateRegistry.register(
  {
    id: 'layout-m8-standard',
    name: 'M8 Standard Layout',
    description: 'M8 Compact系列标准布局模板，适用于4/6/8/10端口产品',
    applicableTo: ['M8-COMPACT-4-6', 'M8-COMPACT-8-10'],
    version: '1.0.0',
    supportsMultiPage: false,
    defaultOrientation: 'portrait',
  },
  M8StandardTemplateComponent
);

// 设置为默认回退模板
TemplateRegistry.setFallback('layout-m8-standard');

export default M8StandardTemplateComponent;

