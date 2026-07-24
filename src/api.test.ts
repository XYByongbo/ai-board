import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import { splitSubRanges, mergeResults } from './api'
import type { Period, TokenBreakdown, TokenCostData } from './types'

function tokens(p: Partial<TokenBreakdown> = {}): TokenBreakdown {
  return {
    input: 0,
    output: 0,
    cache: 0,
    cache_read: 0,
    cache_write: 0,
    total: 0,
    ...p,
  }
}

function period(
  date: string,
  cost: number,
  request: number,
  t: Partial<TokenBreakdown> = {},
): Period {
  return { date, quota: 0, cost, request_count: request, tokens: tokens(t) }
}

function data(periods: Period[]): TokenCostData {
  return {
    currency: 'CNY',
    start_date: periods[0]?.date ?? '',
    end_date: periods[periods.length - 1]?.date ?? '',
    object: 'usage',
    token_name: 'test-key',
    periods,
    summary: {
      quota: 0,
      cost: periods.reduce((s, p) => s + p.cost, 0),
      request_count: periods.reduce((s, p) => s + p.request_count, 0),
      tokens: periods.reduce(
        (acc, p) => ({
          input: acc.input + p.tokens.input,
          output: acc.output + p.tokens.output,
          cache: acc.cache + p.tokens.cache,
          cache_read: acc.cache_read + p.tokens.cache_read,
          cache_write: acc.cache_write + p.tokens.cache_write,
          total: acc.total + p.tokens.total,
        }),
        tokens(),
      ),
    },
  }
}

describe('splitSubRanges', () => {
  it('把 20 天区间切成 3 段（每段 ≤7 天）', () => {
    const segs = splitSubRanges(dayjs('2026-01-01'), dayjs('2026-01-20'))
    expect(segs).toHaveLength(3)
    expect(segs[0][0].format('YYYY-MM-DD')).toBe('2026-01-01')
    expect(segs[0][1].format('YYYY-MM-DD')).toBe('2026-01-07')
    expect(segs[1][1].format('YYYY-MM-DD')).toBe('2026-01-14')
    expect(segs[2][0].format('YYYY-MM-DD')).toBe('2026-01-15')
    expect(segs[2][1].format('YYYY-MM-DD')).toBe('2026-01-20')
  })

  it('单段区间不切片', () => {
    const segs = splitSubRanges(dayjs('2026-03-01'), dayjs('2026-03-05'))
    expect(segs).toHaveLength(1)
    expect(segs[0][1].format('YYYY-MM-DD')).toBe('2026-03-05')
  })

  it('正好 7 天只产生 1 段', () => {
    const segs = splitSubRanges(dayjs('2026-03-01'), dayjs('2026-03-07'))
    expect(segs).toHaveLength(1)
  })
})

describe('mergeResults', () => {
  it('合并两段：periods 去重升序、summary 累加', () => {
    const a = data([period('2026-01-01', 10, 1, { input: 100, output: 50, total: 150 })])
    const b = data([period('2026-01-02', 20, 2, { input: 200, output: 80, total: 280 })])
    const merged = mergeResults([a, b], '2026-01-01', '2026-01-02')

    expect(merged.periods.map((p) => p.date)).toEqual(['2026-01-01', '2026-01-02'])
    expect(merged.summary.cost).toBe(30)
    expect(merged.summary.request_count).toBe(3)
    expect(merged.summary.tokens.input).toBe(300)
    expect(merged.summary.tokens.output).toBe(130)
    expect(merged.summary.tokens.total).toBe(430)
    expect(merged.currency).toBe('CNY')
    expect(merged.token_name).toBe('test-key')
  })

  it('重叠日期只保留一份（取后者），其余字段照常累加', () => {
    const a = data([period('2026-01-01', 10, 1, { input: 100, total: 100 })])
    const b = data([period('2026-01-01', 5, 1, { input: 40, total: 40 })])
    const merged = mergeResults([a, b], '2026-01-01', '2026-01-01')
    expect(merged.periods).toHaveLength(1)
    // summary 仍累加两段（防御性）
    expect(merged.summary.cost).toBe(15)
    expect(merged.summary.tokens.input).toBe(140)
  })
})
