'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Layers, Settings2 } from 'lucide-react';

export default function EditSeriesPage({ params }: { params: { id: string } }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('保存成功！（演示模式）');
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">编辑系列</h1>
            <p className="text-slate-600">M8 Compact 4/6 Ports</p>
          </div>
        </div>
        <Link
          href={`/admin/series/${params.id}/schema`}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          配置字段
        </Link>
      </div>

      {/* 表单 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">系列名称</label>
          <input
            type="text"
            defaultValue="M8 Compact 4/6 Ports"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">系列代码</label>
          <input
            type="text"
            defaultValue="M8-COMPACT-4-6"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">PDF 模板</label>
          <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
            <option value="layout-m8-standard">M8 标准布局</option>
            <option value="layout-m8-distributor">M8 分线器布局</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
          <textarea
            defaultValue="M8紧凑型分线盒，带M12预装插头"
            rows={3}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" defaultChecked className="w-4 h-4" />
          <label htmlFor="isActive" className="text-sm text-slate-700">启用此系列</label>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  );
}

