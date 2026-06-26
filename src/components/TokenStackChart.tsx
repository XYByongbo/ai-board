import { Card } from 'antd'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Period } from '../types'
import { formatCompact, formatNumber, shortDate } from '../utils/format'

const SERIES = [
  { key: 'input', name: '输入', color: '#1677ff' },
  { key: 'output', name: '输出', color: '#52c41a' },
  { key: 'cache_read', name: '缓存读', color: '#faad14' },
  { key: 'cache_write', name: '缓存写', color: '#eb2f96' },
]

export default function TokenStackChart({ periods }: { periods: Period[] }) {
  const data = periods.map((p) => ({
    date: shortDate(p.date),
    input: p.tokens.input,
    output: p.tokens.output,
    cache_read: p.tokens.cache_read,
    cache_write: p.tokens.cache_write,
  }))

  return (
    <Card title="每日 Token 构成（堆叠）">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v: any) => formatCompact(Number(v))} />
          <Tooltip formatter={(v: any, name: any) => [formatNumber(Number(v)), name]} />
          <Legend />
          {SERIES.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="tokens" fill={s.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
