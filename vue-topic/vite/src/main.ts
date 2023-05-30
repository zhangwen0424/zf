import { createApp } from "vue";
import App from "./App.vue"; // 这里会报错，不支持.vue

import router from "./router/index";
createApp(App).use(router).mount("#app");
