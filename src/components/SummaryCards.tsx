import { Card, Col, Row, Statistic, Tag, Tooltip } from 'antd'
import {
  DollarOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  TagOutlined,
} from '@ant-design/icons'
import type { TokenCostData } from '../types'
import { formatCompact, formatNumber } from '../utils/format'

export default function SummaryCards({ data }: { data: TokenCostData }) {
  const s = data.summary
  const symbol = data.currency === 'CNY' ? '¥' : data.currency === 'USD' ? '$' : ''
  const hasPartial = data.periods.some((p) => p.partial)

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={
              <span>
                <DollarOutlined /> 总花费（{data.currency}）
              </span>
            }
            value={s.cost}
            precision={2}
            prefix={symbol}
            valueStyle={{ color: '#cf1322' }}
          />
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

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={
              <span>
                <ApiOutlined /> 请求次数
              </span>
            }
            value={s.request_count}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>累计请求数</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Tooltip title={`${formatNumber(s.tokens.total)} tokens`}>
            <Statistic
              title={
                <span>
                  <ThunderboltOutlined /> 总 Tokens
                </span>
              }
              value={formatCompact(s.tokens.total)}
            />
          </Tooltip>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            缓存读 {formatCompact(s.tokens.cache_read)} · 输出 {formatCompact(s.tokens.output)}
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={
              <span>
                <TagOutlined /> Key 名称
              </span>
            }
            value={data.token_name}
            valueStyle={{ fontSize: 16 }}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>当前查询的 Key 归属</div>
        </Card>
      </Col>
    </Row>
  )
}
