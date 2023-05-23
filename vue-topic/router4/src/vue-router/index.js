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
