import { createApp } from "vue";
import App from "./App.vue"; // 这里会报错，不支持.vue

createApp(App).mount("#app");

let num: string = 123;
console.log(num);
