<template>
  计数器： {{ count }} {{ $store.state.count }}
  <hr />
  double:{{ double }} {{ $store.getters.double }}

  <!-- 开启严格模式会报错 -->
  <button @click="$store.state.count++">错误修改</button>
  &nbsp;

  <!-- 同步修改 -->
  <button @click="add">同步修改</button>
  &nbsp;
  <button @click="asyncAdd">异步修改</button>

  <hr />
  a模块：{{ aCount }} &nbsp;b模块：{{ bCount }} &nbsp;c模块：{{ cCount }}
  <button @click="$store.commit('aCount/add', 1)">改 a</button>&nbsp;
  <button @click="$store.commit('bCount/add', 1)">改 b</button>&nbsp;
  <button @click="$store.commit('aCount/cCount/add', 1)">改 c</button>&nbsp;
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
      store.dispatch("asyncAdd", 1).then((d) => {
        console.log("ok", d);
      });
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.state.double),
      aCount: computed(() => store.state.aCount.count),
      bCount: computed(() => store.state.bCount.count),
      cCount: computed(() => store.state.aCount.cCount.count),
      add,
      asyncAdd,
    };
  },
};
</script>
