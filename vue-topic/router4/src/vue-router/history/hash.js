// 实现路由监听，如果路径变化 需要通知用户
// routerHistory.listen((to, from, { isBack }) => {
//   console.log(to, from, isBack);
// });
import { createWebHistory } from "./html5";

// 创建 hash 路由记录
export function createWebHashHistory() {
  return createWebHistory("#");
}
