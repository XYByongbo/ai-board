import dayjs, { type Dayjs } from 'dayjs'
import type {
  Period,
  TokenBreakdown,
  TokenCostData,
  TokenCostResponse,
  TokenCostSummary,
} from './types'

/** 官方接口基础域名（文档：https://nf.ainowork.ai/docs/getting-started/api-keys） */
const BASE_URL = 'https://hk.ainowork.ai'

/** 单次请求超时（毫秒）。超时按瞬时故障重试。 */
const REQUEST_TIMEOUT_MS = 15_000
/** 429 / 5xx 最大重试次数（不含首次） */
const MAX_RETRIES = 2
/** 重试退避基准（指数退避：base × 2^(attempt-1)），单位毫秒 */
const RETRY_BASE_DELAY_MS = 800

/**
 * 查询单个 Key 的每日 Token 消耗。
 * 接口已开启 CORS（access-control-allow-origin: *），浏览器可直接请求，无需后端代理。
 * Key 仅用于本次请求的 Authorization 头，不会发送到任何第三方。
 *
 * @param apiKey    形如 sk-xxxx 的请求 Key
 * @param startDate 可选，YYYY-MM-DD
 * @param endDate   可选，YYYY-MM-DD（单次区间上限约 7 天，起始不早于 30 天前）
 */
export async function fetchTokenCost(
  apiKey: string,
  startDate?: string,
  endDate?: string,
): Promise<TokenCostResponse> {
  return requestTokenCost(apiKey.trim(), startDate, endDate)
}

/**
 * 底层请求：带超时（AbortController）、网络/5xx/429 有限重试（指数退避）。
 * - 超时或网络故障：视为瞬时故障，重试 MAX_RETRIES 次后抛出友好错误。
 * - 429 / 5xx：尊重 Retry-After，否则按指数退避重试。
 * - 401 / 403：立即失败（凭证问题，重试无意义）。
 */
async function requestTokenCost(
  apiKey: string,
  startDate?: string,
  endDate?: string,
): Promise<TokenCostResponse> {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  const qs = params.toString()
  const url = `${BASE_URL}/api/usage/token/cost${qs ? `?${qs}` : ''}`

  let attempt = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let res: Response
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      })
    } catch (err) {
      clearTimeout(timer)
      const isAbort =
        controller.signal.aborted || (err instanceof Error && err.name === 'AbortError')
      const isNetErr = err instanceof TypeError // 网络层失败（无法连接 / CORS 等）
      if ((isAbort || isNetErr) && attempt < MAX_RETRIES) {
        attempt++
        await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
        continue
      }
      if (isAbort) throw new Error('请求超时，请稍后重试')
      throw new Error('网络请求失败，请检查网络连接后重试')
    } finally {
      clearTimeout(timer)
    }

    // 可重试的服务端错误：429 限流 / 5xx 内部错误
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      attempt++
      const retryAfter = Number(res.headers.get('Retry-After'))
      const backoff =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
      await delay(backoff)
      continue
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
}

/** 单次查询区间上限（接口限制：约 7 天，超过则分段） */
const MAX_RANGE_DAYS = 7

/** 分段请求的并发上限，避免瞬时大量请求冲击接口被限流 */
const MAX_CONCURRENCY = 2

/**
 * 按并发上限依次执行 items，保持结果顺序。
 * 启动 min(limit, items.length) 个 worker 抢占式消费游标。
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

/**
 * 把大区间切成多个 ≤7 天、互不重叠的子区间。
 * cur 从 start 推进到 end，每段终点取「cur+6 天」与 end 的较早者，下一段从终点+1 天起。
 */
export function splitSubRanges(start: Dayjs, end: Dayjs): [Dayjs, Dayjs][] {
  const segs: [Dayjs, Dayjs][] = []
  let cur = start
  while (!cur.isAfter(end, 'day')) {
    const segEnd = cur.add(MAX_RANGE_DAYS - 1, 'day')
    const endOfSeg = segEnd.isAfter(end, 'day') ? end : segEnd
    segs.push([cur, endOfSeg])
    cur = endOfSeg.add(1, 'day')
  }
  return segs
}

const zeroTokens = (): TokenBreakdown => ({
  input: 0,
  output: 0,
  cache: 0,
  cache_read: 0,
  cache_write: 0,
  total: 0,
})

/**
 * 合并多段查询结果为一份 TokenCostData：
 * - periods 按日期去重升序（子区间不重叠，去重仅为防御接口边界重复）
 * - summary 的 quota/cost/request_count 与 tokens 各字段逐一累加
 * - start_date/end_date 用整体大区间，currency/token_name/object 取首段
 */
export function mergeResults(
  results: TokenCostData[],
  startDate: string,
  endDate: string,
): TokenCostData {
  const first = results[0]
  const periodMap = new Map<string, Period>()
  for (const r of results) {
    for (const p of r.periods) periodMap.set(p.date, p)
  }
  const periods = Array.from(periodMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  const summary: TokenCostSummary = {
    quota: 0,
    cost: 0,
    request_count: 0,
    tokens: zeroTokens(),
  }
  for (const r of results) {
    summary.quota += r.summary.quota
    summary.cost += r.summary.cost
    summary.request_count += r.summary.request_count
    const t = r.summary.tokens
    summary.tokens.input += t.input
    summary.tokens.output += t.output
    summary.tokens.cache += t.cache
    summary.tokens.cache_read += t.cache_read
    summary.tokens.cache_write += t.cache_write
    summary.tokens.total += t.total
  }

  return { ...first, start_date: startDate, end_date: endDate, periods, summary }
}

/**
 * 查询单个 Key 在任意区间（起始不早于 30 天前）的每日 Token 消耗。
 * 内部按 ≤7 天切片，以 MAX_CONCURRENCY 并发请求再合并，绕过单次区间上限；任一切片失败则整体抛错。
 * 未指定完整区间时退化为单次请求，由接口返回默认最近 7 天。
 *
 * @param apiKey     形如 sk-xxxx 的请求 Key
 * @param startDate  YYYY-MM-DD（可选）
 * @param endDate    YYYY-MM-DD（可选）
 * @param onProgress 每完成一段触发一次，参数为 (已完成段数, 总段数)
 */
export async function fetchTokenCostRange(
  apiKey: string,
  startDate?: string,
  endDate?: string,
  onProgress?: (done: number, total: number) => void,
): Promise<TokenCostData> {
  if (!startDate || !endDate) {
    const res = await fetchTokenCost(apiKey, startDate, endDate)
    return res.data
  }
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const segs = splitSubRanges(start, end)
  const total = segs.length
  let done = 0
  const results = await mapWithConcurrency(segs, MAX_CONCURRENCY, async ([s, e]) => {
    const r = await fetchTokenCost(apiKey, s.format('YYYY-MM-DD'), e.format('YYYY-MM-DD'))
    done++
    onProgress?.(done, total)
    return r.data
  })
  return mergeResults(results, startDate, endDate)
}

/** 简单的延时工具（用于重试退避） */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
