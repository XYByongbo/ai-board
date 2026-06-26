import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 纯前端应用：浏览器直接请求 https://hk.ainowork.ai，接口已开启 CORS（allow-origin: *），无需代理。
export default defineConfig({
  plugins: [react()],
})
