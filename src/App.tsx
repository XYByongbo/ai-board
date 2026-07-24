import { lazy, Suspense, useState } from 'react'
import { Alert, Button, Card, Col, Empty, Layout, Row, Space, Spin, Typography } from 'antd'
import { DashboardOutlined, MoonOutlined, SunOutlined } from '@/icons'
import { useTheme } from '@/theme'
import QueryForm from './components/QueryForm'
import SummaryCards from './components/SummaryCards'
import DailyTable from './components/DailyTable'
import { fetchTokenCostRange } from './api'
import type { TokenCostData } from './types'

// 图表组件体积较大（recharts ≈400KB），按需懒加载以缩小首屏 JS。
const CostTrendChart = lazy(() => import('./components/CostTrendChart'))
const TokenStackChart = lazy(() => import('./components/TokenStackChart'))
const RequestChart = lazy(() => import('./components/RequestChart'))
const TokenPieChart = lazy(() => import('./components/TokenPieChart'))

const { Header, Content, Footer } = Layout

export default function App() {
  const { mode, toggle } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TokenCostData | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const handleQuery = async (key: string, start?: string, end?: string) => {
    setLoading(true)
    setError(null)
    setProgress(null)
    try {
      const res = await fetchTokenCostRange(key, start, end, (done, total) =>
        setProgress({ done, total }),
      )
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误')
      setData(null)
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: mode === 'dark' ? '#141414' : '#f5f5f5',
      }}
    >
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
          <DashboardOutlined /> Token 消耗看板
        </Typography.Title>
        <Button
          type="text"
          icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggle}
          style={{ color: '#fff' }}
          aria-label={mode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        />
      </Header>

      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <QueryForm loading={loading} onQuery={handleQuery} />

            {error && (
              <Alert
                type="error"
                showIcon
                message="查询失败"
                description={error}
                closable
                onClose={() => setError(null)}
              />
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: 64 }}>
                <Spin
                  size="large"
                  tip={progress ? `查询中 ${progress.done}/${progress.total} 段...` : '查询中...'}
                >
                  <div style={{ height: 80 }} />
                </Spin>
              </div>
            )}

            {!loading && data && (
              <>
                <SummaryCards data={data} />
                <DailyTable
                  periods={data.periods}
                  summary={data.summary}
                  currency={data.currency}
                />
                <Suspense
                  fallback={
                    <Card>
                      <div style={{ textAlign: 'center', padding: 64 }}>
                        <Spin />
                      </div>
                    </Card>
                  }
                >
                  <CostTrendChart periods={data.periods} currency={data.currency} />
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={16}>
                      <TokenStackChart periods={data.periods} />
                    </Col>
                    <Col xs={24} lg={8}>
                      <TokenPieChart tokens={data.summary.tokens} />
                    </Col>
                  </Row>
                  <RequestChart periods={data.periods} />
                </Suspense>
              </>
            )}

            {!loading && !data && !error && (
              <Card>
                <Empty
                  description="输入 API Key 后点击「查询」查看 Token 消耗"
                  style={{ padding: 48 }}
                />
              </Card>
            )}
          </Space>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', color: '#999' }}>
        纯前端 · 数据直连官方接口 hk.ainowork.ai · Key 不出本机
      </Footer>
    </Layout>
  )
}
