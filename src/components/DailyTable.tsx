import { Button, Card, Table, Tag, type TableColumnsType } from 'antd'
import { DownloadOutlined } from '@/icons'
import dayjs from 'dayjs'
import type { Period, TokenCostSummary } from '../types'
import { formatCurrency, formatNumber } from '../utils/format'

interface Props {
  periods: Period[]
  summary: TokenCostSummary
  currency: string
}

export default function DailyTable({ periods, summary, currency }: Props) {
  const num = (v: number) => formatNumber(v)

  const exportCsv = () => {
    const header = [
      '日期',
      `花费(${currency})`,
      '请求数',
      '输入',
      '输出',
      '缓存读',
      '缓存写',
      '合计Tokens',
    ]
    const rows = periods.map((p) => [
      p.partial ? `${p.date} (进行中)` : p.date,
      p.cost.toFixed(2),
      p.request_count,
      p.tokens.input,
      p.tokens.output,
      p.tokens.cache_read,
      p.tokens.cache_write,
      p.tokens.total,
    ])
    const summaryRow = [
      '合计',
      summary.cost.toFixed(2),
      summary.request_count,
      summary.tokens.input,
      summary.tokens.output,
      summary.tokens.cache_read,
      summary.tokens.cache_write,
      summary.tokens.total,
    ]
    const csv = [header, ...rows, summaryRow]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    // 前置 BOM，保证 Excel 正确识别 UTF-8（中文不乱码）
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `token-cost-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
    {
      title: '缓存读',
      dataIndex: ['tokens', 'cache_read'],
      key: 'cache_read',
      align: 'right',
      render: num,
    },
    {
      title: '缓存写',
      dataIndex: ['tokens', 'cache_write'],
      key: 'cache_write',
      align: 'right',
      render: num,
    },
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
    <Card
      title="每日明细"
      extra={
        <Button
          size="small"
          icon={<DownloadOutlined />}
          onClick={exportCsv}
          disabled={periods.length === 0}
        >
          导出 CSV
        </Button>
      }
    >
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
              <Table.Summary.Cell index={3} align="right">
                {num(summary.tokens.input)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                {num(summary.tokens.output)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                {num(summary.tokens.cache_read)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                {num(summary.tokens.cache_write)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong>{num(summary.tokens.total)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Card>
  )
}
