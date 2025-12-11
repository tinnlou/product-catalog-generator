'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, FileDown } from 'lucide-react';

export default function ImportExportPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState<'products' | 'series'>('products');
  const [importMode, setImportMode] = useState<'skip' | 'update'>('skip');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  // 导出数据
  const handleExport = async (type: 'products' | 'series') => {
    setExporting(true);
    setError('');
    
    try {
      const res = await fetch(`/api/export?type=${type}&format=csv`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError('导出失败');
      }
    } catch (err) {
      setError('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 下载模板
  const handleDownloadTemplate = async (type: 'products' | 'series') => {
    try {
      const res = await fetch(`/api/template?type=${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('下载模板失败');
    }
  };

  // 导入数据
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', importType);
      formData.append('mode', importMode);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setResults(json.results);
      } else {
        setError(json.error || '导入失败');
      }
    } catch (err) {
      setError('导入失败，请重试');
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
          <FileSpreadsheet className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">批量导入导出</h1>
          <p className="text-slate-600">使用 CSV 表格批量管理产品和系列数据</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* 导出卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">导出数据</h2>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            将数据导出为 CSV 表格文件，可用 Excel 打开编辑。
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleExport('products')}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              导出产品表格
            </button>

            <button
              onClick={() => handleExport('series')}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
            >
              导出系列表格
            </button>
          </div>
        </div>

        {/* 导入卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">导入数据</h2>
          </div>

          <p className="text-slate-600 text-sm mb-4">从 CSV 表格文件导入数据。</p>

          {/* 导入类型选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">导入类型：</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="products"
                  checked={importType === 'products'}
                  onChange={() => setImportType('products')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-600">产品</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="series"
                  checked={importType === 'series'}
                  onChange={() => setImportType('series')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-600">系列</span>
              </label>
            </div>
          </div>

          {/* 重复处理模式 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">遇到重复数据：</label>
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

          {/* 下载模板按钮 */}
          <button
            onClick={() => handleDownloadTemplate(importType)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            下载{importType === 'products' ? '产品' : '系列'}导入模板
          </button>

          {/* 上传文件 */}
          <label className="block">
            <input type="file" accept=".csv" onChange={handleImport} disabled={importing} className="hidden" />
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
                  <span className="text-slate-600">点击选择 CSV 文件</span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* 导入结果 */}
      {results && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            导入完成
          </h3>
          <div className="flex gap-6 text-sm">
            <span className="text-green-600">✓ 新建 {results.created}</span>
            <span className="text-blue-600">↻ 更新 {results.updated}</span>
            <span className="text-slate-400">- 跳过 {results.skipped}</span>
          </div>
          {results.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-1">错误信息：</p>
              <div className="text-sm text-red-600 space-y-1">
                {results.errors.slice(0, 10).map((err: string, i: number) => (
                  <p key={i}>• {err}</p>
                ))}
                {results.errors.length > 10 && (
                  <p>... 还有 {results.errors.length - 10} 条错误</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-3">📋 使用说明</h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p><strong>1. 导出数据</strong>：点击导出按钮，会下载 CSV 文件，可用 Excel 打开编辑</p>
          <p><strong>2. 下载模板</strong>：首次导入前，建议先下载模板查看格式要求</p>
          <p><strong>3. 编辑表格</strong>：用 Excel 编辑表格，保存为 CSV 格式（逗号分隔）</p>
          <p><strong>4. 导入数据</strong>：选择类型和重复处理方式，上传 CSV 文件</p>
        </div>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            💡 <strong>提示</strong>：导入产品前，请先确保对应的系列已存在。可以先导入系列，再导入产品。
          </p>
        </div>
      </div>
    </div>
  );
}
