'use client';

import Link from 'next/link';
import { BookOpen, Package, Layers, FileText, Settings2, ArrowRight, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: '创建产品系列',
    description: '首先创建产品系列，定义该系列产品的共同属性字段（如电压、电流、端口数等）',
    icon: Layers,
    href: '/admin/series',
    color: 'bg-purple-500',
  },
  {
    number: 2,
    title: '配置字段结构',
    description: '为每个系列配置专属的字段结构，系统会自动生成对应的编辑表单',
    icon: Settings2,
    href: '/admin/series',
    color: 'bg-blue-500',
  },
  {
    number: 3,
    title: '添加产品',
    description: '在对应系列下添加产品，填写规格参数、上传图片、添加型号',
    icon: Package,
    href: '/admin/products/new',
    color: 'bg-green-500',
  },
  {
    number: 4,
    title: '生成PDF',
    description: '选择产品或系列，一键生成专业的PDF目录页',
    icon: FileText,
    href: '/admin/generate',
    color: 'bg-orange-500',
  },
];

const tips = [
  '每个产品系列可以有不同的字段结构和PDF模板',
  '修改产品数据时，系统会自动记录修改历史',
  '支持批量导出多个产品的PDF',
  '可以预览PDF效果后再下载',
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 标题 */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">新手入门指南</h1>
        <p className="text-slate-600 mt-2">跟随以下步骤，快速上手产品目录管理系统</p>
      </div>

      {/* 步骤 */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Link
            key={step.number}
            href={step.href}
            className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-500">步骤 {step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-600 mt-1">{step.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* 小贴士 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-slate-900 mb-4">💡 小贴士</h3>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 快速开始 */}
      <div className="text-center">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          <Package className="w-5 h-5" />
          立即创建第一个产品
        </Link>
      </div>
    </div>
  );
}

