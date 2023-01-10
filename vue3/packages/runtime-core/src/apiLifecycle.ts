// 生命周期钩子

import { curretInstance, setCurrentInstance } from "./component";

// 生命周期钩子 =》 映射表
export const enum LicycleHooks {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BFORE_UPDATE = "bu",
  UPDATED = "u",
  BEFORE_UNMOUNT = "bum",
  UNMOUNTED = "um",
}

// 这里用户调用的都是这个方法
function createHook(type) {
  // hook 就是用户真实的逻辑,
  // curretInstance在 setup 执行之后就被置空了，导致在写 minix 中获取不到instance
  // 用参数来保存变量, 将 instance放到参数中，采用闭包保存变量
  return (hook, i = curretInstance) => {
    if (curretInstance) {
      const hooks = curretInstance[type] || (curretInstance[type] = []);
      // hooks.push(hook);
      hooks.push(() => {
        setCurrentInstance(i);
        hook(); // 用户的逻辑
        setCurrentInstance(null);
      });

      // 当用户调用onMounted的时候 我们将用户的函数存起来了。
      // 这个方法可能是延迟到setup执行之后才调用的，这个时候实例已经销毁了
    }
    // console.log("curretInstance:", curretInstance);
  };
}

export const onBeforeMount = createHook(LicycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LicycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LicycleHooks.BFORE_UPDATE);
export const onUpdated = createHook(LicycleHooks.UPDATED);
export const onBeforeUnmount = createHook(LicycleHooks.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LicycleHooks.UNMOUNTED);
