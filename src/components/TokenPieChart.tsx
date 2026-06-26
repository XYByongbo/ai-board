import { Card, Empty } from 'antd'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TokenBreakdown } from '../types'
import { formatNumber } from '../utils/format'

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#eb2f96']

export default function TokenPieChart({ tokens }: { tokens: TokenBreakdown }) {
  const data = [
    { name: '输入', value: tokens.input },
    { name: '输出', value: tokens.output },
    { name: '缓存读', value: tokens.cache_read },
    { name: '缓存写', value: tokens.cache_write },
  ].filter((d) => d.value > 0)

  return (
    <Card title="Token 占比（汇总）" style={{ height: '100%' }}>
      {data.length === 0 ? (
        <Empty description="暂无 Token 数据" style={{ padding: 48 }} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any, name: any) => [formatNumber(Number(v)), name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
