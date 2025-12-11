'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// 示例产品数据
const products = [
  {
    id: '1',
    name: 'M8 Compact 4 Ports 标准型',
    sku: 'M8C4-STD-001',
    series: 'M8 Compact 4/6 Ports',
    status: 'PUBLISHED',
    partNumbers: 3,
    updatedAt: '2024-12-10',
  },
  {
    id: '2',
    name: 'M8 Compact 6 Ports 标准型',
    sku: 'M8C6-STD-001',
    series: 'M8 Compact 4/6 Ports',
    status: 'PUBLISHED',
    partNumbers: 3,
    updatedAt: '2024-12-09',
  },
  {
    id: '3',
    name: 'M8 Distributor 8 Ports PVC',
    sku: 'M8D8-PVC-001',
    series: 'M8 Distributor 8/12 Ports',
    status: 'DRAFT',
    partNumbers: 2,
    updatedAt: '2024-12-08',
  },
  {
    id: '4',
    name: 'M8 Distributor 12 Ports PUR',
    sku: 'M8D12-PUR-001',
    series: 'M8 Distributor 8/12 Ports',
    status: 'REVIEW',
    partNumbers: 4,
    updatedAt: '2024-12-07',
  },
];

const statusConfig = {
  DRAFT: { label: '草稿', color: 'bg-slate-100 text-slate-700', icon: Clock },
  REVIEW: { label: '审核中', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  ARCHIVED: { label: '已归档', color: 'bg-slate-100 text-slate-500', icon: Clock },
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeries = selectedSeries === 'all' || product.series === selectedSeries;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesSeries && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
          <p className="text-slate-600 mt-1">管理所有产品的规格数据和型号信息</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建产品
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索产品名称或SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 系列筛选 */}
          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">所有系列</option>
            <option value="M8 Compact 4/6 Ports">M8 Compact 4/6 Ports</option>
            <option value="M8 Distributor 8/12 Ports">M8 Distributor 8/12 Ports</option>
          </select>

          {/* 状态筛选 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">所有状态</option>
            <option value="DRAFT">草稿</option>
            <option value="REVIEW">审核中</option>
            <option value="PUBLISHED">已发布</option>
          </select>
        </div>

        {/* 批量操作 */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <span className="text-sm text-slate-600">
              已选择 {selectedProducts.length} 个产品
            </span>
            <button className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
              批量编辑
            </button>
            <button className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
              生成PDF
            </button>
            <button className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
              删除
            </button>
          </div>
        )}
      </div>

      {/* 产品列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">产品名称</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">SKU</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">系列</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">型号数</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">状态</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">更新时间</th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const status = statusConfig[product.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.series}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.partNumbers}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{product.updatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="预览PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="复制"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 空状态 */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">没有找到产品</h3>
            <p className="text-slate-500 mb-4">尝试调整搜索条件或筛选器</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建产品
            </Link>
          </div>
        )}

        {/* 分页 */}
        {filteredProducts.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              显示 1-{filteredProducts.length} 共 {filteredProducts.length} 个产品
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

