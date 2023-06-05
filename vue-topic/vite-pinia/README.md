# Vue 3 + Vite

## 启动项目

- 创建 vite 项目：yarn create vite
  - 项目名称：Project name: vite-pinia
- cd vite-pinia
- yarn
- yarn dev
- yarn add pinia

## pinia 的特点

- pinia 他是用来取代 vuex 的。 pinia 非常小巧的 支持 vue2 也支持 vue3 ts 类型支持非常的好。 我们在使用 pinia 之后就不用写类型。
- pinia 就是默认支持多仓库 vuex 典型的是当仓库 $store.state 会导致所有的状态都放到一个 store 里，模块来区分不同的 store
  - store.state.a 产生了一个 a 模块。 树状结构不好维护 store.state.a.b.c.xx
  - 默认不采用命名空间的方式来管理 拍平，每个状态都可以是单独的 store (userStore.xxx productStore.xxx)
  - 用起来也很方便，store 之间也可以相互调用
- pinia vuex 中所有的状态 组件-》（action-》mutation -》) 状态 。 action 这一层的但是是为了什么？

  - 组件 -》 action (commit(mutation) -》  
     commit(mutation) -》
    commit(mutation) -》
    commit(mutation) -》) => 》(mutation)状态 action 起到的作用核心就是封装

  - 组件 点击按钮 setTimeout -> commit(mutation) -> 状态

- pinia 所有的更改 都只有 action 了 没有 mutation。 只有 action 层没有 mutation 了

- 扁平化 多个 store， 没用 mutation 了， 支持 ts， 小，支持 devtool
- vue2 辅助函数 mapState mapGetters mapActions 都支持

## 使用 Pinia

main.js

```js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
// 基本上咱们js中的插件都是函数
app.use(createPinia()); // 插件要求得有一个install方法
app.mount("#app");
```

vue-topic/vite-pinia/src/stores/counter1.js

```js
import { defineStore } from "pinia";

// defineStore中的id是独一无二的
// {counter=> state, counter -> state}
export const useCounterStore1 = defineStore("counter1", {
  // vuex 在前端用是对象 在ssr中是函数
  // vue data:{} data:()=>{}
  state: () => {
    return { count: 0 };
  },
  getters: {
    double() {
      return this.count * 2;
    },
  },
  actions: {
    increment(payload) {
      return (this.count += payload);
    },
  },
});
```

vue-topic/vite-pinia/src/stores/counter2.js

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCounterStore2 = defineStore("counter2", () => {
  const count = ref(10);
  const increment = (payload) => {
    count.value *= payload;
  };
  const double = computed(() => {
    return count.value * 2;
  });
  return { count, increment, double };
});
```

vue-topic/vite-pinia/src/App.vue

```vue
<script setup>
import { useCounterStore1 } from "./stores/counter1";
import { useCounterStore2 } from "./stores/counter2";
const store1 = useCounterStore1();
const { increment } = useCounterStore1();
const handleClick1 = () => {
  increment(2);
};

const store2 = useCounterStore2();
const handleClick2 = () => {
  store2.increment(3);
};
</script>

<template>
  ----------------options-------------- <br />
  {{ store1.count }}
  {{ store1.double }}
  <button @click="handleClick1">修改状态</button>
  <hr />

  ----------------setup--------------<br />
  {{ store2.count }}
  {{ store2.double }}
  <button @click="handleClick2">修改状态</button>
</template>

<style scoped></style>
```

## Pinia 源码实现

- createOptionStore(内部会拿到用户的 options 将他变成 setup)
- createSetupStore(用户穿的就是 setup 可以直接使用)

配置别名: vue-topic/vite-pinia/vite.config.js

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

vue-topic/vite-pinia/src/pinia/index.js

```js
export { createPinia } from "./createPinia";
export { defineStore } from "./store";
```

vue-topic/vite-pinia/src/pinia/rootStore.js

```js
export const piniaSymbol = Symbol();
```

vue-topic/vite-pinia/src/pinia/createPinia.js

```js
// 存的是createPinia这个ap
import { ref, effectScope } from "vue";
import { piniaSymbol } from "./rootStore";

export function createPinia() {
  const scope = effectScope();
  const state = scope.run(() => ref({})); // 用来存储每个store的state的
  // scope.stop() 可以通过一个方法全部停止响应式

  // 状态里面 可能会存放 计算属性， computed

  const pinia = {
    _s: new Map(), // 这里用这个map来存放所有的store   {counter1-> store,counter2-> store}
    _e: scope, // 可以控制停止响应
    install(app) {
      // 对于pinia而言，我们希望让它去管理所有的store
      // pinia 要去收集所有store的信息 , 过一会想卸载store
      // 如何让所有的store 都能获取这个pinia 对象
      app.provide(piniaSymbol, pinia); // 所有组件都可以通过 app.inject(piniaSymbol)
      // 适配 vue2 中写法 this.$pinia
      app.config.globalProperties.$pinia = pinia; // 让vue2的组件实例也可以共享
    },
    state,
  };
  return pinia;
}
```

vue-topic/vite-pinia/src/pinia/store.js

```js
// 这里存放 defineStore的api

// createPinia(), 默认是一个插件具备一个install方法
// _s 用来存储 id->store
// state 用来存储所有状态的
// _e 用来停止所有状态的

// id  + options
// options
// id + setup
import {
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
  computed,
} from "vue";
import { piniaSymbol } from "./rootStore";

// 创建 options 的 store
function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options;

  function setup() {
    // 这里面会对用户传递的state，actions getters 做处理
    const localState = (pinia.state.value[id] = state ? state() : {});
    // getters
    return Object.assign(
      localState, // 用户的状态
      actions, // 用户的动作
      // 用户计算属性
      Object.keys(getters || {}).reduce((memo, name) => {
        memo[name] = computed(() => {
          let store = pinia._s.get(id);
          return getters[name].call(store); // 解决 this的指向，保证 this 一直指向 store
        });
        return memo;
      }, {})
    );
  }
  createSetupStore(id, setup, pinia);
}

// 创建 setup 的 store
function createSetupStore(id, setup, pinia) {
  let scope;
  // 后续一些不是用户定义的属性和方法，内置的api会增加到这个store上
  const store = reactive({}); // store就是一个响应式对象而已

  // 父亲可以停止所有 , setupStore 是用户传递的属性和方法
  const setupStore = pinia._e.run(() => {
    scope = effectScope(); // 自己可以停止自己
    return scope.run(() => setup());
  });
  // pinia._e.stop()//停止全部
  // scope.stop()//停止自己

  function wrapAction(name, action) {
    return function () {
      let ret = action.apply(store, arguments);
      // action执行后可能是promise
      // todo ...

      return ret;
    };
  }

  // 解决 this 指向问题
  for (let key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop == "function") {
      // 你是一个action
      // 对action中的this 和 后续的逻辑进行处理 ， 函数劫持
      setupStore[key] = wrapAction(key, prop);
    }
  }

  pinia._s.set(id, store); // 将store 和 id映射起来
  Object.assign(store, setupStore); //setupStore就是 setup 函数的返回值

  return store;
}

export function defineStore(idOrOptions, setup) {
  let id;
  let options;

  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }

  // 可能setup是一个函数，这个稍后处理
  const isSetupStore = typeof setup === "function";

  function useStore() {
    // 在这里我们拿到的store 应该是同一个
    let instance = getCurrentInstance();
    const pinia = instance && inject(piniaSymbol);

    // 第一次useStore
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, pinia);
      } else {
        // 如果是第一次 则创建映射关系
        createOptionsStore(id, options, pinia);
      }
    }

    // 后续通过id 获取对应的store返回
    const store = pinia._s.get(id);
    return store;
  }

  return useStore;
}
```
