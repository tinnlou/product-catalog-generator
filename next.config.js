/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许从 Supabase Storage 加载图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // 实验性功能
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig

