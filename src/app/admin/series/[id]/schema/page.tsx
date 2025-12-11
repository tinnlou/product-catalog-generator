'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Settings2, Plus, Trash2, GripVertical, Loader2, CheckCircle } from 'lucide-react';

interface SchemaField {
  key: string;
  label: string;
  type: string;
  group: string;
  required: boolean;
  options?: string[];
  unit?: string;
  placeholder?: string;
}

interface SchemaGroup {
  key: string;
  label: string;
  order: number;
}

interface Series {
  id: string;
  name: string;
  code: string;
  schemaDefinition: {
    fields: SchemaField[];
    groups: SchemaGroup[];
  };
}

const fieldTypes = [
  { value: 'text', label: '📝 文本' },
  { value: 'number', label: '🔢 数字' },
  { value: 'select', label: '📋 下拉选择' },
  { value: 'boolean', label: '🔘 开关' },
  { value: 'textarea', label: '📄 多行文本' },
];

const defaultGroups: SchemaGroup[] = [
  { key: 'electrical', label: '电气参数', order: 1 },
  { key: 'physical', label: '物理参数', order: 2 },
  { key: 'led', label: 'LED指示', order: 3 },
];

export default function SchemaConfigPage({ params }: { params: { id: string } }) {
  const [series, setSeries] = useState<Series | null>(null);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [groups, setGroups] = useState<SchemaGroup[]>(defaultGroups);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 获取系列数据
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch(`/api/series/${params.id}`);
        const json = await res.json();
        
        if (json.success) {
          setSeries(json.data);
          const schema = json.data.schemaDefinition;
          if (schema?.fields) {
            setFields(schema.fields);
          }
          if (schema?.groups) {
            setGroups(schema.groups);
          }
        } else {
          setError(json.error || '获取系列失败');
        }
      } catch (err) {
        setError('获取系列失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [params.id]);

  const addField = () => {
    const newField: SchemaField = {
      key: `field_${Date.now()}`,
      label: '新字段',
      type: 'text',
      group: groups[0]?.key || 'electrical',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`/api/series/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaDefinition: {
            fields,
            groups,
            version: (series?.schemaDefinition as any)?.version ? (series?.schemaDefinition as any).version + 1 : 1,
          },
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess('Schema 保存成功！');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(json.error || '保存失败');
      }
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">加载中...</span>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">{error || '系列不存在'}</p>
        <Link href="/admin/series" className="text-blue-600 hover:underline">
          返回系列列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* 返回链接 */}
      <Link
        href="/admin/series"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回系列列表
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">配置字段结构</h1>
            <p className="text-slate-600">{series.name}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              保存 Schema
            </>
          )}
        </button>
      </div>

      {/* 提示信息 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* 说明 */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-purple-700">
          💡 在这里配置该系列产品的字段结构。添加的字段会自动出现在产品编辑表单中。
        </p>
      </div>

      {/* 字段列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 表头 */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
          <div className="col-span-1"></div>
          <div className="col-span-3">字段标签</div>
          <div className="col-span-2">字段Key</div>
          <div className="col-span-2">类型</div>
          <div className="col-span-2">分组</div>
          <div className="col-span-1">必填</div>
          <div className="col-span-1"></div>
        </div>

        {/* 字段行 */}
        <div className="divide-y divide-slate-100">
          {fields.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              暂无字段，点击下方"添加字段"按钮添加
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.key + index} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50">
                <div className="col-span-1">
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="字段名称"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateField(index, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="field_key"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fieldTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <select
                    value={field.group}
                    onChange={(e) => updateField(index, { group: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {groups.map(g => (
                      <option key={g.key} value={g.key}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => removeField(index)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 添加按钮 */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={addField}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加字段
          </button>
        </div>
      </div>

      {/* 字段统计 */}
      <div className="mt-4 text-sm text-slate-500">
        共 {fields.length} 个字段，{fields.filter(f => f.required).length} 个必填
      </div>
    </div>
  );
}
