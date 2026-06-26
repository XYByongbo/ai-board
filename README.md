# Token 消耗看板

纯前端（React + TypeScript + Vite）应用：在浏览器输入自己的 API Key，直连官方接口
`https://hk.ainowork.ai/api/usage/token/cost`，把单个 Key 最近 7 天（可自选区间）的 Token 消耗可视化。

> 接口文档：<https://nf.ainowork.ai/docs/getting-started/api-keys>

## 特性

- **纯前端、无后端**：接口已开启 CORS（`access-control-allow-origin: *`），浏览器可直接携带 `Authorization: Bearer sk-...` 请求，Key 不出本机、不经任何第三方。
- **可视化**：概览卡片（总花费 ¥ / 请求数 / 总 Tokens / Key 名称）+ 每日花费趋势（面积图）+ 每日 Token 构成（堆叠柱：输入/输出/缓存读/缓存写）+ 每日请求数 + Token 占比环形图 + 每日明细表（含合计行）。
- **日期范围**：内置 RangePicker，受接口约束限制为「区间 ≤7 天、起始不早于 30 天前」；不选则用接口默认（最近 7 天）。
- **进行中标记**：当天数据（`partial: true`）在图表与表格中以橙色高亮 / 「进行中」标签提示。
- **Key 记住**：可勾选「记住 Key」写入浏览器 `localStorage`（公共电脑请勿勾选）。

## 运行

```bash
pnpm install      # 首次安装（已在 pnpm-workspace.yaml 中允许 esbuild 构建脚本）
pnpm dev          # 本地开发：http://localhost:5173
pnpm build        # 生产构建到 dist/（tsc 类型检查 + vite 打包）
pnpm preview      # 本地预览 dist 产物
```

> 用 npm/yarn 亦可：把 `pnpm` 换成 `npm run` / `yarn`。npm 不需要 `pnpm-workspace.yaml`。

## 目录结构

```
src/
  main.tsx              # 入口，ConfigProvider(locale=zhCN) + 全局样式
  App.tsx               # 页面编排：查询表单 / 概览 / 图表 / 明细表
  api.ts                # fetchTokenCost(key, start?, end?)，含 401/异常处理
  types.ts              # 接口返回类型定义
  utils/format.ts       # 数字/金额/日期格式化
  components/
    QueryForm.tsx       # Key 输入 + 日期范围 + 记住 + 查询
    SummaryCards.tsx    # 概览统计卡片
    CostTrendChart.tsx  # 每日花费面积图
    TokenStackChart.tsx # 每日 Token 堆叠柱状图
    RequestChart.tsx    # 每日请求数柱状图
    TokenPieChart.tsx   # Token 占比环形图
    DailyTable.tsx      # 每日明细表（含合计行）
```

## 字段说明

- 金额以 `data.currency`（CNY）为准，看板主指标用 `cost`。
- `quota` 是内部计费单位（≈ USD×500000），非人类可读金额，看板未展示。
- Token 勾稽：`input + output + cache = total`，`cache_read + cache_write = cache`。

## 技术栈

React 18 · TypeScript · Vite 5 · Ant Design 5 · Recharts 2 · dayjs
