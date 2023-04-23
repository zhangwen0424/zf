# vuex

## 安装

- 1.安装 vue-cli 工具
  npm install -g @vue/cli
- 2.查看版本 5 以上
  vue --version
- 3.创建项目,选择第三项，自定义勾选 vuex
  vue create vuex
- 安装后代码报红： No Babel config file detected
  "parserOptions": {
  "requireConfigFile": false
  },

## 项目启动

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

## 使用

vuex 原理就是 借助 provide 和 inject 实现组件间传递数据
createStore 初始化 vuex 实例，createApp(App).use(store) 注入数据，useStore() 取数据，两者返回的是一个实例对象

### 注册 vuex

store.js

```js
import { createStore } from "@/vuex";

export default createStore({
  // 组件中的data
  state: {
    count: 0,
  },
  // 计算属性 vuex4 他并没有实现计算属性的功能
  getters: {
    double(state) {
      return state.count * 2;
    },
  },
  // 可以更改状态 必须是同步更改的
  mutations: {
    add(state, payload) {
      state.count += payload;
    },
  },
  // 可以调用其他action，或者调用mutation
  actions: {
    asyncAdd({ commit }, payload) {
      setTimeout(() => {
        commit("add", payload);
      }, 1000);
    },
  },
  // 子模块 实现逻辑的拆分
  modules: {},
});

// 严格模式
// dispatch(action) => commit(mutation) => 修改状态

// 有一个功能 在a页面需要调用一个接口 影响的可能是a数据    b页面也需要调用同一个接口 改的是b数据
```

main.js

```js
import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";

// Vue.use(store) 插件的用法， 会默认调用store中的install方法
createApp(App).use(store).mount("#app");
```

### vuex 使用

app.vue

```vue
<template>
  计数器： {{ count }} {{ $store.state.count }}
  <hr />
  double:{{ double }} {{ $store.getters.double }}

  <!-- 开启严格模式会报错 -->
  <button @click="$store.state.count++">错误修改</button>
  &nbsp;

  <!-- 同步修改 -->
  <button @click="add">同步修改</button>
  &nbsp;
  <button @click="asyncAdd">异步修改</button>
</template>

<script>
import { computed } from "vue";
// import { useStore } from "vuex";
import { useStore } from "@/vuex";
export default {
  name: "App",
  setup() {
    // vue3 有个compositionApi的入口
    const store = useStore();
    console.log("store", store);

    function add() {
      store.commit("add", 1);
    }
    function asyncAdd() {
      store.dispatch("asyncAdd", 1);
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.state.double),
      add,
      asyncAdd,
    };
  },
};
</script>
```

### vuex 实现

```js
import { inject, reactive } from "vue";

export function forEachValue(obj, fn) {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}

const storeKey = "store";
class Store {
  constructor(options) {
    // vuex3 内部会创造一个vue的实例 ，但是 vuex4 直接采用vue3 提供的响应式方法
    const store = this;
    // store._state.data
    store._state = reactive({ data: options.state }); //把他变成响应式的
    // vuex 里面有一个比较中的api  replaceState

    // getter
    const _getters = options.getters; //{double: function => getter}
    store.getters = {};
    forEachValue(_getters, function (fn, key) {
      Object.defineProperty(store.getters, key, {
        enumerable: true,
        get: () => fn(store.state), // computed,很遗憾 在vuex中不能用computed实现  如果组件销毁了会移除计算属性 ， vue3.2 会改掉这个bug
      });
    });

    // mutations、actions
    store._mutations = Object.create(null);
    store._actions = Object.create(null);
    const _mutations = options.mutations;
    const _actions = options.actions;
    forEachValue(_mutations, (mutation, key) => {
      store._mutations[key] = (payload) => {
        mutation.call(store, store.state, payload);
      };
    });
    forEachValue(_actions, (action, key) => {
      store._actions[key] = (payload) => {
        action.call(store, store, payload);
      };
    });
  }
  commit = (type, payload) => {
    // bind 方法
    this._mutations[type](payload);
  };
  dispatch = (type, payload) => {
    this._actions[type](payload);
  };
  get state() {
    // 类的属性访问器
    return this._state.data;
  }
  // createApp().use(store,'my')
  install(app, injectKey) {
    // 全局暴露一个变量 暴露的是store的实例
    app.provide(injectKey || storeKey, this); // 给根app增加一个_provides ,子组件会去向上查找
    // Vue.prototype.$store = this
    app.config.globalProperties.$store = this; // 增添$store属性
  }
}

function createStore(options) {
  return new Store(options);
}

function useStore(injectKey = storeKey) {
  return inject(injectKey);
}

export { useStore, createStore };
```

### vuex 命名空间、严格模式、持久化插件、注册组件

- 严格模式，断言 mutation 中异步修改，存在异步修改给与提示
- 命名空间，开启命名空间，取值时需要把模块路径拼上
- 持久化插件，发布订阅模式，传入订阅函数，状态变化发布消息，执行订阅函数更新 localStorage 的状态数据
- state 流向，严格模式：dispatch(action) => commit(mutation) => 修改状态
- 注册组件

app.vue

```vue
<template>
  计数器： {{ count }} {{ $store.state.count }}
  <hr />
  double:{{ double }} {{ $store.getters.double }}

  <!-- 开启严格模式会报错 -->
  <button @click="$store.state.count++">错误修改</button>
  &nbsp;

  <!-- 同步修改 -->
  <button @click="add">同步修改</button>
  &nbsp;
  <button @click="asyncAdd">异步修改</button>

  <hr />
  a模块：{{ aCount }} &nbsp;b模块：{{ bCount }} &nbsp;c模块：{{ cCount }}
  <button @click="$store.commit('aCount/add', 1)">改 a</button>&nbsp;
  <button @click="$store.commit('bCount/add', 1)">改 b</button>&nbsp;
  <button @click="$store.commit('aCount/cCount/add', 1)">改 c</button>&nbsp;
</template>

<script>
import { computed } from "vue";
// import { useStore } from "vuex";
import { useStore } from "@/vuex";
export default {
  name: "App",
  setup() {
    // vue3 有个compositionApi的入口
    const store = useStore();
    console.log("store", store);

    function add() {
      store.commit("add", 1);
    }
    function asyncAdd() {
      store.dispatch("asyncAdd", 1).then((d) => {
        console.log("ok", d);
      });
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.state.double),
      aCount: computed(() => store.state.aCount.count),
      bCount: computed(() => store.state.bCount.count),
      cCount: computed(() => store.state.aCount.cCount.count),
      add,
      asyncAdd,
    };
  },
};
</script>
```

store/index.js

```js
import { createStore } from "@/vuex";
// import { createStore } from "vuex";

// 自定义插件，数据持久化插件：1.传入订阅函数，2.数据修改发布消息，3 执行订阅函数，修改 localStorage
function customPlugin(store) {
  let local = localStorage.getItem("VUEX:STATE");
  if (local) {
    store.replaceState(JSON.parse(local));
  }
  // 每当状态发生变化 （调用了mutation的时候 就会执行此回调）
  store.subscribe((mutaton, state) => {
    localStorage.setItem("VUEX:STATE", JSON.stringify(state));
  });
}

const store = createStore({
  plugins: [customPlugin], // 会按照注册的顺序依次执行插件,执行的时候会把store传递给你
  strict: true, //开启严格模式不允许在mutation下该状态
  // 组件中的data
  state: {
    count: 0,
  },
  // 计算属性 vuex4 他并没有实现计算属性的功能
  getters: {
    double(state) {
      return state.count * 2;
    },
  },
  // 可以更改状态 必须是同步更改的
  mutations: {
    add(state, payload) {
      state.count += payload;
    },
  },
  // 可以调用其他action，或者调用mutation
  actions: {
    asyncAdd({ commit }, payload) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit("add", payload);
          resolve();
        }, 2000);
      });
    },
  },
  // 子模块 实现逻辑的拆分
  modules: {
    aCount: {
      namespaced: true,
      state: { count: 0 },
      mutations: {
        add(state, payload) {
          state.count += payload;
        },
      },
      modules: {
        cCount: {
          state: { count: 0 },
          namespaced: true,
          mutations: {
            add(state, payload) {
              state.count += payload;
            },
          },
        },
      },
    },
    bCount: {
      state: { count: 0 },
      namespaced: true,
      mutations: {
        add(state, payload) {
          state.count += payload;
        },
      },
    },
  },
});

// 严格模式
// dispatch(action) => commit(mutation) => 修改状态

// 有一个功能 在a页面需要调用一个接口 影响的可能是a数据    b页面也需要调用同一个接口 改的是b数据

// 注册组件
store.registerModule(["aCount", "cCount"], {
  namespaced: true,
  state: { count: 100 },
  mutations: {
    add(state, payload) {
      state.count += payload;
    },
  },
});
export default store;
```

vuex/store.js

```js
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
```

vuex/module/module-collection.js

```js
import { forEachValue } from "../utils";
import { Module } from "./module";

// modules 类
export class ModuleCollection {
  constructor(rootModule) {
    this.root = null;
    this.register(rootModule, []); // root => a b  a=>c
  }
  register(rawModule, path) {
    const newModule = new Module(rawModule);
    if (path.length == 0) {
      // 是一个根模块
      this.root = newModule;
    } else {
      // [a]  [b]   [a]
      // 这里是循环去拿路径中的模块，把模块放到对应的children下
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    // 如果 modules 存在，循环 modules中的模块到children 中
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(rawChildModule, path.concat(key));
      });
    }
  }
  getNamespaced(path) {
    // 看改模块有没有命名空间，有的话把该模块路径拼进去
    let module = this.root;
    return path.reduce((namespaceStr, key) => {
      module = module.getChild(key); // 子模块
      return namespaceStr + (module.namespaced ? key + "/" : "");
    }, "");
  }
}
```

vuex/module/module.js

```js
import { forEachValue } from "../utils";
export class Module {
  constructor(rawModule) {
    this._raw = rawModule;
    this._children = {};
    this.state = rawModule.state;
    this.namespaced = rawModule.namespaced; // 自己是否有命名空间
  }
  // 写成 class的形式，方便扩展
  addChild(key, module) {
    this._children[key] = module;
  }
  getChild(key) {
    return this._children[key];
  }
  forEachChild(fn) {
    forEachValue(this._children, fn);
  }
  forEachGetter(fn) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, fn);
    }
  }
  forEachMutation(fn) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, fn);
    }
  }
  forEachAction(fn) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, fn);
    }
  }
}
```
