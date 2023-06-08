import { createApp } from "vue";
import { createPinia } from "@/pinia";
import App from "./App.vue";
import { useCounterStore1 } from "./stores/counter1";

const app = createApp(App);

// 基本上咱们js中的插件都是函数
const pinia = createPinia();

// 插件就是一个函数，use 是用来注册插件的，插件的核心就是 $subscribe、$onAction
pinia.use(function ({ store }) {
  let local = localStorage.getItem(store.$id + "PINIA_STATE");
  if (local) {
    store.$state = JSON.parse(local);
  }
  store.$subscribe(({ storeId: id }, state) => {
    localStorage.setItem(id + "PINIA_STATE", JSON.stringify(state));
  });
  store.$onAction(() => {
    // 埋点
  });
  return { a: 1 };
});

app.use(pinia); // 插件要求得有一个install方法

app.mount("#app");

// 异步路由，在任何地方都可以使用 pinia，通过 activePinia、setActivePinia 存全局变量
const store1 = useCounterStore1(); // inject方法无法使用
console.log(store1.count);
