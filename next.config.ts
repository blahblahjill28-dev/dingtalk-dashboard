import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel Cron 配置：每5分钟自动同步钉钉多维表数据
  experimental: {
    // 如果使用 Vercel Cron，可以在 api 路由中使用
  },
};

export default nextConfig;
