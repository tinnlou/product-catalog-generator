'use client';

import Link from 'next/link';
import { Package, Layers, FileText, Clock, TrendingUp, Users } from 'lucide-react';

// 统计卡片数据（示例）
const stats = [
  { name: '产品总数', value: '24', icon: Package, color: 'bg-blue-500', href: '/admin/products' },
  { name: '产品系列', value: '4', icon: Layers, color: 'bg-purple-500', href: '/admin/series' },
  { name: '已发布PDF', value: '18', icon: FileText, color: 'bg-green-500', href: '/admin/generate' },
  { name: '本周更新', value: '6', icon: TrendingUp, color: 'bg-orange-500', href: '/admin/products' },
];

// 最近活动（示例）
const recentActivity = [
  { id: 1, action: '创建产品', target: 'M8 Compact 4 Ports 标准型', user: '张三', time: '10分钟前' },
  { id: 2, action: '更新规格', target: 'M8 Distributor 8 Ports', user: '李四', time: '1小时前' },
  { id: 3, action: '生成PDF', target: 'M8系列完整目录', user: '王五', time: '2小时前' },
  { id: 4, action: '新建系列', target: 'M12 Extended Series', user: '张三', time: '昨天' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="text-slate-600 mt-1">欢迎回来！这是您的产品目录管理概览。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 两列布局 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 快捷操作 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/products/new"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700">新建产品</span>
            </Link>
            
            <Link
              href="/admin/series/new"
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-700">新建系列</span>
            </Link>
            
            <Link
              href="/admin/generate"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-700">生成PDF</span>
            </Link>
            
            <Link
              href="/admin/products"
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-orange-700">批量导入</span>
            </Link>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">最近活动</h2>
            <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium text-blue-600">{activity.target}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 使用指南 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">🚀 新手入门指南</h2>
            <p className="text-blue-100">
              第一次使用？了解如何创建产品系列、添加产品、生成专业PDF目录。
            </p>
          </div>
          <Link
            href="/admin/guide"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            查看教程
          </Link>
        </div>
      </div>
    </div>
  );
}

