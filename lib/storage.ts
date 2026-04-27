// 数据存取 - 使用本地JSON文件作为轻量级存储
// 生产环境可以替换为 Redis / PostgreSQL

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import type { SheetData, DashboardData, SyncStatus } from '@/types';

// 数据存储目录
const DATA_DIR = path.join(process.cwd(), 'data');
const DASHBOARD_FILE = path.join(DATA_DIR, 'dashboard.json');
const SYNC_STATUS_FILE = path.join(DATA_DIR, 'sync-status.json');

// 确保数据目录存在
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * 计算数据的MD5校验和（用于检测数据变化）
 */
export function computeChecksum(data: any): string {
  return createHash('md5')
    .update(JSON.stringify(data, Object.keys(data).sort()))
    .digest('hex');
}

/**
 * 保存Dashboard数据
 */
export async function saveDashboardData(data: DashboardData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DASHBOARD_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 读取Dashboard数据
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    await ensureDataDir();
    const content = await fs.readFile(DASHBOARD_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 保存同步状态
 */
export async function saveSyncStatus(status: SyncStatus): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SYNC_STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
}

/**
 * 读取同步状态
 */
export async function getSyncStatus(): Promise<SyncStatus | null> {
  try {
    await ensureDataDir();
    const content = await fs.readFile(SYNC_STATUS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 检查数据是否有变化
 * @param newData 新数据
 * @param oldChecksum 旧的校验和
 */
export function hasDataChanged(newData: any, oldChecksum: string): boolean {
  const newChecksum = computeChecksum(newData);
  return newChecksum !== oldChecksum;
}
