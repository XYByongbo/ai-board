import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 纯前端应用：浏览器直接请求 https://hk.ainowork.ai，接口已开启 CORS（allow-origin: *），无需代理。
// 部署在子路径 /board 下，base 必须设为 /board/，否则资源引用路径会指向根目录而出错。
export default defineConfig({
  plugins: [react()],
  base: '/board/',
  resolve: {
    // 团队统一路径别名：所有模块优先用 @/ 引用，便于代码审查与重构。
    // 图标体系的唯一入口即 @/icons。
    // 用 import.meta.url + URL 全局计算绝对路径，避免引入 @types/node 依赖。
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    // 代码分割：把第三方库拆成独立 vendor chunk，浏览器可并行下载、长期缓存，减小首屏 JS 体积
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons', 'dayjs'],
          charts: ['recharts'],
        },
      },
    },
  },
})
