// API路由 - 获取Dashboard数据
// GET /api/data

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/storage';

const DEMO_MODE = !process.env.DINGTALK_APP_KEY || !process.env.DINGTALK_TABLE_ID;

export async function GET(request: NextRequest) {
  try {
    const dashboardData = await getDashboardData();

    if (!dashboardData) {
      return NextResponse.json(
        {
          success: false,
          message: '暂无数据，请先执行同步',
          data: null,
        },
        { status: 404 }
      );
    }

    // 支持筛选参数
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get('sheet');

    if (sheetId) {
      // 返回指定数据表
      const sheet = dashboardData.sheets.find(s => s.id === sheetId);
      if (!sheet) {
        return NextResponse.json(
          { success: false, message: `未找到数据表: ${sheetId}` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: sheet,
        lastUpdated: dashboardData.lastUpdated,
        demoMode: DEMO_MODE,
      });
    }

    // 返回全部数据
    return NextResponse.json({
      success: true,
      data: dashboardData,
      demoMode: DEMO_MODE,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `获取数据失败: ${error.message}` },
      { status: 500 }
    );
  }
}
