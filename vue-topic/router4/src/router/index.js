import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    // children: [
    //   { path: "a", component: { render: () => <h1>a页面</h1> } }, // jsx 语法
    //   { path: "b", component: { render: () => <h1>b页面</h1> } },
    // ],
    // children: [
    //   { path: "a", component: { render: () => <h1>a页面</h1> } }, // jsx 语法
    //   { path: "b", component: { render: () => <h1>b页面</h1> } },
    // ],
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
