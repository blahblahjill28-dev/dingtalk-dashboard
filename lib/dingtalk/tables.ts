// 钉钉多维表 API 封装
// API文档: https://open.dingtalk.com/document/development/api-notable-listrecords

import { dingtalkFetch, buildTableApiUrl } from './auth';
import type { DingTalkSheet, DingTalkRecord, DingTalkField } from '@/types';

/**
 * 获取多维表的所有数据表（Sheet）
 * @param tableId 多维表ID
 */
export async function getTableSheets(tableId: string): Promise<DingTalkSheet[]> {
  const url = buildTableApiUrl(`/notable/tables/${tableId}/sheets`);
  const response = await dingtalkFetch(url, { method: 'GET' });

  if (!response.success || !response.result) {
    throw new Error('获取数据表列表失败: ' + JSON.stringify(response));
  }

  return response.result.map((sheet: any) => ({
    id: sheet.sheetId,
    name: sheet.name,
    fields: sheet.columns?.map((col: any) => ({
      id: col.columnId,
      name: col.name,
      type: col.type,
    })) || [],
  }));
}

/**
 * 获取数据表中的所有记录
 * 支持分页，自动获取全部数据
 * @param tableId 多维表ID
 * @param sheetId 数据表ID
 * @param maxRecords 最大记录数（默认10000）
 */
export async function getAllRecords(
  tableId: string,
  sheetId: string,
  maxRecords: number = 10000
): Promise<DingTalkRecord[]> {
  const allRecords: DingTalkRecord[] = [];
  let nextCursor: string | null = null;
  const pageSize = 100; // 每页最大100条

  do {
    const url = buildTableApiUrl(`/notable/sheets/${sheetId}/records`);
    
    const params = new URLSearchParams({
      maxResults: pageSize.toString(),
    });

    if (nextCursor) {
      params.set('nextCursor', nextCursor);
    }

    const response = await dingtalkFetch(`${url}?${params}`, { method: 'GET' });

    if (!response.success || !response.result) {
      throw new Error('获取记录失败: ' + JSON.stringify(response));
    }

    const records = response.result.records || [];
    
    allRecords.push(
      ...records.map((record: any) => ({
        id: record.recordId,
        fields: record.fields || {},
        createdTime: record.createdTime,
        modifiedTime: record.modifiedTime,
      }))
    );

    // 检查是否还有更多数据
    nextCursor = response.result.nextCursor || null;

    // 防止无限循环
    if (allRecords.length >= maxRecords) {
      console.warn(`[钉钉多维表] 已达到最大记录数限制: ${maxRecords}`);
      break;
    }
  } while (nextCursor);

  return allRecords;
}

/**
 * 获取指定记录
 * @param tableId 多维表ID
 * @param sheetId 数据表ID
 * @param recordId 记录ID
 */
export async function getRecord(
  tableId: string,
  sheetId: string,
  recordId: string
): Promise<DingTalkRecord | null> {
  const url = buildTableApiUrl(`/notable/sheets/${sheetId}/records/${recordId}`);
  const response = await dingtalkFetch(url, { method: 'GET' });

  if (!response.success || !response.result) {
    return null;
  }

  return {
    id: response.result.recordId,
    fields: response.result.fields || {},
    createdTime: response.result.createdTime,
    modifiedTime: response.result.modifiedTime,
  };
}

/**
 * 获取多维表的完整数据（所有Sheet和记录）
 * @param tableId 多维表ID
 * @param maxRecordsPerSheet 每个Sheet的最大记录数
 */
export async function getFullTableData(
  tableId: string,
  maxRecordsPerSheet: number = 10000
): Promise<{
  sheets: DingTalkSheet[];
  records: Record<string, DingTalkRecord[]>;
  totalRecords: number;
}> {
  // 1. 获取所有数据表
  const sheets = await getTableSheets(tableId);
  console.log(`[钉钉多维表] 获取到 ${sheets.length} 个数据表`);

  // 2. 获取每个数据表的记录
  const records: Record<string, DingTalkRecord[]> = {};
  let totalRecords = 0;

  for (const sheet of sheets) {
    console.log(`[钉钉多维表] 正在获取数据表 "${sheet.name}" 的记录...`);
    const sheetRecords = await getAllRecords(tableId, sheet.id, maxRecordsPerSheet);
    records[sheet.id] = sheetRecords;
    totalRecords += sheetRecords.length;
    console.log(`[钉钉多维表] "${sheet.name}" 共 ${sheetRecords.length} 条记录`);
  }

  return {
    sheets,
    records,
    totalRecords,
  };
}
