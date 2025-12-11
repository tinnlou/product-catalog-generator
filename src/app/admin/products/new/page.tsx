'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package } from 'lucide-react';

// 示例系列数据
const seriesList = [
  { id: '1', name: 'M8 Compact 4/6 Ports', code: 'M8-COMPACT-4-6' },
  { id: '2', name: 'M8 Distributor 8/12 Ports', code: 'M8-DISTRIBUTOR-8-12' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    seriesId: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('产品创建成功！（演示模式）');
    setSaving(false);
    router.push('/admin/products');
  };

  return (
    <div className="max-w-3xl">
      {/* 返回链接 */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回产品列表
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新建产品</h1>
          <p className="text-slate-600">填写基本信息创建新产品</p>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {/* 产品名称 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              产品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如：M8 Compact 4 Ports 标准型"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="如：M8C4-STD-001"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* 所属系列 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              所属系列 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.seriesId}
              onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择系列...</option>
              {seriesList.map(series => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-1">
              选择系列后，系统会自动加载该系列的规格字段表单
            </p>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              产品描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="简要描述产品特点..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 创建产品后，您可以在编辑页面填写详细的规格参数、上传图片、添加型号等。
          </p>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '创建中...' : '创建产品'}
          </button>
        </div>
      </form>
    </div>
  );
}

