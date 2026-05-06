// 钉钉多维表 Dashboard - 类型定义

// 钉钉多维表字段
export interface DingTalkField {
  id: string;
  name: string;
  type: string;
}

// 钉钉多维表记录
export interface DingTalkRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
  modifiedTime?: string;
}

// 钉钉多维表数据表
export interface DingTalkSheet {
  id: string;
  name: string;
  fields: DingTalkField[];
}

// 钉钉多维表响应
export interface DingTalkTableResponse {
  success: boolean;
  data: {
    sheets: DingTalkSheet[];
    records: DingTalkRecord[];
    totalCount: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

// 内部数据结构
export interface SheetData {
  id: string;
  name: string;
  fields: DingTalkField[];
  records: Record<string, any>[];
  totalCount: number;
  lastSynced: string;
  checksum: string;
}

// Dashboard 数据
export interface DashboardData {
  lastUpdated: string;
  syncStatus: 'syncing' | 'success' | 'error';
  sheets: SheetData[];
  summary?: {
    totalRecords: number;
    totalSheets: number;
  };
  demoMode?: boolean;
}

// 同步状态
export interface SyncStatus {
  lastSyncTime: string | null;
  isSyncing: boolean;
  error: string | null;
  sheetCount: number;
  recordCount: number;
}
