# 钉钉多维表 Dashboard

基于 Next.js 构建的订单数据仪表板，直接从钉钉多维表自动拉取数据，替代手动上传流程。

## 功能特性

- 自动同步：每 5 分钟自动从钉钉多维表拉取最新数据
- 手动刷新：页面提供一键同步按钮
- 数据缓存：智能校验和比对，只在数据变化时更新
- 分页搜索：内置表格分页和全文搜索
- 多数据表：支持多维表中多个 Sheet 的切换展示

## 快速开始

### 1. 安装依赖

```bash
cd dingtalk-dashboard
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的配置：

```bash
cp .env.example .env.local
```

需要配置的关键变量：

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `DINGTALK_APP_KEY` | 钉钉应用 Key | 钉钉开放平台 → 应用详情 |
| `DINGTALK_APP_SECRET` | 钉钉应用密钥 | 钉钉开放平台 → 应用详情 |
| `DINGTALK_TABLE_ID` | 多维表 ID | 打开多维表时 URL 中的参数 |
| `SYNC_API_KEY` | 同步接口密钥（可选） | 自定义安全字符串 |

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

### 4. 首次同步

访问页面后点击"同步"按钮，或手动调用：

```bash
curl -X POST http://localhost:3000/api/sync
```

## 部署到 Vercel

### 方式一：直接部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 在 Vercel 项目设置中添加环境变量
4. 部署完成

### 方式二：开启 Vercel Cron

部署后在 Vercel Dashboard 中启用 Cron Jobs，即可实现每 5 分钟自动同步。

## 项目结构

```
dingtalk-dashboard/
├── app/
│   ├── api/
│   │   ├── sync/route.ts      # 同步 API
│   │   └── data/route.ts      # 数据 API
│   ├── layout.tsx
│   └── page.tsx               # Dashboard 主页
├── components/
│   └── dashboard/
│       ├── data-table.tsx     # 数据表格
│       └── stats-cards.tsx    # 统计卡片
├── lib/
│   ├── dingtalk/
│   │   ├── auth.ts            # 钉钉鉴权
│   │   └── tables.ts          # 多维表 API
│   ├── sync.ts                # 数据同步
│   └── storage.ts             # 数据存储
├── types/
│   └── index.ts               # 类型定义
├── data/                      # 本地 JSON 存储
├── .env.example
├── next.config.ts
└── vercel.json                # Vercel Cron 配置
```

## 数据流

```
钉钉多维表 ──▶ /api/sync ──▶ 同步服务 ──▶ data/dashboard.json
                                              │
                                              ▼
                                        /api/data ──▶ Dashboard 前端
```

## 钉钉开放平台配置指南

### 1. 创建企业内部应用

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 登录并进入「应用开发」
3. 创建「企业内部应用」
4. 记录 AppKey 和 AppSecret

### 2. 申请 API 权限

在应用的「权限管理」中添加以下权限：

- `dingtalk.oapi.ding.doc.read` - 读取文档
- `dingtalk.oapi.ding.table.read` - 读取表格/多维表

### 3. 获取多维表 ID

打开目标多维表，URL 格式类似：

```
https://alidocs.dingtalk.com/i/nodes/{table_id}...
```

其中 `{table_id}` 就是 `DINGTALK_TABLE_ID`。

## 常见问题

### 同步失败：Token 错误

检查 `DINGTALK_APP_KEY` 和 `DINGTALK_APP_SECRET` 是否正确。

### 数据为空

确认多维表 ID 正确，且应用有读取权限。

### Vercel 部署后不自动同步

确认已启用 Vercel Cron Jobs，并检查环境变量配置。

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SWR (数据获取)
- 本地 JSON 存储（可替换为数据库）

## 许可证

MIT
