'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package, History, Trash2, Loader2, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  seriesId: string;
  series: {
    id: string;
    name: string;
    code: string;
    schemaDefinition: any;
  };
  specifications: Record<string, any>;
  status: string;
  version: number;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    specifications: {} as Record<string, any>,
    status: 'DRAFT',
  });

  // 获取产品数据
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const json = await res.json();
        
        if (json.success) {
          setProduct(json.data);
          setFormData({
            name: json.data.name,
            sku: json.data.sku,
            description: json.data.description || '',
            specifications: json.data.specifications || {},
            status: json.data.status,
          });
        } else {
          setError(json.error || '获取产品失败');
        }
      } catch (err) {
        setError('获取产品失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          description: formData.description,
          specifications: formData.specifications,
          status: formData.status,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess('保存成功！');
        setProduct(prev => prev ? { ...prev, ...json.data } : null);
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

  const handleDelete = async () => {
    if (!confirm('确定要删除此产品吗？此操作不可撤销。')) return;

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (json.success) {
        router.push('/admin/products');
      } else {
        setError(json.error || '删除失败');
      }
    } catch (err) {
      setError('删除失败，请重试');
    }
  };

  const updateSpecification = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  // 获取系列的字段定义
  const schemaFields = product?.series?.schemaDefinition?.fields || [];
  const schemaGroups = product?.series?.schemaDefinition?.groups || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">加载中...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">{error || '产品不存在'}</p>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          返回产品列表
        </Link>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <p className="text-slate-600">SKU: {product.sku} · 版本 {product.version}</p>
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

        {/* 基本信息 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">产品名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">所属系列</label>
                <input
                  type="text"
                  value={product.series.name}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">产品描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">草稿</option>
                <option value="REVIEW">审核中</option>
                <option value="APPROVED">已批准</option>
                <option value="PUBLISHED">已发布</option>
              </select>
            </div>
          </div>
        </div>

        {/* 规格参数 - 根据系列Schema动态生成 */}
        {schemaGroups.length > 0 ? (
          schemaGroups.map((group: any) => {
            const groupFields = schemaFields.filter((f: any) => f.group === group.key);
            if (groupFields.length === 0) return null;
            
            return (
              <div key={group.key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="font-semibold text-slate-900 mb-4">{group.label}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {groupFields.map((field: any) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formData.specifications[field.key] || ''}
                          onChange={(e) => updateSpecification(field.key, e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择...</option>
                          {(field.options || []).map((opt: string | { value: string; label: string }) => {
                            const value = typeof opt === 'string' ? opt : opt.value;
                            const label = typeof opt === 'string' ? opt : opt.label;
                            return <option key={value} value={value}>{label}</option>;
                          })}
                        </select>
                      ) : field.type === 'number' ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.specifications[field.key] || ''}
                            onChange={(e) => updateSpecification(field.key, e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {field.unit && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      ) : field.type === 'boolean' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.specifications[field.key] || false}
                            onChange={(e) => updateSpecification(field.key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                          />
                          <span className="text-sm text-slate-600">是</span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={formData.specifications[field.key] || ''}
                          onChange={(e) => updateSpecification(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">规格参数</h2>
            <p className="text-slate-500 text-sm">
              该系列暂未配置字段结构，请先在
              <Link href={`/admin/series/${product.seriesId}/schema`} className="text-blue-600 hover:underline mx-1">
                系列管理
              </Link>
              中配置字段。
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除产品
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存修改
              </>
            )}
          </button>
        </div>
      </div>

      {/* 历史记录侧边栏 */}
      {showHistory && (
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-20">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" />
              修改历史
            </h3>
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-blue-500 pl-3 py-1">
                <p className="font-medium text-slate-900">创建产品</p>
                <p className="text-xs text-slate-500">系统 · 创建时</p>
              </div>
              <p className="text-slate-400 text-xs">更多历史记录开发中...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
