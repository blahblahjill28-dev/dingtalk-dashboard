## 部署到 Vercel

### 方式一：一键部署（推荐）

点击下方按钮直接部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dingtalk-dashboard)

### 方式二：手动部署

1. **推送代码到 GitHub**

```bash
cd dingtalk-dashboard
git init
git add .
git commit -m "feat: 初始化钉钉多维表 Dashboard"
git remote add origin https://github.com/your-username/dingtalk-dashboard.git
git push -u origin main
```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 导入你的 GitHub 仓库
   - 添加环境变量（见下方）

3. **配置环境变量**

在 Vercel 项目设置 → Environment Variables 中添加：

| 变量 | 值 | 说明 |
|------|-----|------|
| `DINGTALK_APP_KEY` | `dingXXXXXXXXX` | 钉钉应用 Key |
| `DINGTALK_APP_SECRET` | `你的AppSecret` | 钉钉应用密钥 |
| `DINGTALK_TABLE_ID` | `你的多维表ID` | 多维表 ID |
| `SYNC_API_KEY` | `自定义密钥` | 同步接口密钥（可选） |

4. **启用 Cron Jobs**

在 Vercel Dashboard → Settings → Cron 中启用定时任务。

### 环境变量获取指南

**钉钉 AppKey 和 AppSecret：**
1. 访问 https://open.dingtalk.com/
2. 登录 → 应用开发 → 企业内部应用
3. 选择你的应用 → 凭证与基础信息
4. 复制 AppKey 和 AppSecret

**多维表 ID：**
打开目标多维表，URL 格式类似：
`https://alidocs.dingtalk.com/i/nodes/XXXXXXXXXXXXXXX`
其中 `XXXXXXXXXXXXXXX` 就是 Table ID
