// 项目比较小，可以采用约定式路由 根据规范来创建目录
// 项目比较大，建议采用配置
import { createRouter, createWebHistory } from "vue-router"

const getRoutes = () => {
  const files = import.meta.glob("../views/*.vue")
}
export default createRouter({
  history: createWebHistory(),
  routes: getRoutes()
})
