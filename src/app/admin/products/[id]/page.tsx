'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Package, History, Trash2 } from 'lucide-react';

// 示例产品数据
const productData = {
  id: '1',
  name: 'M8 Compact 4 Ports 标准型',
  sku: 'M8C4-STD-001',
  series: 'M8 Compact 4/6 Ports',
  description: 'M8紧凑型4端口分线盒，带M12预装插头',
  specifications: {
    voltage_rating: '24V DC/AC',
    working_voltage: '16...30V DC',
    current_load: 2,
    total_current: 6,
    port_count: '4',
    ip_rating: 'IP67',
  },
};

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('保存成功！（演示模式）');
  };

  return (
    <div className="flex gap-6">
      {/* 主内容区 */}
      <div className="flex-1 max-w-3xl">
        {/* 返回链接 */}
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回产品列表
        </Link>

        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{productData.name}</h1>
              <p className="text-slate-600">SKU: {productData.sku}</p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${
              showHistory ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">产品名称</label>
              <input
                type="text"
                defaultValue={productData.name}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  defaultValue={productData.sku}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">所属系列</label>
                <input
                  type="text"
                  defaultValue={productData.series}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 规格参数 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">规格参数</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">额定电源</label>
              <input
                type="text"
                defaultValue={productData.specifications.voltage_rating}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">工作电压</label>
              <input
                type="text"
                defaultValue={productData.specifications.working_voltage}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">电流负载 (A)</label>
              <input
                type="number"
                defaultValue={productData.specifications.current_load}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">总电流 (A)</label>
              <input
                type="number"
                defaultValue={productData.specifications.total_current}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">端口数量</label>
              <select
                defaultValue={productData.specifications.port_count}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              >
                <option value="4">4</option>
                <option value="6">6</option>
                <option value="8">8</option>
                <option value="10">10</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">防护等级</label>
              <input
                type="text"
                defaultValue={productData.specifications.ip_rating}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
            删除产品
          </button>
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

      {/* 历史记录侧边栏 */}
      {showHistory && (
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" />
              修改历史
            </h3>
            <div className="space-y-3">
              <div className="border-l-2 border-blue-500 pl-3 py-1">
                <p className="text-sm font-medium text-slate-900">创建产品</p>
                <p className="text-xs text-slate-500">System Admin · 2小时前</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-3 py-1">
                <p className="text-sm font-medium text-slate-900">更新规格参数</p>
                <p className="text-xs text-slate-500">张三 · 1小时前</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

