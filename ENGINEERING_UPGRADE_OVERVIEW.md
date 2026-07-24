# ai-board 工程化全量优化总览（2026-07-24）

> 资深开发视角：按项目评估结论，把 P0/P1/P2 共 10 项改进全部落地。
> 验证：`npm run test` 8/8 通过 · `npm run lint` 0 error/0 warning · `npm run build` 通过（tsc 0 错误，图表已拆懒加载 chunk）。

## P0 — 团队能力基建（最关键）
1. **ESLint + Prettier 机器强制**
   - `.eslintrc.cjs`：`no-restricted-imports` 锁死 `@ant-design/icons` 直引（仅 `src/icons/index.ts` 豁免）→ 图标红线从「人工记忆」变「工具拦截」。
   - `@typescript-eslint/no-explicit-any: warn`、`consistent-type-imports: warn`。
   - `.prettierrc`（单引号/无分号，对齐存量风格）、`.editorconfig`。
   - package.json：新增 `lint` / `lint:fix` / `format` / `test` / `test:watch`。
2. **Vitest 单元测试**：`src/api.test.ts`（splitSubRanges / mergeResults）、`src/utils/format.test.ts`（formatCompact / formatCurrency / formatNumber），覆盖纯函数，8 用例全过。
3. **消除 `any`**：图表 `tickFormatter` / `Tooltip formatter` 去除显式 `any`；`CostTrendChart.renderDot` 用 `DotProps` 接口替代 `(props:any)`，让 `strict` 真正生效。

## P1 — 质量与高级感
4. **暗色模式**：`src/theme.tsx`（ThemeProvider + localStorage 持久化 + `data-theme`），`main.tsx` 接 `theme.darkAlgorithm`，Header 右侧 Sun/Moon 切换按钮；`src/index.css` 切背景。
5. **图表配色 Token 化**：`src/icons/tokens.ts` 新增 `chartColor`（与 `iconColor` 同品牌色）；4 个图表全部改从 `chartColor` 取色，消除魔法色值，图标/图表视觉统一。
6. **图表懒加载**：`App.tsx` 用 `React.lazy` + `Suspense`，4 个图表拆成独立 chunk（各 ~1KB），recharts 仅在渲染时加载。

## P2 — 健壮性 / 体验
7. **fetch 超时/中断/重试**：`api.ts` 加 `AbortController` 超时（15s）+ 网络/429/5xx 指数退避重试（尊重 Retry-After）；导出 `splitSubRanges`/`mergeResults` 供测试。
8. **CSV 导出**：`DailyTable` 自带 Card + 「导出 CSV」按钮（带 BOM 防 Excel 中文乱码，含合计行，文件名时间戳）。
9. **Key 存储增强**：`QueryForm` 改为基础混淆（非明文）+「本机长期(localStorage) / 本次会话(sessionStorage)」范围单选，自动还原上次范围。
10. **图表可访问性**：4 个图表容器 `role="img"` + `aria-label`；新增 `src/hooks/useReducedMotion.ts`，图表 `isAnimationActive={!reduced}` 尊重系统「减少动效」偏好。

## 新增/变更文件
- 新增：`.eslintrc.cjs`、`.prettierrc`、`.editorconfig`、`src/theme.tsx`、`src/index.css`、`src/hooks/useReducedMotion.ts`、`src/api.test.ts`、`src/utils/format.test.ts`
- 变更：`src/icons/tokens.ts`（chartColor）、`src/icons/index.ts`（+Sun/Moon/Download 图标）、`src/api.ts`、`src/main.tsx`（ThemeProvider）、`src/App.tsx`（懒加载+主题切换）、`src/components/*Chart.tsx`（去 any+Token 化+a11y）、`src/components/DailyTable.tsx`（CSV）、`src/components/QueryForm.tsx`（Key 存储）、`package.json`（脚本+devDeps）

## 下一步可选
- 接 husky + lint-staged 做提交前校验；把 `no-explicit-any` 升为 `error`。
- IconBadge 加 hover 微动效（ICON_GUIDE.md 路线图）。
