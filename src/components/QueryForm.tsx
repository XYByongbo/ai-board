import { useEffect, useState } from 'react'
import { Button, Card, Checkbox, DatePicker, Input, Space, Typography } from 'antd'
import { KeyOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const STORAGE_KEY = 'ainowork_token_key'

type RangeValue = [Dayjs | null, Dayjs | null] | null

type QuickRange = {
  id: string
  label: string
  /** 构造区间 [start, end]（均含今天） */
  build: () => [Dayjs, Dayjs]
}

const buildRange = (days: number): [Dayjs, Dayjs] => [
  dayjs().subtract(days - 1, 'day'),
  dayjs(),
]

// 快捷查询区间（均含今天）。「当月/近三十天」超过 7 天，会自动分段多次请求。
const QUICK_RANGES: QuickRange[] = [
  { id: 'today', label: '今天', build: () => buildRange(1) },
  { id: '3d', label: '近三天', build: () => buildRange(3) },
  { id: '7d', label: '近七天', build: () => buildRange(7) },
  { id: 'thisMonth', label: '当月', build: () => [dayjs().startOf('month'), dayjs()] },
  { id: 'last30', label: '近三十天', build: () => [dayjs().subtract(29, 'day'), dayjs()] },
]

interface Props {
  loading: boolean
  onQuery: (key: string, start?: string, end?: string) => void
}

export default function QueryForm({ loading, onQuery }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [remember, setRemember] = useState(false)
  const [range, setRange] = useState<RangeValue>([dayjs().subtract(6, 'day'), dayjs()])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setApiKey(saved)
      setRemember(true)
    }
  }, [])

  const disabledDate = (current: Dayjs) => {
    // 不能晚于今天，不能早于 30 天前（实测接口允许的范围）
    if (current > dayjs().endOf('day')) return true
    if (current < dayjs().subtract(30, 'day').startOf('day')) return true
    return false
  }

  const runQuery = (queryRange: RangeValue) => {
    const key = apiKey.trim()
    if (!key) return
    if (remember) localStorage.setItem(STORAGE_KEY, key)
    else localStorage.removeItem(STORAGE_KEY)
    const start = queryRange?.[0]?.format('YYYY-MM-DD')
    const end = queryRange?.[1]?.format('YYYY-MM-DD')
    onQuery(key, start, end)
  }

  const handleQuery = () => runQuery(range)

  // 点击快捷按钮：直接设置区间并立即查询（用 next 而非 state，避免 setState 异步取到旧值）
  const handleQuick = (build: () => [Dayjs, Dayjs]) => {
    const next = build()
    setRange(next)
    runQuery(next)
  }

  // 当前区间命中的快捷项（两端均与某项 build() 同日才算选中），用于高亮按钮
  const activeQuick = QUICK_RANGES.find(({ build }) => {
    const [start, end] = range ?? [null, null]
    const [bs, be] = build()
    return (
      start != null &&
      end != null &&
      start.isSame(bs, 'day') &&
      end.isSame(be, 'day')
    )
  })?.id

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Input.Password
          size="large"
          prefix={<KeyOutlined />}
          placeholder="输入你的 API Key（sk-...）"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onPressEnter={handleQuery}
          allowClear
        />
        <Space wrap size="middle">
          <Space.Compact>
            {QUICK_RANGES.map(({ id, label, build }) => (
              <Button
                key={id}
                type={activeQuick === id ? 'primary' : 'default'}
                loading={loading && activeQuick === id}
                disabled={!apiKey.trim()}
                onClick={() => handleQuick(build)}
              >
                {label}
              </Button>
            ))}
          </Space.Compact>
          <RangePicker
            value={range}
            disabledDate={disabledDate}
            onChange={(val) => setRange(val as RangeValue)}
            allowClear
          />
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            记住 Key
          </Checkbox>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            disabled={!apiKey.trim()}
            onClick={handleQuery}
          >
            查询
          </Button>
        </Space>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Key 仅保存在你的浏览器本地，直接请求官方接口，不经任何第三方；勾选「记住 Key」会写入
          localStorage（公共电脑请勿勾选）。查询区间起始不早于 30 天前；超过 7 天的区间会自动分段
          多次请求；不选区间则默认最近 7 天。
        </Typography.Text>
      </Space>
    </Card>
  )
}
