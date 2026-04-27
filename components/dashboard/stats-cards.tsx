// 统计卡片组件

import { BarChart3, Table2, Clock, RefreshCw } from 'lucide-react';

interface StatsCardsProps {
  totalRecords: number;
  totalSheets: number;
  lastUpdated: string;
  isSyncing: boolean;
}

export function StatsCards({ totalRecords, totalSheets, lastUpdated, isSyncing }: StatsCardsProps) {
  const stats = [
    {
      label: '总记录数',
      value: totalRecords.toLocaleString(),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '数据表数',
      value: totalSheets,
      icon: Table2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '最后同步',
      value: lastUpdated ? formatTime(lastUpdated) : '未同步',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '同步状态',
      value: isSyncing ? '同步中...' : '就绪',
      icon: RefreshCw,
      color: isSyncing ? 'text-yellow-600' : 'text-gray-600',
      bgColor: isSyncing ? 'bg-yellow-50' : 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
