<template>
  计数器： {{ count }} {{ $store.state.count }}
  <hr />
  <!-- double:{{ double }} {{ $store.getters.double }} -->

  <!-- 开启严格模式会报错 -->
  <button @click="$store.state.count++">错误修改</button>
  &nbsp;
</template>

<script>
import { computed } from "vue";
// import { useStore } from "vuex";
import { useStore } from "@/vuex";
export default {
  name: "App",
  setup() {
    // vue3 有个compositionApi的入口
    const store = useStore();
    console.log("store", store);

    function add() {
      store.commit("add", 1);
    }
    function asyncAdd() {
      store.dispatch("asyncAdd", 1);
    }
    return {
      // count: computed(() => store.state.count),
      // double: computed(() => store.state.double),
      // add,
      // asyncAdd,
    };
  },
};
</script>
