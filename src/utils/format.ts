/** 千分位完整数字，如 152,088,307 */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** 紧凑数字，用于坐标轴/卡片，如 152.09M */
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

/** 金额，如 ¥2,262.32 */
export function formatCurrency(n: number, currency = 'CNY'): string {
  const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : ''
  return (
    symbol +
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  )
}

/** '2026-06-19' -> '06-19' */
export function shortDate(d: string): string {
  return d.length >= 10 ? d.slice(5) : d
}
