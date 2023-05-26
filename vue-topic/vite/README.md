# vite

## 一.pnpm 管理项目

为什么选择它？

- 快：pnpm 是同类工具速度的将近 2 倍
- 高效：node_modules 中的所有文件均链接自单一存储位置
- 支持单体仓库：monorepo，单个源码仓库中包含多个软件包的支持
- 权限严格：pnpm 创建的 node_modules 默认并非扁平结构，因此代码无法对任意软件包进行访问

## 二.Vite 介绍

- 极速的服务启动，使用原生 ESM 文件，无需打包! （原来整个项目的代码打包在一起，然后才能启动服务）
- 轻量快速的热重载 无论应用程序大小如何，都始终极快的模块热替换（HMR）
- 丰富的功能 对 TypeScript、JSX、CSS 等支持开箱即用。
- 优化的构建 可选 “多⻚应用” 或 “库” 模式的预配置 Rollup 构建
- 通用的插件 在开发和构建之间共享 Rollup-superset 插件接口。
- 完全类型化的 API 灵活的 API 和完整 TypeScript

  Vite3 修复了 400+issuse,减少了体积，Vite 决定每年发布一个新的版本

## 三.项目初始化

pnpm init # 初始化 package.json
pnpm install vite -D # 安装 vite,-D 开发环境使用的

1.package.json
增添启动命令，启动地址：http://127.0.0.1:5173/ 之前是 3000 端口，防止冲突

启动命令：npm run dev 等价于 pnpm dev

```json
"scripts": {
  "dev": "vite",
  "build": "vite build"
}
```

2.index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-
width, initial-scale=1.0"
    />
    <title>vite-start</title>
  </head>
  <body>
    <!-- 稍后vue项目挂载到这个元素上 -->
    <div id="app"></div>
    <!-- vite 是基于esModule的 -->
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

3.main.ts

pnpm install vue # 安装 vue

```js
import { createApp } from "vue";
import App from "./App.vue"; // 这里会报错，不支持.vue
createApp(App).mount("#app");
```

4.env.d.ts

main.ts 文件默认需要 ts 声明文件

```ts
// 声明文件
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

5.vite.config.ts

我们需要让 vite 支持.vue 文件的解析，安装插件帮我们解析.vue 文件
pnpm install @vitejs/plugin-vue -D

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// vite 默认只会编译ts 不会检测ts
export default defineConfig({
  plugins: [vue()],
});
```

6.vue-tsc

Vite 仅执行 .ts 文件的转译工作，并不执行任何类型检查。vue-tsc 可以对 Vue3 进行 Typescript 类型较验

开发时配置坚持 ts 浪费性能没必要，在生产环境打包的时候检测 ts 文件, package.json 中配置: "build":"vue-tsc --noEmit && vite build", --noEmit 表示只检测不生成 js 文件，此时需要配置 tsconfig.json 文件

pnpm install typescript vue-tsc -D
检测 ts:typescript, 检测.vue 文件: vue-tsc

创建 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "sourceMap": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "lib": ["esnext", "dom"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```
