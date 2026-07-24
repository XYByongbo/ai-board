# 图标规范（Icon Guidelines）

> 团队统一图标标准。本文件是「图标持续优化」的可信源与审查依据。
> 维护人：资深开发（Senior Developer）。新增 / 修改图标前请通读本文件。

---

## 1. 为什么要有规范

早期图标分散在各个组件里直接 `from '@ant-design/icons'`，导致：风格漂移、尺寸不一、无色彩语义、新人无据可依。
统一规范后，图标成为**可审查、可演进**的资产，而非随写随丢的碎片——这是团队技术能力沉淀的第一步。

## 2. 唯一入口原则（红线）

**所有页面 / 组件必须从 `@/icons` 导入图标，禁止直接 `import ... from '@ant-design/icons'`。**

```ts
// ✅ 正确
import { DollarOutlined } from '@/icons'

// ❌ 违规（代码审查直接打回）
import { DollarOutlined } from '@ant-design/icons'
```

- 统一出口：`src/icons/index.ts` —— 在此再导出图标，并在 `ICON_REGISTRY` 登记用途与语义色。
- 尺寸 / 颜色：`src/icons/tokens.ts` —— 全局唯一 Token 源。
- 可视化容器：`src/components/IconBadge.tsx` —— 统计卡等关键图标的高级质感容器。

> 别名 `@` 已在 `vite.config.ts` 与 `tsconfig.json` 配置，构建期与类型检查均生效。

## 3. 尺寸 Token（禁止魔法数字）

组件里一律用 `iconSize` 的 token 名，不要写裸数字：

| Token | 像素 | 典型场景 |
|-------|------|----------|
| `sm`  | 14   | 表格内、密集列表 |
| `md`  | 16   | 按钮、表单前缀（antd 默认） |
| `lg`  | 20   | 正文内联、导航 |
| `xl`  | 24   | 大标题、空状态 |

## 4. 语义色板（颜色要传达含义）

`iconColor` 与 antd 5 主色协调。**选色原则：颜色表达数据语义，而非单纯装饰。**

| Token | 色值 | 含义 |
|-------|------|------|
| `brand`   | `#1677ff` | 品牌主色 |
| `cost`    | `#cf1322` | 花费（红 = 支出/警示） |
| `request` | `#1677ff` | 请求（蓝） |
| `token`   | `#722ed1` | token（紫 = 算力） |
| `key`     | `#13c2c2` | key（青 = 凭证） |
| `success` | `#52c41a` | 成功 |
| `warning` | `#faad14` | 警告 |
| `muted`   | `#8c8c8c` | 弱化/禁用 |

> 辅助函数 `alpha(hex, a)` 已提供（hex→rgba），用于生成容器底色，兼容老浏览器。

## 5. 可访问性（a11y）规则

- **装饰性图标**（含义已由相邻文字表达，如图标+文字标题）：默认 `aria-hidden`，无需额外处理。
- **功能性图标**（图标本身即含义，如独立图标按钮）：必须提供 `aria-label` 或可见文字。
- `IconBadge` 已内置该逻辑：传 `title` 即作为 `aria-label` 暴露给读屏；不传则自动 `aria-hidden`。

## 6. 新增图标流程

1. 在 `@ant-design/icons` 确认图标存在；
2. 在 `src/icons/index.ts` 的再导出列表中加入该图标；
3. 在 `ICON_REGISTRY` 登记 `{ usage, color }`（说明用途 + 选语义色）；
4. 组件里 `import { Xxx } from '@/icons'` 使用；尺寸/颜色一律走 Token。

## 7. 禁止事项

- ❌ 组件内直接 `from '@ant-design/icons'`
- ❌ 写裸尺寸 / 裸色值（如 `fontSize: 18`、`color: '#f00'`）
- ❌ 同一个含义用多个不同图标（造成用户认知混乱）
- ❌ 用 emoji 当图标混用
- ❌ 引入第二个图标库（除非经团队评审，避免包体膨胀与风格冲突）

## 8. PR 图标审查清单（代码质量把控）

每次涉及图标的改动，审查人逐条核对：

- [ ] 图标均从 `@/icons` 导入（grep 无 `@ant-design/icons` 直引）
- [ ] 尺寸使用 `iconSize` token
- [ ] 颜色使用 `iconColor` token 或 `alpha()`
- [ ] 若为功能性图标，已提供可访问性标签
- [ ] 新增图标已在 `ICON_REGISTRY` 登记
- [ ] 语义色与数据含义一致（如花费=红）
- [ ] 与既有图标风格统一、无重复语义

## 9. 持续优化路线图（下一步可做）

本规范打下地基，以下为后续迭代方向（按需排期，不阻塞当前）：

1. **视觉升级**：`IconBadge` 增加 hover 微动效（底色加深 / 轻微位移），强化 premium 质感。
2. **图标驱动信息架构**：图表卡片统一图标标识、空状态插画图标、快捷区间图标化。
3. **暗色模式**：`iconColor` 接入 antd `theme` 算法，自动适配暗色主题。
4. **用量审计**：定期扫描 `ICON_REGISTRY` 与组件引用，清理未使用图标，控制包体。
5. **Lint 规则**：用 ESLint `no-restricted-imports` 自动拦截 `@ant-design/icons` 直引，把规范变成机器强制。

---
*本文件随图标体系演进持续更新。任何修改请同步更新 `ICON_REGISTRY`。*
