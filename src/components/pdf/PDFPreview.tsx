'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// 动态导入PDF组件（禁用SSR）
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ),
  }
);

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

const Document = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.Page),
  { ssr: false }
);

const View = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.View),
  { ssr: false }
);

const Text = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.Text),
  { ssr: false }
);

export { PDFViewer, PDFDownloadLink, Document, Page, View, Text };

