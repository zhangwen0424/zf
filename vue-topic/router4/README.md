# router4

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## 路由实现原理

根目录执行

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>

  <body>
    <button onclick="routerHistory.push('/')">首页</button>
    <button onclick="routerHistory.push('/about')">关于我</button>
    <button onclick="routerHistory.replace('/xxxx')">替换</button>
    <script>
      // 前端路由的实现原理：两种模式 一种是hash模式 一种history模式 h5api
      // window.location.hash = '/' history.pushState(state,null,url) history.replaceState()
      // 目前浏览器 都支持了history.pushState  history.pushState(state,null,url) history.pushState(state,null,'#/')

      // 两种路由的区别：
      // hash  hash模式的好处 就是锚点，刷新页面的时候不会像服务器发送请求，同时他不支持服务端渲染(不能做seo优化)。 不会产生404  忒丑
      // history 特点就是路径漂亮 没有# 和正常页面切换一样，如果刷新页面会像服务器发送请求，如果资源不存在会出现404, 解决方案 ， 渲染首页，首页会根据路径重新跳转

      // 自己实现一个路由核心模块

      // const routerHistory = createWebHistory(); // history模式
      const routerHistory = createWebHashHistory(); // hash模式
      console.log("routerHistory:", routerHistory);

      // 实现路由监听，如果路径变化 需要通知用户
      // routerHistory.listen((to, from, { isBack }) => {
      //   console.log(to, from, isBack);
      // });

      // 创建 hash 路由记录
      function createWebHashHistory() {
        return createWebHistory("#");
      }

      // 创建路由记录
      function createWebHistory(base = "") {
        // 1.路由系统最基本的 得包含当前的路径，当前路径下他的状态是什么, 需要提供两个切换路径的方法 push replace
        const historyNavigation = useHistoryStateNavigation(base);

        const historyListeners = useHistoryListeners(
          base,
          historyNavigation.state,
          historyNavigation.location
        );

        const routerHistory = Object.assign(
          {},
          historyNavigation,
          historyListeners
        );

        Object.defineProperty(routerHistory, "location", {
          get: () => historyNavigation.location.value,
        });
        Object.defineProperty(routerHistory, "state", {
          get: () => historyNavigation.state.value,
        });

        return routerHistory;
      }

      // 前进后退的时候 要更新historyState 和 currentLocation这两个边路
      function useHistoryListeners(base, historyState, currentLocation) {
        let listeners = [];
        // 最新的状态，已经前进后退完毕后的状态
        const popStateHandler = ({ state }) => {
          const to = createCurrentLocation(base);
          const from = currentLocation.value;
          const fromState = historyState.value;

          currentLocation.value = to;
          historyState.value = state;
          let isBack = state.position - fromState.position < 0;
          listeners.forEach((listener) => {
            listener(to, from, { isBack });
          });
        };

        // 只能监听浏览器的前进后退
        window.addEventListener("popstate", popStateHandler);

        function listen(cb) {
          listeners.push(cb);
        }

        return { listen };
      }

      // 路由系统，base,hash模式时候使用
      function useHistoryStateNavigation(base) {
        // window.history: {length:1,scrollRestoration:"auto",state:null, prototype:{pushState,replaceState,state,go,back,forward}}
        // window.history.state {back:null, current:'', forward:null, position:0, replace:true, scroll:null}

        // 当前位置信息
        const currentLocation = {
          value: createCurrentLocation(base),
        };
        // 当前路径的状态
        const historyState = {
          value: window.history.state,
        };
        // console.log("window.history", window.history.state);

        // 第一次刷新页面 此时没有任何状态，那么我就自己维护一个状态
        if (!historyState.value) {
          changeLocation(
            currentLocation.value,
            buildState(null, currentLocation.value, null, true),
            true
          );
        }

        //（后退后是哪个路径、当前路径是哪个、要去哪里，我是用的push跳转还是replace跳转，跳转后滚动条位置是哪）
        function changeLocation(to, state, replace) {
          const hasPos = base.indexOf("#");
          const url = hasPos > -1 ? base + to : to;
          window.history[replace ? "replaceState" : "pushState"](
            state,
            null,
            url
          );
          historyState.value = state; // 将自己生成的状态同步到了 路由系统中了
        }

        // 去哪，带的新的状态是谁？
        function push(to, data) {
          // 跳转的时候 我需要做两个状态 一个是跳转前 从哪去哪， 跳转后 从这到了那

          // 跳转前
          const currentState = Object.assign(
            {},
            historyState.value, // 当前的状态
            {
              forward: to,
              scroll: { left: window.pageXOffset, top: window.pageYOffset },
            }
          );
          // 本质是没有跳转的 只是更新了状态，后续在vue中我可以详细监控到状态的变化
          changeLocation(currentState.current, currentState, true);

          // 跳转后 从这到了那
          const state = Object.assign(
            {},
            buildState(currentLocation.value, to, null),
            { position: currentState.position + 1 },
            data
          );
          changeLocation(to, state, false); // 真正的更改路径
          currentLocation.value = to;
        }

        function replace(to, data) {
          const state = Object.assign(
            {},
            buildState(
              historyState.value.back,
              to,
              historyState.value.forward,
              true
            )
          );
          changeLocation(to, state, true);
          currentLocation.value = to; // 替换后需要将路径变为现在的路径
        }
        return {
          location: currentLocation,
          state: historyState,
          push,
          replace,
        };
      }

      // 自己实现一个路由核心模块
      function buildState(
        back,
        current,
        forward,
        replace = false,
        computedScroll = false
      ) {
        return {
          back,
          current,
          forward,
          replace,
          scroll: computedScroll
            ? { left: window.pathXOffset, top: window.pageYOffset }
            : null,
          position: window.history.length - 1,
        };
      }

      // 返回当前位置信息
      function createCurrentLocation(base) {
        const { pathname, search, hash } = window.location;

        const hasPos = base.indexOf("#"); // 就是hash  / /about ->  #/ #/about
        if (hasPos > -1) {
          return base.slice(1) || "/";
        }

        return pathname + search + hash;
      }
    </script>
  </body>
</html>
```

## vue-router 路由注册使用

index.js

```js
import {
  // createRouter,
  // createWebHistory,
  createWebHashHistory,
} from "vue-router";

import { createRouter, createWebHistory } from "@/vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    children: [
      { path: "a", component: { render: () => <h1>a页面</h1> } }, // jsx 语法
      { path: "b", component: { render: () => <h1>b页面</h1> } },
    ],
    // 路由钩子函数
    beforeEnter(to, from, next) {
      console.log("afterEach", to);
    },
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由前置守卫
router.beforeEach((to, from, next) => {
  console.log("beforEach", to);
});

router.beforeResolve((to, from, next) => {
  console.log("beforeResolve", to);
});

// 路由后置守卫
router.afterEach((to, from, next) => {
  console.log("afterEach", to);
});

export default router;
```

main.js

```js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
```

vue-topic/router4/src/App.vue

```vue
<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>
```

vue-topic/router4/src/views/HomeView.vue

```vue
<template>
  <div class="home">首页</div>
  <hr />
  <router-link to="/a">a页面</router-link>&nbsp;
  <router-link to="/b">b页面</router-link>
  <hr />
  <router-view></router-view>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "HomeView",
  components: {
    HelloWorld,
  },
  beforeRouteEnter(to, from, next) {
    console.log("beforeRouteEnter", to);
  },
  beforeRouteUpdate(to, from, next) {
    console.log("beforeRouteUpdate", to);
  },
  beforeRouteLeave(to, from, next) {
    console.log("beforeRouteLeave", to);
  },
};
</script>
```

## vue-router 源码实现

● 手写 Vue-Router 中 Hash 模式和 History 模式的实现
● 手写动态路由 addRoutes 原理
● 手写$route及$router 实现
● 手写 router-link 及 router-view 组件
● 手写多级路由实现原理
● 手写 Vue-router 中路由钩子原理

### 手写 Vue-Router 中 Hash 模式和 History 模式的实现

vue-topic/router4/src/vue-router/history/html5.js

```js
// 创建路由记录
export function createWebHistory(base = "") {
  // 1.路由系统最基本的 得包含当前的路径，当前路径下他的状态是什么, 需要提供两个切换路径的方法 push replace
  const historyNavigation = useHistoryStateNavigation(base);

  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location
  );

  const routerHistory = Object.assign({}, historyNavigation, historyListeners);

  Object.defineProperty(routerHistory, "location", {
    get: () => historyNavigation.location.value,
  });
  Object.defineProperty(routerHistory, "state", {
    get: () => historyNavigation.state.value,
  });

  return routerHistory;
}

// 前进后退的时候 要更新historyState 和 currentLocation这两个边路
function useHistoryListeners(base, historyState, currentLocation) {
  let listeners = [];
  // 最新的状态，已经前进后退完毕后的状态
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base);
    const from = currentLocation.value;
    const fromState = historyState.value;

    currentLocation.value = to;
    historyState.value = state;
    let isBack = state.position - fromState.position < 0;
    listeners.forEach((listener) => {
      listener(to, from, { isBack });
    });
  };

  // 只能监听浏览器的前进后退
  window.addEventListener("popstate", popStateHandler);

  function listen(cb) {
    listeners.push(cb);
  }

  return { listen };
}

// 路由系统，base,hash模式时候使用
function useHistoryStateNavigation(base) {
  // window.history: {length:1,scrollRestoration:"auto",state:null, prototype:{pushState,replaceState,state,go,back,forward}}
  // window.history.state {back:null, current:'', forward:null, position:0, replace:true, scroll:null}

  // 当前位置信息
  const currentLocation = {
    value: createCurrentLocation(base),
  };
  // 当前路径的状态
  const historyState = {
    value: window.history.state,
  };
  // console.log("window.history", window.history.state);

  // 第一次刷新页面 此时没有任何状态，那么我就自己维护一个状态
  if (!historyState.value) {
    changeLocation(
      currentLocation.value,
      buildState(null, currentLocation.value, null, true),
      true
    );
  }

  //（后退后是哪个路径、当前路径是哪个、要去哪里，我是用的push跳转还是replace跳转，跳转后滚动条位置是哪）
  function changeLocation(to, state, replace) {
    const hasPos = base.indexOf("#");
    const url = hasPos > -1 ? base + to : to;
    window.history[replace ? "replaceState" : "pushState"](state, null, url);
    historyState.value = state; // 将自己生成的状态同步到了 路由系统中了
  }

  // 去哪，带的新的状态是谁？
  function push(to, data) {
    // 跳转的时候 我需要做两个状态 一个是跳转前 从哪去哪， 跳转后 从这到了那

    // 跳转前
    const currentState = Object.assign(
      {},
      historyState.value, // 当前的状态
      {
        forward: to,
        scroll: { left: window.pageXOffset, top: window.pageYOffset },
      }
    );
    // 本质是没有跳转的 只是更新了状态，后续在vue中我可以详细监控到状态的变化
    changeLocation(currentState.current, currentState, true);

    // 跳转后 从这到了那
    const state = Object.assign(
      {},
      buildState(currentLocation.value, to, null),
      { position: currentState.position + 1 },
      data
    );
    changeLocation(to, state, false); // 真正的更改路径
    currentLocation.value = to;
  }

  function replace(to, data) {
    const state = Object.assign(
      {},
      buildState(historyState.value.back, to, historyState.value.forward, true)
    );
    changeLocation(to, state, true);
    currentLocation.value = to; // 替换后需要将路径变为现在的路径
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace,
  };
}

// 自己实现一个路由核心模块
function buildState(
  back,
  current,
  forward,
  replace = false,
  computedScroll = false
) {
  return {
    back,
    current,
    forward,
    replace,
    scroll: computedScroll
      ? { left: window.pathXOffset, top: window.pageYOffset }
      : null,
    position: window.history.length - 1,
  };
}

// 返回当前位置信息
function createCurrentLocation(base) {
  const { pathname, search, hash } = window.location;

  const hasPos = base.indexOf("#"); // 就是hash  / /about ->  #/ #/about
  if (hasPos > -1) {
    return base.slice(1) || "/";
  }

  return pathname + search + hash;
}
```

vue-topic/router4/src/vue-router/history/hash.js

```js
// 实现路由监听，如果路径变化 需要通知用户
// routerHistory.listen((to, from, { isBack }) => {
//   console.log(to, from, isBack);
// });
import { createWebHistory } from "./html5";

// 创建 hash 路由记录
export function createWebHashHistory() {
  return createWebHistory("#");
}
```

### 手写 router-link 及 router-view 组件

vue-topic/router4/src/vue-router/router-link.js

```js
import { inject, h } from "vue";

function useLink(props) {
  const router = inject("router");
  function navigate() {
    router.push(props.to);
  }
  return { navigate };
}

export const RouterLink = {
  name: "RouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props, { slots }) {
    const link = useLink(props); // 修改 router 中 history
    return () => {
      return h(
        // 虚拟节点 -》 真实节点
        "a",
        {
          onClick: link.navigate,
        },
        slots.default && slots.default()
      );
    };
  },
};
```

vue-topic/router4/src/vue-router/router-view.js

```js
import { h, inject, provide, computed } from "vue";

export const RouterView = {
  name: "RouterView",
  setup(props, { slots }) {
    // 每次渲染组件，只会执行一次
    const depth = inject("depth", 0); // 默认第 0 层
    const injectRoute = inject("route location");
    const matchedRouteRef = computed(() => injectRoute.matched[depth]); // 每次都去取一次 depth 保证准确性
    provide("depth", depth + 1);

    // /a  [home,a] =》 depth:0 home =>  depth:1 a
    return () => {
      const matchRoute = matchedRouteRef.value; // record

      const viewComponent = matchRoute && matchRoute.components.default;
      if (!viewComponent) {
        return slots.default && slots.default();
      }

      return h(viewComponent);
    };
  },
};
```

### 手写多级路由实现原理，手写动态路由 addRoutes 原理

```js
// 格式化用户的参数
function normalizeRouteRecord(record) {
  return {
    path: record.path, // 状态机 解析路径的分数，算出匹配规则
    meta: record.meta || {},
    beforeEnter: record.beforeEnter,
    name: record.name,
    components: { default: record.component }, // 循环
    children: record.children || [],
  };
}

// 创造匹配记录 ，构建父子关系
function createRouteRecordMatcher(record, parent) {
  const matcher = {
    path: record.path,
    record,
    parent,
    children: [],
  };
  if (parent) {
    parent.children.push(matcher);
  }
  return matcher;
}

// 树的遍历
function createRouterMatcher(routes) {
  const matchers = [];

  // 循环加入路由到树中
  function addRoute(route, parent) {
    // 格式化用户参数
    let normalizedRecord = normalizeRouteRecord(route);

    // 把父亲的路径拼到子路由中
    if (parent) {
      normalizedRecord.path = parent.path + normalizedRecord.path;
    }

    // 构建父子关系
    const matcher = createRouteRecordMatcher(normalizedRecord, parent);
    // 循环路由中的子路由，加入到树中
    if ("children" in normalizedRecord) {
      let children = normalizedRecord.children;
      for (let i = 0; i < children.length; i++) {
        addRoute(children[i], matcher);
      }
    }
    matchers.push(matcher);
  }

  routes.forEach((route) => addRoute(route));
  // console.log("matchers", matchers);

  // 匹配路径， /home/a   matched:[home, a]
  function resolve(location) {
    // {path:/,matched:HomeRecord} {path:/a,matched:[HomeRecord,aRecord]}
    const matched = [];
    let path = location.path;
    let matcher = matchers.find((m) => m.path == path);
    while (matcher) {
      matched.unshift(matcher.record); // 将用户的原始数据 放到matched中
      matcher = matcher.parent;
    }

    return {
      path,
      matched,
    };
  }

  return {
    addRoute, // 动态的添加路由， 面试问路由 如何动态添加 就是这个api
    resolve,
  };
}

export { createRouterMatcher };
```

### 手写 Vue-router 中路由钩子原理，手写$route及$router 实现

vue-topic/router4/src/vue-router/index.js

```js
import { createWebHistory } from "./history/html5";
import { createWebHashHistory } from "./history/hash";
import { reactive, shallowRef, computed, unref } from "vue";
import { createRouterMatcher } from "./matcher";
import { RouterLink } from "./router-link";
import { RouterView } from "./router-view";

// 数据处理 options.routes 是用户的配置 ， 难理解不好维护

// /  =>  record {Home}
// /a =>  record {A,parent:Home}
// /b => record {B,parent:Home}
// /about=>record

// 初始化路由系统中的默认参数
const START_LOCATION_NORMALIZED = {
  path: "/",
  // params:{}, // 路径参数
  // query:{},
  matched: [], // 当前路径匹配到的记录
};

// 缓存钩子回调
function useCallback() {
  const handles = [];
  function add(handler) {
    handles.push(handler);
  }
  return {
    add,
    list: () => handles,
  };
}

function createRouter(options) {
  const routerHistory = options.history;
  const matcher = createRouterMatcher(options.routes); // 格式化路由的配置 拍平
  // console.log("options", options);

  // 后续改变这个数据的value 就可以更新视图了
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);

  // 导航钩子
  const beforeGuards = useCallback();
  const beforeResolveGuards = useCallback();
  const afterGuards = useCallback();

  // 解析路径，to="/"   to={path:'/'}
  function resolve(to) {
    if (typeof to == "string") {
      return matcher.resolve({ path: to });
    }
  }

  // 用于监听浏览器前进后退
  let ready;
  function markAsReady() {
    if (ready) return;
    ready = true; // 用来标记已经渲染完毕了

    routerHistory.listen((to) => {
      const targetLocation = resolve(to);
      const from = currentRoute.to;
      finalizeNavigation(targetLocation, from, true);
    });
  }

  // 路由跳转，监听浏览器前进后退
  function finalizeNavigation(to, from, replaced) {
    if (from === START_LOCATION_NORMALIZED || replaced) {
      routerHistory.replace(to.path); // 第一次跳转
    } else {
      routerHistory.push(to.path); // 执行跳转
    }
    currentRoute.value = to; // 更新最新的路径
    // console.log("currentRoute:", currentRoute.value);

    // 如果是初始化 我们还需要注入一个listen 去更新currentRoute的值，这样数据变化后可以重新渲染视图
    markAsReady();
  }

  // 抽离组件
  function extractChangeRecords(to, from) {
    const leavingRecords = [];
    const updatingRecords = [];
    const enteringRecords = [];
    const len = Math.max(to.matched.length, from.matched.length); // 去和来的组件中最长的

    for (let i = 0; i < len; i++) {
      // 循环来的
      const recordFrom = from.matched[i];
      if (recordFrom) {
        // 去的和来的都有 那么就是要更新
        if (to.matched.find((record) => record.path == recordFrom.path)) {
          updatingRecords.push(recordFrom);
        } else {
          // 来的有，去的没有，就是离开
          leavingRecords.push(recordFrom);
        }
      }
      // 循环去的
      const recordTo = to.matched[i];
      if (recordTo) {
        // 去的有，来的也有，就是更新
        if (!from.matched.find((record) => record.path == recordTo.path)) {
          enteringRecords.push(recordTo);
        }
      }
    }

    return [leavingRecords, updatingRecords, enteringRecords];
  }

  function guardToPromise(guard, to, from, record) {
    return () =>
      new Promise((resolve, reject) => {
        const next = () => resolve();
        let guardReturn = guard.call(record, to, from, next);
        return Promise.resolve(guardReturn).then(next);
      });
  }
  // 执行组件钩子函数  matched:组件集合，guardType:钩子类型
  function extractComponentsGuards(matched, guradType, to, from) {
    const guards = [];
    for (const record of matched) {
      let rawComponent = record.components.default;
      const guard = rawComponent[guradType];
      // 将组件钩子函数组装成 promise 放到一个数组中，方便后续按照顺序执行
      guard && guards.push(guardToPromise(guard, to, from, record));
    }
    return guards;
  }

  // promise的组合函数
  function runGuardQueue(guards) {
    return guards.reduce(
      (promise, guard) => promise.then(() => guard()),
      Promise.resolve()
    );
  }

  // 路由守卫钩子
  async function navigate(to, from) {
    // 在做导航的时候 我要知道哪个组件是进入，哪个组件是离开的，还要知道哪个组件是更新的

    const [leavingRecords, updatingRecords, enteringRecords] =
      extractChangeRecords(to, from); // 抽离离开、更新、进入组件

    // 循环调用组件的钩子
    /* 
      1. 导航被触发。
      2. 在失活的组件里调用beforeRouteLeave守卫。
      3. 调用全局的beforeEach守卫。
      4. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
      5. 在路由配置里调用beforeEnter。
      6. 解析异步路由组件。
      7. 在被激活的组件里调用beforeRouteEnter。
      8. 调用全局的beforeResolve守卫(2.5+)。
      9. 导航被确认。
      10. 调用全局的afterEach钩子。
      11. 触发DOM更新。
      12. 调用beforeRouteEnter守卫中传给next的回调函数，创建好的组件实例会作为回调函数的参数传入。
     */

    // 调用组件离开的钩子, 我离开的时候 需要从后往前   /home/a  -> about
    let guards = extractComponentsGuards(
      leavingRecords.reverse(),
      "beforeRouteLeave",
      to,
      from
    );

    // 组件离开(beforeRouteLeave) =》 全局前置守卫(beforeEach) =》 组件更新(beforeRouteUpdate) =》
    // 路由前置(beforeEnter) =》 组件进入(beforeRouteEnter) =》 全局解析(beforeResolve) =》 全局后置(afterEach)
    return runGuardQueue(guards)
      .then(() => {
        guards = [];
        for (const guard of beforeGuards.list()) {
          guards.push(guardToPromise(guard, to, from, guard));
        }
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = extractComponentsGuards(
          updatingRecords,
          "beforeRouteUpdate",
          to,
          from
        );
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const record of to.matched) {
          if (record.beforeEnter) {
            guards.push(guardToPromise(record.beforeEnter, to, from, record));
          }
        }
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = extractComponentsGuards(
          enteringRecords,
          "beforeRouteEnter",
          to,
          from
        );
        return runGuardQueue(guards);
      })
      .then(() => {
        guards = [];
        for (const guard of beforeResolveGuards.list()) {
          guards.push(guardToPromise(guard, to, from, guard));
        }
        return runGuardQueue(guards);
      });
  }

  // 通过路径匹配到对应的记录，更新currentRoute，调用导航钩子
  function pushWithRedirect(to) {
    const targetLocation = resolve(to); //根据路径解析
    const from = currentRoute.value; // 从哪来

    // 路由的导航守卫 有几种呢？ 全局钩子 路由钩子 组件上的钩子

    // 路由的钩子 在跳转前我们可以做路由的拦截， 钩子函数 =》路径跳转 =》 执行全局后置钩子 afterEach
    navigate(targetLocation, from)
      .then(() => {
        return finalizeNavigation(targetLocation, from); // 路由跳转和路径切换
      })
      .then(() => {
        // 当导航切换完毕后执行 afterEach
        for (const guard of afterGuards.list()) guard(to, from);
      });
  }

  function push(to) {
    return pushWithRedirect(to);
  }

  const router = {
    push,
    beforeEach: beforeGuards.add, // 可以注册多个 所以是一个发布订阅模式
    afterEach: afterGuards.add, // 导航守卫钩子在切换路由调用
    beforeResolve: beforeResolveGuards.add,
    install(app) {
      // 路由的核心就是 页面切换 ，重新渲染
      const router = this;

      // vue2 中有两个属性 $router 里面包含的时方法  $route 里面包含的属性
      app.config.globalProperties.$router = router; // 方法
      Object.defineProperty(app.config.globalProperties, "$route", {
        // 属性，拆包取值，去 value 上取值
        enumerable: true,
        get: () => unref(currentRoute),
      });

      // 把所有路由属性变成响应式的，且解构不失去响应式
      const reactiveRoute = {};
      for (let key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = computed(() => currentRoute.value[key]);
      }

      // 把路由提供出去，用户可以用过 inject 注入
      app.provide("router", router); // 暴露路由对象
      app.provide("route location", reactive(reactiveRoute)); // 用于实现useApi
      // let router = useRouter(); // inject('router')
      // let route = useRoute();// inject('route location')

      // 全局注册路由组件
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);

      // 默认就是初始化, 需要通过路由系统先进行一次跳转 发生匹配
      if (currentRoute.value == START_LOCATION_NORMALIZED) {
        push(routerHistory.location);
      }
      // 解析路径 ， RouterLink RouterView 实现， 页面的钩子 从离开到进入 到解析完成
    },
  };

  return router;
}

export { createRouter, createWebHistory, createWebHashHistory };
```
