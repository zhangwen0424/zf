import { forEachValue, isPromise } from "./utils";
import { storeKey } from "./injectKey";
import { ModuleCollection } from "./module/module-collection";
import { reactive } from "vue";

/* 
  1.把数据格式化, 格式化用户的参数，实现根据自己的需要，后续使用时方便
      // root = {
      //     _raw:rootModule,
      //     state:rootModule.state, // 用户管理
      //     _children:{
      //         aCount:{ // > 1
      //             _raw:aModule,
      //             state:aModule.state,
      //             _children:{ // > 1
      //                 cCount:{
      //                     _raw:useCssModule,
      //                     state:cModule.state,
      //                     _children:{}
      //                 }
      //             }
      //         },
      //         bCount:{
      //             _raw:bModule,
      //             state:bModule.state,
      //             _children:{}
      //         }
      //     }
      // }
  2.把数据安装到 store变量上
  3.给容器添加对应的状态
 */
export default class Store {
  _withCommit(fn) {
    // 切片， 监控 mutation 的更改
    const commiting = this._commiting;
    this._commiting = true;
    fn();
    this._commiting = commiting;
  }
  constructor(options) {
    // {state,actions,mutations,getter,modules}
    const store = this;

    // 组装 modules 数据
    store._modules = new ModuleCollection(options);

    // {add:[fn,fn,fn]}  发布订阅模式
    this._wrappedGetters = Object.create(null);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);

    this.strict = options.strict || false; // 是不是严格模式

    // 调用的时候 知道是mutation，mutation里面得写同步代码
    this._commiting = false;
    // 在mutation之前添加一个状态 _commiting = true;
    // 调用mutation -> 会更改状态 ， 我就监控这个状态，如果当前状态变化的时候_commiting = true, 同步更改
    // _commiting = false 异步更改

    // 定义状态，把状态定义到 store.state.aCount.cCount.count;
    const state = store._modules.root.state; // 根状态
    installModule(store, state, [], store._modules.root); // 递归安装 state、action、mutation、getter
    resetStoreState(store, state); // 把 state、getter 改成响应式的

    // 插件，循环执行插件，数据持久化插件
    store._subscribes = [];
    options.plugins.forEach((plugin) => plugin(store));
  }
  // createApp().use(store,'my')
  install(app, injectKey) {
    // 全局暴露一个变量 暴露的是store的实例
    app.provide(injectKey || storeKey, this); // 给根app增加一个_provides ,子组件会去向上查找
    // Vue.prototype.$store = this
    app.config.globalProperties.$store = this; // 增添$store属性
  }
  // 发布订阅
  subscribe(fn) {
    this._subscribes.push(fn);
  }
  replaceState(newState) {
    // 严格模式下 不能直接修改状态
    this._withCommit(() => {
      this._state.data = newState;
    });
  }
  // 注册模块
  registerModule(path, rawModule) {
    const store = this;
    if (typeof path == "string") path = [path];
    // 要在原有的模块基础上新增加一个
    const newModule = store._modules.register(rawModule, path); // 注册上去

    // 在把模块安装上
    installModule(store, store.state, path, newModule);

    // 重置容器
    resetStoreState(store, store.state);
  }
  get state() {
    return this._state.data;
  }
  commit = (type, payload) => {
    const entry = this._mutations[type] || [];
    // watch检测_commiting的状态修改
    this._withCommit(() => {
      entry && entry.forEach((handle) => handle(payload));
    });
    // 每次修改值时把发布消息
    this._subscribes.forEach((sub) => sub({ type, payload }));
  };
  dispatch = (type, payload) => {
    const entry = this._actions[type] || [];
    return Promise.all(entry.map((handler) => handler(payload)));
  };
}

// 开启严格模式断言，严格模式下 不能直接修改状态，mutation 和 action的区别？action 支持 promise
function enableStrictMode(store) {
  watch(
    // 监控数据变变化，数据变化后执行回调函数  effect
    () => store._state.data,
    () => {
      // 开启断言，如果开启严格模式， mutation 内部是异步修改则提示
      console.assert(
        store._commiting,
        "do not mutate vuex store state outside mutation handlers"
      );
    },
    {
      // watch默认是一层检测，开启深层次检测，默认watchApi是异步的，这里改成同步的监控
      deep: true,
      flush: "async",
    }
  );
}

// 状态变成响应式
function resetStoreState(store, state) {
  store._state = reactive({ data: state });
  const wrappedGetters = store._wrappedGetters;
  store.getters = {};
  forEachValue(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      get: getter,
      enumerable: true,
    });
  });
  // 开启严格模式时
  if (store.stict) {
    enableStrictMode(store);
  }
}

// 递归安装
function installModule(store, rootState, path, module) {
  let isRoot = !path.length; // 如果数组是空数组 说明是根，否则不是

  const namespaced = store._modules.getNamespaced(path);

  if (!isRoot) {
    //[]
    let parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState);
    parentState[path[path.length - 1]] = module.state;
  }
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  });

  // getters  module._raw.getters
  module.forEachGetter((getter, key) => {
    store._wrappedGetters[namespaced + key] = () => {
      // return getter(module.state, path); // 如果直接使用模块上自己的状态，此状态不是响应式的
      return getter(getNestedState(store.state, path));
    };
  });
  // mutation   {add:[mutation]}
  module.forEachMutation((mutation, key) => {
    const entry =
      store._mutations[namespaced + key] ||
      (store._mutations[namespaced + key] = []);
    entry.push((payload) => {
      mutation.call(store, getNestedState(store.state, path), payload);
    });
  });
  // actions  mutation和action的一个区别， action执行后返回一个是promise
  module.forEachAction((action, key) => {
    const entry =
      store._actions[namespaced + key] ||
      (store._actions[namespaced + key] = []);
    entry.push((payload) => {
      let res = action.call(store, store, payload);
      // res 是不是一个promise
      if (!isPromise(res)) {
        return Promise.resolve(res);
      }
      return res;
    });
  });
}

// 根据路径去取响应式的state，自己 module 上的可能不是响应式的
function getNestedState(state, path) {
  return path.reduce((state, key) => state[key], state);
}
