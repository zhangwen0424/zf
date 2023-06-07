import { defineStore } from "@/pinia";
import { ref, computed } from "vue";

export const useCounterStore2 = defineStore("counter2", () => {
  const count = ref(10);
  const increment = (payload) => {
    count.value *= payload;
    // throw Error("出错了");
  };
  const double = computed(() => {
    return count.value * 2;
  });
  return { count, increment, double };
});
