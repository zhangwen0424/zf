/// <reference types="vitest"/>

// 引入 vitest类型定义文件，使 defineConfig 能配置 test 属性
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite"; // 自动引入 Composition API
import path from "path";
import jsx from "@vitejs/plugin-vue-jsx"; // 解析vue 中的 jsx 语法

// vite 默认只会编译ts 不会检测ts
export default defineConfig({
  plugins: [
    vue(),
    jsx(),
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
  },
  test: {
    globals: true, // 显式提供全局 API,可以全局使用单元测试API
    environment: "happy-dom", //Vitest 中的默认测试环境是一个 Node.js 环境。如果你正在构建 Web 端应用程序，你可以使用 jsdom 或 happy-dom 这种类似浏览器(browser-like)的环境来替代 Node.js
    transformMode: { web: [/.tsx$/] } // 模块转换语法
  }
});
