import { createWebHistory } from "./history/html5";
import { createWebHashHistory } from "./history/hash";
import { reactive, shallowRef, computed, unref } from "vue";
import { resolve } from "core-js/fn/promise";

// 数据处理 options.routes 是用户的配置 ， 难理解不好维护

// /  =>  record {Home}
// /a =>  record {A,parent:Home}
// /b => record {B,parent:Home}
// /about=>record

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

// 初始化路由系统中的默认参数
const START_LOCATION_NORMALIZED = {
  path: "/",
  // params:{}, // 路径参数
  // query:{},
  matched: [], // 当前路径匹配到的记录
};

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
  console.log("matchers", matchers);
  return {
    addRoute, // 动态的添加路由， 面试问路由 如何动态添加 就是这个api
  };
}

function createRouter(options) {
  const routerHistory = options.history;
  const matcher = createRouterMatcher(options.routes); // 格式化路由的配置 拍平
  console.log("options", options);

  // 后续改变这个数据的value 就可以更新视图了
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);

  // 解析路径，to="/"   to={path:'/'}
  function resolve(to) {
    if (typeof to == "string") {
      return matcher.resolve({ path: to });
    }
  }

  // 通过路径匹配到对应的记录，更新currentRoute
  function pushWithRedirect(to) {
    const targetLocation = resolve(to); //根据路径解析
    const from = currentRoute.value; // 从哪来
    // 路由的钩子 在跳转前我们可以做路由的拦截
  }

  function push(to) {
    return pushWithRedirect(to);
  }
  const router = {
    push,
    replace() {},
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
      console.log("app", app);

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
      app.component("RouterLink", {
        setup:
          (props, { slots }) =>
          () =>
            <a>{slots.default && slots.default()}</a>,
      });
      app.component("RouterView", {
        setup:
          (props, { slots }) =>
          () =>
            <div></div>,
      });

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
