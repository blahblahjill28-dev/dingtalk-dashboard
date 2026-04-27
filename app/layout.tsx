import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '订单 Dashboard - 钉钉多维表',
  description: '基于钉钉多维表的实时订单数据展示',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
