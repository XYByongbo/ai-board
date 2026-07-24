import { Card } from 'antd'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Period } from '../types'
import { formatNumber, shortDate } from '../utils/format'
import { chartColor } from '@/icons/tokens'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function RequestChart({ periods }: { periods: Period[] }) {
  const reduced = useReducedMotion()
  const data = periods.map((p) => ({
    date: shortDate(p.date),
    requests: p.request_count,
    partial: !!p.partial,
  }))

  return (
    <Card title="每日请求数">
      <div role="img" aria-label={`每日请求数柱状图，共 ${periods.length} 天`}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip formatter={(v) => [formatNumber(Number(v)), '请求数']} />
            <Bar dataKey="requests" radius={[4, 4, 0, 0]} isAnimationActive={!reduced}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.partial ? chartColor.requestToday : chartColor.request} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
