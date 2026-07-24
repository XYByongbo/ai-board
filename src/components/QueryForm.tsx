import { useEffect, useState } from 'react'
import { Button, Card, Checkbox, DatePicker, Input, Radio, Space, Typography } from 'antd'
import { KeyOutlined, SearchOutlined } from '@/icons'
import dayjs, { type Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const STORAGE_KEY = 'ainowork_token_key'

type RangeValue = [Dayjs | null, Dayjs | null] | null
type StorageMode = 'local' | 'session'

type QuickRange = {
  id: string
  label: string
  /** 构造区间 [start, end]（均含今天） */
  build: () => [Dayjs, Dayjs]
}

const buildRange = (days: number): [Dayjs, Dayjs] => [dayjs().subtract(days - 1, 'day'), dayjs()]

// 快捷查询区间（均含今天，且 ≤ 7 天，单次请求即可）。
// 说明：手动用 RangePicker 选择超过 7 天的区间时，api.ts 仍会自动分段多次请求。
const QUICK_RANGES: QuickRange[] = [
  { id: 'today', label: '今天', build: () => buildRange(1) },
  { id: '3d', label: '近三天', build: () => buildRange(3) },
  { id: '7d', label: '近七天', build: () => buildRange(7) },
]

/** 轻量混淆：避免 Key 以明文直接躺在 Storage 里（非加密，仅提升随意窥视门槛）。 */
function obfuscate(s: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(s)))
}
function deobfuscate(s: string): string {
  const bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** 从 localStorage / sessionStorage 读取已保存的 Key，并还原其存储范围。 */
function readStoredKey(): { key: string; scope: StorageMode } | null {
  for (const scope of ['local', 'session'] as const) {
    const store = scope === 'local' ? localStorage : sessionStorage
    const raw = store.getItem(STORAGE_KEY)
    if (raw) {
      try {
        return { key: deobfuscate(raw), scope }
      } catch {
        store.removeItem(STORAGE_KEY)
        return null
      }
    }
  }
  return null
}

function writeStoredKey(key: string, scope: StorageMode) {
  const store = scope === 'local' ? localStorage : sessionStorage
  const other = scope === 'local' ? sessionStorage : localStorage
  store.setItem(STORAGE_KEY, obfuscate(key))
  other.removeItem(STORAGE_KEY) // 两种范围互斥，避免重复留存
}

function clearStoredKey() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

interface Props {
  loading: boolean
  onQuery: (key: string, start?: string, end?: string) => void
}

export default function QueryForm({ loading, onQuery }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [remember, setRemember] = useState(false)
  const [saveScope, setSaveScope] = useState<StorageMode>('local')
  const [range, setRange] = useState<RangeValue>([dayjs().subtract(6, 'day'), dayjs()])

  useEffect(() => {
    const stored = readStoredKey()
    if (stored) {
      setApiKey(stored.key)
      setRemember(true)
      setSaveScope(stored.scope)
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
    if (remember) writeStoredKey(key, saveScope)
    else clearStoredKey()
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
    return start != null && end != null && start.isSame(bs, 'day') && end.isSame(be, 'day')
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
          {remember && (
            <Radio.Group
              value={saveScope}
              onChange={(e) => setSaveScope(e.target.value)}
              optionType="button"
              size="small"
            >
              <Radio value="local">本机长期</Radio>
              <Radio value="session">本次会话</Radio>
            </Radio.Group>
          )}
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
          Key 仅保存在你的浏览器本地（已做基础混淆，非明文），直接请求官方接口，不经任何第三方。
          勾选「记住 Key」会写入本地存储：选「本机长期」用
          localStorage（公共电脑请勿勾选），选「本次会话」用
          sessionStorage（关闭标签页即清除）。查询区间起始不早于 30 天前；超过 7
          天的区间会自动分段多次请求； 不选区间则默认最近 7 天。
        </Typography.Text>
      </Space>
    </Card>
  )
}
