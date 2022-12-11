import { isReactive } from "./reactive";
import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";

export function watch(source, cb, options: any = {}) {
  return dowatch(source, cb, options);
}
export function watchEffect(source, options: any = {}) {
  return dowatch(source, null, options);
}
export function dowatch(source, cb, options) {
  // 1）source是一个 响应式对象
  // 2）source是一个函数

  // effect() + scheduler
  let getter;
  if (isReactive(source)) {
    // 包装成一个函数，需要把对象中的所有属性都访问一遍，触发依赖收集
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  // 里面的属性就会收集当前的effect
  // 如果数据变化后会执行对应scheduler方法
  let clear;
  let onCleanup = (fn) => {
    clear = fn;
  };
  // debugger;
  const job = () => {
    if (cb) {
      if (clear) clear(); // 下次执行的时候将上次的执行一下
      const newVal = effect.run();
      cb(newVal, oldVal, onCleanup);
    } else {
      effect.run(); // watchEffect 只需要运行自身就可以了
    }
  };
  // ReactiveEffect中fn 里面的属性就会收集当前的effect
  // 如果数据变化后会执行对应scheduler方法,在这个方法我们手动的执行 run
  const effect = new ReactiveEffect(getter, job);
  oldVal = effect.run(); // 这里调用会让ReactiveEffect中 getter 跑一遍，让属性和effect关联在一起
}

// 循环访问属性用作依赖收集，= 深拷贝, seen防止死循环
function traverse(value, seen = new Set()) {
  if (!isObject(value)) {
    return value;
  }
  // 如果已经循环了这个对象，那么在循环会导致死循环
  if (!seen.has(value)) {
    return value;
  }
  seen.add(value);

  // 循环取值
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
