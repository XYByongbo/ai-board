import { useEffect, useState } from 'react'
import { Button, Card, Checkbox, DatePicker, Input, Space, Typography } from 'antd'
import { KeyOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const STORAGE_KEY = 'ainowork_token_key'

type RangeValue = [Dayjs | null, Dayjs | null] | null

// 快捷查询区间（含今天，days 为天数）
const QUICK_RANGES = [
  { label: '今天', days: 1 },
  { label: '近三天', days: 3 },
  { label: '近七天', days: 7 },
]

const buildRange = (days: number): RangeValue => [dayjs().subtract(days - 1, 'day'), dayjs()]

interface Props {
  loading: boolean
  onQuery: (key: string, start?: string, end?: string) => void
}

export default function QueryForm({ loading, onQuery }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [remember, setRemember] = useState(false)
  const [range, setRange] = useState<RangeValue>([dayjs().subtract(6, 'day'), dayjs()])
  // 选择过程中的临时值，用于把可选区间限制在 7 天内
  const [picking, setPicking] = useState<RangeValue>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setApiKey(saved)
      setRemember(true)
    }
  }, [])

  const disabledDate = (current: Dayjs) => {
    // 不能晚于今天，不能早于 30 天前（接口限制）
    if (current > dayjs().endOf('day')) return true
    if (current < dayjs().subtract(30, 'day').startOf('day')) return true
    // 选择中：与已选端点相距超过 6 天（即区间 > 7 天）的日期不可选
    const anchor = picking?.[0] ?? picking?.[1] ?? null
    if (anchor && Math.abs(current.diff(anchor, 'day')) > 6) return true
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
  const handleQuick = (days: number) => {
    const next = buildRange(days)
    setRange(next)
    runQuery(next)
  }

  // 当前区间命中的快捷天数（截止今天、起点匹配才算选中），用于高亮按钮
  const activeQuick = QUICK_RANGES.find(({ days }) => {
    const [start, end] = range ?? [null, null]
    return (
      start != null &&
      end != null &&
      end.isSame(dayjs(), 'day') &&
      start.isSame(dayjs().subtract(days - 1, 'day'), 'day')
    )
  })?.days

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
            {QUICK_RANGES.map(({ label, days }) => (
              <Button
                key={days}
                type={activeQuick === days ? 'primary' : 'default'}
                loading={loading && activeQuick === days}
                disabled={!apiKey.trim()}
                onClick={() => handleQuick(days)}
              >
                {label}
              </Button>
            ))}
          </Space.Compact>
          <RangePicker
            value={range}
            disabledDate={disabledDate}
            onCalendarChange={(val) => setPicking(val as RangeValue)}
            onChange={(val) => setRange(val as RangeValue)}
            onOpenChange={(open) => setPicking(open ? [null, null] : null)}
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
          localStorage（公共电脑请勿勾选）。查询区间 ≤7 天，起始不早于 30 天前；不选区间则默认最近 7 天。
        </Typography.Text>
      </Space>
    </Card>
  )
}
