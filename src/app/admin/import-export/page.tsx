'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ImportExportPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'skip' | 'update'>('skip');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleExport = async (type: 'all' | 'products' | 'series') => {
    setExporting(true);
    setError('');
    
    try {
      const res = await fetch(`/api/export?type=${type}`);
      const json = await res.json();
      
      if (json.success) {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalog-${type}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(json.error || '导出失败');
      }
    } catch (err) {
      setError('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setResults(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: data.series,
          products: data.products,
          mode: importMode,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setResults(json.results);
      } else {
        setError(json.error || '导入失败');
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('文件格式错误，请确保是有效的JSON文件');
      } else {
        setError('导入失败，请重试');
      }
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回控制台
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <FileJson className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">批量导入导出</h1>
          <p className="text-slate-600">导入或导出产品和系列数据</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">导出数据</h2>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            将数据导出为 JSON 文件，可用于备份或迁移。
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleExport('all')}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              导出全部数据
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('series')}
                disabled={exporting}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
              >
                仅导出系列
              </button>
              <button
                onClick={() => handleExport('products')}
                disabled={exporting}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
              >
                仅导出产品
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">导入数据</h2>
          </div>

          <p className="text-slate-600 text-sm mb-4">从 JSON 文件导入产品和系列数据。</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">遇到重复数据时：</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="skip"
                  checked={importMode === 'skip'}
                  onChange={() => setImportMode('skip')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-600">跳过</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="update"
                  checked={importMode === 'update'}
                  onChange={() => setImportMode('update')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-600">更新覆盖</span>
              </label>
            </div>
          </div>

          <label className="block">
            <input type="file" accept=".json" onChange={handleImport} disabled={importing} className="hidden" />
            <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              importing ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
            }`}>
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-blue-600 font-medium">导入中...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">点击选择 JSON 文件</span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {results && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            导入完成
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">系列</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">新建 {results.series.created}</span>
                <span className="text-blue-600">更新 {results.series.updated}</span>
                <span className="text-slate-400">跳过 {results.series.skipped}</span>
              </div>
              {results.series.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {results.series.errors.map((err: string, i: number) => <p key={i}>{err}</p>)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">产品</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">新建 {results.products.created}</span>
                <span className="text-blue-600">更新 {results.products.updated}</span>
                <span className="text-slate-400">跳过 {results.products.skipped}</span>
              </div>
              {results.products.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {results.products.errors.map((err: string, i: number) => <p key={i}>{err}</p>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-3">JSON 文件格式示例</h3>
        <pre className="text-xs text-slate-600 bg-white p-4 rounded-lg overflow-x-auto border border-slate-200">
{`{
  "series": [
    { "name": "M8 Compact 4 Ports", "code": "M8-COMPACT-4", "templateId": "layout-m8-standard" }
  ],
  "products": [
    { "name": "产品名称", "sku": "SKU-001", "seriesCode": "M8-COMPACT-4", "specifications": {} }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}

