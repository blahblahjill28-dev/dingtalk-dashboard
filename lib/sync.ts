// 数据同步服务 - 核心逻辑

import { getFullTableData } from './dingtalk/tables';
import { saveDashboardData, getDashboardData, saveSyncStatus, getSyncStatus, computeChecksum } from './storage';
import type { DashboardData, SheetData, DingTalkRecord, DingTalkSheet, SyncStatus } from '@/types';

const TABLE_ID = process.env.DINGTALK_TABLE_ID || '';

/**
 * 将钉钉多维表的记录转换为结构化数据
 */
function convertRecordsToRows(records: DingTalkRecord[], fields: any[]): Record<string, any>[] {
  return records.map(record => {
    const row: Record<string, any> = {
      id: record.id,
    };

    // 将字段ID映射为字段名
    if (record.fields) {
      for (const [fieldId, value] of Object.entries(record.fields)) {
        // 尝试从字段元数据中找到对应的字段名
        const field = fields.find(f => f.id === fieldId);
        const key = field ? field.name : fieldId;
        row[key] = value;
      }
    }

    return row;
  });
}

/**
 * 执行数据同步
 * 这是核心同步逻辑，被定时任务和手动触发调用
 */
export async function syncData(): Promise<{ success: boolean; message: string }> {
  const startTime = Date.now();
  console.log('[数据同步] 开始同步...', new Date().toLocaleString('zh-CN'));

  try {
    // 读取现有的同步状态
    const syncStatus = await getSyncStatus();
    
    if (syncStatus?.isSyncing) {
      return {
        success: false,
        message: '同步正在进行中，请稍后再试',
      };
    }

    // 更新状态为同步中
    await saveSyncStatus({
      lastSyncTime: syncStatus?.lastSyncTime || null,
      isSyncing: true,
      error: null,
      sheetCount: 0,
      recordCount: 0,
    });

    if (!TABLE_ID) {
      throw new Error('未配置 DINGTALK_TABLE_ID 环境变量');
    }

    // 从钉钉多维表获取完整数据
    const tableData = await getFullTableData(TABLE_ID);

    console.log('[数据同步] 获取到数据:', {
      数据表数: tableData.sheets.length,
      总记录数: tableData.totalRecords,
    });

    // 转换并保存数据
    const sheets: SheetData[] = tableData.sheets.map(sheet => {
      const records = tableData.records[sheet.id] || [];
      const rows = convertRecordsToRows(records, sheet.fields);
      const checksum = computeChecksum(rows);

      return {
        id: sheet.id,
        name: sheet.name,
        fields: sheet.fields,
        records: rows,
        totalCount: rows.length,
        lastSynced: new Date().toISOString(),
        checksum,
      };
    });

    // 构建Dashboard数据
    const dashboardData: DashboardData = {
      lastUpdated: new Date().toISOString(),
      syncStatus: 'success',
      sheets,
      summary: {
        totalRecords: tableData.totalRecords,
        totalSheets: tableData.sheets.length,
      },
    };

    // 保存数据
    await saveDashboardData(dashboardData);

    // 更新同步状态
    await saveSyncStatus({
      lastSyncTime: new Date().toISOString(),
      isSyncing: false,
      error: null,
      sheetCount: tableData.sheets.length,
      recordCount: tableData.totalRecords,
    });

    const duration = Date.now() - startTime;
    const message = `同步完成: ${tableData.sheets.length}个数据表, ${tableData.totalRecords}条记录, 耗时${duration}ms`;
    console.log('[数据同步]', message);

    return {
      success: true,
      message,
    };
  } catch (error: any) {
    const errorMessage = error.message || '未知错误';
    console.error('[数据同步] 失败:', errorMessage);

    // 更新状态为失败
    await saveSyncStatus({
      lastSyncTime: new Date().toISOString(),
      isSyncing: false,
      error: errorMessage,
      sheetCount: 0,
      recordCount: 0,
    });

    return {
      success: false,
      message: `同步失败: ${errorMessage}`,
    };
  }
}

/**
 * 获取同步进度
 */
export async function getSyncProgress(): Promise<SyncStatus | null> {
  return await getSyncStatus();
}
