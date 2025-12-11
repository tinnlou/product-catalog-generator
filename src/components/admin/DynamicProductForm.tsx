'use client';

// ============================================================================
// DynamicProductForm - 动态产品编辑表单
// 
// 功能:
// 1. 根据Series.schemaDefinition动态生成表单字段
// 2. 实时验证
// 3. 字段分组显示
// 4. 支持所有字段类型
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, HelpCircle, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { 
  SchemaField, 
  SchemaGroup, 
  SeriesSchemaDefinition, 
  ProductSpecifications,
  FieldType,
} from '@/types/schema';

// ============================================================================
// 类型定义
// ============================================================================

interface DynamicProductFormProps {
  schemaDefinition: SeriesSchemaDefinition;
  initialValues?: ProductSpecifications;
  onChange?: (values: ProductSpecifications) => void;
  onSubmit?: (values: ProductSpecifications) => void;
  disabled?: boolean;
}

interface FieldInputProps {
  field: SchemaField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

// ============================================================================
// 字段输入组件
// ============================================================================

function FieldInput({ field, value, onChange, error, disabled }: FieldInputProps) {
  const baseInputClass = `
    w-full px-3 py-2 border rounded-lg text-sm transition-colors
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}
    focus:outline-none focus:ring-2 focus:ring-opacity-50
  `;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={(value as number) ?? ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              disabled={disabled}
              className={`${baseInputClass} ${field.unit ? 'pr-12' : ''}`}
            />
            {field.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            disabled={disabled}
            className={baseInputClass}
          >
            <option value="">{field.placeholder ?? '请选择...'}</option>
            {field.options?.map((opt) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        );

      case 'multiselect':
        const selectedValues = (value as string[]) ?? [];
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isChecked = selectedValues.includes(optValue);
              return (
                <label
                  key={optValue}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, optValue]);
                      } else {
                        onChange(selectedValues.filter((v) => v !== optValue));
                      }
                    }}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{optLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'boolean':
        return (
          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            onClick={() => !disabled && onChange(!value)}
            disabled={disabled}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${value ? 'bg-blue-600' : 'bg-slate-200'}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${value ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'json':
        const jsonString = value ? JSON.stringify(value, null, 2) : '';
        return (
          <textarea
            value={jsonString}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                // 保持原值，让用户继续编辑
              }
            }}
            placeholder={field.placeholder ?? '{\n  "key": "value"\n}'}
            disabled={disabled}
            rows={6}
            className={`${baseInputClass} font-mono text-xs`}
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={(value as string) ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder ?? '输入图片URL或上传'}
              disabled={disabled}
              className={baseInputClass}
            />
            {typeof value === 'string' && value && (
              <div className="relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,...';
                  }}
                />
              </div>
            )}
            {(!value || typeof value !== 'string') && (
              <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
            )}
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={(value as string) ?? '#000000'}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-10 h-10 rounded cursor-pointer border border-slate-200"
            />
            <input
              type="text"
              value={(value as string) ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              className={`${baseInputClass} flex-1 font-mono`}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="space-y-1.5">
      {/* 标签 */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {field.description && (
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {field.description}
            </div>
          </div>
        )}
      </label>

      {/* 输入 */}
      {renderInput()}

      {/* 错误信息 */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 分组组件
// ============================================================================

interface FieldGroupProps {
  group: SchemaGroup;
  fields: SchemaField[];
  values: ProductSpecifications;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
}

function FieldGroup({ group, fields, values, errors, onChange, disabled }: FieldGroupProps) {
  const [collapsed, setCollapsed] = useState(group.defaultCollapsed ?? false);

  if (fields.length === 0) return null;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* 分组标题 */}
      <button
        type="button"
        onClick={() => group.collapsible !== false && setCollapsed(!collapsed)}
        className={`
          w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-left
          ${group.collapsible !== false ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'}
          transition-colors
        `}
      >
        <div>
          <h3 className="font-medium text-slate-900">{group.label}</h3>
          {group.description && (
            <p className="text-sm text-slate-500 mt-0.5">{group.description}</p>
          )}
        </div>
        {group.collapsible !== false && (
          collapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )
        )}
      </button>

      {/* 字段内容 */}
      {!collapsed && (
        <div className="p-4 space-y-4 bg-white">
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(value) => onChange(field.key, value)}
              error={errors[field.key]}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 主组件: DynamicProductForm
// ============================================================================

export function DynamicProductForm({
  schemaDefinition,
  initialValues = {},
  onChange,
  onSubmit,
  disabled = false,
}: DynamicProductFormProps) {
  const [values, setValues] = useState<ProductSpecifications>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 初始值变化时更新
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // 验证单个字段
  const validateField = useCallback((field: SchemaField, value: unknown): string | undefined => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label}是必填项`;
    }

    if (field.type === 'number' && value !== undefined && value !== null) {
      const numValue = Number(value);
      if (field.min !== undefined && numValue < field.min) {
        return `${field.label}不能小于${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.label}不能大于${field.max}`;
      }
    }

    if (field.validation?.pattern && typeof value === 'string') {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return field.validation.message ?? `${field.label}格式不正确`;
      }
    }

    return undefined;
  }, []);

  // 验证所有字段
  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    schemaDefinition.fields.forEach((field) => {
      const error = validateField(field, values[field.key]);
      if (error) {
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [schemaDefinition.fields, values, validateField]);

  // 处理字段变更
  const handleChange = useCallback((key: string, value: unknown) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onChange?.(newValues);

    // 触摸过的字段立即验证
    if (touched[key]) {
      const field = schemaDefinition.fields.find((f) => f.key === key);
      if (field) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [key]: error ?? '',
        }));
      }
    }
  }, [values, touched, schemaDefinition.fields, validateField, onChange]);

  // 处理失焦
  const handleBlur = useCallback((key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    
    const field = schemaDefinition.fields.find((f) => f.key === key);
    if (field) {
      const error = validateField(field, values[key]);
      setErrors((prev) => ({
        ...prev,
        [key]: error ?? '',
      }));
    }
  }, [schemaDefinition.fields, values, validateField]);

  // 处理提交
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸
    const allTouched: Record<string, boolean> = {};
    schemaDefinition.fields.forEach((f) => {
      allTouched[f.key] = true;
    });
    setTouched(allTouched);

    if (validateAll()) {
      onSubmit?.(values);
    }
  }, [schemaDefinition.fields, validateAll, values, onSubmit]);

  // 按分组组织字段
  const fieldsByGroup = schemaDefinition.fields.reduce((acc, field) => {
    const groupKey = field.group ?? '_ungrouped';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(field);
    return acc;
  }, {} as Record<string, SchemaField[]>);

  // 排序后的分组
  const sortedGroups = [...schemaDefinition.groups].sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 按分组渲染字段 */}
      {sortedGroups.map((group) => (
        <FieldGroup
          key={group.key}
          group={group}
          fields={fieldsByGroup[group.key] ?? []}
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={disabled}
        />
      ))}

      {/* 未分组字段 */}
      {fieldsByGroup['_ungrouped']?.length > 0 && (
        <FieldGroup
          group={{ key: '_ungrouped', label: '其他', order: 999 }}
          fields={fieldsByGroup['_ungrouped']}
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={disabled}
        />
      )}

      {/* 提交按钮 */}
      {onSubmit && (
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={disabled}
            className={`
              px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
          >
            保存规格
          </button>
        </div>
      )}
    </form>
  );
}

export default DynamicProductForm;

