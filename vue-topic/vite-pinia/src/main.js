import { createApp } from "vue";
import { createPinia } from "@/pinia";
import App from "./App.vue";

const app = createApp(App);
// 基本上咱们js中的插件都是函数
app.use(createPinia()); // 插件要求得有一个install方法
app.mount("#app");
