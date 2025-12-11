'use client';

import { useState } from 'react';
import { FileText, Download, Eye, CheckSquare, Square, Loader2 } from 'lucide-react';

// 示例产品数据
const products = [
  { id: '1', name: 'M8 Compact 4 Ports 标准型', series: 'M8 Compact 4/6 Ports', status: 'PUBLISHED' },
  { id: '2', name: 'M8 Compact 6 Ports 标准型', series: 'M8 Compact 4/6 Ports', status: 'PUBLISHED' },
  { id: '3', name: 'M8 Distributor 8 Ports PVC', series: 'M8 Distributor 8/12 Ports', status: 'DRAFT' },
];

export default function GeneratePage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    alert('PDF生成功能正在开发中，敬请期待！');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PDF 生成</h1>
        <p className="text-slate-600 mt-1">选择产品，一键生成专业的PDF目录页</p>
      </div>

      {/* 操作区 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              {selectedProducts.length === products.length ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              全选
            </button>
            <span className="text-sm text-slate-500">
              已选择 {selectedProducts.length} 个产品
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={selectedProducts.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  生成 PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* 产品列表 */}
        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => toggleSelect(product.id)}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedProducts.includes(product.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {selectedProducts.includes(product.id) ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-500">{product.series}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('预览功能开发中');
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('下载功能开发中');
                  }}
                  className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">📄 PDF 生成说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 选择一个或多个产品，点击"生成 PDF"按钮</li>
          <li>• 系统会根据产品所属系列自动选择对应的PDF模板</li>
          <li>• 生成的PDF可以预览后下载</li>
          <li>• 支持批量生成多个产品的PDF合集</li>
        </ul>
      </div>
    </div>
  );
}

