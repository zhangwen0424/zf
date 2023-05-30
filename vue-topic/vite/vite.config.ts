import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import path from "path";

// vite 默认只会编译ts 不会检测ts
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"] // 自动引入ref、reactive、computed等
      // eslintrc: { enabled: true } // 生成一个.eslint-auto-import.json，关闭 eslint 的校验
    })
  ],
  resolve: {
    alias: [
      // 配置和rollup一样
      { find: "@", replacement: path.resolve(__dirname, "src") }
    ]
  }
});
