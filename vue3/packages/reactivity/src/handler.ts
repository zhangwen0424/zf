import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags } from "./reactive";

export const mutableHandle = {
  get(target, key, receiver) {
    console.log("handler.js getter", key); // 取值的时候
    // debugger;

    if (key == ReactiveFlags.IS_REACTIVE) {
      return true; //代理过的对象再次被传入代理问题
    }

    // 如果在取值的时候发现取出来的值是对象，那么再次进行代理，返回代理后的结果
    if (isObject(target[key])) {
      return reactive(target[key]);
    }

    // 取值的时候, 让这个属性 和 effect产生关系
    // 做依赖收集 记录属性和当前effect的关系
    const res = Reflect.get(target, key, receiver); // 我们在使用proxy的时候要搭配reflect来使用,用来解决this问题
    track(target, key);
    return res;
  },
  set(target, key, newValue, receiver) {
    console.log("handler.js setter", key); // 更新值
    // debugger;
    let oldValue = target[key];

    // 找到这个数值对应的effect让他执行
    const r = Reflect.set(target, key, newValue, receiver);
    if (oldValue !== newValue) {
      trigger(target, key, newValue, oldValue);
    }

    return r;
  },
};
