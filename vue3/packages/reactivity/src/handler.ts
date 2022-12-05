import { ReactiveFlags } from "./reactive";

export const mutableHandle = {
  get(target, key, receiver) {
    // 取值的时候
    // 我们在使用proxy的时候要搭配reflect来使用,用来解决this问题
    console.log("handler getter");
    if (key == ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 更新值
    console.log("handler setter");
    return Reflect.set(target, key, value, receiver);
  },
};
