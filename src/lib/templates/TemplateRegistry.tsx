// ============================================================================
// TemplateRegistry - 动态模板解析器 (策略模式)
// 
// 核心职责:
// 1. 注册和管理所有PDF模板组件
// 2. 根据Series.templateId动态解析对应的模板
// 3. 提供类型安全的模板渲染接口
// ============================================================================

import React from 'react';
import type { ProductWithRelations, SeriesSchemaDefinition, LayoutConfig } from '@/types/schema';

// ============================================================================
// 模板Props接口定义
// ============================================================================

/**
 * 所有PDF模板组件必须实现的Props接口
 */
export interface TemplateProps {
  /** 产品数据(包含关联数据) */
  product: ProductWithRelations;
  
  /** 系列Schema定义 */
  schemaDefinition: SeriesSchemaDefinition;
  
  /** 布局配置 */
  layoutConfig?: LayoutConfig;
  
  /** 是否为预览模式 */
  isPreview?: boolean;
  
  /** 页码(用于多页渲染) */
  pageNumber?: number;
  
  /** 自定义样式覆盖 */
  styleOverrides?: Record<string, unknown>;
}

/**
 * 模板组件类型
 */
export type TemplateComponent = React.ComponentType<TemplateProps>;

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  /** 模板唯一标识 */
  id: string;
  
  /** 模板显示名称 */
  name: string;
  
  /** 模板描述 */
  description?: string;
  
  /** 适用的系列类型 */
  applicableTo?: string[];
  
  /** 模板版本 */
  version: string;
  
  /** 预览图URL */
  previewImage?: string;
  
  /** 是否支持多页 */
  supportsMultiPage?: boolean;
  
  /** 默认页面方向 */
  defaultOrientation?: 'portrait' | 'landscape';
}

/**
 * 注册的模板条目
 */
interface RegisteredTemplate {
  metadata: TemplateMetadata;
  component: TemplateComponent;
}

// ============================================================================
// TemplateRegistry 类实现
// ============================================================================

class TemplateRegistryClass {
  private templates: Map<string, RegisteredTemplate> = new Map();
  private fallbackTemplateId: string | null = null;

  /**
   * 注册一个模板
   * @param metadata 模板元数据
   * @param component React组件
   */
  register(metadata: TemplateMetadata, component: TemplateComponent): void {
    if (this.templates.has(metadata.id)) {
      console.warn(`Template "${metadata.id}" is already registered. Overwriting.`);
    }
    
    this.templates.set(metadata.id, {
      metadata,
      component,
    });
    
    console.log(`[TemplateRegistry] Registered template: ${metadata.id}`);
  }

  /**
   * 注销一个模板
   * @param templateId 模板ID
   */
  unregister(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      console.log(`[TemplateRegistry] Unregistered template: ${templateId}`);
    }
    return deleted;
  }

  /**
   * 设置默认回退模板
   * @param templateId 回退模板ID
   */
  setFallback(templateId: string): void {
    if (!this.templates.has(templateId)) {
      throw new Error(`Cannot set fallback: Template "${templateId}" is not registered.`);
    }
    this.fallbackTemplateId = templateId;
  }

  /**
   * 获取模板组件
   * @param templateId 模板ID
   * @returns 模板组件或null
   */
  getComponent(templateId: string): TemplateComponent | null {
    const template = this.templates.get(templateId);
    
    if (template) {
      return template.component;
    }
    
    // 尝试使用回退模板
    if (this.fallbackTemplateId && this.fallbackTemplateId !== templateId) {
      console.warn(
        `[TemplateRegistry] Template "${templateId}" not found. Using fallback "${this.fallbackTemplateId}".`
      );
      return this.templates.get(this.fallbackTemplateId)?.component ?? null;
    }
    
    console.error(`[TemplateRegistry] Template "${templateId}" not found and no fallback available.`);
    return null;
  }

  /**
   * 获取模板元数据
   * @param templateId 模板ID
   */
  getMetadata(templateId: string): TemplateMetadata | null {
    return this.templates.get(templateId)?.metadata ?? null;
  }

  /**
   * 获取所有已注册模板的元数据
   */
  getAllMetadata(): TemplateMetadata[] {
    return Array.from(this.templates.values()).map((t) => t.metadata);
  }

  /**
   * 检查模板是否已注册
   * @param templateId 模板ID
   */
  has(templateId: string): boolean {
    return this.templates.has(templateId);
  }

  /**
   * 获取已注册模板数量
   */
  get size(): number {
    return this.templates.size;
  }

  /**
   * 根据templateId渲染模板
   * @param templateId 模板ID
   * @param props 模板Props
   */
  render(templateId: string, props: TemplateProps): React.ReactElement | null {
    const Component = this.getComponent(templateId);
    
    if (!Component) {
      return null;
    }
    
    return <Component {...props} />;
  }
}

// ============================================================================
// 导出单例实例
// ============================================================================

export const TemplateRegistry = new TemplateRegistryClass();

// ============================================================================
// 模板解析Hook
// ============================================================================

import { useMemo } from 'react';

/**
 * Hook: 根据产品数据动态解析模板
 */
export function useTemplateResolver(product: ProductWithRelations | null) {
  return useMemo(() => {
    if (!product?.series) {
      return {
        Component: null,
        metadata: null,
        templateId: null,
        error: 'Product or series data is missing',
      };
    }

    const templateId = product.series.templateId;
    const Component = TemplateRegistry.getComponent(templateId);
    const metadata = TemplateRegistry.getMetadata(templateId);

    if (!Component) {
      return {
        Component: null,
        metadata: null,
        templateId,
        error: `Template "${templateId}" not found`,
      };
    }

    return {
      Component,
      metadata,
      templateId,
      error: null,
    };
  }, [product]);
}

// ============================================================================
// 模板渲染组件
// ============================================================================

interface DynamicTemplateRendererProps extends Omit<TemplateProps, 'schemaDefinition'> {
  /** 可选的schema覆盖 */
  schemaOverride?: SeriesSchemaDefinition;
}

/**
 * 动态模板渲染组件
 * 自动根据product.series.templateId选择对应的模板
 */
export function DynamicTemplateRenderer({
  product,
  schemaOverride,
  layoutConfig,
  isPreview,
  pageNumber,
  styleOverrides,
}: DynamicTemplateRendererProps): React.ReactElement | null {
  const { Component, error, templateId } = useTemplateResolver(product);

  if (error || !Component) {
    // 渲染错误占位符
    return (
      <div style={{ 
        padding: 20, 
        backgroundColor: '#fee2e2', 
        border: '1px solid #ef4444',
        borderRadius: 8,
      }}>
        <h3 style={{ color: '#dc2626', margin: 0 }}>模板加载失败</h3>
        <p style={{ color: '#7f1d1d', marginTop: 8 }}>
          {error ?? `无法加载模板: ${templateId}`}
        </p>
      </div>
    );
  }

  const schemaDefinition = schemaOverride ?? product.series?.schemaDefinition;

  if (!schemaDefinition) {
    return (
      <div style={{ 
        padding: 20, 
        backgroundColor: '#fef3c7', 
        border: '1px solid #f59e0b',
        borderRadius: 8,
      }}>
        <h3 style={{ color: '#d97706', margin: 0 }}>Schema未定义</h3>
        <p style={{ color: '#92400e', marginTop: 8 }}>
          该产品系列缺少Schema定义，请先配置Series.schemaDefinition
        </p>
      </div>
    );
  }

  return (
    <Component
      product={product}
      schemaDefinition={schemaDefinition}
      layoutConfig={layoutConfig ?? product.series?.layoutConfig}
      isPreview={isPreview}
      pageNumber={pageNumber}
      styleOverrides={styleOverrides}
    />
  );
}

// ============================================================================
// 装饰器: 用于注册模板 (TypeScript装饰器语法)
// ============================================================================

/**
 * 模板注册装饰器
 * 使用方法:
 * @registerTemplate({ id: 'layout-m8-standard', name: 'M8标准布局', version: '1.0.0' })
 * class M8StandardTemplate extends React.Component<TemplateProps> { ... }
 */
export function registerTemplate(metadata: TemplateMetadata) {
  return function <T extends TemplateComponent>(Component: T): T {
    TemplateRegistry.register(metadata, Component);
    return Component;
  };
}

// ============================================================================
// 工具函数: 批量注册模板
// ============================================================================

interface TemplateDefinition {
  metadata: TemplateMetadata;
  component: TemplateComponent;
}

/**
 * 批量注册多个模板
 */
export function registerTemplates(templates: TemplateDefinition[]): void {
  templates.forEach(({ metadata, component }) => {
    TemplateRegistry.register(metadata, component);
  });
}

// ============================================================================
// 导出类型
// ============================================================================

export type { TemplateProps, TemplateMetadata, RegisteredTemplate };

