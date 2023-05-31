import { createApp } from "vue";
import App from "./App.vue"; // 这里会报错，不支持.vue
import { login } from "./api/user";
import router from "./router/index";
createApp(App).use(router).use(createPinia()).mount("#app");

/* 
// acion 这里写到这 是为了表示页面加载的时候会调用
login<{ username: string; token: string }>({
  username: "hello",
  password: "123456"
}).then((res) => {
  console.log(res.data?.username);
}); */
