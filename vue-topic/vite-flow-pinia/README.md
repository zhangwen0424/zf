# Vue3+Vite 项目流程

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
  plugins: [vue()]
});
```

6.vue-tsc

Vite 仅执行 .ts 文件的转译工作，并不执行任何类型检查。vue-tsc 可以对 Vue3 进行 Typescript 类型较验

开发时配置坚持 ts 浪费性能没必要，在生产环境打包的时候检测 ts 文件, package.json 中配置: "build":"vue-tsc --noEmit && vite build", --noEmit 表示只检测不生成 js 文件，此时需要配置 tsconfig.json 文件

````json
"scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit &&vite build"
}
```

pnpm install typescript vue-tsc -D
检测 ts:typescript, 检测.vue 文件: vue-tsc

创建 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "esnext", // 目标转化的语法
    "module": "esnext", // 转化的格式
    "moduleResolution": "node", // 解析规则
    "strict": true, // 严格模式
    "sourceMap": true, // 启动sourcemap 调试
    "jsx": "preserve", // 不允许ts编译jsx语法
    "esModuleInterop": true, // es6 和 commonjs 转化
    "lib": ["esnext", "dom"], // 支持esnext和dom语法
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"] // @符号的真实含义， 还需要配置vite别名， 和 declare module
    }
  },
  // 编译那些文件
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "./auto-imports.d.ts"
  ]
}
````

此时再次运行 pnpm build 则会对文件内容进行 ts 检测

## 四.Eslint 配置

开发项目需要安装 vscode 插件 volar

1.校验语法并提示错误行数
npx eslint --init

? How would you like to use ESLint? ...

> To check syntax only
> To check syntax and find problems
> To check syntax, find problems, and enforce code style

一般选择第二种，第三种会强制规范代码风格，代码风格规范交给 volar，eslint 只做语法校验即可

2.采用 js-module

? What type of modules does your project use?

> ...
> JavaScript modules (import/export)
> CommonJS (require/exports)
> None of these

3.项目采用 vue 语法

> ? Which framework does your project use? ...
> React
> Vue.js
> None of these

安装包，我们可以自己使用 pnpm 安装
pnpm i eslint-plugin-vue@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint@latest -D

支持 vue 中 ts eslint 配置
pnpm i @vue/eslint-config-typescript -D

4.生成 eslintrc.js

```js
module.exports = {
  env: {
    // 环境 针对那些环境的语法
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    // 集成了哪些规则， 别人写好的. 别人写好的规则拿来用
    "eslint:recommended",
    "plugin:vue/vue3-essential", // eslint-plugin-vue
    "plugin:@typescript-eslint/recommended" // typescript 规则
  ],
  overrides: [],
  //  parser: "@typescript-eslint/parser",
  // 上面的事解析 ts文件的，需要配置可以解析.vue 文件
  parser: "vue-eslint-parser", // esprima babel-eslint @typescript-eslint/parser
  parserOptions: {
    parser: "@typescript-eslint/parser", // 解析ts文件的
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["vue", "@typescript-eslint"],
  rules: {}
};
```

package.json 中配置 eslint 检验，执行 pnpm lint

```json
"scripts": {
    "lint": "eslint --fix --ext .ts,.tsx,.vue src --quiet"
  }
```

通过 eslint 修复，--ext 扩展名，src 为修复目录，--quiet 忽略 warning 的修复提示
最终安装 vscode 中 eslint 插件：eslint 只是检测代码规范

5. .eslintignore 配置

配置 eslint 检测需要忽略的文件

```
node_modules
dist
*.css
*.jpg
*.jpeg
*.png
*.gif
*.d.ts
```

## 五.Prettier 配置

1.eslint 中进行配置  
在 eslint 中集成 prettier 配置
pnpm install prettier eslint-plugin-prettier @vue/eslint-config-prettier -D

```js
module.exports = {
  "env": {
  "browser": true,
  "es2021": true,
  "node": true
  },
  "extends": [
        "eslint:recommended",
        "plugin:vue/vue3-essential", // vue3 解析https://eslint.vuejs.org/
        "plugin:@typescript-eslint/recommended",
-       "@vue/prettier"
  ],
  "parser": "vue-eslint-parser", // 解析 .vue文件
  "parserOptions": {
    "parser": '@typescript-eslint/parser',
    // 解析 .ts 文件
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
- rules: {
-       "prettier/prettier": [
-           "error",
-           {
-               singleQuote: false, //使用单引号

   .prettierignore

-               semi: false, ////末尾添加分号
-               tabWidth: 2,
-               trailingComma: "none",
-               useTabs: false,
-               endOfLine: "auto"
-           }
-       ]
      }
}
```

2. .prettierrc.js 自动格式化处理

```js
module.exports = {
  singleQuote: false, //使用单引号
  semi: false, ////末尾添加分号
  tabWidth: 2,
  trailingComma: "none",
  useTabs: false,
  endOfLine: "auto"
};
```

.prettierignore

```
node_modules
dist
```

最终安装 vscode 中 Prettier 插件：prettier 只是用来格式化代码
这里需要配置 Format On Save 为启用，保存时自动格式化 Default Formatter 选择 Prettier - Code formatter

3. editorconfig 编辑器的配置

.editorconfig

```
root = true
[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
```

最终安装 vscode 中 EditorConfig for VS Code 插件

<!-- eslint prettier editorconfig -->

// 思想：
// eslint js 代码检查插件， prettier 代码格式化工具统一风格， editconfig 代码编译器配置
// eslint vscode、prettier vsode、editconfig for vscode
// 默认格式化
// 配合 git hook 实现提交代码前 先进行校验

- ESlint
  - 可以做简单的代码风格检测和限制
  - 可以对 js 语法进行检测限制 but 只能检测 js，ts，vue 中的 js 等 js 语言，无法检测和限制 css 的代码风格
- Prettier
  - 可以对代码风格进行检测和限制
  - 可以检测和限制 js，ts，css 等多种类型文件和语言 but 不能对代码语法进行检测和限制
- 小结
  简单的说就是 ESlint 限制语法（对与错），Prettier 限制风格（好与坏）
  这样区分就很明显，ESlint 主要解决了团队开发时，每个人写代码的严谨程度，让项目出 BUG 几率大大降低，而 Prettier 则是让张三、李四写的代码看起来风格统一，即使后来王五加入项目，也能很快上手项目，不会让项目代码看起来杂乱不堪。

首先要明确一点，ESLint 也是自带一些风格检测时限制，例如缩进，结尾分号等，这些 Prettier 中也有限制，那么如果同时使用 ESLint 和 Prettier，应该听谁的呢？
事实上，如果你真的在同一个项目中分别使用了 ESLint 和 Prettier，且不做任何处理，那么在安装 IDE 插件后，格式化时两者都会介入并格式化代码，在 IDE 中的表现就是，鬼畜了一下。
因此通常的做法是：让 ESLint 去做语法检测，让 Prettier 去接管风格检测，让 Prettier 的风格检测覆盖 ESLint 的风格检测。

## 六.husky

配置 .gitignore

- git init # 初始化
- pnpm install husky -D # 安装 husky
- package.json 中 配置 prepare，或者直接通过命令执行: npm set-script prepare "husky install"

  ```json
  "scripts": {
      "prepare": "husky install"
    },
  ```

  当执行 pnpm insall 时会去执行 prepare 这个钩子，首次使用时先执行一下这个钩子：pnpm prepare，会生成一个 .husky 目录

- npx husky add .husky/pre-commit "pnpm lint" # 添加一个提交代码之前需要执行的钩子，会生成一个文件 pre-commit, 当我们提交的时候回去执行 eslint 校验

```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint
```

## 七.commitlint

- 安装代码提交检测包
  pnpm install @commitlint/cli @commitlint/config-conventional -D
- 添加一个 commit-msg 文件，当执行 commit 的时候会通过 commitlint 去校验，$1 表示匹配的用户的 commit 信息，需要添加 commitlint.config.js 配置
  npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"

commitlint.config.js

```js
module.exports = {
  extends: ["@commitlint/config-conventional"]
};
```

- git commit -m"feat: 初始化工程"

- 描述信息
  - build 主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
  - chore 不属于以上类型的其他类型
  - ci 主要目的是修改项目继续集成流程(例如 Travis， Jenkins，GitLab CI，Circle 等)的提交
  - docs 文档更新
  - feat 新功能、新特性；
  - fix 修改 bug；
  - perf 更改代码，以提高性能；
  - refactor 代码重构（重构，在不影响代码内部行为、功能下的代码修改）；
  - revert 恢复上一次提交；
  - style 不影响程序逻辑的代码修改(修改空白字符，格式缩进，补全缺失的分号等，没有改变代码逻辑)
  - test 测试用例新增、修改；

## 八.路由配置

- vue-topic/vite/src/router/index.ts

```js
// 项目比较小，可以采用约定式路由 根据规范来创建目录
// 项目比较大，建议采用配置
import { createRouter, createWebHistory } from "vue-router";

const getRoutes = () => {
  const files = import.meta.glob("../views/*.vue");
  //../views/about.vue: () => import("/src/views/about.vue")
  // ../views/home.vue: () => import("/src/views/home.vue")
  return Object.entries(files).map(([file, module]) => {
    const name = file.match(/\.\.\/views\/[^.]+?\.vue/i)?.[1];
    return {
      path: "/" + name,
      component: module
    };
  });
};
export default createRouter({
  history: createWebHistory(),
  routes: getRoutes()
});
```

- 需要引入 ts 类型定义

vue-topic/vite/src/router/index.ts

```ts
// 需要引入vite/client得到 ts 支持
/// <reference types="vite/client"/>
```

- vue-topic/vite/src/main.ts

```js
import { createApp } from "vue";
import App from "./App.vue"; // 这里会报错，不支持.vue

import router from "./router/index";
createApp(App).use(router).mount("#app");
```

## 九.编写 Todo 功能

```vue
<template>
  <div>
    <input v-model="todo" type="text" />
    <button @click="addTodo">添加内容</button>
    <ul>
      <li v-for="(item, index) in todos" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
let todo = ref("");
let todos = ref<string[]>([]);
let addTodo = () => {
  if (!todo.value) return;
  todos.value.push(todo.value);
};
</script>
```

### 1.自动引入插件

pnpm install -D unplugin-auto-import

vue-topic/vite/vite.config.ts

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";

// vite 默认只会编译ts 不会检测ts
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"] // 自动引入ref、reactive、computed等
      // eslintrc: { enabled: true } // 生成一个.eslint-auto-import.json，关闭 eslint 的校验，只需要配置一次生成即可
    })
  ]
});
```

vite 中使用此插件后保证 vue 文件中不引入工具函数正常运行，保存一次会在根目录生成 auto-imports.d.ts 文件，但 ts 和 eslint 报错需把生成的文件配置到 tsconfig.json 和 .eslintrc 中

- .eslintrc

```json
  extends: [
  "eslint:recommended",
  "plugin:vue/vue3-recommended", // vue3 解析 https://eslint.vuejs.org/
  "plugin:@typescript-eslint/recommended",
  "@vue/typescript/recommended",
  "@vue/prettier",
- "./.eslintrc-auto-import.json"
  ]
```

- tsconfig.json

```json
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "./auto-imports.d.ts"
  ]
```

### 2.路径别名

allsource/vue-topic/vite-flow-1/vite.config.ts

```ts
export default defineConfig({
  resolve: {
    alias: [
      // 配置和rollup一样
      { find: "@", replacement: path.resolve(__dirname, "src") }
    ]
  }
});
```

```vue
<script lang="ts" setup>
// 配置完后，鼠标扫过文件提示：module "\*.vue", 需要再tsconfig.json 中配置别名，ts 才可提示出正确的文件路径
import Todo from "@/components/ToDo/index.vue";
</script>
```

tsconfig.json

```json
{
  "compilerOptions": {
    "target": "esnext", // 目标转化的语法
    "module": "esnext", // 转化的格式
    "moduleResolution": "node", // 解析规则
    "strict": true, // 严格模式
    "sourceMap": true, // 启动sourcemap 调试
    "jsx": "preserve", // 不允许ts编译jsx语法
    "esModuleInterop": true, // es6 和 commonjs 转化
    "lib": ["esnext", "dom"], // 支持esnext和dom语法
    "baseUrl": ".", // 当前路径的根目录
    "paths": {
      "@/*": ["src/*"] // @符号的真实含义， 还需要配置vite别名， 和 declare module
    }
  }
}
```

### 3.识别 TSX 文件

.js 是 javascript 文件的扩展名，例如 main.js。
.jsx 是 javascript 文件并表明使用了 JSX 语法。
.ts 是 typescript 文件的扩展名
.tsx 表明是 typescript 文件并使用了 JSX 语法

vue-topic/vite/src/components/ToDo/todo-list.tsx

```tsx
import { PropType } from "vue";

export default defineComponent({
  props: {
    todos: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  render() {
    return (
      <ul>
        {this.todos.map((todo, index) => {
          return <li key={index}>{todo}</li>;
        })}
      </ul>
    );
  }
});
```

需要安装插件：解析 vue 中的 jsx 语法
pnpm install @vitejs/plugin-vue-jsx -D

vite.config.ts

```ts
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
  }
});
```

## 九.unocss

- Atomic CSS 原子 CSS 是一种 CSS 架构方法，传统方法使用预处理器编译后生成样式，但是体积大。（类似行内样式，但是行内样式缺点：冗余）
- Tailwind 依赖 PostCSS 和 Autoprefixer + purgeCSS,开发环境 css 体积大
- Windi CSS 是一种 Tailwind CSS 替代品，不依赖，按需使用。采用预扫描的方式生成样式。 但是自定义复杂~~

## 十.Vitest 单元测试

pnpm i -D vitest @vue/test-utils happy-dom @types/jest

@vue/test-utils 是一个用于基于 Vue3 的基础测试工具库，用于模拟给定的代码生成测试用例。
Vitest： vite 提供的单元测试框架

vue-topic/vite/vite.config.ts

```js
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
```

package.json 中配置 test 命令，回去找.test 或者 .spec 的文件
同时可以添加 git push 的钩子函数，在代码提交前进行单元测试：
npx husky add .husky/pre-push "pnpm test:run"

```json
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
```

## 十一.Mock 数据

pnpm install mockjs vite-plugin-mock -D

vite.config.js

```js
// 引入 vitest类型定义文件，使 defineConfig 能配置 test 属性
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite"; // 自动引入 Composition API
import path from "path";
import jsx from "@vitejs/plugin-vue-jsx"; // 解析vue 中的 jsx 语法
import { viteMockServe } from "vite-plugin-mock"; // mock 数据

export default defineConfig({
  plugins: [
    viteMockServe(), // mock 数据
    vue(),
    jsx(),
    AutoImport({
      imports: ["vue", "vue-router"] // 自动引入ref、reactive、computed等
      // eslintrc: { enabled: true } // 生成一个.eslint-auto-import.json，关闭 eslint 的校验
    })
  ]
});
```

vue-topic/vite/mock/user.ts

```ts
// 用来mock数据的
export default [
  {
    url: "/api/login",
    method: "post",
    response: (res) => {
      // express
      return {
        code: 0, // code 0 成功  code 1失败
        data: {
          token: "Bearer Token",
          username: res.body.username
        }
      };
    }
  }
];
```

## 十二.axios 封装和使用

pnpm install -D axios

vue-topic/vite/src/utils/http.ts

```ts
import axios, { AxiosRequestConfig } from "axios";

// 设置返回数据的格式
export interface ResponseData<T> {
  code: number;
  data?: T;
  msg?: string;
  //..
}
class HttpRequest {
  public baseURL = import.meta.env.DEV ? "/api" : "/"; // 基本请求路径
  public timeout = 3000;

  // 每次请求都创建一个独一无二的实例 ， 为了保证 请求之间是互不干扰的
  public request(options: AxiosRequestConfig) {
    const instance = axios.create(); // 创建一个axios实例
    options = this.mergeOptions(options); // 合并请求选项
    this.setInterceptors(instance); // 设置拦截器
    return instance(options);
  }
  setInterceptors(instance: any) {
    // 配置请求拦截器
    instance.interceptors.request.use(
      (config) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        config.headers!["token"] = "bearer token";
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
    // 配置响应拦截器
    instance.interceptors.response.use(
      (res) => {
        const { code } = res.data;
        if (code !== 0) {
          return Promise.reject(res);
        }
        return res;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }
  // 合并请求选项
  mergeOptions(options: AxiosRequestConfig) {
    return Object.assign(
      {
        baseURL: this.baseURL,
        timeout: this.timeout
      },
      options
    );
  }
  public get<T>(url: string, data: unknown): Promise<ResponseData<T>> {
    // res.data.data
    return this.request({
      method: "get",
      url,
      params: data
    }).then(
      (res) => {
        return Promise.resolve(res.data);
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }
  public post<T>(url: string, data: unknown): Promise<ResponseData<T>> {
    // res.data.data
    return this.request({
      method: "post",
      url,
      data
    }).then(
      (res) => {
        return Promise.resolve(res.data);
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }
}
// 请求取消 需要维护页面的状态 base:{ 'a','b','c'}
export default new HttpRequest();
```

vue-topic/vite/src/api/user.ts

```ts
import http from "@/utils/http";

// 封装接口路径
const enum USERAPI_LIST {
  login = "/login" // 请求路径
}

// 封装用户的信息
export interface IUserData {
  username: string;
  password: string;
}

// 后续方法可以继续扩展  用户调用的接口
export function login<T>(data: IUserData) {
  return http.post<T>(USERAPI_LIST.login, data);
}
```

vue-topic/vite/src/main.ts

```ts
import { createApp } from "vue";
import App from "./App.vue"; // 这里会报错，不支持.vue
import { login } from "./api/user";
import router from "./router/index";
createApp(App).use(router).mount("#app");

login<{ username: string; token: string }>({
  username: "hello",
  password: "123456"
}).then((res) => {
  console.log(res.data?.username);
});
```

## 十三.代理配置

一般不采用 vite.config.js 中 mock 数据，使用 express 返回数据，此时需要配置下代理

vite.config.js

```ts
// 引入 vitest类型定义文件，使 defineConfig 能配置 test 属性
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite"; // 自动引入 Composition API
import path from "path";
import jsx from "@vitejs/plugin-vue-jsx"; // 解析vue 中的 jsx 语法
import { viteMockServe } from "vite-plugin-mock";

export default defineConfig({
  plugins: [
    // viteMockServe(), // mock 数据，注释掉此插件
    vue(),
    jsx(),
    AutoImport({
      imports: ["vue", "vue-router"] // 自动引入ref、reactive、computed等
      // eslintrc: { enabled: true } // 生成一个.eslint-auto-import.json，关闭 eslint 的校验
    })
  ],
  server: {
    // 方向代理  不需要配置跨域  http://127.0.0.1:3000/login
    proxy: {
      // http-proxy 在中间做了个中间层  客户端->(中间层*透明的* -> 真实服务器)
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true, // 这里不加服务端无法拿到origin属性
        rewrite: (path) => path.replace(/^\/api/, "") //重写请求地址
      }
    }
  }
});
```

根目录新建 server.js，起一个 express 路由，执行：nodemon server.js

```js
const express = require("express");

const app = express();

app.post("/login", (req, res) => {
  res.send({
    code: 0,
    data: { username: "zw", token: "server token" }
  });
});
app.listen(3000);
```

## Pinia 的使用

### pinia 和 vuex 对比

- vuex 的缺点 vuex 中的 store 是单一的 new Vue()
- 模块方式很恶心 namesapced 整个状态是树状来管理的 store.state.b.c.d -> computed
- action 和 mutation 的区别， 要不要有这个 action （增加代码，不知道要不要写）
- vuex 不是用 ts 来写的 类型提示我们需要自己在封装
- .....

- pinia 菠萝 好处多仓库 store -> reactive() 数据源
- 扁平化管理
- action 只保留 action
- ts 来编写的 体积小 也是支持 vue2 也有自己的工具
- 不单独支持 optionsApi

```js
// options api
export default {
  state,
  getters,
  actions,
  mutations,
}

// hook
export function(){

}

```

### 安装

安装 pinia: pnpm install -D pinia

### 创建 store

- 创建 stores/counter.ts 文件

```ts
// 定义一个 store

// 1.setup 写法
/* export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubleCount = computed(() => {
    return count.value * 2;
  });
  const changeCount = (payload: number) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        count.value += payload;
        resolve();
      }, 100);
    });
  };
  return { count, doubuleCount, changeCount };
}); */

// 2.options 写法
export const useCounterStore = defineStore("counter", {
  state: () => {
    return {
      count: 0
    };
  },

  actions: {
    changeCount(state: any, payload: number) {
      state.count += payload;
    }
  }
});
```

### 注册及引入

App.vue

```vue
<template>
  <Counter></Counter>
</template>

<script lang="ts" setup>
import Counter from "@/components/Counter/index.vue";
</script>
```

main.ts

```ts
createApp(App).use(router).use(createPinia()).mount("#app");
```

### 组件中使用 store

vue-topic/vite-flow-pinia/src/components/Counter/index.vue

```vue
<template>
  <div>
    <button @click="handleClick">计算器</button>
    count:<span>{{ store.count }}</span> doubleCount:<span>{{
      store.doubleCount
    }}</span>
  </div>
</template>
<script lang="ts" setup>
import { useCounterStore } from "@/stores/counter"; // 引入 store
const store = useCounterStore(); //使用 store
const handleClick = () => {
  store.changeCount(5).then(() => {
    console.log("ok");
  });
};
</script>
```
