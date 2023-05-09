import {
  // createRouter,
  // createWebHistory,
  createWebHashHistory,
} from "vue-router";

import { createRouter, createWebHistory } from "@/vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    children: [
      { path: "a", component: { render: () => <h1>a页面</h1> } }, // jsx 语法
      { path: "b", component: { render: () => <h1>b页面</h1> } },
    ],
    // 路由钩子函数
    beforeEnter(to, from, next) {
      console.log("afterEach", to);
    },
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由前置守卫
router.beforEach((to, from, next) => {
  console.log("beforEach", to);
});

router.beforeResolve((to, from, next) => {
  console.log("beforeResolve", to);
});

// 路由后置守卫
router.afterEach((to, from, next) => {
  console.log("afterEach", to);
});

export default router;
