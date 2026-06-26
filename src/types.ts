export interface TokenBreakdown {
  /** 输入 token */
  input: number
  /** 输出 token */
  output: number
  /** 缓存 token = cache_read + cache_write */
  cache: number
  /** 命中缓存读取 token */
  cache_read: number
  /** 写入缓存 token */
  cache_write: number
  /** 合计 = input + output + cache */
  total: number
}

export interface Period {
  /** 日期 YYYY-MM-DD */
  date: string
  /** 内部计费单位（约等于 USD×500000），人类可读金额请用 cost */
  quota: number
  /** 当日花费（币种见 currency） */
  cost: number
  /** 当日请求次数 */
  request_count: number
  tokens: TokenBreakdown
  /** 仅当天可能为 true，表示数据尚未结算完整 */
  partial?: boolean
}

export interface TokenCostSummary {
  quota: number
  cost: number
  request_count: number
  tokens: TokenBreakdown
}

export interface TokenCostData {
  /** 币种，如 CNY */
  currency: string
  start_date: string
  end_date: string
  object: string
  periods: Period[]
  summary: TokenCostSummary
  /** Key 归属名称 */
  token_name: string
}

export interface TokenCostResponse {
  data: TokenCostData
  message: string
  success: boolean
}
