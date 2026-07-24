import { Card, Typography } from 'antd'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Period } from '../types'
import { formatCompact, formatCurrency, shortDate } from '../utils/format'
import { chartColor } from '@/icons/tokens'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  periods: Period[]
  currency: string
}

/** recharts 自定义 dot 的 props（避免 any，仅取用到的字段） */
interface DotProps {
  cx?: number
  cy?: number
  index?: number
  payload?: { partial?: boolean }
}

export default function CostTrendChart({ periods, currency }: Props) {
  const reduced = useReducedMotion()
  const data = periods.map((p) => ({
    date: shortDate(p.date),
    cost: Number(p.cost.toFixed(4)),
    partial: !!p.partial,
  }))

  // 今日（partial）用橙色实心点标出
  const renderDot = (props: DotProps) => {
    const { cx, cy, payload, index } = props
    if (typeof cx !== 'number' || typeof cy !== 'number') return <g key={`g-${index}`} />
    return payload?.partial ? (
      <circle
        key={`d-${index}`}
        cx={cx}
        cy={cy}
        r={5}
        fill={chartColor.partial}
        stroke="#fff"
        strokeWidth={2}
      />
    ) : (
      <circle key={`d-${index}`} cx={cx} cy={cy} r={3} fill={chartColor.cost} />
    )
  }

  return (
    <Card title="每日花费趋势">
      <div role="img" aria-label={`每日花费趋势面积图，共 ${periods.length} 天`}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor.cost} stopOpacity={0.7} />
                <stop offset="95%" stopColor={chartColor.cost} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => formatCompact(Number(v))} />
            <Tooltip formatter={(v) => [formatCurrency(Number(v), currency), '花费']} />
            <Area
              type="monotone"
              dataKey="cost"
              stroke={chartColor.cost}
              strokeWidth={2}
              fill="url(#costColor)"
              dot={renderDot}
              activeDot={{ r: 6 }}
              isAnimationActive={!reduced}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        橙色点为今日数据（进行中，尚未结算完整）。
      </Typography.Text>
    </Card>
  )
}
