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

export default function RequestChart({ periods }: { periods: Period[] }) {
  const data = periods.map((p) => ({
    date: shortDate(p.date),
    requests: p.request_count,
    partial: !!p.partial,
  }))

  return (
    <Card title="每日请求数">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} tickFormatter={(v: any) => formatNumber(Number(v))} />
          <Tooltip formatter={(v: any) => [formatNumber(Number(v)), '请求数']} />
          <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.partial ? '#b37feb' : '#722ed1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
