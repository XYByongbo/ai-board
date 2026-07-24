// 图标设计 Token —— 团队统一标准，禁止在组件里写图标尺寸/颜色的魔法数字。
// 这是「图标持续优化」的唯一可信源：改这里即全局生效。

/** 图标尺寸阶梯。组件一律用 token 名，不要写 14 / 16 / 20 这类裸数字。 */
export const iconSize = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const

export type IconSizeToken = keyof typeof iconSize

/**
 * 语义色板：与 antd 5 主色协调，用于图标容器底色 / 强调色。
 * 选色原则：颜色要传达数据含义（如「花费」用红表警示），而非单纯好看。
 */
export const iconColor = {
  brand: '#1677ff', // 品牌主色
  cost: '#cf1322', // 花费（红 = 支出/警示）
  request: '#1677ff', // 请求（蓝 = 品牌延伸）
  token: '#722ed1', // token（紫 = 算力）
  key: '#13c2c2', // key（青 = 凭证）
  success: '#52c41a',
  warning: '#faad14',
  muted: '#8c8c8c',
} as const

export type IconColorToken = keyof typeof iconColor

/**
 * 图表品牌色板：与 iconColor 共用同一套品牌色，保证「图标 + 图表」视觉一致。
 * 图表组件一律从这里取色，禁止在图表里写死 #1677ff 这类魔法色值。
 * 改这一处即可全局统一图表配色（含暗色模式下的对比度协调）。
 */
export const chartColor = {
  input: '#1677ff', // 输入（蓝 = 品牌）
  output: '#52c41a', // 输出（绿 = 完成）
  cacheRead: '#faad14', // 缓存读（橙 = 命中）
  cacheWrite: '#eb2f96', // 缓存写（品红 = 写入）
  cost: '#1677ff', // 花费趋势（蓝）
  request: '#722ed1', // 请求（紫 = 算力）
  partial: '#faad14', // 进行中数据点（橙）
  requestToday: '#b37feb', // 当日请求（浅紫）
} as const

export type ChartColorToken = keyof typeof chartColor

/** 16 进制转带透明度 rgba，兼容老浏览器，避免依赖 color-mix。 */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
