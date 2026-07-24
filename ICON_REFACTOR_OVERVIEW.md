# ai-board 图标体系重构总览

> 资深开发者（Senior Developer）指导产出 · 2026-07-24

## 目标
提升团队技术能力：通过统一图标规范 + 代码质量把控，建立可长期「持续优化」的图标体系。

## 交付物

### 1. 统一出口（红线）
- 新增 `@` 路径别名（vite + tsconfig），未引入额外依赖。
- `src/icons/index.ts`：所有图标唯一入口，并附 `ICON_REGISTRY` 用途/语义色登记表。
- 规则：**禁止组件直引 `@ant-design/icons`**，代码审查可一键 grep 拦截。

### 2. 设计 Token（唯一可信源）
- `src/icons/tokens.ts`：`iconSize`（sm14/md16/lg20/xl24）、`iconColor`（与 antd 协调的语义色板）、`alpha()` hex→rgba 辅助。
- 组件不再写尺寸/颜色魔法数字。

### 3. 高级质感组件
- `src/components/IconBadge.tsx`：彩色圆角图标容器；装饰性图标默认 `aria-hidden`，可传 `title` 作 `aria-label`。

### 4. 落地到现有组件
- `App.tsx` / `QueryForm.tsx`：统一从 `@/icons` 导入。
- `SummaryCards.tsx`：统计卡用 `IconBadge` + 语义色重构，一致性与质感提升。

### 5. 团队规范文档
- `docs/ICON_GUIDE.md`：唯一入口红线、Token、可访问性规则、新增图标流程、禁止事项、**PR 图标审查清单**、持续优化路线图（hover 微动效 / 暗色模式 / ESLint 强制拦截等）。

## 验证
- `npm run build` 通过（tsc 类型检查 + vite 打包，3837 模块）。
- dev 服务器启动 HTTP 200，无报错；`@/icons` 别名解析正常。
- 代码审查红线已生效：`from '@ant-design/icons'` 直引仅存于 `src/icons/index.ts` 自身。

## 后续优化建议（见文档第 9 节）
1. `IconBadge` 增加 hover 微动效
2. `iconColor` 接入 antd `theme` 适配暗色模式
3. 用 ESLint `no-restricted-imports` 把规范变成机器强制
4. 定期扫描 `ICON_REGISTRY` 清理未使用图标，控制包体
