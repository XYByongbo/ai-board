import type { TokenCostResponse } from './types'

/** 官方接口基础域名（文档：https://nf.ainowork.ai/docs/getting-started/api-keys） */
const BASE_URL = 'https://hk.ainowork.ai'

/**
 * 查询单个 Key 的每日 Token 消耗。
 * 接口已开启 CORS（access-control-allow-origin: *），浏览器可直接请求，无需后端代理。
 * Key 仅用于本次请求的 Authorization 头，不会发送到任何第三方。
 *
 * @param apiKey   形如 sk-xxxx 的请求 Key
 * @param startDate 可选，YYYY-MM-DD
 * @param endDate   可选，YYYY-MM-DD（区间≤7天，起始不早于30天前）
 */
export async function fetchTokenCost(
  apiKey: string,
  startDate?: string,
  endDate?: string,
): Promise<TokenCostResponse> {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  const qs = params.toString()
  const url = `${BASE_URL}/api/usage/token/cost${qs ? `?${qs}` : ''}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
    })
  } catch {
    throw new Error('网络请求失败，请检查网络连接后重试')
  }

  let body: TokenCostResponse | null = null
  try {
    body = (await res.json()) as TokenCostResponse
  } catch {
    // 响应体非 JSON，下面按状态码处理
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('API Key 无效或无权限（HTTP ' + res.status + '）')
    }
    throw new Error(body?.message || `请求失败（HTTP ${res.status}）`)
  }

  if (!body || !body.success || !body.data) {
    throw new Error(body?.message || '接口返回数据异常')
  }

  return body
}
