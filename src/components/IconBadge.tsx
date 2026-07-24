import type { ReactNode } from 'react'
import { iconSize, iconColor, alpha, type IconColorToken, type IconSizeToken } from '@/icons/tokens'

interface IconBadgeProps {
  /** antd 图标节点，如 <DollarOutlined /> */
  children: ReactNode
  /** 语义色（见 iconColor），决定容器底色与图标色 */
  color?: IconColorToken
  /** 尺寸 token（见 iconSize），默认 lg */
  size?: IconSizeToken
  /**
   * 可访问性标签。
   * - 省略（默认）：图标为纯装饰，设 aria-hidden=true；
   * - 传入文字：图标承载含义，作为 aria-label 暴露给读屏软件。
   */
  title?: string
}

const BOX: Record<IconSizeToken, number> = { sm: 32, md: 36, lg: 44, xl: 52 }

/**
 * 彩色圆角图标容器：让统计卡等关键图标拥有一致的高级质感。
 * 所有视觉变量来自 tokens，禁止在此写死颜色 / 尺寸。
 */
export default function IconBadge({
  children,
  color = 'brand',
  size = 'lg',
  title,
}: IconBadgeProps) {
  const c = iconColor[color]
  return (
    <span
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: BOX[size],
        height: BOX[size],
        borderRadius: 12,
        fontSize: iconSize[size],
        lineHeight: 1,
        color: c,
        background: alpha(c, 0.12),
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  )
}
