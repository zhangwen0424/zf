import { reactive } from "vue";
import { forEachValue } from "./utils";
import { storeKey } from "./injectKey";

export default class Store {
  constructor(options) {
    const store = this;
  }
  // createApp().use(store,'my')
  install(app, injectKey) {
    // 全局暴露一个变量 暴露的是store的实例
    app.provide(injectKey || storeKey, this); // 给根app增加一个_provides ,子组件会去向上查找
    // Vue.prototype.$store = this
    app.config.globalProperties.$store = this; // 增添$store属性
  }
}

// 格式化用户的参数，实现根据自己的需要，后续使用时方便
