<template>
  <div>
    <button @click="handleClick">计算器</button>
    count:<span>{{ store.count }}</span> doubleCount:<span>{{
      store.doubleCount
    }}</span>
  </div>
</template>
<script lang="ts" setup>
import { useCounterStore } from "@/stores/counter"; // 引入 store
const store = useCounterStore(); //使用 store
const handleClick = () => {
  store.changeCount(5).then(() => {
    console.log("ok");
  });
};
</script>
