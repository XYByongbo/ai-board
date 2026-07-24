import { Card, Col, Row, Statistic, Tag, Tooltip } from 'antd'
import { DollarOutlined, ApiOutlined, ThunderboltOutlined, TagOutlined } from '@/icons'
import IconBadge from '@/components/IconBadge'
import type { TokenCostData } from '../types'
import { formatCompact, formatNumber } from '../utils/format'

export default function SummaryCards({ data }: { data: TokenCostData }) {
  const s = data.summary
  const symbol = data.currency === 'CNY' ? '¥' : data.currency === 'USD' ? '$' : ''
  const hasPartial = data.periods.some((p) => p.partial)

  return (
    <Row gutter={[16, 16]}>
      {/* 总花费 */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <IconBadge color="cost">
              <DollarOutlined />
            </IconBadge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Statistic
                title={`总花费（${data.currency}）`}
                value={s.cost}
                precision={2}
                prefix={symbol}
                valueStyle={{ color: '#cf1322' }}
              />
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            {data.start_date} ~ {data.end_date}
            {hasPartial && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                含进行中
              </Tag>
            )}
          </div>
        </Card>
      </Col>

      {/* 请求次数 */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <IconBadge color="request">
              <ApiOutlined />
            </IconBadge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Statistic title="请求次数" value={s.request_count} />
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>累计请求数</div>
        </Card>
      </Col>

      {/* 总 Tokens */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <IconBadge color="token">
              <ThunderboltOutlined />
            </IconBadge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={`${formatNumber(s.tokens.total)} tokens`}>
                <Statistic title="总 Tokens" value={formatCompact(s.tokens.total)} />
              </Tooltip>
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            缓存读 {formatCompact(s.tokens.cache_read)} · 输出 {formatCompact(s.tokens.output)}
          </div>
        </Card>
      </Col>

      {/* Key 名称 */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <IconBadge color="key">
              <TagOutlined />
            </IconBadge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Statistic title="Key 名称" value={data.token_name} valueStyle={{ fontSize: 16 }} />
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>当前查询的 Key 归属</div>
        </Card>
      </Col>
    </Row>
  )
}
