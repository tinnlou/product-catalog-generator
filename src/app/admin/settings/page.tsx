'use client';

import { useState } from 'react';
import { Settings, Save, Database, Palette, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('设置已保存！');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
        <p className="text-slate-600 mt-1">配置系统参数和偏好设置</p>
      </div>

      {/* 基本设置 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">基本设置</h2>
            <p className="text-sm text-slate-500">系统基础配置</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">公司名称</label>
            <input
              type="text"
              defaultValue="Industrial Connectors Co."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">公司Logo URL</label>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* PDF设置 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">PDF 设置</h2>
            <p className="text-sm text-slate-500">自定义PDF输出样式</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">默认页面尺寸</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="LETTER">Letter (8.5 × 11 in)</option>
              <option value="LEGAL">Legal (8.5 × 14 in)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">主题色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#1e40af"
                className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                defaultValue="#1e40af"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 数据库信息 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">数据库信息</h2>
            <p className="text-sm text-slate-500">查看数据库连接状态</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">状态:</span>
              <span className="ml-2 text-green-600 font-medium">● 已连接</span>
            </div>
            <div>
              <span className="text-slate-500">提供商:</span>
              <span className="ml-2 text-slate-900">Supabase (PostgreSQL)</span>
            </div>
            <div>
              <span className="text-slate-500">产品数:</span>
              <span className="ml-2 text-slate-900">2</span>
            </div>
            <div>
              <span className="text-slate-500">系列数:</span>
              <span className="ml-2 text-slate-900">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}

