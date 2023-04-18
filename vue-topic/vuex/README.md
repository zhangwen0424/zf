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
