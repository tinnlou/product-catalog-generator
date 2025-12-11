'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Settings2, Package, Edit, Trash2, Eye, Loader2, RefreshCw } from 'lucide-react';

interface Series {
  id: string;
  name: string;
  code: string;
  description: string | null;
  templateId: string;
  productCount: number;
  fieldCount: number;
  isActive: boolean;
}

const templateNames: Record<string, string> = {
  'layout-m8-standard': 'M8 标准布局',
  'layout-m8-distributor': 'M8 分线器布局',
  'layout-m12-standard': 'M12 标准布局',
};

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchSeries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/series');
      const json = await res.json();
      
      if (json.success) {
        setSeriesList(json.data);
      } else {
        setError(json.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/series/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchSeries();
        setShowDeleteConfirm(null);
      } else {
        alert('删除失败: ' + json.error);
      }
    } catch (err) {
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">系列管理</h1>
          <p className="text-slate-600 mt-1">配置产品系列的字段结构和PDF模板</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSeries}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <Link
            href="/admin/series/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建系列
          </Link>
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">什么是产品系列？</h3>
            <p className="text-sm text-blue-700 mt-1">
              产品系列定义了一类产品的共同属性结构。例如"M8 Compact"系列的产品都有"端口数量"、"电压"等字段。
              每个系列可以选择不同的PDF模板来生成目录页。
            </p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 系列列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">加载中...</span>
        </div>
      ) : seriesList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">还没有产品系列</h3>
          <p className="text-slate-500 mb-4">创建您的第一个产品系列来开始管理产品</p>
          <Link
            href="/admin/series/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建系列
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {seriesList.map((series) => (
            <div
              key={series.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* 基本信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{series.name}</h3>
                    {series.isActive ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        启用
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                        禁用
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{series.description || '暂无描述'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">
                        {series.code}
                      </code>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Package className="w-4 h-4" />
                      {series.productCount} 个产品
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Settings2 className="w-4 h-4" />
                      {series.fieldCount} 个字段
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        {templateNames[series.templateId] || series.templateId}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 lg:flex-shrink-0">
                  <Link
                    href={`/admin/series/${series.id}/schema`}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Settings2 className="w-4 h-4" />
                    配置字段
                  </Link>
                  <Link
                    href={`/admin/series/${series.id}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑系列"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="预览模板"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(series.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除系列"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 删除确认 */}
              {showDeleteConfirm === series.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      确定要删除此系列吗？该系列下的 {series.productCount} 个产品将变为无系列状态。
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-white rounded-lg transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleDelete(series.id)}
                        className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        确认删除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
