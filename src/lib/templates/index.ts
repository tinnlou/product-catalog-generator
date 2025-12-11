// ============================================================================
// Templates Index - 模板入口文件
// 
// 导入此文件以自动注册所有模板到TemplateRegistry
// ============================================================================

// 导出核心模块
export {
  TemplateRegistry,
  useTemplateResolver,
  DynamicTemplateRenderer,
  registerTemplate,
  registerTemplates,
} from './TemplateRegistry';

export type {
  TemplateProps,
  TemplateMetadata,
  TemplateComponent,
} from './TemplateRegistry';

// 导入模板组件 (自动注册)
import './components/M8StandardTemplate';
import './components/M8DistributorTemplate';

// 导出基础组件
export {
  baseStyles,
  PageContainer,
  SpecificationTable,
  PartNumberTable,
  CircuitDiagramDisplay,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from './components/BaseTemplate';

// ============================================================================
// 预定义模板ID常量
// ============================================================================

export const TEMPLATE_IDS = {
  M8_STANDARD: 'layout-m8-standard',
  M8_DISTRIBUTOR: 'layout-m8-distributor',
  // 未来扩展
  // M12_STANDARD: 'layout-m12-standard',
  // M23_STANDARD: 'layout-m23-standard',
} as const;

export type TemplateId = typeof TEMPLATE_IDS[keyof typeof TEMPLATE_IDS];

