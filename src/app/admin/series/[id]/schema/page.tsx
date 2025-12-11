'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Settings2, Plus, Trash2, GripVertical } from 'lucide-react';

// 示例字段数据
const initialFields = [
  { id: '1', key: 'voltage_rating', label: '额定电源', type: 'select', group: 'electrical', required: true },
  { id: '2', key: 'working_voltage', label: '工作电压', type: 'text', group: 'electrical', required: true },
  { id: '3', key: 'current_load', label: '电流负载', type: 'number', group: 'electrical', required: true },
  { id: '4', key: 'total_current', label: '总电流', type: 'number', group: 'electrical', required: true },
  { id: '5', key: 'port_count', label: '端口数量', type: 'select', group: 'physical', required: true },
  { id: '6', key: 'ip_rating', label: '防护等级', type: 'text', group: 'physical', required: true },
];

const fieldTypes = [
  { value: 'text', label: '📝 文本' },
  { value: 'number', label: '🔢 数字' },
  { value: 'select', label: '📋 下拉选择' },
  { value: 'boolean', label: '🔘 开关' },
  { value: 'textarea', label: '📄 多行文本' },
];

const groups = [
  { key: 'electrical', label: '电气参数' },
  { key: 'physical', label: '物理参数' },
  { key: 'led', label: 'LED指示' },
];

export default function SchemaConfigPage({ params }: { params: { id: string } }) {
  const [fields, setFields] = useState(initialFields);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const newField = {
      id: `new_${Date.now()}`,
      key: '',
      label: '新字段',
      type: 'text',
      group: 'electrical',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<typeof initialFields[0]>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Schema 保存成功！（演示模式）');
  };

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
            <p className="text-slate-600">M8 Compact 4/6 Ports</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存 Schema'}
        </button>
      </div>

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
          {fields.map((field) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50">
              <div className="col-span-1">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateField(field.id, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm font-mono"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                >
                  {fieldTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <select
                  value={field.group}
                  onChange={(e) => updateField(field.id, { group: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
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
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => removeField(field.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
    </div>
  );
}

