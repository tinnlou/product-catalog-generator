// ============================================================================
// 类型定义 - Schema & Configuration Types
// ============================================================================

/**
 * 字段类型枚举
 */
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect'
  | 'boolean'
  | 'textarea'
  | 'json'
  | 'image'
  | 'color';

/**
 * Schema字段定义
 */
export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  description?: string;
  group?: string;
  unit?: string;
  
  // select/multiselect 选项
  options?: string[] | { value: string; label: string }[];
  
  // number 类型约束
  min?: number;
  max?: number;
  step?: number;
  
  // 验证规则
  validation?: {
    pattern?: string;
    message?: string;
  };
  
  // 条件显示
  showWhen?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in';
    value: unknown;
  };
}

/**
 * 字段分组定义
 */
export interface SchemaGroup {
  key: string;
  label: string;
  order: number;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * 系列Schema定义 (存储在Series.schemaDefinition中)
 */
export interface SeriesSchemaDefinition {
  fields: SchemaField[];
  groups: SchemaGroup[];
  version?: number;
}

/**
 * 布局配置 (存储在Series.layoutConfig中)
 */
export interface LayoutConfig {
  pageSize?: 'A4' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showHeader?: boolean;
  showFooter?: boolean;
  showPageNumbers?: boolean;
  customStyles?: Record<string, unknown>;
}

/**
 * 电路图配置
 */
export interface CircuitDiagram {
  assetId: string;
  description?: string;
  type?: 'npn' | 'pnp' | 'no_led' | 'custom';
}

export interface CircuitDiagrams {
  npn?: CircuitDiagram;
  pnp?: CircuitDiagram;
  no_led?: CircuitDiagram;
  [key: string]: CircuitDiagram | undefined;
}

/**
 * 引脚定义
 */
export interface PinDefinition {
  pin: number;
  name: string;
  function: string;
  color?: string;
}

export interface PinDefinitions {
  connector_type: string;
  pins: PinDefinition[];
  diagram_asset_id?: string;
}

/**
 * 产品变体配置 (存储在PartNumber.variantConfig中)
 */
export interface VariantConfig {
  signal_type?: 'NPN' | 'PNP' | 'NO_LED';
  cable_type?: 'PVC' | 'PUR';
  cable_length?: string;
  connector_type?: string;
  [key: string]: unknown;
}

/**
 * LED指示器配置
 */
export interface LEDIndicator {
  power?: string;
  signal?: string;
  [key: string]: string | undefined;
}

/**
 * 产品规格 (存储在Product.specifications中)
 */
export interface ProductSpecifications {
  voltage_rating?: string;
  working_voltage?: string;
  current_load?: number;
  total_current?: number;
  port_count?: string | number;
  ip_rating?: string;
  led_indicator?: LEDIndicator;
  channel_type?: 'single' | 'dual';
  [key: string]: unknown;
}

// ============================================================================
// 审计日志相关类型
// ============================================================================

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'PUBLISH' 
  | 'UNPUBLISH' 
  | 'RESTORE' 
  | 'BULK_UPDATE';

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditAction;
  fieldName?: string;
  previousValue?: unknown;
  newValue?: unknown;
  summary?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// API响应类型
// ============================================================================

export interface SeriesWithProducts {
  id: string;
  name: string;
  code: string;
  description?: string;
  templateId: string;
  schemaDefinition: SeriesSchemaDefinition;
  layoutConfig?: LayoutConfig;
  products: ProductWithRelations[];
}

export interface ProductWithRelations {
  id: string;
  name: string;
  sku: string;
  description?: string;
  seriesId: string;
  series?: {
    id: string;
    name: string;
    code: string;
    templateId: string;
    schemaDefinition: SeriesSchemaDefinition;
    layoutConfig?: LayoutConfig;
  };
  specifications: ProductSpecifications;
  circuitDiagrams?: CircuitDiagrams;
  pinDefinitions?: PinDefinitions;
  status: string;
  version: number;
  partNumbers: PartNumberData[];
  assets: ProductAssetData[];
}

export interface PartNumberData {
  id: string;
  partNumber: string;
  variantConfig: VariantConfig;
  category?: string;
}

export interface ProductAssetData {
  id: string;
  usage: string;
  sortOrder: number;
  asset: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    tags: string[];
    altText?: string;
  };
}

