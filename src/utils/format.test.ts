import { describe, it, expect } from 'vitest'
import { formatCompact, formatCurrency, formatNumber } from './format'

describe('formatCompact', () => {
  it('大数用 B/M/K 紧凑表示', () => {
    expect(formatCompact(152_088_307)).toBe('152.09M')
    expect(formatCompact(1_500)).toBe('1.5K')
    expect(formatCompact(999)).toBe('999')
    expect(formatCompact(2_000_000_000)).toBe('2.00B')
  })
})

describe('formatCurrency', () => {
  it('CNY / USD 带符号，其它币种无符号', () => {
    expect(formatCurrency(2262.32, 'CNY')).toBe('¥2,262.32')
    expect(formatCurrency(10, 'USD')).toBe('$10.00')
    expect(formatCurrency(10, 'EUR')).toBe('10.00')
  })
})

describe('formatNumber', () => {
  it('千分位整数', () => {
    expect(formatNumber(152_088_307)).toBe('152,088,307')
    expect(formatNumber(0)).toBe('0')
  })
})
