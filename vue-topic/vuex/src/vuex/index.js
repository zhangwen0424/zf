// import Store from "./store";

import { inject, reactive } from "vue";
// import { storeKey } from "vuex";

export function forEachValue(obj, fn) {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}

const storeKey = "store";
class Store {
  constructor(options) {
    const store = this;
    // this.a = 100;
    store._state = reactive({ data: options.state });

    // getter
    const _getters = options.getters; //{double: function => getter}
    store.getters = {};
    forEachValue(_getters, function(fn, key){
      
    });
  }
  get state() {
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
