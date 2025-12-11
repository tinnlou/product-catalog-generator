'use client';

// ============================================================================
// SchemaBuilder - 动态Schema配置器
// 
// 功能:
// 1. 可视化配置Series的schema_definition
// 2. 拖拽排序字段
// 3. 字段分组管理
// 4. 实时预览生成的表单
// ============================================================================

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Settings2, Eye, Save, ChevronDown, ChevronRight } from 'lucide-react';
import type { SchemaField, SchemaGroup, SeriesSchemaDefinition, FieldType } from '@/types/schema';

// ============================================================================
// 类型定义
// ============================================================================

interface SchemaBuilderProps {
  initialSchema?: SeriesSchemaDefinition;
  onSave: (schema: SeriesSchemaDefinition) => void;
  onPreview?: (schema: SeriesSchemaDefinition) => void;
}

// ============================================================================
// 字段类型选项
// ============================================================================

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string; icon: string }[] = [
  { value: 'text', label: '文本', icon: '📝' },
  { value: 'number', label: '数字', icon: '🔢' },
  { value: 'select', label: '下拉选择', icon: '📋' },
  { value: 'multiselect', label: '多选', icon: '☑️' },
  { value: 'boolean', label: '开关', icon: '🔘' },
  { value: 'textarea', label: '多行文本', icon: '📄' },
  { value: 'json', label: 'JSON', icon: '{ }' },
  { value: 'image', label: '图片', icon: '🖼️' },
  { value: 'color', label: '颜色', icon: '🎨' },
];

// ============================================================================
// 默认Schema
// ============================================================================

const DEFAULT_SCHEMA: SeriesSchemaDefinition = {
  fields: [],
  groups: [
    { key: 'general', label: '基本信息', order: 0 },
    { key: 'electrical', label: '电气参数', order: 1 },
    { key: 'physical', label: '物理参数', order: 2 },
  ],
  version: 1,
};

// ============================================================================
// 字段编辑器组件
// ============================================================================

interface FieldEditorProps {
  field: SchemaField;
  groups: SchemaGroup[];
  onChange: (field: SchemaField) => void;
  onDelete: () => void;
}

function FieldEditor({ field, groups, onChange, onDelete }: FieldEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const updateField = (key: keyof SchemaField, value: unknown) => {
    onChange({ ...field, [key]: value });
  };

  const fieldTypeInfo = FIELD_TYPE_OPTIONS.find(t => t.value === field.type);

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm">
      {/* 字段头部 */}
      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
           onClick={() => setExpanded(!expanded)}>
        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
        
        <div className="flex-1 flex items-center gap-3">
          <span className="text-lg">{fieldTypeInfo?.icon}</span>
          <div>
            <div className="font-medium text-slate-900">{field.label || '未命名字段'}</div>
            <div className="text-xs text-slate-500 font-mono">{field.key}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {field.required && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">必填</span>
          )}
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
            {fieldTypeInfo?.label}
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* 展开的编辑区 */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 字段Key */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                字段Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField('key', e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase())}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="voltage_rating"
              />
            </div>

            {/* 显示标签 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                显示标签 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField('label', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="额定电压"
              />
            </div>

            {/* 字段类型 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">字段类型</label>
              <select
                value={field.type}
                onChange={(e) => updateField('type', e.target.value as FieldType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FIELD_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 所属分组 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">所属分组</label>
              <select
                value={field.group ?? ''}
                onChange={(e) => updateField('group', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">无分组</option>
                {groups.map(g => (
                  <option key={g.key} value={g.key}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Select/Multiselect 选项 */}
          {(field.type === 'select' || field.type === 'multiselect') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                选项 (每行一个)
              </label>
              <textarea
                value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                onChange={(e) => updateField('options', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="24V DC/AC&#10;12V DC&#10;48V DC"
              />
            </div>
          )}

          {/* Number 类型约束 */}
          {field.type === 'number' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">最小值</label>
                <input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) => updateField('min', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">最大值</label>
                <input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) => updateField('max', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                <input
                  type="text"
                  value={field.unit ?? ''}
                  onChange={(e) => updateField('unit', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  placeholder="A, V, mm"
                />
              </div>
            </div>
          )}

          {/* 其他选项 */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required ?? false}
                onChange={(e) => updateField('required', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">必填字段</span>
            </label>
          </div>

          {/* 描述/帮助文本 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述/帮助文本</label>
            <input
              type="text"
              value={field.description ?? ''}
              onChange={(e) => updateField('description', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              placeholder="该字段的说明或帮助信息"
            />
          </div>

          {/* 删除按钮 */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除字段
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 分组管理组件
// ============================================================================

interface GroupManagerProps {
  groups: SchemaGroup[];
  onChange: (groups: SchemaGroup[]) => void;
}

function GroupManager({ groups, onChange }: GroupManagerProps) {
  const addGroup = () => {
    const newKey = `group_${Date.now()}`;
    onChange([
      ...groups,
      { key: newKey, label: '新分组', order: groups.length },
    ]);
  };

  const updateGroup = (index: number, updates: Partial<SchemaGroup>) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], ...updates };
    onChange(newGroups);
  };

  const deleteGroup = (index: number) => {
    onChange(groups.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-900">字段分组</h4>
        <button
          onClick={addGroup}
          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
        >
          <Plus className="w-4 h-4" />
          添加分组
        </button>
      </div>

      <div className="space-y-2">
        {groups.map((group, index) => (
          <div key={group.key} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={group.key}
              onChange={(e) => updateGroup(index, { key: e.target.value })}
              className="w-32 px-2 py-1 text-sm font-mono border border-slate-200 rounded"
              placeholder="key"
            />
            <input
              type="text"
              value={group.label}
              onChange={(e) => updateGroup(index, { label: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded"
              placeholder="显示名称"
            />
            <button
              onClick={() => deleteGroup(index)}
              className="p-1 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 主组件: SchemaBuilder
// ============================================================================

export function SchemaBuilder({ initialSchema, onSave, onPreview }: SchemaBuilderProps) {
  const [schema, setSchema] = useState<SeriesSchemaDefinition>(
    initialSchema ?? DEFAULT_SCHEMA
  );
  const [activeTab, setActiveTab] = useState<'fields' | 'groups' | 'preview'>('fields');

  // 添加新字段
  const addField = useCallback(() => {
    const newField: SchemaField = {
      key: `field_${Date.now()}`,
      label: '新字段',
      type: 'text',
      required: false,
      group: schema.groups[0]?.key,
    };
    setSchema(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  }, [schema.groups]);

  // 更新字段
  const updateField = useCallback((index: number, field: SchemaField) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? field : f),
    }));
  }, []);

  // 删除字段
  const deleteField = useCallback((index: number) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  }, []);

  // 更新分组
  const updateGroups = useCallback((groups: SchemaGroup[]) => {
    setSchema(prev => ({ ...prev, groups }));
  }, []);

  // 保存
  const handleSave = () => {
    onSave({
      ...schema,
      version: (schema.version ?? 0) + 1,
    });
  };

  // 按分组组织字段
  const fieldsByGroup = schema.fields.reduce((acc, field, index) => {
    const groupKey = field.group ?? '_ungrouped';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push({ field, index });
    return acc;
  }, {} as Record<string, { field: SchemaField; index: number }[]>);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Schema Builder</h2>
          <p className="text-sm text-slate-500">配置该系列产品的动态字段结构</p>
        </div>
        <div className="flex items-center gap-3">
          {onPreview && (
            <button
              onClick={() => onPreview(schema)}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存 Schema
          </button>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="flex border-b border-slate-200 bg-white px-6">
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'fields'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          字段配置 ({schema.fields.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'groups'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          分组管理 ({schema.groups.length})
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          JSON预览
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {/* 字段配置 */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            {/* 按分组显示字段 */}
            {schema.groups.map(group => {
              const groupFields = fieldsByGroup[group.key] ?? [];
              return (
                <div key={group.key} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    <Settings2 className="w-4 h-4" />
                    {group.label}
                    <span className="text-slate-400">({groupFields.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {groupFields.map(({ field, index }) => (
                      <FieldEditor
                        key={field.key}
                        field={field}
                        groups={schema.groups}
                        onChange={(f) => updateField(index, f)}
                        onDelete={() => deleteField(index)}
                      />
                    ))}
                    {groupFields.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                        该分组暂无字段
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 未分组字段 */}
            {fieldsByGroup['_ungrouped']?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  未分组字段
                </h3>
                <div className="space-y-2">
                  {fieldsByGroup['_ungrouped'].map(({ field, index }) => (
                    <FieldEditor
                      key={field.key}
                      field={field}
                      groups={schema.groups}
                      onChange={(f) => updateField(index, f)}
                      onDelete={() => deleteField(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 添加字段按钮 */}
            <button
              onClick={addField}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加新字段
            </button>
          </div>
        )}

        {/* 分组管理 */}
        {activeTab === 'groups' && (
          <div className="max-w-2xl">
            <GroupManager groups={schema.groups} onChange={updateGroups} />
          </div>
        )}

        {/* JSON预览 */}
        {activeTab === 'preview' && (
          <div className="bg-slate-900 rounded-lg p-4 overflow-auto">
            <pre className="text-sm text-slate-100 font-mono">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemaBuilder;

