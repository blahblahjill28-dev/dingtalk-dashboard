// 钉钉开放平台 - 鉴权和Token管理
// API文档: https://open.dingtalk.com/document/orgapp/obtain-orgapp-token

const DINGTALK_APP_KEY = process.env.DINGTALK_APP_KEY || '';
const DINGTALK_APP_SECRET = process.env.DINGTALK_APP_SECRET || '';
const DINGTALK_API_BASE = 'https://api.dingtalk.com/v1.0';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * 获取钉钉访问令牌
 * 缓存机制：提前5分钟刷新，避免过期
 */
export async function getAccessToken(): Promise<string> {
  // 检查缓存
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  try {
    const response = await fetch(
      `${DINGTALK_API_BASE}/oauth2/accessToken`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey: DINGTALK_APP_KEY,
          appSecret: DINGTALK_APP_SECRET,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`获取Token失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errcode !== 0 && data.success !== true) {
      throw new Error(`钉钉API错误: ${JSON.stringify(data)}`);
    }

    const accessToken = data.accessToken;
    const expiresIn = data.expireIn || 7200; // 默认2小时

    // 缓存令牌，提前5分钟过期
    tokenCache = {
      accessToken,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    console.log('[钉钉Token] 获取成功，有效期至:', new Date(tokenCache.expiresAt).toLocaleString('zh-CN'));
    
    return accessToken;
  } catch (error) {
    console.error('[钉钉Token] 获取失败:', error);
    throw error;
  }
}

/**
 * 清除Token缓存（用于手动刷新）
 */
export function clearTokenCache(): void {
  tokenCache = null;
}

/**
 * 统一的钉钉API请求封装
 * 包含重试机制和错误处理
 */
export async function dingtalkFetch(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    retries?: number;
  } = {}
): Promise<any> {
  const {
    method = 'GET',
    body,
    retries = 2,
  } = options;

  const token = await getAccessToken();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const headers: Record<string, string> = {
        'x-acs-dingtalk-access-token': token,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 检查钉钉API错误码
      if (data.errcode && data.errcode !== 0) {
        // Token过期时清除缓存并重试
        if (data.errcode === 40001 || data.errcode === 40014) {
          clearTokenCache();
          throw new Error('Token过期，将自动重试');
        }
        throw new Error(`钉钉API错误[${data.errcode}]: ${data.errmsg || JSON.stringify(data)}`);
      }

      return data;
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries) {
        // 指数退避重试
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[钉钉API] 第${attempt + 1}次尝试失败，${delay}ms后重试: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`[钉钉API] 重试${retries + 1}次后仍然失败: ${lastError?.message}`);
}

// 构建多维表API URL
export function buildTableApiUrl(path: string): string {
  return `${DINGTALK_API_BASE}${path}`;
}
