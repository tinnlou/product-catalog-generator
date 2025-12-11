'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Download, Eye, Check, Layers } from 'lucide-react';

// 动态导入PDF组件
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { ssr: false }
);

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

const ProductCatalogPDF = dynamic(
  () => import('@/components/pdf/ProductCatalogPDF'),
  { ssr: false }
);

interface Series {
  id: string;
  name: string;
  code: string;
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  series: { name: string; code: string };
}

export default function GeneratePDFPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<'series' | 'products'>('series');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [pdfData, setPdfData] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  // 获取系列和产品列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesRes, productsRes] = await Promise.all([
          fetch('/api/series'),
          fetch('/api/products'),
        ]);
        
        const seriesJson = await seriesRes.json();
        const productsJson = await productsRes.json();
        
        if (seriesJson.success) setSeriesList(seriesJson.data);
        if (productsJson.success) setProductList(productsJson.data);
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 生成PDF数据
  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    setPdfData(null);

    try {
      const body: any = { type: selectedType };
      
      if (selectedType === 'series' && selectedSeriesId) {
        body.seriesId = selectedSeriesId;
      } else if (selectedType === 'products' && selectedProductIds.length > 0) {
        body.productIds = selectedProductIds;
      } else {
        setError('请选择要生成的系列或产品');
        setGenerating(false);
        return;
      }

      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        setPdfData(json.data);
        setShowPreview(true);
      } else {
        setError(json.error || '生成失败');
      }
    } catch (err) {
      setError('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 切换产品选择
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedProductIds.length === productList.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(productList.map(p => p.id));
    }
  };

  const selectedSeries = seriesList.find(s => s.id === selectedSeriesId);

  return (
    <div className="max-w-6xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回控制台
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PDF 生成</h1>
          <p className="text-slate-600">选择产品或系列，生成产品目录PDF</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 选择面板 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">选择生成内容</h2>

          {/* 类型选择 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setSelectedType('series');
                setSelectedProductIds([]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                selectedType === 'series'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Layers className="w-5 h-5" />
              按系列生成
            </button>
            <button
              onClick={() => {
                setSelectedType('products');
                setSelectedSeriesId('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                selectedType === 'products'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              选择产品
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : selectedType === 'series' ? (
            /* 系列选择 */
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                选择系列
              </label>
              {seriesList.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">暂无系列数据</p>
              ) : (
                seriesList.map(series => (
                  <label
                    key={series.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSeriesId === series.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="series"
                      value={series.id}
                      checked={selectedSeriesId === series.id}
                      onChange={() => setSelectedSeriesId(series.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{series.name}</p>
                      <p className="text-sm text-slate-500">
                        {series.code} · {series._count?.products || 0} 个产品
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          ) : (
            /* 产品选择 */
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  选择产品 ({selectedProductIds.length}/{productList.length})
                </label>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedProductIds.length === productList.length ? '取消全选' : '全选'}
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {productList.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">暂无产品数据</p>
                ) : (
                  productList.map(product => (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProductIds.includes(product.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">
                          {product.sku} · {product.series.name}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 生成按钮 */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleGenerate}
              disabled={generating || (selectedType === 'series' && !selectedSeriesId) || (selectedType === 'products' && selectedProductIds.length === 0)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  生成 PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* 预览面板 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">PDF 预览</h2>

          {!pdfData ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Eye className="w-12 h-12 mb-4" />
              <p>选择内容并点击生成查看预览</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PDF预览区域 */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100" style={{ height: '500px' }}>
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                  <ProductCatalogPDF 
                    products={pdfData} 
                    title={selectedSeries?.name || '产品目录'}
                  />
                </PDFViewer>
              </div>

              {/* 下载按钮 */}
              <PDFDownloadLink
                document={
                  <ProductCatalogPDF 
                    products={pdfData} 
                    title={selectedSeries?.name || '产品目录'}
                  />
                }
                fileName={`catalog-${selectedSeries?.code || 'products'}-${new Date().toISOString().slice(0, 10)}.pdf`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                {({ loading }) => 
                  loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      准备中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下载 PDF
                    </>
                  )
                }
              </PDFDownloadLink>

              <p className="text-sm text-slate-500 text-center">
                共 {pdfData.length} 个产品
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-6 bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-3">📋 使用说明</h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p><strong>按系列生成</strong>：选择一个系列，生成该系列下所有产品的目录PDF</p>
          <p><strong>选择产品</strong>：手动选择要包含的产品，可跨系列选择</p>
          <p><strong>预览</strong>：生成后可在右侧预览PDF效果</p>
          <p><strong>下载</strong>：确认无误后点击下载按钮保存PDF文件</p>
        </div>
      </div>
    </div>
  );
}
