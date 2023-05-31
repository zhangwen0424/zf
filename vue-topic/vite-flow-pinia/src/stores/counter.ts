// 定义一个 store

// 1.setup 写法
/* export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubuleCount = computed(() => {
    return count.value * 2;
  });
  const changeCount = (payload: number) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        count.value += payload;
        resolve();
      }, 100);
    });
  };
  return { count, doubuleCount, changeCount };
}); */

// 2.options 写法
export const useCounterStore = defineStore("counter", {
  state: () => {
    return {
      count: 0
    };
  },
  getters: {
    doubleCount(state) {
      return state.count * 2;
    }
  },
  actions: {
    changeCount(payload: number) {
      this.count += payload;
      return Promise.resolve();
    }
  }
});
