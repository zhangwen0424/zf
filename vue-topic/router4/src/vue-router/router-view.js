import { h, inject, provide, computed } from "vue";

export const RouterView = {
  name: "RouterView",
  setup(props, { slots }) {
    // 每次渲染组件，只会执行一次
    const depth = inject("depth", 0); // 默认第 0 层
    const injectRoute = inject("route location");
    const matchedRouteRef = computed(() => injectRoute.matched[depth]); // 每次都去取一次 depth 保证准确性
    provide("depth", depth + 1);

    // /a  [home,a] =》 depth:0 home =>  depth:1 a
    return () => {
      const matchRoute = matchedRouteRef.value; // record

      const viewComponent = matchRoute && matchRoute.components.default;
      if (!viewComponent) {
        return slots.default && slots.default();
      }

      return h(viewComponent);
    };
  },
};
