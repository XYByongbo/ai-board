import { Table, Tag, type TableColumnsType } from 'antd'
import type { Period, TokenCostSummary } from '../types'
import { formatCurrency, formatNumber } from '../utils/format'

interface Props {
  periods: Period[]
  summary: TokenCostSummary
  currency: string
}

export default function DailyTable({ periods, summary, currency }: Props) {
  const num = (v: number) => formatNumber(v)

  const columns: TableColumnsType<Period> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      render: (d: string, r) => (
        <span>
          {d}
          {r.partial && (
            <Tag color="orange" style={{ marginLeft: 8 }}>
              进行中
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: `花费(${currency})`,
      dataIndex: 'cost',
      key: 'cost',
      align: 'right',
      sorter: (a, b) => a.cost - b.cost,
      render: (v: number) => formatCurrency(v, currency),
    },
    {
      title: '请求数',
      dataIndex: 'request_count',
      key: 'request_count',
      align: 'right',
      sorter: (a, b) => a.request_count - b.request_count,
      render: num,
    },
    { title: '输入', dataIndex: ['tokens', 'input'], key: 'input', align: 'right', render: num },
    { title: '输出', dataIndex: ['tokens', 'output'], key: 'output', align: 'right', render: num },
    { title: '缓存读', dataIndex: ['tokens', 'cache_read'], key: 'cache_read', align: 'right', render: num },
    { title: '缓存写', dataIndex: ['tokens', 'cache_write'], key: 'cache_write', align: 'right', render: num },
    {
      title: '合计 Tokens',
      dataIndex: ['tokens', 'total'],
      key: 'total',
      align: 'right',
      sorter: (a, b) => a.tokens.total - b.tokens.total,
      render: num,
    },
  ]

  return (
    <Table<Period>
      rowKey="date"
      columns={columns}
      dataSource={periods}
      pagination={false}
      size="middle"
      scroll={{ x: 'max-content' }}
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <strong>合计</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <strong>{formatCurrency(summary.cost, currency)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
              <strong>{num(summary.request_count)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">{num(summary.tokens.input)}</Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">{num(summary.tokens.output)}</Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right">{num(summary.tokens.cache_read)}</Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="right">{num(summary.tokens.cache_write)}</Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="right">
              <strong>{num(summary.tokens.total)}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  )
}
