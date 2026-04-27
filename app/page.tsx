// Dashboard 主页

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { RefreshCw, Database, ExternalLink } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DataTable } from '@/components/dashboard/data-table';
import type { DashboardData } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 获取Dashboard数据
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: DashboardData | null;
  }>('/api/data', fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5分钟自动刷新
    revalidateOnFocus: true,
    dedupingInterval: 60 * 1000,
  });

  // 手动同步
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const result = await res.json();
      
      if (result.success) {
        // 同步成功后刷新数据
        await mutate();
      } else {
        alert(`同步失败: ${result.message}`);
      }
    } catch (err: any) {
      alert(`同步错误: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center card max-w-md">
          <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无数据</h2>
          <p className="text-gray-500 mb-6">
            还没有同步过数据，请点击下方按钮开始同步
          </p>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn btn-primary disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '同步中...' : '立即同步'}
          </button>
        </div>
      </div>
    );
  }

  const dashboardData = data.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">订单 Dashboard</h1>
                <p className="text-sm text-gray-500">
                  数据源: 钉钉多维表 {data.demoMode && '（演示模式）'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {data.demoMode && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  演示模式
                </span>
              )}
              <span className="text-sm text-gray-500">
                最后更新: {formatDateTime(dashboardData.lastUpdated)}
              </span>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="btn btn-primary disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? '同步中...' : '同步'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <StatsCards
          totalRecords={dashboardData.summary?.totalRecords || 0}
          totalSheets={dashboardData.summary?.totalSheets || 0}
          lastUpdated={dashboardData.lastUpdated}
          isSyncing={isSyncing}
        />

        {/* 数据表标签页 */}
        {dashboardData.sheets.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* 标签页导航 */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-4" aria-label="Tabs">
                {dashboardData.sheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => setActiveSheet(sheet.id)}
                    className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                      activeSheet === sheet.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {sheet.name}
                    <span className="ml-2 text-xs text-gray-400">
                      ({sheet.totalCount})
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 数据表格 */}
            {dashboardData.sheets
              .filter(sheet => activeSheet === null || sheet.id === activeSheet)
              .map(sheet => (
                <div key={sheet.id} className="card">
                  <DataTable sheet={sheet} />
                </div>
              ))}
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>钉钉多维表 Dashboard</span>
            <a
              href="https://open.dingtalk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-700"
            >
              钉钉开放平台
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
