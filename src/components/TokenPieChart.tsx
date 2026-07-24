import { Card, Empty } from 'antd'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TokenBreakdown } from '../types'
import { formatNumber } from '../utils/format'
import { chartColor } from '@/icons/tokens'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COLORS = [chartColor.input, chartColor.output, chartColor.cacheRead, chartColor.cacheWrite]

export default function TokenPieChart({ tokens }: { tokens: TokenBreakdown }) {
  const reduced = useReducedMotion()
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
        <div role="img" aria-label="Token 类型占比环形图">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                isAnimationActive={!reduced}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [formatNumber(Number(v)), name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
