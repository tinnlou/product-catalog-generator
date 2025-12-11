'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Layers } from 'lucide-react';

const templateOptions = [
  { id: 'layout-m8-standard', name: 'M8 标准布局', description: '适用于M8 Compact系列' },
  { id: 'layout-m8-distributor', name: 'M8 分线器布局', description: '适用于带线缆的分线器' },
];

export default function NewSeriesPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    templateId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('系列创建成功！（演示模式）');
    setSaving(false);
    router.push('/admin/series');
  };

  return (
    <div className="max-w-3xl">
      {/* 返回链接 */}
      <Link
        href="/admin/series"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回系列列表
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Layers className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新建产品系列</h1>
          <p className="text-slate-600">创建新的产品系列并配置字段结构</p>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {/* 系列名称 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              系列名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如：M8 Compact 4/6 Ports"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 系列代码 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              系列代码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
              placeholder="如：M8-COMPACT-4-6"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-sm text-slate-500 mt-1">唯一标识符，只能包含大写字母、数字和连字符</p>
          </div>

          {/* PDF模板 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              PDF 模板 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {templateOptions.map(template => (
                <label
                  key={template.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.templateId === template.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="templateId"
                    value={template.id}
                    checked={formData.templateId === template.id}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{template.name}</p>
                    <p className="text-sm text-slate-500">{template.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="简要描述该系列产品的特点..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 提示 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700">
            💡 创建系列后，您需要在"配置字段"中设置该系列产品的属性结构（如电压、电流、端口数等）。
          </p>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/series"
            className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '创建中...' : '创建系列'}
          </button>
        </div>
      </form>
    </div>
  );
}

