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
  isRef,
  isReactive,
  toRefs,
  watch,
} from "vue";
import { piniaSymbol } from "./rootStore";
import { addSubscription, triggerSubscriptions } from "./subscribe";

// 计算属性是 ref,同时也是一个 effect
function isComputed(v) {
  return !!(isRef(v) && v.effect);
}
// 创建 options 的 store
function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options;

  function setup() {
    // 这里面会对用户传递的state，actions getters 做处理
    // const localState = (pinia.state.value[id] = state ? state() : {}); // 这样就是普通对象，失去响应式
    pinia.state.value[id] = state ? state() : {};
    const localState = toRefs(pinia.state.value[id]); //需要将状态转成 ref，变成响应式

    // console.log("localState", localState);

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
  const store = createSetupStore(id, setup, pinia, true);

  // $reset只支持 option api
  store.$reset = function () {
    // 拿到老的状态，用初始状态覆盖掉闲的状态
    const oldState = state ? state() : {};
    store.$patch((state) => {
      Object.assign(state, oldState);
    });
  };
}

function isObject(value) {
  return typeof value === "object" && value !== null;
}
// 递归合并状态，这里不能用 Object.assin(),对象不会合并会被覆盖掉，{a:{a:1}}  {a:{b:1}}  => {a:{a:1,b:1}}
function mergeReactiveObject(target, state) {
  for (let key in state) {
    let oldValue = target[key];
    let newValue = state[key]; // 这里循环的时候拿出来，丧失了响应式
    if (isObject(oldValue) && isObject(newValue)) {
      target[key] = mergeReactiveObject(oldValue, newValue);
    } else {
      target[key] = newValue;
    }
    console.log(oldValue, newValue);
  }
  return target;
}

// 创建 setup 的 store, isOption:是否为 option api
function createSetupStore(id, setup, pinia, isOption) {
  let scope;

  function $patch(partialStoreOrMutatior) {
    // 如果是对象，合并状态，store1.$patch({ count: 1000 });
    if (typeof partialStoreOrMutatior == "object") {
      // 用新的状态合并老的状态
      mergeReactiveObject(pinia.state.value[id], partialStoreOrMutatior);
    } else {
      // 如果是函数，直接运行，store1.$patch((state) => { state.count = 1000; });
      partialStoreOrMutatior(pinia.state.value[id]);
    }
  }

  // 后续一些不是用户定义的属性和方法，内置的api会增加到这个store上
  let actionSubscriptions = [];
  const partialStore = {
    $patch, // 合并修改状态
    // 消息订阅
    $subscribe(callback, options = {}) {
      // 保证停止的时候，这里的也可以被停止
      scope.run(() => {
        // 每次状态变化都会触发此函数
        watch(pinia.state.value[id], (state) => {
          callback({ storeId: id }, state);
        });
      });
    },
    $onAction: addSubscription.bind(null, actionSubscriptions), // 收集依赖
    $dispose() {
      scope.stop(); // 清除响应式
      actionSubscriptions = []; // 取消订阅
      pinia._s.delete(id);
    },
  };
  const store = reactive(partialStore); // store就是一个响应式对象而已

  const initialState = pinia.state.value[id]; // 在 setup api 没有初始化状态
  // 没有初始化状态,不是 option api  => setup api
  if (!initialState && !isOption) {
    pinia.state.value[id] = {};
  }

  // 父亲可以停止所有 , setupStore 是用户传递的属性和方法
  const setupStore = pinia._e.run(() => {
    scope = effectScope(); // 自己可以停止自己
    return scope.run(() => setup());
  });
  // pinia._e.stop()//停止全部
  // scope.stop()//停止自己

  function wrapAction(name, action) {
    return function () {
      // 收集回调
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      // 触发依赖
      triggerSubscriptions(actionSubscriptions, { after, onError });
      let ret;
      // 捕获错误、异常
      try {
        ret = action.apply(store, arguments);
      } catch (e) {
        triggerSubscriptions(onErrorCallbackList, e);
      }
      // action可以下成 promise， 成功调用成功的回调，失败调用 err回调
      if (ret instanceof Promise) {
        return ret
          .then(() => {
            return triggerSubscriptions(afterCallbackList, value);
          })
          .catch((e) => {
            triggerSubscriptions(onErrorCallbackList, e);
            return Promise.reject(e); // 失败时返回失败的promise
          });
      }
      triggerSubscriptions(afterCallbackList, ret); // action不是 promise 时执行
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

    // 如何看这个值是不是状态, 1.是 ref 同时不能是计算属性(computed也是 ref)，2. 是reactive
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      // 针对 setup api而言
      if (!isOption) {
        pinia.state.value[id][key] = prop;
      }
    }
  }
  // console.log(pinia.state.value);

  pinia._s.set(id, store); // 将store 和 id映射起来
  Object.assign(store, setupStore); //setupStore就是 setup 函数的返回值

  // 定义一个$state的替换，可以操作 state 的所有属性
  Object.defineProperty(store, "$state", {
    get: () => pinia.state.value[id],
    set: (state) => $patch(($state) => Object.assign($state, state)),
  });

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
