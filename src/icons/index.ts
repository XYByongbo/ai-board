// 应用图标统一出口（团队唯一入口）
//
// 规则：所有页面 / 组件必须从 `@/icons` 导入图标，
// 禁止写 `import { XxxOutlined } from '@ant-design/icons'`。
//
// 收益：
//  1. 统一把控风格 / 尺寸 / 可访问性；
//  2. 后续换图标库或增删图标只改这一处；
//  3. 代码审查可用 `from '@ant-design/icons'` 直接 grep 出违规。

export {
  DashboardOutlined,
  DollarOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  TagOutlined,
  KeyOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  DownloadOutlined,
} from '@ant-design/icons'

import type { IconColorToken } from './tokens'

/**
 * 图标用途登记表：新增图标务必在此登记「用途 + 语义色」。
 * 这是团队审查与「图标持续优化」的索引，便于发现重复 / 歧义图标。
 */
export const ICON_REGISTRY = {
  DashboardOutlined: { usage: '顶部品牌标识', color: 'brand' as IconColorToken },
  DollarOutlined: { usage: '总花费统计', color: 'cost' as IconColorToken },
  ApiOutlined: { usage: '请求次数统计', color: 'request' as IconColorToken },
  ThunderboltOutlined: { usage: '总 Tokens 统计', color: 'token' as IconColorToken },
  TagOutlined: { usage: 'Key 名称标识', color: 'key' as IconColorToken },
  KeyOutlined: { usage: 'API Key 输入框前缀', color: 'key' as IconColorToken },
  SearchOutlined: { usage: '查询按钮', color: 'brand' as IconColorToken },
  SunOutlined: { usage: '亮色主题切换', color: 'warning' as IconColorToken },
  MoonOutlined: { usage: '暗色主题切换', color: 'brand' as IconColorToken },
  DownloadOutlined: { usage: '导出 CSV', color: 'success' as IconColorToken },
} as const

export type IconName = keyof typeof ICON_REGISTRY
