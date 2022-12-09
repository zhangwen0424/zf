import { isObject } from "@vue/shared";
import { mutableHandle } from "./handler";

export const enum ReactiveFlags { // 对象
  IS_REACTIVE = "__v_isReactive",
}

const reactiveMap = new WeakMap(); // 映射表，WeakMap 中key 是个对象
export function reactive(target) {
  // reactive 只能处理对象类型的数据，不是对象不处理
  if (!isObject(target)) return target;

  // 缓存可以采用映射表 {{target} -> proxy}

  let existingProxy = reactiveMap.get(target); // 看一下这个对象是否有被代理过
  if (existingProxy) return existingProxy; // 代理过直接返回

  // 判断是不是传入代理对象，是直接返回。
  if (target[ReactiveFlags.IS_REACTIVE]) {
    // 第一次代理的时候值为 undefined，再次代理时,因为 target 被代理过，访问target 属性会命中代理中的 get 方法
    // 通过代理中的 get 方法判断，如果是指定的 key，返回 target不在进行代理
    return target;
  }

  const proxy = new Proxy(target, mutableHandle); // 没有代理过创建代理
  reactiveMap.set(target, proxy); // 缓存代理结果

  // 代理过的再次被传进来
  // 1） 在vue3.0的时候 会创造一个反向映射表 {代理的结果 -》 原内容}
  // 2) 目前不用创建反向映射表，用的方式是，如果这个对象被代理过了说明已经被proxy拦截过了

  return proxy;
}

export function isReactive(value) {
  return value[ReactiveFlags["IS_REACTIVE"]];
}
