// API路由 - 手动触发数据同步
// POST /api/sync

import { NextRequest, NextResponse } from 'next/server';
import { syncData } from '@/lib/sync';
import { getSyncStatus } from '@/lib/storage';

// 简单的API密钥鉴权
const SYNC_API_KEY = process.env.SYNC_API_KEY || '';

// 检查是否启用演示模式（没有配置钉钉凭据时使用）
const DEMO_MODE = !process.env.DINGTALK_APP_KEY || !process.env.DINGTALK_TABLE_ID;

export async function POST(request: NextRequest) {
  // 如果配置了API密钥，则进行验证
  if (SYNC_API_KEY) {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== SYNC_API_KEY) {
      return NextResponse.json(
        { success: false, message: '鉴权失败: 无效的API密钥' },
        { status: 401 }
      );
    }
  }

  try {
    // 演示模式：返回模拟成功消息
    if (DEMO_MODE) {
      return NextResponse.json({
        success: true,
        message: '演示模式：未配置钉钉凭据，使用演示数据。请配置环境变量后启用真实同步。',
        demoMode: true,
      });
    }

    const result = await syncData();
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `同步失败: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = await getSyncStatus();
  
  return NextResponse.json({
    success: true,
    status: status || { message: '从未同步过' },
    demoMode: DEMO_MODE,
  });
}
